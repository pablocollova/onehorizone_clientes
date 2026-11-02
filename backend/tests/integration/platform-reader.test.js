const request = require('supertest');
const { app } = require('../../src/app');
const { authHeader, cleanTestDb, createActiveUser, createClient, createInvoice, createLocation, createServiceRecord, prisma } = require('../helpers/db');

describe.sequential('four-role policy: One Horizon read-only user', () => {
    let reader, a, b, invoice, service;
    beforeEach(async () => {
        await cleanTestDb();
        reader = (await createActiveUser({ role: 'PLATFORM_USER', clientId: null })).user;
        a = await createClient(); b = await createClient();
        await createLocation({ clientId: b.id });
        invoice = await createInvoice({ clientId: b.id });
        service = await createServiceRecord({ clientId: b.id });
    });
    afterAll(async () => { await cleanTestDb(); await prisma.$disconnect(); });

    it('reads global operational data and can filter it by company', async () => {
        for (const path of ['/api/admin/overview', '/api/admin/clients', '/api/admin/users', '/api/admin/invoices', '/api/admin/service-records', '/api/dashboard', '/clients', `/clients/${b.id}/locations`]) {
            await request(app).get(path).set(authHeader(reader)).expect(200);
        }
        const all = await request(app).get('/api/admin/clients').set(authHeader(reader)).expect(200);
        expect(all.body.map(x => x.id).sort()).toEqual([a.id, b.id].sort());
        const filtered = await request(app).get(`/api/admin/invoices?clientId=${a.id}`).set(authHeader(reader)).expect(200);
        expect(filtered.body).toEqual([]);
        const invoices = await request(app).get('/invoices').set(authHeader(reader)).expect(200);
        expect(invoices.body.invoices.map(x => x.id)).toEqual([invoice.id]);
    });
    it('rejects every existing administrative write, including both invitation aliases', async () => {
        const before = await prisma.client.count();
        for (const path of ['/api/admin/clients', '/api/admin/invoices', '/api/admin/service-records', '/api/admin/invites', '/api/admin/users/invite']) {
            await request(app).post(path).set(authHeader(reader)).send({ clientId: b.id, role: 'PLATFORM_ADMIN', email: 'fictional@example.test' }).expect(403);
        }
        await request(app).patch(`/api/admin/invoices/${invoice.id}`).set(authHeader(reader)).send({ totalCents: 1 }).expect(403);
        await request(app).patch(`/api/admin/service-records/${service.id}`).set(authHeader(reader)).send({ status: 'COMPLETED' }).expect(403);
        expect(await prisma.client.count()).toBe(before);
        expect((await prisma.invoice.findUnique({ where: { id: invoice.id } })).totalCents).toBe(invoice.totalCents);
    });
    it.each(['CLIENT_ADMIN', 'CLIENT_USER'])('does not grant global access or escalation to %s', async role => {
        const actor = (await createActiveUser({ role, clientId: a.id })).user;
        for (const path of ['/api/admin/overview', '/api/admin/users', '/api/admin/clients', '/api/admin/invoices', '/api/admin/service-records']) await request(app).get(path).set(authHeader(actor)).expect(403);
        for (const path of ['/api/admin/invites', '/api/admin/users/invite']) await request(app).post(path).set(authHeader(actor)).send({ role: 'PLATFORM_USER', email: 'escalate@example.test' }).expect(403);
        const invoices = await request(app).get(`/invoices?clientId=${b.id}`).set(authHeader(actor)).expect(200);
        expect(invoices.body.invoices).toEqual([]);
    });
    it('allows only a platform admin to create an internal read-only invitation without a client', async () => {
        const admin = (await createActiveUser({ role: 'PLATFORM_ADMIN', clientId: null })).user;
        await request(app).post('/api/admin/users/invite').set(authHeader(admin)).send({ role: 'PLATFORM_USER', email: 'reader@example.test', name: 'Fictional reader' }).expect(200);
        const pending = await prisma.user.findUnique({ where: { email: 'reader@example.test' } });
        expect(pending).toMatchObject({ role: 'PLATFORM_USER', clientId: null, status: 'INVITED', password: null });
        await request(app).post('/api/admin/users/invite').set(authHeader(admin)).send({ role: 'PLATFORM_USER', clientId: a.id, email: 'bad-scope@example.test' }).expect(400);
    });
    it('revokes a former admin session after downgrade to the read-only role', async () => {
        const admin = (await createActiveUser({ role: 'PLATFORM_ADMIN', clientId: null })).user;
        const oldHeader = authHeader(admin);
        await prisma.user.update({ where: { id: admin.id }, data: { role: 'PLATFORM_USER' } });
        await request(app).get('/api/admin/clients').set(oldHeader).expect(401);
        const fresh = await prisma.user.findUnique({ where: { id: admin.id } });
        await request(app).get('/api/admin/clients').set(authHeader(fresh)).expect(200);
        await request(app).post('/api/admin/clients').set(authHeader(fresh)).send({ name: 'Fictional', email: 'fictional@example.test' }).expect(403);
    });
    it('rejects an inconsistent internal role with a client attached', async () => {
        const malformed = await prisma.user.update({ where: { id: reader.id }, data: { clientId: a.id } });
        await request(app).get('/api/admin/clients').set(authHeader(malformed)).expect(401);
    });
});
