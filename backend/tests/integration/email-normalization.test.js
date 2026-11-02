const request = require('supertest')
const { app } = require('../../src/app')
const { prisma, cleanTestDb, createClient, createUser } = require('../helpers/db')

describe.sequential('T16 email normalization', () => {
  beforeEach(cleanTestDb)
  afterAll(async () => { await cleanTestDb(); await prisma.$disconnect() })

  it('accepts uppercase and surrounding whitespace for email login', async () => {
    const client = await createClient()
    const { user, password } = await createUser({ clientId: client.id, email: 'person@example.com' })
    for (const username of ['person@example.com', 'PERSON@EXAMPLE.COM', '  Person@Example.Com  ']) {
      const res = await request(app).post('/api/auth/login').send({ username, password }).expect(200)
      expect(res.body.user.id).toBe(user.id)
      await request(app).get('/me').set('Authorization', `Bearer ${res.body.token}`).expect(200)
    }
  })

  it('supports legacy mixed-case emails without rewriting the stored identity', async () => {
    const client = await createClient()
    const { user, password } = await createUser({ clientId: client.id, email: 'Legacy.Person@Example.com' })
    await request(app).post('/api/auth/login')
      .send({ username: ' LEGACY.PERSON@example.COM ', password }).expect(200)
    expect(await prisma.user.findUnique({ where: { id: user.id } })).toEqual(user)
  })

  it('preserves case-sensitive usernames and exact passwords', async () => {
    const client = await createClient()
    const { password } = await createUser({ clientId: client.id, username: 'CaseSensitiveUser', email: 'case@example.com' })
    await request(app).post('/api/auth/login').send({ username: 'CaseSensitiveUser', password }).expect(200)
    await request(app).post('/api/auth/login').send({ username: 'casesensitiveuser', password }).expect(401)
    await request(app).post('/api/auth/login').send({ username: 'case@example.com', password: ` ${password} ` }).expect(401)
  })

  it('refuses ambiguous case-only email duplicates instead of selecting an account', async () => {
    const a = await createClient(); const b = await createClient()
    await createUser({ clientId: a.id, email: 'duplicate@example.com' })
    await createUser({ clientId: b.id, email: 'Duplicate@Example.com' })
    const duplicateGroups = await prisma.$queryRaw`SELECT COUNT(*)::int AS count FROM "User"
      WHERE email IS NOT NULL GROUP BY lower(btrim(email)) HAVING COUNT(*) > 1`
    expect(duplicateGroups).toEqual([{ count: 2 }])
    for (const username of ['duplicate@example.com', 'Duplicate@Example.com']) {
      await request(app).post('/api/auth/login').send({ username, password: 'admin123' }).expect(401)
    }
  })

  it('rejects malformed login identifiers and passwords as validation errors', async () => {
    for (const body of [{ username: 123, password: 'x' }, { username: 'x', password: {} }, { username: '', password: 'x' }]) {
      await request(app).post('/api/auth/login').send(body).expect(400)
    }
  })

  it('resends normalized and legacy emails, but sends nothing for ambiguous duplicates', async () => {
    const a = await createClient(); const b = await createClient()
    const { user: pending } = await createUser({ clientId: a.id, status: 'INVITED', password: null, email: 'pending@example.com' })
    const { user: legacy } = await createUser({ clientId: a.id, status: 'INVITED', password: null, email: 'Legacy.Pending@Example.com' })
    await prisma.inviteToken.create({ data: { userId: pending.id, tokenHash: 'old-link', expiresAt: new Date(Date.now() + 60000) } })
    const first = await request(app).post('/api/auth/resend-invite').send({ email: '  PENDING@EXAMPLE.COM  ' }).expect(200)
    const second = await request(app).post('/api/auth/resend-invite').send({ email: ' legacy.pending@EXAMPLE.COM ' }).expect(200)
    expect(await prisma.inviteToken.count({ where: { userId: pending.id, usedAt: null } })).toBe(1)
    expect((await prisma.inviteToken.findFirst({ where: { tokenHash: 'old-link' } })).usedAt).toBeInstanceOf(Date)
    expect(await prisma.inviteToken.count({ where: { userId: legacy.id, usedAt: null } })).toBe(1)
    await createUser({ clientId: a.id, status: 'INVITED', password: null, email: 'ambiguous@example.com' })
    await createUser({ clientId: b.id, status: 'INVITED', password: null, email: 'Ambiguous@Example.com' })
    const before = await prisma.inviteToken.findMany({ orderBy: { id: 'asc' } })
    const ambiguous = await request(app).post('/api/auth/resend-invite').send({ email: 'AMBIGUOUS@example.com' }).expect(200)
    expect(ambiguous.body).toEqual(first.body)
    expect(second.body).toEqual(first.body)
    expect(await prisma.inviteToken.findMany({ orderBy: { id: 'asc' } })).toEqual(before)
  })
})
