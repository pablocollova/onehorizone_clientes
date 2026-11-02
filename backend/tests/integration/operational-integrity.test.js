const request = require('supertest');
const { app } = require('../../src/app');
const { authHeader, cleanTestDb, createActiveUser, createClient, createInvoice, createLocation, createServiceRecord, prisma } = require('../helpers/db');

describe.sequential('T04 operational integrity (fictional local tenants)', () => {
    let admin, a, b, locationA, locationB, invoiceA, invoiceB;
    beforeEach(async () => {
        await cleanTestDb();
        admin = (await createActiveUser({ role: 'PLATFORM_ADMIN', clientId: null })).user;
        a = await createClient(); b = await createClient();
        locationA = await createLocation({ clientId: a.id });
        locationB = await createLocation({ clientId: b.id });
        invoiceA = await createInvoice({ clientId: a.id, locationId: locationA.id });
        invoiceB = await createInvoice({ clientId: b.id, locationId: locationB.id });
    });
    afterAll(async () => { await cleanTestDb(); await prisma.$disconnect(); });
    const invoiceBody = () => ({ clientId: a.id, type: 'ONEHORIZON_FEE', totalCents: 10000 });
    const serviceBody = () => ({ clientId: a.id, title: 'Fictional inspection', serviceDate: '2026-11-02', costCents: 4000 });
    const post = (route, body) => request(app).post(`/api/admin/${route}`).set(authHeader(admin)).send(body);
    const patch = (route, id, body) => request(app).patch(`/api/admin/${route}/${id}`).set(authHeader(admin)).send(body);

    it('creates and updates valid invoices and service records without changing contracts', async () => {
        const invoice = await post('invoices', { ...invoiceBody(), locationId: locationA.id }).expect(201);
        const service = await post('service-records', { ...serviceBody(), locationId: locationA.id, invoiceId: invoice.body.id }).expect(201);
        await patch('invoices', invoice.body.id, { number: 'FICTIONAL-001' }).expect(200);
        await patch('service-records', service.body.id, { status: 'COMPLETED' }).expect(200);
    });
    it('provides a real global administrative summary and denies client roles', async () => {
        await createServiceRecord({ clientId: b.id });
        const summary = await request(app).get('/api/admin/overview').set(authHeader(admin)).expect(200);
        expect(summary.body.counts).toEqual({ clients: 2, locations: 2, activeUsers: 1, pendingInvitations: 0, pendingInvoices: 2, pendingServices: 1, documents: 0 });
        for (const role of ['CLIENT_ADMIN', 'CLIENT_USER']) {
            const user = (await createActiveUser({ role, clientId: a.id })).user;
            await request(app).get('/api/admin/overview').set(authHeader(user)).expect(403);
        }
        await request(app).get('/api/admin/overview').expect(401);
    });
    it('returns validation errors for malformed list filters instead of database errors', async () => {
        for (const path of ['invoices?status=UNKNOWN', 'invoices?type=UNKNOWN', 'invoices?status=ISSUED&status=PAID', 'service-records?billingMode=UNKNOWN', 'service-records?status=UNKNOWN']) {
            await request(app).get(`/api/admin/${path}`).set(authHeader(admin)).expect(400);
        }
    });
    it('rejects a foreign location on invoice creation and patch without persisting changes', async () => {
        await post('invoices', { ...invoiceBody(), locationId: locationB.id }).expect(400);
        await patch('invoices', invoiceA.id, { locationId: locationB.id }).expect(400);
        expect((await prisma.invoice.findUnique({ where: { id: invoiceA.id } })).locationId).toBe(locationA.id);
        expect(await prisma.invoice.count()).toBe(2);
    });
    it('validates final associations when only clientId changes', async () => {
        await patch('invoices', invoiceA.id, { clientId: b.id }).expect(400);
        const service = await createServiceRecord({ clientId: a.id, invoiceId: invoiceA.id });
        await patch('service-records', service.id, { clientId: b.id }).expect(400);
    });
    it('rejects foreign invoices and locations in service creation and editing', async () => {
        await post('service-records', { ...serviceBody(), invoiceId: invoiceB.id }).expect(400);
        await post('service-records', { ...serviceBody(), locationId: locationB.id }).expect(400);
        const service = await createServiceRecord({ clientId: a.id });
        await patch('service-records', service.id, { invoiceId: invoiceB.id }).expect(400);
        await patch('service-records', service.id, { locationId: locationB.id }).expect(400);
    });
    it.each(['document', 'serviceRecord'])('prevents invoice reassignment leaving an inverse %s association', async model => {
        if (model === 'document') await prisma.document.create({ data: { clientId: a.id, invoiceId: invoiceA.id, name: 'fictional.txt', storagePath: 'fictional/private.txt' } });
        else await createServiceRecord({ clientId: a.id, invoiceId: invoiceA.id });
        await patch('invoices', invoiceA.id, { clientId: b.id, locationId: null }).expect(400);
        expect((await prisma.invoice.findUnique({ where: { id: invoiceA.id } })).clientId).toBe(a.id);
    });
    it('preserves the financial identity and amount of invoices with payments', async () => {
        await prisma.payment.create({ data: { invoiceId: invoiceA.id, amountCents: 4000 } });
        for (const data of [{ currency: 'USD' }, { totalCents: 3000 }, { clientId: b.id, locationId: null }]) await patch('invoices', invoiceA.id, data).expect(400);
        await patch('invoices', invoiceA.id, { number: 'FICTIONAL-CORRECTION' }).expect(200);
    });
    it.each([-1, 1.5, '100', null, true, 2147483648])('rejects malformed cents %s on both flows', async value => {
        await post('invoices', { ...invoiceBody(), totalCents: value }).expect(400);
        await post('service-records', { ...serviceBody(), costCents: value }).expect(400);
        await patch('invoices', invoiceA.id, { totalCents: value }).expect(400);
    });
    it.each([{ status: 'UNKNOWN' }, { type: null }, { currency: 'eur' }, { dueDate: '2026-02-30' }, { dueDate: true }, { clientId: 'missing' }, { vendorId: 'missing' }])('rejects invalid invoice fields %j', async data => {
        await post('invoices', { ...invoiceBody(), ...data }).expect(400);
        await patch('invoices', invoiceA.id, data).expect(400);
    });
    it.each([{ status: 'UNKNOWN' }, { billingMode: 'UNKNOWN' }, { serviceDate: null }, { serviceDate: 'invalid' }, { title: ' ' }, { currency: null }, { invoiceId: 'missing' }])('rejects invalid service fields %j', async data => {
        await post('service-records', { ...serviceBody(), ...data }).expect(400);
    });
    it.each(['CLIENT_ADMIN', 'CLIENT_USER'])('denies all operational writes to %s even on their company', async role => {
        const user = (await createActiveUser({ role, clientId: a.id })).user;
        for (const [route, body, id] of [['invoices', invoiceBody(), invoiceA.id], ['service-records', serviceBody(), 'missing']]) {
            await request(app).post(`/api/admin/${route}`).set(authHeader(user)).send(body).expect(403);
            await request(app).patch(`/api/admin/${route}/${id}`).set(authHeader(user)).send(body).expect(403);
        }
    });
    it('ignores another company query on client reads and does not disclose storage paths', async () => {
        const user = (await createActiveUser({ role: 'CLIENT_USER', clientId: a.id })).user;
        await prisma.document.create({ data: { clientId: b.id, name: 'foreign-private.txt', storagePath: 'private/foreign.txt' } });
        const invoices = await request(app).get(`/invoices?clientId=${b.id}`).set(authHeader(user)).expect(200);
        expect(invoices.body.invoices.map(x => x.id)).toEqual([invoiceA.id]);
        const dashboard = await request(app).get(`/api/dashboard?clientId=${b.id}`).set(authHeader(user)).expect(200);
        expect(dashboard.body.recentDocuments).toEqual([]);
        expect(JSON.stringify(dashboard.body)).not.toContain('storagePath');
    });
});
