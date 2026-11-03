const request = require('supertest');
const fs = require('node:fs/promises');
const path = require('node:path');
const { app } = require('../../src/app');
const { cleanTestDb, createClient, createActiveUser, createInvoice, createLocation, authHeader, prisma } = require('../helpers/db');
const { MAX_BYTES } = require('../../src/services/privateFiles');
describe.sequential('private documents: fictional tenants and isolated storage', () => {
    let a, b, admin, client, other, invoice, foreignInvoice, receipt, foreignReceipt, sequence = 0;
    const pdf = Buffer.from('%PDF-1.4\nFictional local invoice\n%%EOF');
    const upload = (actor, fields = {}, bytes = pdf) => request(app).post('/api/documents/upload').set(authHeader(actor)).query({ clientId: a.id, name: 'fictional.pdf', category: 'INVOICE', folder: '2026/Facturas', uploadKey: `upload-${++sequence}`, ...fields }).set('Content-Type', 'application/octet-stream').send(bytes);
    const raw = (actor, id) => request(app).get(`/api/documents/${id}/download`).set(authHeader(actor)).buffer(true).parse((res, callback) => { const chunks = []; res.on('data', x => chunks.push(x)); res.on('end', () => callback(null, Buffer.concat(chunks))); });
    beforeEach(async () => {
        await cleanTestDb(); a = await createClient(); b = await createClient();
        admin = (await createActiveUser({ role: 'PLATFORM_ADMIN', clientId: null })).user;
        client = (await createActiveUser({ clientId: a.id })).user;
        other = (await createActiveUser({ clientId: b.id })).user;
        invoice = await createInvoice({ clientId: a.id }); foreignInvoice = await createInvoice({ clientId: b.id });
        const base = { amountCents: 1000, currency: 'EUR', recipient: 'ONE_HORIZON', reference: 'Fictional receipt', paidAt: new Date('2026-01-01'), createdBy: admin.id, requestKey: 'fixture' };
        receipt = await prisma.paymentReceipt.create({ data: { ...base, clientId: a.id } });
        foreignReceipt = await prisma.paymentReceipt.create({ data: { ...base, clientId: b.id } });
    });
    afterAll(async () => { await cleanTestDb(); await prisma.$disconnect(); });
    it.each(['platform', 'client'])('allows %s administrator to upload, organize and download exact bytes with history', async role => {
        const actor = role === 'platform' ? admin : client;
        const response = await upload(actor, { invoiceId: invoice.id, receiptId: receipt.id }).expect(201);
        expect(response.body).toMatchObject({ invoiceId: invoice.id, receiptId: receipt.id, downloadAvailable: true, folder: '2026/Facturas' });
        expect(JSON.stringify(response.body)).not.toMatch(/storagePath|storageKind|checksum|uploadKey/);
        const downloaded = await raw(actor, response.body.id).expect(200);
        expect(downloaded.body.equals(pdf)).toBe(true);
        expect(downloaded.headers['content-disposition']).toContain('attachment;');
        expect(downloaded.headers['cache-control']).toContain('no-store');
        expect(downloaded.headers['x-content-type-options']).toBe('nosniff');
        const updated = await request(app).patch(`/api/documents/${response.body.id}`).set(authHeader(actor)).send({ name: 'reorganized.pdf', category: 'PAYMENT', folder: 'Pagos', expectedUpdatedAt: response.body.updatedAt }).expect(200);
        expect(updated.body.folder).toBe('Pagos');
        expect((await raw(actor, response.body.id)).body.equals(pdf)).toBe(true);
        const history = await request(app).get(`/api/documents/${response.body.id}/history`).set(authHeader(actor)).expect(200);
        expect(history.body.map(x => x.action)).toContain('ORGANIZED');
        expect(history.body.find(x => x.action === 'UPLOADED')).toMatchObject({ actorRole: actor.role, actorName: actor.username });
    });
    it.each(['CLIENT_USER', 'PLATFORM_USER'])('allows read/download but no upload/organization for %s', async role => {
        const doc = (await upload(admin).expect(201)).body;
        const actor = (await createActiveUser({ role, clientId: role === 'CLIENT_USER' ? a.id : null })).user;
        await request(app).get(`/api/documents?clientId=${a.id}`).set(authHeader(actor)).expect(200);
        await raw(actor, doc.id).expect(200);
        await upload(actor).expect(403);
        await request(app).patch(`/api/documents/${doc.id}`).set(authHeader(actor)).send({ folder: 'X', expectedUpdatedAt: doc.updatedAt }).expect(403);
    });
    it('denies foreign documents, histories, links and query overrides without exposing file paths', async () => {
        const doc = (await upload(admin).expect(201)).body;
        for (const id of [doc.id, 'missing']) {
            await raw(other, id).expect(404);
            await request(app).get(`/api/documents/${id}/history`).set(authHeader(other)).expect(404);
            await request(app).patch(`/api/documents/${id}`).set(authHeader(other)).send({ folder: 'Hijacked', expectedUpdatedAt: doc.updatedAt }).expect(404);
        }
        await upload(other).expect(403);
        await upload(client, { invoiceId: foreignInvoice.id }).expect(404);
        await upload(client, { receiptId: foreignReceipt.id }).expect(404);
        const location = await createLocation({ clientId: b.id });
        await upload(client, { locationId: location.id }).expect(404);
        await request(app).get(`/api/documents?clientId=${a.id}`).set(authHeader(other)).expect(403);
        const own = await request(app).get('/api/documents').set(authHeader(other)).expect(200);
        expect(own.body.documents).toEqual([]);
        const context = await request(app).get('/api/documents/context').set(authHeader(other)).expect(200);
        expect(context.body.invoices.map(x => x.id)).toEqual([foreignInvoice.id]);
        expect(JSON.stringify(context.body)).not.toContain(invoice.id);
    }, 15000); // Multiple real authenticated requests; allow slow local Windows/PG scheduling.
    it('requires a valid current session for every download', async () => {
        const doc = (await upload(client).expect(201)).body;
        await request(app).get(`/api/documents/${doc.id}/download`).expect(401);
        await prisma.user.update({ where: { id: client.id }, data: { status: 'DISABLED' } });
        await raw(client, doc.id).expect(401);
    });
    it('supports direct invoice/payment filters and receipt allocations without duplicating files', async () => {
        const doc = (await upload(client, { receiptId: receipt.id, category: 'PAYMENT' }).expect(201)).body;
        await prisma.paymentReceipt.update({ where: { id: receipt.id }, data: { status: 'CONFIRMED', confirmedBy: client.id, confirmedAt: new Date() } });
        await prisma.paymentAllocation.create({ data: { receiptId: receipt.id, invoiceId: invoice.id, amountCents: 1000, requestKey: 'link', createdBy: client.id } });
        const filtered = await request(app).get('/api/documents').query({ invoiceId: invoice.id }).set(authHeader(client)).expect(200);
        expect(filtered.body.documents.map(x => x.id)).toEqual([doc.id]);
        expect((await request(app).get('/api/documents').query({ receiptId: receipt.id, category: 'PAYMENT', folder: '2026/Facturas' }).set(authHeader(client))).body.documents).toHaveLength(1);
        expect(await prisma.document.count()).toBe(1);
    });
    it('keeps references immutable and rejects stale organization edits and financial mismatches', async () => {
        const doc = (await upload(client, { invoiceId: invoice.id }).expect(201)).body;
        await request(app).patch(`/api/documents/${doc.id}`).set(authHeader(client)).send({ invoiceId: foreignInvoice.id, expectedUpdatedAt: doc.updatedAt }).expect(400);
        await request(app).patch(`/api/documents/${doc.id}`).set(authHeader(client)).send({ folder: 'Changed', expectedUpdatedAt: '2000-01-01T00:00:00.000Z' }).expect(409);
        await request(app).patch(`/api/documents/${doc.id}`).set(authHeader(client)).send({ name: 'danger.exe', expectedUpdatedAt: doc.updatedAt }).expect(400);
        const usd = await createInvoice({ clientId: a.id, currency: 'USD' });
        await upload(client, { invoiceId: usd.id, receiptId: receipt.id }).expect(400);
    });
    it('makes upload retries idempotent and rejects key reuse with different bytes', async () => {
        const first = (await upload(client, { uploadKey: 'fixed-upload-key' }).expect(201)).body;
        expect((await upload(client, { uploadKey: 'fixed-upload-key' }).expect(201)).body.id).toBe(first.id);
        await upload(client, { uploadKey: 'fixed-upload-key' }, Buffer.from('%PDF-1.4\nDifferent')).expect(409);
        expect(await prisma.document.count()).toBe(1);
        expect(await prisma.documentEvent.count({ where: { action: 'UPLOADED' } })).toBe(1);
    });
    it.each(['../secret.pdf', 'x\\secret.pdf', 'bad\u0000.pdf', '.'])('rejects unsafe filenames %s', async name => { await upload(client, { name }).expect(400); });
    it('rejects oversized, empty, executable and disguised content without storing anything', async () => {
        const before = await fs.readdir(process.env.DOCUMENT_STORAGE_DIR_TEST);
        await upload(client, {}, Buffer.alloc(MAX_BYTES + 1)).expect(413);
        await upload(client, {}, Buffer.alloc(0)).expect(400);
        await upload(client, { name: 'payload.exe' }, Buffer.from('MZ...')).expect(400);
        await upload(client, { name: 'disguised.pdf' }, Buffer.from('<html>not a pdf</html>')).expect(400);
        expect(await fs.readdir(process.env.DOCUMENT_STORAGE_DIR_TEST)).toEqual(before);
    });
    it('never follows historical paths or serves altered/private missing files', async () => {
        const legacy = await prisma.document.create({ data: { clientId: a.id, name: 'legacy.pdf', storagePath: '../secrets.env' } });
        await raw(client, legacy.id).expect(409);
        const doc = (await upload(client).expect(201)).body;
        const stored = await prisma.document.findUnique({ where: { id: doc.id } });
        const file = path.join(process.env.DOCUMENT_STORAGE_DIR_TEST, stored.storagePath);
        await fs.writeFile(file, Buffer.from('x'.repeat(pdf.length)));
        await raw(client, doc.id).expect(409);
        await fs.unlink(file); await raw(client, doc.id).expect(409);
        const listed = await request(app).get('/api/documents').set(authHeader(client)).expect(200);
        expect(listed.body.documents.find(x => x.id === legacy.id).downloadAvailable).toBe(false);
        expect(JSON.stringify(listed.body)).not.toMatch(/storagePath|secrets.env|checksum/);
    });
    it('fails closed if storage is missing and leaves no document metadata', async () => {
        const original = process.env.DOCUMENT_STORAGE_DIR_TEST;
        try { delete process.env.DOCUMENT_STORAGE_DIR_TEST; await upload(client).expect(503); }
        finally { process.env.DOCUMENT_STORAGE_DIR_TEST = original; }
        expect(await prisma.document.count()).toBe(0);
    });
    it('rolls back metadata and removes newly written bytes if the audit insert fails', async () => {
        const before = await fs.readdir(process.env.DOCUMENT_STORAGE_DIR_TEST);
        await prisma.$executeRawUnsafe(`CREATE FUNCTION document_test_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'fictional audit failure'; END; $$`);
        await prisma.$executeRawUnsafe(`CREATE TRIGGER document_test_failure_trigger BEFORE INSERT ON "DocumentEvent" FOR EACH ROW EXECUTE FUNCTION document_test_failure()`);
        try {
            await upload(client).expect(500);
            expect(await prisma.document.count()).toBe(0);
            expect(await fs.readdir(process.env.DOCUMENT_STORAGE_DIR_TEST)).toEqual(before);
        } finally {
            await prisma.$executeRawUnsafe(`DROP TRIGGER document_test_failure_trigger ON "DocumentEvent"`);
            await prisma.$executeRawUnsafe(`DROP FUNCTION document_test_failure()`);
        }
    });
    it('concurrent retries do not create duplicate rows or orphan files', async () => {
        const before = await fs.readdir(process.env.DOCUMENT_STORAGE_DIR_TEST);
        const responses = await Promise.all([upload(client, { uploadKey: 'concurrent-key' }), upload(client, { uploadKey: 'concurrent-key' })]);
        expect(responses.every(x => [201, 409].includes(x.status))).toBe(true);
        expect(responses.some(x => x.status === 201)).toBe(true);
        expect(await prisma.document.count()).toBe(1);
        expect((await fs.readdir(process.env.DOCUMENT_STORAGE_DIR_TEST)).length - before.length).toBe(1);
    });
    it('paginates scoped records without disclosing a foreign cursor', async () => {
        await prisma.document.createMany({ data: Array.from({ length: 51 }, (_, index) => ({ id: `fictional-page-${index}`, clientId: a.id, name: `page-${index}.pdf`, storagePath: 'legacy' })) });
        const first = await request(app).get('/api/documents').set(authHeader(client)).expect(200);
        expect(first.body.documents).toHaveLength(50);
        const second = await request(app).get('/api/documents').query({ cursor: first.body.nextCursor }).set(authHeader(client)).expect(200);
        expect(second.body.documents).toHaveLength(1);
        expect(new Set([...first.body.documents, ...second.body.documents].map(x => x.id)).size).toBe(51);
        await request(app).get('/api/documents').query({ cursor: first.body.nextCursor }).set(authHeader(other)).expect(404);
    });
    it('rejects configured public storage roots and forged managed paths', async () => {
        const original = process.env.DOCUMENT_STORAGE_DIR_TEST;
        try { process.env.DOCUMENT_STORAGE_DIR_TEST = path.resolve(__dirname, '../../..', 'frontend/public'); await upload(client).expect(503); }
        finally { process.env.DOCUMENT_STORAGE_DIR_TEST = original; }
        const doc = (await upload(client).expect(201)).body;
        await prisma.document.update({ where: { id: doc.id }, data: { storagePath: '../../private.env' } });
        await raw(client, doc.id).expect(409);
    });
});
