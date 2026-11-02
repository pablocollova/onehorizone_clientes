const request = require('supertest');
const { app } = require('../../src/app');
const { prisma, cleanTestDb, createClient, createActiveUser, createInvoice } = require('../helpers/db');
describe.sequential('operational accounts: local fictional data', () => {
    let a, b, admin, client, other, invoice, seq = 0;
    const post = (actor, path, body) => request(app).post(`/api/accounts/${path}`).set(authHeader(actor)).send(body);
    const { authHeader } = require('../helpers/db');
    const pay = (overrides = {}) => ({ clientId: a.id, currency: 'EUR', amountCents: 4000, recipient: 'ONE_HORIZON', paidAt: '2026-01-01', reference: 'Fictional transfer', requestKey: `receipt-${++seq}`, ...overrides });
    const account = actor => request(app).get(`/api/accounts/statement?clientId=${a.id}`).set(authHeader(actor));
    const confirm = async (actor, id) => { await post(actor, `payments/${id}/state`, { status: 'REVIEW' }).expect(200); await post(actor, `payments/${id}/state`, { status: 'CONFIRMED' }).expect(200); };
    beforeEach(async () => {
        await cleanTestDb(); a = await createClient(); b = await createClient();
        admin = (await createActiveUser({ role: 'PLATFORM_ADMIN', clientId: null })).user;
        client = (await createActiveUser({ clientId: a.id })).user;
        other = (await createActiveUser({ clientId: b.id })).user;
        invoice = await createInvoice({ clientId: a.id, totalCents: 10000 });
    });
    afterAll(async () => { await cleanTestDb(); await prisma.$disconnect(); });
    it.each(['platform', 'client'])('allows %s admin to confirm and partially allocate: 100 - 40 = 60', async role => {
        const actor = role === 'platform' ? admin : client;
        const payment = (await post(actor, 'payments', pay()).expect(200)).body;
        await post(actor, `payments/${payment.id}/allocations`, { invoiceId: invoice.id, amountCents: 4000, requestKey: 'alloc' }).expect(409);
        await post(actor, `payments/${payment.id}/state`, { status: 'REVIEW' }).expect(200);
        const review = (await account(actor).expect(200)).body;
        expect(review.balances.find(x => x.currency === 'EUR' && x.recipient === 'ONE_HORIZON')).toMatchObject({ outstandingCents: 10000, reviewCents: 4000 });
        await post(actor, `payments/${payment.id}/state`, { status: 'CONFIRMED' }).expect(200);
        expect((await account(actor)).body.balances.find(x => x.currency === 'EUR' && x.recipient === 'ONE_HORIZON')).toMatchObject({ outstandingCents: 10000, unappliedCents: 4000, netCents: 6000 });
        await post(actor, `payments/${payment.id}/allocations`, { invoiceId: invoice.id, amountCents: 4000, requestKey: 'alloc' }).expect(200);
        const result = (await account(actor).expect(200)).body;
        expect(result.balances.find(x => x.currency === 'EUR' && x.recipient === 'ONE_HORIZON')).toMatchObject({ outstandingCents: 6000, appliedCents: 4000, unappliedCents: 0, outstandingEurCents: 6000, netCents: 6000 });
        expect(result.events.find(x => x.action === 'PAYMENT_CONFIRMED')).toMatchObject({ actorId: actor.id, actorRole: actor.role });
        const dashboard = await request(app).get('/api/dashboard').set(authHeader(client)).expect(200);
        expect(dashboard.body.currentBalance).toBe(60);
        expect(dashboard.body.balances.find(x => x.currency === 'EUR' && x.recipient === 'ONE_HORIZON').netCents).toBe(6000);
    });
    it('uses idempotency keys without duplicating receipts, confirmations or allocations', async () => {
        const body = pay();
        const receipt = (await post(client, 'payments', body).expect(200)).body;
        expect((await post(client, 'payments', body).expect(200)).body.id).toBe(receipt.id);
        await post(client, 'payments', { ...body, amountCents: 5000 }).expect(409);
        await confirm(client, receipt.id);
        await post(client, `payments/${receipt.id}/state`, { status: 'CONFIRMED' }).expect(200);
        const allocation = { invoiceId: invoice.id, amountCents: 4000, requestKey: 'stable' };
        await post(client, `payments/${receipt.id}/allocations`, allocation).expect(200);
        await post(client, `payments/${receipt.id}/allocations`, allocation).expect(200);
        await post(client, `payments/${receipt.id}/allocations`, { ...allocation, amountCents: 1 }).expect(409);
        expect(await prisma.paymentReceipt.count()).toBe(1);
        expect(await prisma.paymentAllocation.count()).toBe(1);
        expect(await prisma.financeEvent.count({ where: { action: 'PAYMENT_CONFIRMED' } })).toBe(1);
    });
    it('keeps excess money unapplied and supports several invoices per payment and vice versa', async () => {
        const second = await createInvoice({ clientId: a.id, totalCents: 2000 });
        const receipt = (await post(admin, 'payments', pay({ amountCents: 15000 })).expect(200)).body;
        await confirm(client, receipt.id);
        for (const [id, amountCents] of [[invoice.id, 10000], [second.id, 2000]]) await post(client, `payments/${receipt.id}/allocations`, { invoiceId: id, amountCents, requestKey: id }).expect(200);
        await post(admin, `payments/${receipt.id}/allocations`, { invoiceId: invoice.id, amountCents: 1, requestKey: 'excess' }).expect(409);
        expect((await account(admin)).body.balances.find(x => x.currency === 'EUR' && x.recipient === 'ONE_HORIZON')).toMatchObject({ outstandingCents: 0, unappliedCents: 3000 });
    });
    it('isolates companies, receipts, rates, invoice allocations and history', async () => {
        const receipt = (await post(client, 'payments', pay()).expect(200)).body;
        await account(other).expect(403);
        await post(other, 'payments', pay()).expect(403);
        await post(other, `payments/${receipt.id}/state`, { status: 'REVIEW' }).expect(403);
        await post(other, `payments/${receipt.id}/allocations`, { invoiceId: invoice.id, amountCents: 1, requestKey: 'foreign' }).expect(403);
        await post(other, 'exchange-rates', { clientId: a.id }).expect(403);
        const foreign = await createInvoice({ clientId: b.id });
        await confirm(client, receipt.id);
        await post(client, `payments/${receipt.id}/allocations`, { invoiceId: foreign.id, amountCents: 1, requestKey: 'foreign-invoice' }).expect(403);
        const own = await request(app).get('/api/accounts/statement').set(authHeader(other)).expect(200);
        expect(own.body.receipts).toEqual([]); expect(own.body.events).toEqual([]);
    });
    it.each(['CLIENT_USER', 'PLATFORM_USER'])('permits reading but denies all financial writes for %s', async role => {
        const reader = (await createActiveUser({ role, clientId: role === 'CLIENT_USER' ? a.id : null })).user;
        await account(reader).expect(200);
        for (const [path, data] of [['payments', pay()], ['payments/unknown/state', { status: 'REVIEW' }], ['payments/unknown/allocations', {}], ['exchange-rates', {}], [`invoices/${invoice.id}/advance`, {}]]) await post(reader, path, data).expect(403);
    });
    it('separates direct supplier payments, own fees and documented reimbursable advances', async () => {
        const vendor = await prisma.vendor.create({ data: { name: 'Fictional electricity' } });
        const direct = await createInvoice({ clientId: a.id, vendorId: vendor.id, type: 'VENDOR_DIRECT', totalCents: 10000 });
        const rebill = await createInvoice({ clientId: a.id, vendorId: vendor.id, type: 'VENDOR_REBILL', totalCents: 7000 });
        let result = (await account(client)).body;
        expect(result.balances.find(x => x.currency === 'EUR' && x.recipient === 'ONE_HORIZON').billedCents).toBe(10000);
        expect(result.balances.find(x => x.currency === 'EUR' && x.recipient === 'VENDOR').billedCents).toBe(10000);
        await post(client, `invoices/${rebill.id}/advance`, { reference: 'Fictional bank record', paidAt: '2026-01-01' }).expect(403);
        await post(admin, `invoices/${rebill.id}/advance`, { reference: 'Fictional bank record', paidAt: '2026-01-01' }).expect(200);
        result = (await account(client)).body;
        expect(result.balances.find(x => x.currency === 'EUR' && x.recipient === 'ONE_HORIZON').billedCents).toBe(17000);
        const receipt = (await post(client, 'payments', pay({ recipient: 'VENDOR', vendorId: vendor.id })).expect(200)).body;
        await confirm(client, receipt.id);
        await post(client, `payments/${receipt.id}/allocations`, { invoiceId: invoice.id, amountCents: 4000, requestKey: 'wrong-target' }).expect(400);
        await post(client, `payments/${receipt.id}/allocations`, { invoiceId: direct.id, amountCents: 4000, requestKey: 'correct-target' }).expect(200);
    });
    it('separates currencies and records exact manual EUR equivalents with source and date', async () => {
        await createInvoice({ clientId: a.id, currency: 'GBP', totalCents: 10001 });
        const usd = await createInvoice({ clientId: a.id, currency: 'USD', totalCents: 10000 });
        let result = (await account(client)).body;
        expect(result.balances.find(x => x.currency === 'GBP' && x.recipient === 'ONE_HORIZON').outstandingEurCents).toBeNull();
        await post(client, 'exchange-rates', { clientId: a.id, currency: 'GBP', eurPerUnit: '1.234567', source: 'Fictional manual rate', effectiveAt: '2026-01-01' }).expect(200);
        result = (await account(client)).body;
        expect(result.balances.find(x => x.currency === 'GBP' && x.recipient === 'ONE_HORIZON')).toMatchObject({ outstandingCents: 10001, outstandingEurCents: 12347, rate: { source: 'Fictional manual rate', eurMicros: 1234567 } });
        const receipt = (await post(client, 'payments', pay()).expect(200)).body; await confirm(client, receipt.id);
        await post(client, `payments/${receipt.id}/allocations`, { invoiceId: usd.id, amountCents: 100, requestKey: 'currency-mismatch' }).expect(400);
    });
    it('reports credit balances and converts a negative GBP balance with symmetric rounding', async () => {
        await createInvoice({ clientId: a.id, currency: 'GBP', totalCents: 10000 });
        await post(client, 'exchange-rates', { clientId: a.id, currency: 'GBP', eurPerUnit: '1.25', source: 'Fictional manual rate', effectiveAt: '2026-01-01' }).expect(200);
        const receipt = (await post(client, 'payments', pay({ currency: 'GBP', amountCents: 15000 })).expect(200)).body;
        await confirm(client, receipt.id);
        expect((await account(client)).body.balances.find(x => x.currency === 'GBP' && x.recipient === 'ONE_HORIZON')).toMatchObject({ outstandingCents: 10000, unappliedCents: 15000, netCents: -5000, netEurCents: -6250 });
    });
    it('serializes competing allocations without overspending or overpaying', async () => {
        const receipt = (await post(client, 'payments', pay({ amountCents: 10000 })).expect(200)).body; await confirm(client, receipt.id);
        const results = await Promise.all(['a', 'b'].map(requestKey => post(client, `payments/${receipt.id}/allocations`, { invoiceId: invoice.id, amountCents: 8000, requestKey })));
        expect(results.map(x => x.status).sort()).toEqual([200, 409]);
        expect((await prisma.paymentAllocation.aggregate({ _sum: { amountCents: true } }))._sum.amountCents).toBe(8000);
    });
    it('serializes different receipts competing for the same invoice', async () => {
        const receipts = [];
        for (let i = 0; i < 2; i++) {
            const row = (await post(client, 'payments', pay({ amountCents: 8000 })).expect(200)).body;
            await confirm(client, row.id); receipts.push(row);
        }
        const results = await Promise.all(receipts.map(x => post(client, `payments/${x.id}/allocations`, { invoiceId: invoice.id, amountCents: 8000, requestKey: x.id })));
        expect(results.map(x => x.status).sort()).toEqual([200, 409]);
        const winner = results.find(x => x.status === 200).body.receiptId;
        const remaining = receipts.find(x => x.id !== winner);
        await post(client, `payments/${remaining.id}/allocations`, { invoiceId: invoice.id, amountCents: 2000, requestKey: 'partial-retry' }).expect(200);
        expect((await account(client)).body.balances.find(x => x.currency === 'EUR' && x.recipient === 'ONE_HORIZON')).toMatchObject({ outstandingCents: 0, appliedCents: 10000, unappliedCents: 6000 });
    });
    it('ignores injected status and confirmation metadata when recording a payment', async () => {
        const receipt = (await post(client, 'payments', pay({ status: 'CONFIRMED', confirmedBy: admin.id })).expect(200)).body;
        expect(receipt).toMatchObject({ status: 'PROCESSING', confirmedBy: null, confirmedAt: null, createdBy: client.id });
        await request(app).get('/api/accounts/statement').expect(401);
    });
    it('does not auto-confirm historical payments and blocks financial edits after allocation', async () => {
        const receipt = (await post(client, 'payments', pay()).expect(200)).body; await confirm(client, receipt.id);
        await post(client, `payments/${receipt.id}/allocations`, { invoiceId: invoice.id, amountCents: 4000, requestKey: 'a' }).expect(200);
        for (const body of [{ status: 'CANCELED' }, { currency: 'USD' }, { totalCents: 1 }, { type: 'VENDOR_DIRECT' }, { clientId: b.id }]) await request(app).patch(`/api/admin/invoices/${invoice.id}`).set(authHeader(admin)).send(body).expect(400);
        const legacy = await createInvoice({ clientId: a.id }); await prisma.payment.create({ data: { invoiceId: legacy.id, amountCents: 1000 } });
        expect((await account(client)).body.warnings.legacyPayments).toBe(1);
        await post(client, `payments/${receipt.id}/allocations`, { invoiceId: legacy.id, amountCents: 1, requestKey: 'legacy' }).expect(409);
    });
    it.each([-1, 0, 1.5, '100', null, true])('rejects invalid money %s', async amountCents => { await post(client, 'payments', pay({ amountCents })).expect(400); });
    it('rejects skipped/reversed states, draft/cancelled debts, unsupported currencies and malformed rates', async () => {
        const receipt = (await post(client, 'payments', pay()).expect(200)).body;
        await post(client, `payments/${receipt.id}/state`, { status: 'CONFIRMED' }).expect(409);
        await confirm(client, receipt.id);
        await post(client, `payments/${receipt.id}/state`, { status: 'REVIEW' }).expect(409);
        for (const status of ['DRAFT', 'CANCELED', 'PAID']) { const row = await createInvoice({ clientId: a.id, status }); await post(client, `payments/${receipt.id}/allocations`, { invoiceId: row.id, amountCents: 1, requestKey: status }).expect(409); }
        await post(client, 'payments', pay({ currency: 'JPY' })).expect(400);
        await post(client, 'payments', pay({ paidAt: '2026-02-30' })).expect(400);
        await post(client, 'exchange-rates', { clientId: a.id, currency: 'GBP', eurPerUnit: '1.1234567', effectiveAt: '2026-01-01', source: 'fake' }).expect(400);
    });
});
