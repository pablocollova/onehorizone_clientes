const ENUMS = {
    type: ['ONEHORIZON_FEE', 'VENDOR_REBILL', 'VENDOR_DIRECT'],
    invoiceStatus: ['DRAFT', 'ISSUED', 'PAID', 'OVERDUE', 'CANCELED'],
    serviceStatus: ['PENDING', 'COMPLETED', 'CANCELED'],
    billingMode: ['REBILL', 'DIRECT_VENDOR'],
};

class OperationalError extends Error {
    constructor(message, status = 400) {
        super(message);
        this.status = status;
    }
}

function assert(condition, message) {
    if (!condition) throw new OperationalError(message);
}

// Validate the final object, including unchanged associations on PATCH.
async function validateOperation(db, kind, record) {
    const isInvoice = kind === 'invoice';
    assert(typeof record.clientId === 'string' && record.clientId.length > 0, 'clientId is required');
    assert(await db.client.findUnique({ where: { id: record.clientId } }), 'Invalid clientId');
    for (const [field, model] of [['locationId', 'location'], ['vendorId', 'vendor'], ['invoiceId', 'invoice']]) {
        const id = record[field];
        if (id === null || id === undefined) continue;
        assert(typeof id === 'string' && id.length > 0, `Invalid ${field}`);
        const related = await db[model].findUnique({ where: { id } });
        assert(related, `Invalid ${field}`);
        if (model !== 'vendor') assert(related.clientId === record.clientId, `${field} belongs to another client`);
    }
    const amount = record[isInvoice ? 'totalCents' : 'costCents'];
    assert(Number.isInteger(amount) && amount >= 0 && amount <= 2147483647, 'Amount must be nonnegative integer cents within database range');
    assert(typeof record.currency === 'string' && /^[A-Z]{3}$/.test(record.currency), 'currency must be a three-letter uppercase code');
    assert(ENUMS[isInvoice ? 'invoiceStatus' : 'serviceStatus'].includes(record.status), 'Invalid status');
    assert(ENUMS[isInvoice ? 'type' : 'billingMode'].includes(record[isInvoice ? 'type' : 'billingMode']), 'Invalid type or billingMode');
    if (!isInvoice) assert(typeof record.title === 'string' && record.title.trim().length > 0, 'title is required');
    for (const field of isInvoice ? ['dueDate'] : ['serviceDate']) {
        const value = record[field];
        if (isInvoice && value === null) continue;
        assert(value instanceof Date && Number.isFinite(value.getTime()), `Invalid ${field}`);
    }
    if (isInvoice && record.id) {
        // A global administrator must not orphan inverse tenant associations either.
        for (const model of ['serviceRecord', 'document']) {
            assert(!await db[model].findFirst({ where: { invoiceId: record.id, clientId: { not: record.clientId } } }), 'Invoice has linked records in another client');
        }
        if (record.clientId !== record.originalClientId || record.currency !== record.originalCurrency || record.totalCents !== record.originalTotalCents) {
            assert(!await db.payment.findFirst({ where: { invoiceId: record.id } }), 'Cannot change client, currency or total of an invoice with payments');
        }
    }
}

function operationData(kind, body, existing) {
    assert(body && typeof body === 'object' && !Array.isArray(body), 'Invalid body');
    const isInvoice = kind === 'invoice';
    const fields = isInvoice
        ? ['clientId', 'locationId', 'vendorId', 'type', 'totalCents', 'currency', 'dueDate', 'status', 'number']
        : ['clientId', 'locationId', 'vendorId', 'title', 'description', 'serviceDate', 'costCents', 'currency', 'billingMode', 'status', 'invoiceId'];
    const data = existing ? {} : {
        locationId: null, vendorId: null, currency: 'EUR',
        ...(isInvoice ? { status: 'ISSUED', dueDate: null, number: null } : { status: 'PENDING', billingMode: 'REBILL', invoiceId: null, description: null }),
    };
    for (const key of fields) {
        if (body[key] === undefined) continue;
        const value = body[key];
        if (key === 'dueDate' || key === 'serviceDate') {
            // Reject JS date coercions (booleans/numbers) and normalized invalid calendar dates.
            assert(value === null && key === 'dueDate' || typeof value === 'string' && /^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value), `Invalid ${key}`);
            data[key] = value === null ? null : new Date(value);
            if (value !== null) assert(Number.isFinite(data[key].getTime()) && data[key].toISOString().slice(0, 10) === value.slice(0, 10), `Invalid ${key}`);
        } else {
            data[key] = value;
        }
    }
    for (const field of isInvoice ? ['number'] : ['description']) assert(data[field] === undefined || data[field] === null || typeof data[field] === 'string', `Invalid ${field}`);
    return data;
}

async function saveOperation(prisma, kind, body, id, include) {
    return prisma.$transaction(async db => {
        const existing = id ? await db[kind].findUnique({ where: { id } }) : null;
        if (id && !existing) throw new OperationalError('Record not found', 404);
        const data = operationData(kind, body, existing);
        await validateOperation(db, kind, {
            ...existing, ...data,
            originalClientId: existing?.clientId, originalCurrency: existing?.currency, originalTotalCents: existing?.totalCents,
        });
        return existing
            ? db[kind].update({ where: { id }, data, include })
            : db[kind].create({ data, include });
    }, { isolationLevel: 'Serializable' });
}

function operationError(error, res) {
    if (error instanceof OperationalError) return res.status(error.status).json({ error: 'VALIDATION_ERROR', message: error.message });
    if (['P2034', 'P2003'].includes(error.code)) return res.status(409).json({ error: 'RELATION_CONFLICT', message: 'The related data changed; reload and retry' });
    return null;
}

function validateFilters(kind, query) {
    for (const field of ['clientId', ...(kind === 'invoice' ? ['type', 'status'] : ['billingMode', 'status'])]) {
        const value = query[field];
        if (value === undefined) continue;
        assert(typeof value === 'string' && value.length > 0, `Invalid ${field} filter`);
        if (field !== 'clientId') assert(ENUMS[field === 'status' ? (kind === 'invoice' ? 'invoiceStatus' : 'serviceStatus') : field].includes(value), `Invalid ${field} filter`);
    }
}

module.exports = { saveOperation, operationError, validateFilters };
