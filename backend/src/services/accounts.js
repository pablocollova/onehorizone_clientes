const prisma = require('../prisma');
const currencies = ['EUR', 'GBP', 'USD'];
class AccountError extends Error {
    constructor(message, status = 400) { super(message); this.status = status; }
}
const ensure = (condition, message, status) => { if (!condition) throw new AccountError(message, status); };
const text = (value, name) => { ensure(typeof value === 'string' && value.trim().length > 0 && value.length <= 300, `${name} is required (maximum 300 characters)`); return value.trim(); };
const cents = value => { ensure(Number.isInteger(value) && value > 0 && value <= 2147483647, 'Amount must be positive integer cents'); return value; };
function date(value) {
    ensure(typeof value === 'string' && /^\d{4}-\d{2}-\d{2}(T.*)?$/.test(value), 'Invalid date');
    const result = new Date(value);
    ensure(Number.isFinite(result.getTime()) && result.toISOString().slice(0, 10) === value.slice(0, 10) && result <= new Date(), 'Invalid or future date');
    return result;
}
function scope(actor, requested) {
    if (['CLIENT_ADMIN', 'CLIENT_USER'].includes(actor.role)) {
        ensure(actor.clientId, 'Company required', 403);
        ensure(!requested || requested === actor.clientId, 'Company not accessible', 403);
        return actor.clientId;
    }
    ensure(['PLATFORM_ADMIN', 'PLATFORM_USER'].includes(actor.role), 'Forbidden', 403);
    return text(requested, 'Company');
}
function writer(actor) { ensure(['PLATFORM_ADMIN', 'CLIENT_ADMIN'].includes(actor.role), 'Read-only role', 403); }
async function company(db, id) { ensure(await db.client.findUnique({ where: { id } }), 'Company not found', 404); }
async function event(db, actor, clientId, entityId, action, details) {
    return db.financeEvent.create({ data: { clientId, entityId, action, actorId: actor.id, actorRole: actor.role, details: { ...details, actorName: actor.username || actor.id } } });
}
function transaction(fn) { return prisma.$transaction(fn, { isolationLevel: 'Serializable' }); }
function eligible(invoice) { return currencies.includes(invoice.currency) && invoice.totalCents >= 0 && ['ISSUED', 'OVERDUE'].includes(invoice.status) && (invoice.type !== 'VENDOR_REBILL' || invoice.advance); }
function recipient(invoice) { return invoice.type === 'VENDOR_DIRECT' ? 'VENDOR' : 'ONE_HORIZON'; }

async function createReceipt(actor, input) {
    writer(actor);
    const clientId = scope(actor, input.clientId);
    const data = {
        clientId, amountCents: cents(input.amountCents), currency: input.currency,
        recipient: input.recipient, vendorId: input.vendorId || null,
        paidAt: date(input.paidAt), reference: text(input.reference, 'Reference'),
        requestKey: text(input.requestKey, 'Request key'), createdBy: actor.id,
    };
    ensure(currencies.includes(data.currency), 'Use EUR, GBP or USD');
    ensure(['ONE_HORIZON', 'VENDOR'].includes(data.recipient), 'Invalid recipient');
    ensure(data.recipient === 'VENDOR' ? typeof data.vendorId === 'string' : data.vendorId === null, 'Vendor required only for direct supplier payments');
    return transaction(async db => {
        await company(db, clientId);
        if (data.vendorId) {
            // A client cannot probe/use arbitrary global suppliers.
            ensure(await db.invoice.findFirst({ where: { clientId, vendorId: data.vendorId, type: 'VENDOR_DIRECT' } }), 'Supplier not available for this company');
        }
        const old = await db.paymentReceipt.findUnique({ where: { clientId_requestKey: { clientId, requestKey: data.requestKey } } });
        if (old) {
            ensure(['amountCents', 'currency', 'recipient', 'vendorId', 'reference'].every(k => old[k] === data[k]) && old.paidAt.getTime() === data.paidAt.getTime(), 'Request key already used with different data', 409);
            return old;
        }
        const result = await db.paymentReceipt.create({ data });
        await event(db, actor, clientId, result.id, 'PAYMENT_RECORDED', { amountCents: data.amountCents, currency: data.currency, recipient: data.recipient });
        return result;
    });
}
async function transition(actor, id, next) {
    writer(actor);
    ensure(['REVIEW', 'CONFIRMED'].includes(next), 'Invalid payment state');
    return transaction(async db => {
        const payment = await db.paymentReceipt.findUnique({ where: { id } });
        ensure(payment, 'Payment not found', 404);
        scope(actor, payment.clientId);
        if (payment.status === next) return payment;
        ensure((payment.status === 'PROCESSING' && next === 'REVIEW') || (payment.status === 'REVIEW' && next === 'CONFIRMED'), 'Invalid state transition', 409);
        const result = await db.paymentReceipt.update({ where: { id }, data: {
            status: next, ...(next === 'CONFIRMED' ? { confirmedBy: actor.id, confirmedAt: new Date() } : {}),
        } });
        await event(db, actor, payment.clientId, id, `PAYMENT_${next}`, { from: payment.status, to: next });
        return result;
    });
}
async function allocate(actor, id, input) {
    writer(actor);
    const amountCents = cents(input.amountCents), requestKey = text(input.requestKey, 'Request key');
    const invoiceId = text(input.invoiceId, 'Invoice');
    return transaction(async db => {
        const payment = await db.paymentReceipt.findUnique({ where: { id }, include: { allocations: true } });
        ensure(payment, 'Payment not found', 404);
        scope(actor, payment.clientId);
        const old = await db.paymentAllocation.findUnique({ where: { receiptId_requestKey: { receiptId: id, requestKey } } });
        if (old) { ensure(old.invoiceId === invoiceId && old.amountCents === amountCents, 'Request key conflict', 409); return old; }
        ensure(payment.status === 'CONFIRMED', 'Only confirmed payments can be allocated', 409);
        const invoice = await db.invoice.findUnique({ where: { id: invoiceId }, include: { allocations: true, advance: true, payments: true } });
        ensure(invoice && invoice.clientId === payment.clientId, 'Invoice not accessible', 403);
        ensure(eligible(invoice), 'Invoice is not an outstanding obligation', 409);
        ensure(invoice.payments.length === 0, 'Historical payments require reconciliation before allocating', 409);
        ensure(invoice.currency === payment.currency && recipient(invoice) === payment.recipient && (payment.recipient !== 'VENDOR' || invoice.vendorId === payment.vendorId), 'Currency or recipient mismatch');
        ensure(payment.allocations.reduce((n, x) => n + x.amountCents, 0) + amountCents <= payment.amountCents, 'Amount exceeds unapplied payment', 409);
        ensure(invoice.allocations.reduce((n, x) => n + x.amountCents, 0) + amountCents <= invoice.totalCents, 'Amount exceeds invoice outstanding', 409);
        const result = await db.paymentAllocation.create({ data: { receiptId: id, invoiceId, amountCents, requestKey, createdBy: actor.id } });
        await event(db, actor, payment.clientId, result.id, 'PAYMENT_ALLOCATED', { receiptId: id, invoiceId, amountCents, currency: payment.currency });
        return result;
    });
}
async function recordAdvance(actor, invoiceId, input) {
    ensure(actor.role === 'PLATFORM_ADMIN', 'Only One Horizon can record its supplier advance', 403);
    const reference = text(input.reference, 'Reference'), paidAt = date(input.paidAt);
    return transaction(async db => {
        const invoice = await db.invoice.findUnique({ where: { id: invoiceId }, include: { advance: true } });
        ensure(invoice, 'Invoice not found', 404);
        ensure(invoice.type === 'VENDOR_REBILL' && ['ISSUED', 'OVERDUE'].includes(invoice.status), 'Not a reimbursable invoice');
        ensure(currencies.includes(invoice.currency) && invoice.totalCents > 0 && invoice.vendorId, 'Vendor, supported currency and amount required');
        if (invoice.advance) {
            ensure(invoice.advance.reference === reference && invoice.advance.paidAt.getTime() === paidAt.getTime(), 'Advance already recorded', 409);
            return invoice.advance;
        }
        const result = await db.vendorAdvance.create({ data: { invoiceId, reference, paidAt, createdBy: actor.id } });
        await event(db, actor, invoice.clientId, result.id, 'VENDOR_ADVANCE_RECORDED', { invoiceId, amountCents: invoice.totalCents, currency: invoice.currency, reference });
        return result;
    });
}
async function recordRate(actor, input) {
    writer(actor);
    const clientId = scope(actor, input.clientId), source = text(input.source, 'Rate source'), effectiveAt = date(input.effectiveAt);
    ensure(['GBP', 'USD'].includes(input.currency), 'Rate must be GBP or USD to EUR');
    ensure(typeof input.eurPerUnit === 'string' && /^\d{1,3}(\.\d{1,6})?$/.test(input.eurPerUnit), 'Use a decimal rate with at most six decimal places');
    const [whole, fractional = ''] = input.eurPerUnit.split('.');
    const eurMicros = Number(whole) * 1000000 + Number(fractional.padEnd(6, '0'));
    ensure(eurMicros > 0 && eurMicros <= 2147483647, 'Rate out of range');
    return transaction(async db => {
        await company(db, clientId);
        const result = await db.exchangeRate.create({ data: { clientId, currency: input.currency, eurMicros, source, effectiveAt, createdBy: actor.id } });
        await event(db, actor, clientId, result.id, 'EXCHANGE_RATE_RECORDED', { currency: input.currency, eurMicros, source, effectiveAt: effectiveAt.toISOString() });
        return result;
    });
}
// Integer arithmetic, rounding half up; output remains cents.
function equivalent(amountCents, rate) {
    if (!rate) return null;
    const value = BigInt(amountCents), magnitude = value < 0n ? -value : value;
    const rounded = (magnitude * BigInt(rate.eurMicros) + 500000n) / 1000000n;
    return Number(value < 0n ? -rounded : rounded);
}
async function statement(actor, requested) {
    const clientId = scope(actor, requested);
    return prisma.$transaction(async db => {
        await company(db, clientId);
        const [invoices, receipts, rates, events] = await Promise.all([
            db.invoice.findMany({ where: { clientId }, include: { allocations: true, advance: true, payments: true, vendor: { select: { id: true, name: true } } }, orderBy: { issueDate: 'desc' } }),
            db.paymentReceipt.findMany({ where: { clientId }, include: { allocations: true, vendor: { select: { id: true, name: true } } }, orderBy: { createdAt: 'desc' } }),
            db.exchangeRate.findMany({ where: { clientId, effectiveAt: { lte: new Date() } }, orderBy: [{ effectiveAt: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }] }),
            db.financeEvent.findMany({ where: { clientId }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] }),
        ]);
        const balances = [];
        for (const currency of currencies) for (const target of ['ONE_HORIZON', 'VENDOR']) {
            const debts = invoices.filter(x => x.currency === currency && recipient(x) === target && eligible(x));
            const payments = receipts.filter(x => x.currency === currency && x.recipient === target);
            const billedCents = debts.reduce((n, x) => n + x.totalCents, 0);
            const appliedCents = debts.reduce((n, x) => n + x.allocations.reduce((s, a) => s + a.amountCents, 0), 0);
            const confirmedCents = payments.filter(x => x.status === 'CONFIRMED').reduce((n, x) => n + x.amountCents, 0);
            const allocatedCents = payments.reduce((n, x) => n + x.allocations.reduce((s, a) => s + a.amountCents, 0), 0);
            const outstandingCents = billedCents - appliedCents;
            const netCents = outstandingCents - (confirmedCents - allocatedCents);
            const rate = currency === 'EUR' ? { eurMicros: 1000000, source: 'EUR', effectiveAt: null } : rates.find(x => x.currency === currency);
            balances.push({ currency, recipient: target, billedCents, appliedCents, outstandingCents, confirmedCents,
                unappliedCents: confirmedCents - allocatedCents,
                processingCents: payments.filter(x => x.status === 'PROCESSING').reduce((n, x) => n + x.amountCents, 0),
                reviewCents: payments.filter(x => x.status === 'REVIEW').reduce((n, x) => n + x.amountCents, 0),
                netCents, netEurCents: equivalent(netCents, rate),
                outstandingEurCents: equivalent(outstandingCents, rate), unappliedEurCents: equivalent(confirmedCents - allocatedCents, rate), rate: rate || null });
        }
        const rateFor = currency => currency === 'EUR' ? { eurMicros: 1000000 } : rates.find(x => x.currency === currency);
        return { clientId, generatedAt: new Date().toISOString(), balances, receipts: receipts.map(x => ({ ...x, amountEurCents: equivalent(x.amountCents, rateFor(x.currency)) })), events,
            invoices: invoices.map(({ payments, ...x }) => ({ ...x, totalEurCents: equivalent(x.totalCents, rateFor(x.currency)), legacyPaymentsCount: payments.length, eligible: Boolean(eligible(x)), recipient: recipient(x), appliedCents: x.allocations.reduce((n, a) => n + a.amountCents, 0) })),
            warnings: {
                legacyPayments: invoices.reduce((n, x) => n + x.payments.length, 0),
                unrecognizedReimbursements: invoices.filter(x => x.type === 'VENDOR_REBILL' && !x.advance && ['ISSUED', 'OVERDUE'].includes(x.status)).length,
                unsupportedCurrencies: invoices.filter(x => !currencies.includes(x.currency)).length,
                historicalPaidInvoices: invoices.filter(x => x.status === 'PAID').length,
            },
        };
    }, { isolationLevel: 'RepeatableRead' });
}
module.exports = { AccountError, createReceipt, transition, allocate, recordAdvance, recordRate, statement };
