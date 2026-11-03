const prisma = require('../prisma');
const files = require('./privateFiles');
const { check } = files;
const categories = ['INVOICE', 'PAYMENT', 'CONTRACT', 'OTHER'];
const publicSelect = {
    id: true, name: true, originalName: true, mimeType: true, sizeBytes: true, category: true, folder: true,
    clientId: true, locationId: true, invoiceId: true, receiptId: true, createdBy: true, createdAt: true, updatedAt: true,
    invoice: { select: { id: true, number: true } }, receipt: { select: { id: true, reference: true } }, location: { select: { id: true, label: true } },
};
const publicDocument = data => { const { storageKind, ...result } = data; return { ...result, downloadAvailable: storageKind === 'PRIVATE_LOCAL_V1' }; };
const select = { ...publicSelect, storageKind: true };
function scope(actor, requested) {
    if (['CLIENT_ADMIN', 'CLIENT_USER'].includes(actor.role)) {
        check(actor.clientId && (!requested || requested === actor.clientId), 'Empresa no accesible.', 403);
        return actor.clientId;
    }
    check(['PLATFORM_ADMIN', 'PLATFORM_USER'].includes(actor.role), 'Acceso denegado.', 403);
    check(typeof requested === 'string' && requested.length > 0 && requested.length <= 180, 'Seleccioná una empresa.');
    return requested;
}
function writer(actor) { check(['PLATFORM_ADMIN', 'CLIENT_ADMIN'].includes(actor.role), 'Este rol solo permite consultar y descargar.', 403); }
function ownWhere(actor) {
    if (['PLATFORM_ADMIN', 'PLATFORM_USER'].includes(actor.role)) return {};
    check(['CLIENT_ADMIN', 'CLIENT_USER'].includes(actor.role) && actor.clientId, 'Acceso denegado.', 403);
    return { clientId: actor.clientId };
}
async function documentFor(db, actor, id, projection) {
    const result = await db.document.findFirst({ where: { id, ...ownWhere(actor) }, ...(projection ? { select: projection } : {}) });
    check(result, 'Documento no encontrado.', 404);
    return result;
}
function folder(value = '') {
    check(typeof value === 'string' && value.length <= 100 && !/[\x00-\x1f\x7f\\]/.test(value) && !value.split('/').some(x => ['.', '..'].includes(x.trim())), 'Carpeta inválida (máximo 100 caracteres).');
    return value.trim();
}
function optionalId(value) { check(!value || typeof value === 'string' && value.length <= 180, 'Referencia inválida.'); return value || null; }
async function audit(db, actor, document, action, details) {
    return db.documentEvent.create({ data: { clientId: document.clientId, documentId: document.id, action, actorId: actor.id, actorRole: actor.role, actorName: actor.username || actor.id, details } });
}
async function validateLinks(db, data) {
    check(await db.client.findUnique({ where: { id: data.clientId } }), 'Empresa no encontrada.', 404);
    const invoice = data.invoiceId ? await db.invoice.findFirst({ where: { id: data.invoiceId, clientId: data.clientId } }) : null;
    const receipt = data.receiptId ? await db.paymentReceipt.findFirst({ where: { id: data.receiptId, clientId: data.clientId } }) : null;
    const location = data.locationId ? await db.location.findFirst({ where: { id: data.locationId, clientId: data.clientId } }) : null;
    check((!data.invoiceId || invoice) && (!data.receiptId || receipt) && (!data.locationId || location), 'Referencia no accesible en esta empresa.', 404);
    if (invoice && receipt) check(invoice.currency === receipt.currency && (invoice.type === 'VENDOR_DIRECT' ? receipt.recipient === 'VENDOR' && invoice.vendorId === receipt.vendorId : receipt.recipient === 'ONE_HORIZON'), 'La factura y el pago tienen distinta moneda o destinatario.');
    if (invoice && location && invoice.locationId) check(invoice.locationId === location.id, 'El establecimiento no coincide con el de la factura.');
}
async function upload(actor, input, buffer) {
    writer(actor);
    const name = files.fileName(input.name), mimeType = files.detect(buffer, name);
    const data = { clientId: scope(actor, input.clientId), name, originalName: name, mimeType,
        sizeBytes: buffer.length, checksum: files.hash(buffer), storageKind: 'PRIVATE_LOCAL_V1',
        folder: folder(input.folder), category: input.category || 'OTHER',
        locationId: optionalId(input.locationId), invoiceId: optionalId(input.invoiceId), receiptId: optionalId(input.receiptId),
        uploadKey: input.uploadKey, createdBy: actor.id,
    };
    check(categories.includes(data.category), 'Categoría inválida.');
    check(typeof data.uploadKey === 'string' && data.uploadKey.length >= 8 && data.uploadKey.length <= 100, 'Solicitud de carga inválida.');
    const same = old => ['name', 'mimeType', 'sizeBytes', 'checksum', 'folder', 'category', 'locationId', 'invoiceId', 'receiptId'].every(k => old[k] === data[k]);
    const old = await prisma.document.findUnique({ where: { clientId_uploadKey: { clientId: data.clientId, uploadKey: data.uploadKey } } });
    if (old) { check(same(old), 'La carga ya fue registrada con otros datos. Actualizá la lista.', 409); return publicDocument(await prisma.document.findUnique({ where: { id: old.id }, select })); }
    let stored;
    try {
        return await prisma.$transaction(async db => {
            await validateLinks(db, data);
            stored = await files.store(buffer);
            const document = await db.document.create({ data: { ...data, storagePath: stored.key }, select });
            await audit(db, actor, document, 'UPLOADED', { name, category: data.category, folder: data.folder, invoiceId: data.invoiceId, receiptId: data.receiptId, locationId: data.locationId });
            return publicDocument(document);
        }, { isolationLevel: 'Serializable', timeout: 15000 });
    } catch (error) {
        // Prefer an inaccessible orphan to deleting bytes after an uncertain commit.
        if (stored) {
            try { if (!await prisma.document.findFirst({ where: { storagePath: stored.key, storageKind: 'PRIVATE_LOCAL_V1' } })) await files.removeStored(stored); } catch { /* reconciliation required if the DB is unavailable */ }
        }
        throw error;
    }
}
async function list(actor, input) {
    const clientId = scope(actor, input.clientId);
    const where = { clientId };
    if (input.category) { check(categories.includes(input.category), 'Categoría inválida.'); where.category = input.category; }
    if (input.folder !== undefined) where.folder = folder(input.folder);
    if (input.invoiceId) {
        const id = optionalId(input.invoiceId);
        check(await prisma.invoice.findFirst({ where: { id, clientId } }), 'Factura no accesible.', 404);
        where.OR = [{ invoiceId: id }, { receipt: { allocations: { some: { invoiceId: id } } } }];
    }
    if (input.receiptId) {
        const id = optionalId(input.receiptId);
        check(await prisma.paymentReceipt.findFirst({ where: { id, clientId } }), 'Pago no accesible.', 404);
        where.receiptId = id;
    }
    if (input.cursor) { optionalId(input.cursor); await documentFor(prisma, { role: 'CLIENT_USER', clientId }, input.cursor, { id: true }); }
    const documents = await prisma.document.findMany({ where, select, take: 51, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}) });
    const more = documents.length > 50;
    return { documents: documents.slice(0, 50).map(publicDocument), nextCursor: more ? documents[49].id : null };
}
async function context(actor, requested) {
    const clientId = scope(actor, requested);
    const [invoices, receipts, locations, groups] = await Promise.all([
        prisma.invoice.findMany({ where: { clientId }, select: { id: true, number: true }, orderBy: { issueDate: 'desc' } }),
        prisma.paymentReceipt.findMany({ where: { clientId }, select: { id: true, reference: true }, orderBy: { createdAt: 'desc' } }),
        prisma.location.findMany({ where: { clientId }, select: { id: true, label: true } }),
        prisma.document.groupBy({ by: ['folder'], where: { clientId }, orderBy: { folder: 'asc' } }),
    ]);
    return { invoices, receipts, locations, folders: groups.map(x => x.folder) };
}
async function organize(actor, id, input) {
    writer(actor);
    check(input && typeof input === 'object' && !Array.isArray(input), 'Datos inválidos.');
    check(Object.keys(input).length > 0 && Object.keys(input).every(k => ['name', 'folder', 'category', 'expectedUpdatedAt'].includes(k)), 'Solo se puede cambiar nombre, carpeta y categoría; las referencias y el archivo son inmutables.');
    return prisma.$transaction(async db => {
        const old = await documentFor(db, actor, id);
        check(input.expectedUpdatedAt === old.updatedAt.toISOString(), 'El documento cambió. Actualizá la lista antes de editar.', 409);
        const data = {};
        if (input.name !== undefined) {
            data.name = files.fileName(input.name);
            if (old.storageKind === 'PRIVATE_LOCAL_V1') check(require('node:path').extname(data.name).toLowerCase() === require('node:path').extname(old.originalName).toLowerCase(), 'Conservá la extensión original del archivo.');
        }
        if (input.folder !== undefined) data.folder = folder(input.folder);
        if (input.category !== undefined) { check(categories.includes(input.category), 'Categoría inválida.'); data.category = input.category; }
        check(Object.keys(data).length > 0, 'No hay cambios de organización.');
        const result = await db.document.update({ where: { id }, data, select });
        await audit(db, actor, result, 'ORGANIZED', { before: { name: old.name, folder: old.folder, category: old.category }, after: { name: result.name, folder: result.folder, category: result.category } });
        return publicDocument(result);
    }, { isolationLevel: 'Serializable' });
}
async function history(actor, id) {
    await documentFor(prisma, actor, id, { id: true });
    return prisma.documentEvent.findMany({ where: { documentId: id, ...ownWhere(actor) }, select: { id: true, action: true, actorName: true, actorRole: true, details: true, createdAt: true }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] });
}
async function download(actor, id) {
    const document = await documentFor(prisma, actor, id);
    const buffer = await files.read(document);
    await audit(prisma, actor, document, 'DOWNLOADED', { name: document.name });
    return { buffer, name: document.name, mimeType: document.mimeType };
}
module.exports = { upload, list, context, organize, history, download, writer };
