const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const request = require('supertest')
const { app } = require('../../src/app')
const { getJwtSecret } = require('../../src/middleware/auth')
const { prisma, authHeader, cleanTestDb, createClient, createUser } = require('../helpers/db')

describe.sequential('invitation isolation and session revocation', () => {
  beforeEach(cleanTestDb)
  afterAll(async () => { await cleanTestDb(); await prisma.$disconnect() })

  for (const path of ['/api/admin/invites', '/api/admin/users/invite']) {
    describe(path, () => {
      it('rejects cross-client reinvites without changing the victim or its tokens', async () => {
        const a = await createClient(); const b = await createClient()
        const { user: admin } = await createUser({ role: 'CLIENT_ADMIN', clientId: a.id })
        const { user: victim } = await createUser({ status: 'INVITED', clientId: b.id, password: null })
        const token = await prisma.inviteToken.create({ data: {
          userId: victim.id, tokenHash: 'existing-hash', expiresAt: new Date(Date.now() + 60000),
        } })
        await request(app).post(path).set(authHeader(admin))
          .send({ email: victim.email, name: 'Hijacked', role: 'CLIENT_ADMIN' }).expect(403)
        expect(await prisma.user.findUnique({ where: { id: victim.id } })).toEqual(victim)
        expect(await prisma.inviteToken.findMany()).toEqual([token])
      })

      it('rejects explicit foreign clients, platform roles and ordinary users', async () => {
        const a = await createClient(); const b = await createClient()
        const { user: admin } = await createUser({ clientId: a.id, role: 'CLIENT_ADMIN' })
        const { user: ordinary } = await createUser({ clientId: a.id, role: 'CLIENT_USER' })
        const input = { email: 'new@example.com', role: 'CLIENT_USER' }
        await request(app).post(path).set(authHeader(admin)).send({ ...input, clientId: b.id }).expect(403)
        await request(app).post(path).set(authHeader(admin)).send({ ...input, role: 'PLATFORM_ADMIN' }).expect(403)
        await request(app).post(path).set(authHeader(ordinary)).send(input).expect(403)
        expect(await prisma.inviteToken.count()).toBe(0)
      })

      it('invites within the own client, normalizes email and rotates previous links', async () => {
        const client = await createClient()
        const { user: admin } = await createUser({ clientId: client.id, role: 'CLIENT_ADMIN' })
        const input = { email: ' Own.Invite@Example.com ', role: 'CLIENT_USER' }
        await request(app).post(path).set(authHeader(admin)).send(input).expect(200)
        const first = await prisma.inviteToken.findFirst()
        await request(app).post(path).set(authHeader(admin)).send(input).expect(200)
        const invited = await prisma.user.findUnique({ where: { email: 'own.invite@example.com' } })
        expect(invited).toMatchObject({ clientId: client.id, role: 'CLIENT_USER', status: 'INVITED' })
        expect((await prisma.inviteToken.findUnique({ where: { id: first.id } })).usedAt).toBeInstanceOf(Date)
        expect(await prisma.inviteToken.count({ where: { userId: invited.id, usedAt: null } })).toBe(1)
      })

      it('preserves platform-admin invitation capability and validates roles', async () => {
        const client = await createClient()
        const { user: admin } = await createUser({ clientId: null, role: 'PLATFORM_ADMIN' })
        await request(app).post(path).set(authHeader(admin)).expect(400)
        await request(app).post(path).set(authHeader(admin))
          .send({ email: 'new-admin@example.com', role: 'PLATFORM_ADMIN' }).expect(200)
        await request(app).post(path).set(authHeader(admin))
          .send({ email: 'new-client@example.com', role: 'CLIENT_ADMIN', clientId: client.id }).expect(200)
        await request(app).post(path).set(authHeader(admin))
          .send({ email: 'invalid@example.com', role: 'OWNER', clientId: client.id }).expect(400)
        await request(app).post(path).set(authHeader(admin))
          .send({ email: 'missing@example.com', role: 'CLIENT_USER', clientId: 'missing' }).expect(400)
      })

      it('does not modify active or disabled accounts', async () => {
        const client = await createClient()
        const { user: admin } = await createUser({ clientId: client.id })
        for (const status of ['ACTIVE', 'DISABLED']) {
          const { user } = await createUser({ clientId: client.id, status })
          await request(app).post(path).set(authHeader(admin))
            .send({ email: user.email, role: 'CLIENT_ADMIN' }).expect(400)
          expect(await prisma.user.findUnique({ where: { id: user.id } })).toEqual(user)
        }
      })
    })
  }

  it('keeps the alias default role and legacy response shape', async () => {
    const client = await createClient()
    const { user } = await createUser({ clientId: client.id })
    await request(app).post('/api/admin/invites').set(authHeader(user))
      .send({ email: 'default@example.com' }).expect(200)
      .expect(({ body }) => expect(body.inviteLink).toContain('/activate?token='))
    await request(app).post('/api/admin/users/invite').set(authHeader(user))
      .send({ email: 'legacy@example.com' }).expect(400)
    await request(app).post('/api/admin/users/invite').set(authHeader(user))
      .send({ email: 'legacy@example.com', role: 'CLIENT_USER' }).expect(200)
      .expect(({ body }) => { expect(body.ok).toBe(true); expect(body.inviteLink).toBeUndefined() })
  })

  for (const change of [{ status: 'DISABLED' }, { status: 'INVITED' }, { deletedAt: new Date() }, { role: 'CLIENT_USER' }]) {
    it(`rejects previously issued tokens after ${Object.keys(change)[0]} changes`, async () => {
      const client = await createClient()
      const { user } = await createUser({ clientId: client.id, role: 'CLIENT_ADMIN' })
      const header = authHeader(user)
      await request(app).get('/api/dashboard').set(header).expect(200)
      await prisma.user.update({ where: { id: user.id }, data: change })
      await request(app).get('/api/dashboard').set(header).expect(401)
      await request(app).get('/api/gdpr/me/export').set(header).expect(401)
    })
  }

  it('rejects stale tenant claims and deleted users', async () => {
    const a = await createClient(); const b = await createClient()
    const { user } = await createUser({ clientId: a.id })
    const header = authHeader(user)
    await prisma.user.update({ where: { id: user.id }, data: { clientId: b.id } })
    await request(app).get('/clients').set(header).expect(401)
    await prisma.user.delete({ where: { id: user.id } })
    await request(app).get('/clients').set(header).expect(401)
  })

  it('does not trust old platform-admin permissions after demotion', async () => {
    const client = await createClient()
    const { user } = await createUser({ role: 'PLATFORM_ADMIN', clientId: null })
    const header = authHeader(user)
    await prisma.user.update({ where: { id: user.id }, data: { role: 'CLIENT_USER', clientId: client.id } })
    await request(app).get('/api/admin/clients').set(header).expect(401)
  })

  it('revokes all existing sessions on logout and permits a fresh login', async () => {
    const client = await createClient()
    const { user, password } = await createUser({ clientId: client.id })
    const header = authHeader(user)
    const second = await request(app).post('/api/auth/login').send({ username: user.username, password }).expect(200)
    await request(app).post('/api/auth/logout').set(header).expect(200)
    await request(app).get('/me').set(header).expect(401)
    await request(app).get('/me').set('Authorization', `Bearer ${second.body.token}`).expect(401)
    const fresh = await request(app).post('/api/auth/login').send({ username: user.username, password }).expect(200)
    await request(app).get('/me').set('Authorization', `Bearer ${fresh.body.token}`).expect(200)
  })

  it('GDPR deletion revokes the token even if the account is subsequently reenabled', async () => {
    const client = await createClient()
    const { user } = await createUser({ clientId: client.id })
    const header = authHeader(user)
    await request(app).post('/api/gdpr/me/delete').set(header).expect(200)
    await request(app).get('/api/dashboard').set(header).expect(401)
    await prisma.user.update({ where: { id: user.id }, data: { status: 'ACTIVE', deletedAt: null } })
    await request(app).get('/api/dashboard').set(header).expect(401)
  })

  it('does not resurrect old sessions after disable/reenable or role reversal', async () => {
    const client = await createClient()
    const { user } = await createUser({ clientId: client.id, role: 'CLIENT_ADMIN' })
    const header = authHeader(user)
    await prisma.user.update({ where: { id: user.id }, data: { status: 'DISABLED' } })
    await prisma.user.update({ where: { id: user.id }, data: { status: 'ACTIVE' } })
    await request(app).get('/me').set(header).expect(401)
    const current = await prisma.user.findUnique({ where: { id: user.id } })
    const roleHeader = authHeader(current)
    await prisma.user.update({ where: { id: user.id }, data: { role: 'CLIENT_USER' } })
    await prisma.user.update({ where: { id: user.id }, data: { role: 'CLIENT_ADMIN' } })
    await request(app).get('/me').set(roleHeader).expect(401)
  })

  it('revokes sessions on password change but preserves them on a profile edit', async () => {
    const client = await createClient()
    const { user } = await createUser({ clientId: client.id })
    const header = authHeader(user)
    await prisma.user.update({ where: { id: user.id }, data: { name: 'Updated profile' } })
    await request(app).get('/me').set(header).expect(200)
    await prisma.user.update({ where: { id: user.id }, data: { password: 'changed-hash-for-test' } })
    await request(app).get('/me').set(header).expect(401)
  })

  it('does not attach consent to a revoked session and still accepts anonymous consent', async () => {
    const client = await createClient()
    const { user } = await createUser({ clientId: client.id })
    const header = authHeader(user)
    const consent = { type: 'ANALYTICS', value: false }
    await request(app).post('/api/auth/logout').set(header).expect(200)
    await request(app).post('/api/gdpr/consent').set(header).send(consent).expect(401)
    expect(await prisma.consentLog.count()).toBe(0)
    await request(app).post('/api/gdpr/consent').send(consent).expect(200)
    expect((await prisma.consentLog.findFirst()).userId).toBeNull()
  })

  it('rejects legacy, malformed, expired and invalid tokens', async () => {
    const client = await createClient()
    const { user } = await createUser({ clientId: client.id })
    const { sessionVersion, ...legacy } = user
    const tokens = [
      jwt.sign({ id: user.id, role: user.role, clientId: user.clientId }, getJwtSecret()),
      jwt.sign({ ...legacy, sessionVersion: '0' }, getJwtSecret()),
      jwt.sign({ id: user.id, role: user.role, clientId: user.clientId, sessionVersion }, getJwtSecret(), { expiresIn: -1 }),
      'invalid',
    ]
    for (const token of tokens) await request(app).get('/clients').set('Authorization', `Bearer ${token}`).expect(401)
    await request(app).post('/api/auth/logout').expect(401)
  })

  async function pendingToken(user, raw) {
    return prisma.inviteToken.create({ data: {
      userId: user.id, tokenHash: crypto.createHash('sha256').update(raw).digest('hex'),
      expiresAt: new Date(Date.now() + 60000),
    } })
  }

  it('does not reactivate disabled accounts through an outstanding invite', async () => {
    const client = await createClient()
    const { user } = await createUser({ clientId: client.id, status: 'DISABLED' })
    await pendingToken(user, 'disabled-invite')
    await request(app).post('/api/auth/activate').send({ token: 'disabled-invite', password: 'new-password' }).expect(400)
    expect((await prisma.user.findUnique({ where: { id: user.id } })).status).toBe('DISABLED')
  })

  it('allows exactly one concurrent activation and invalidates all sibling links', async () => {
    const client = await createClient()
    const { user } = await createUser({ clientId: client.id, status: 'INVITED', password: null })
    await pendingToken(user, 'concurrent-invite'); await pendingToken(user, 'sibling-invite')
    const results = await Promise.all([1, 2].map(() => request(app).post('/api/auth/activate')
      .send({ token: 'concurrent-invite', password: 'new-password' })))
    expect(results.filter(r => r.status === 200)).toHaveLength(1)
    expect(results.every(r => [200, 400, 409].includes(r.status))).toBe(true)
    await request(app).post('/api/auth/activate').send({ token: 'sibling-invite', password: 'other-password' }).expect(400)
    await request(app).get('/me').set('Authorization', `Bearer ${results.find(r => r.status === 200).body.token}`).expect(200)
  })
})
