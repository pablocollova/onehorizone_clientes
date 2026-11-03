const request = require('supertest');
const { app } = require('../../src/app');
const { prisma, cleanTestDb, createUser, createClient, createServiceRecord } = require('../helpers/db');
const { signAuthToken } = require('../../src/middleware/auth');
const header = user => ({ Authorization: `Bearer ${signAuthToken(user)}` });

describe.sequential('dashboard service views', () => {
    beforeEach(cleanTestDb);
    afterAll(async () => { await cleanTestDb(); await prisma.$disconnect(); });
    it.each(['CLIENT_ADMIN', 'CLIENT_USER'])('scopes %s to its own services without internal costs or contact data', async role => {
        const a = await createClient(), b = await createClient();
        const { user } = await createUser({ clientId: a.id, role });
        const own = await createServiceRecord({ clientId: a.id, title: 'Own installation', costCents: 90000 });
        await createServiceRecord({ clientId: b.id, title: 'Other company' });
        const result = await request(app).get('/api/workspace/services').set(header(user)).expect(200);
        expect(result.body.records.map(x => x.id)).toEqual([own.id]);
        expect(result.body.records[0]).not.toHaveProperty('costCents');
        expect(result.body.records[0].client).not.toHaveProperty('email');
        await request(app).get(`/api/workspace/services?clientId=${b.id}`).set(header(user)).expect(403);
        await request(app).get('/api/workspace/options').set(header(user)).expect(403);
    });
    it.each(['PLATFORM_ADMIN', 'PLATFORM_USER'])('gives %s global read and explicit company filters', async role => {
        const a = await createClient(), b = await createClient();
        const { user } = await createUser({ role, clientId: null });
        await createServiceRecord({ clientId: a.id });
        const own = await createServiceRecord({ clientId: b.id, status: 'COMPLETED' });
        const all = await request(app).get('/api/workspace/services').set(header(user)).expect(200);
        expect(all.body.records).toHaveLength(2);
        const filtered = await request(app).get(`/api/workspace/services?clientId=${b.id}&status=COMPLETED`).set(header(user)).expect(200);
        expect(filtered.body.records.map(x => x.id)).toEqual([own.id]);
        const options = await request(app).get('/api/workspace/options').set(header(user)).expect(200);
        expect(options.body.clients).toHaveLength(2);
        expect(options.body.clients[0]).not.toHaveProperty('email');
    });
    it('requires a current session and validates filters', async () => {
        await request(app).get('/api/workspace/services').expect(401);
        const { user } = await createUser({ role: 'PLATFORM_ADMIN', clientId: null });
        await request(app).get('/api/workspace/services?status=UNKNOWN').set(header(user)).expect(400);
        const token = header(user);
        await prisma.user.update({ where: { id: user.id }, data: { status: 'DISABLED' } });
        await request(app).get('/api/workspace/services').set(token).expect(401);
    });
});
