const crypto = require('crypto')
const request = require('supertest')
const { app } = require('../../src/app')
const {
  authHeader,
  cleanTestDb,
  createActiveUser,
  createClient,
  createInvoice,
  createLocation,
  createServiceRecord,
  createUser,
  prisma,
} = require('../helpers/db')

describe.sequential('backend integration', () => {
  beforeEach(async () => {
    await cleanTestDb()
  })

  afterAll(async () => {
    await cleanTestDb()
    await prisma.$disconnect()
  })

  describe('health', () => {
    it('serves root, basic health, and detailed health', async () => {
      await request(app)
        .get('/')
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({ ok: true, service: 'onehorizone-backend' })
        })

      await request(app)
        .get('/health')
        .expect(200)
        .expect(({ body }) => {
          expect(body.status).toBe('healthy')
          expect(body.timestamp).toEqual(expect.any(String))
          expect(body.uptime).toEqual(expect.any(Number))
        })

      await request(app)
        .get('/health/detailed')
        .expect(200)
        .expect(({ body }) => {
          expect(body.database).toBe('connected')
          expect(body.memory).toEqual(expect.any(Object))
        })
    })
  })

  describe('auth', () => {
    it('logs in an active user and returns public user data', async () => {
      const { password, user } = await createActiveUser({ username: 'integration_user' })

      await request(app)
        .post('/api/auth/login')
        .send({ username: user.username, password })
        .expect(200)
        .expect(({ body }) => {
          expect(body.token).toEqual(expect.any(String))
          expect(body.user).toMatchObject({
            id: user.id,
            username: user.username,
            role: user.role,
            status: 'ACTIVE',
            clientId: user.clientId,
          })
          expect(body.user.password).toBeUndefined()
        })
    })

    it('rejects invalid password, missing fields, disabled users, and invited users', async () => {
      const { user } = await createActiveUser({ username: 'bad_password_user' })
      const client = await createClient()
      const disabled = await createUser({ username: 'disabled_user', clientId: client.id, status: 'DISABLED' })
      const invited = await createUser({ username: 'invited_user', clientId: client.id, status: 'INVITED', password: null })

      await request(app).post('/api/auth/login').send({ username: user.username, password: 'wrong' }).expect(401)
      await request(app).post('/api/auth/login').send({ username: user.username }).expect(400)
      await request(app).post('/api/auth/login').send({ username: disabled.user.username, password: disabled.password }).expect(401)
      await request(app).post('/api/auth/login').send({ username: invited.user.username, password: 'admin123' }).expect(401)
    })

    it('rejects invalid activation tokens and does not enumerate on resend invite', async () => {
      const client = await createClient()
      const invited = await createUser({ clientId: client.id, status: 'INVITED', password: null })

      await request(app)
        .post('/api/auth/activate')
        .send({ token: 'invalid-token', password: 'new-password' })
        .expect(400)

      await request(app)
        .post('/api/auth/resend-invite')
        .send({ email: 'missing@example.com' })
        .expect(200)
        .expect(({ body }) => expect(body.ok).toBe(true))

      await request(app)
        .post('/api/auth/resend-invite')
        .send({ email: invited.user.email })
        .expect(200)
        .expect(({ body }) => expect(body.ok).toBe(true))

      const tokens = await prisma.inviteToken.findMany({ where: { userId: invited.user.id } })
      expect(tokens).toHaveLength(1)
    })
  })

  describe('me', () => {
    it('returns authenticated public user data without password', async () => {
      const { client, user } = await createActiveUser()

      await request(app)
        .get('/me')
        .set(authHeader(user))
        .expect(200)
        .expect(({ body }) => {
          expect(body).toMatchObject({ id: user.id, email: user.email, clientId: client.id })
          expect(body.client).toMatchObject({ id: client.id, name: client.name, email: client.email })
          expect(body.password).toBeUndefined()
        })
    })

    it('rejects missing and invalid tokens', async () => {
      await request(app).get('/me').expect(401).expect(({ body }) => expect(body.error).toBe('Missing token'))
      await request(app).get('/me').set({ Authorization: 'Bearer invalid' }).expect(401).expect(({ body }) => expect(body.error).toBe('Invalid token'))
    })
  })

  describe('clients and dashboard', () => {
    it('returns all clients to platform admin and scoped clients to client users', async () => {
      const clientA = await createClient({ name: 'Alpha' })
      const clientB = await createClient({ name: 'Beta' })
      const admin = await createUser({ role: 'PLATFORM_ADMIN', clientId: null })
      const scoped = await createUser({ role: 'CLIENT_USER', clientId: clientA.id })

      await request(app)
        .get('/clients')
        .set(authHeader(admin.user))
        .expect(200)
        .expect(({ body }) => expect(body.clients.map((client) => client.id).sort()).toEqual([clientA.id, clientB.id].sort()))

      await request(app)
        .get('/clients')
        .set(authHeader(scoped.user))
        .expect(200)
        .expect(({ body }) => expect(body.clients.map((client) => client.id)).toEqual([clientA.id]))
    })

    it('returns locations contract and protects cross-client access', async () => {
      const clientA = await createClient()
      const clientB = await createClient()
      const location = await createLocation({ clientId: clientA.id, label: 'HQ' })
      const scoped = await createUser({ role: 'CLIENT_USER', clientId: clientA.id })

      await request(app)
        .get(`/clients/${clientA.id}/locations`)
        .set(authHeader(scoped.user))
        .expect(200)
        .expect(({ body }) => {
          expect(body.clientId).toBe(clientA.id)
          expect(body.locations).toEqual([expect.objectContaining({ id: location.id, label: 'HQ' })])
        })

      await request(app).get(`/clients/${clientB.id}/locations`).set(authHeader(scoped.user)).expect(403)
      await request(app).get('/clients/missing-client/locations').set(authHeader(scoped.user)).expect(403)

      const admin = await createUser({ role: 'PLATFORM_ADMIN', clientId: null })
      await request(app).get('/clients/missing-client/locations').set(authHeader(admin.user)).expect(404)
    })

    it('returns platform aggregate dashboard and client-scoped dashboard', async () => {
      const clientA = await createClient()
      const clientB = await createClient()
      const locationA = await createLocation({ clientId: clientA.id })
      await createInvoice({ clientId: clientA.id, locationId: locationA.id, status: 'ISSUED', totalCents: 12050 })
      await createInvoice({ clientId: clientA.id, status: 'OVERDUE', totalCents: 7950 })
      await createInvoice({ clientId: clientB.id, status: 'ISSUED', totalCents: 10000 })
      await createInvoice({ clientId: clientB.id, status: 'PAID', totalCents: 99999 })
      const admin = await createUser({ role: 'PLATFORM_ADMIN', clientId: null })
      const scoped = await createUser({ role: 'CLIENT_USER', clientId: clientA.id })

      await request(app)
        .get('/api/dashboard')
        .set(authHeader(admin.user))
        .expect(200)
        .expect(({ body }) => {
          expect(body.currentBalance).toBe(300)
          expect(body.pendingInvoices).toBe(3)
        })

      await request(app)
        .get('/api/dashboard')
        .set(authHeader(scoped.user))
        .expect(200)
        .expect(({ body }) => {
          expect(body.currentBalance).toBe(200)
          expect(body.balanceByLocation).toBe(120.5)
          expect(body.pendingInvoices).toBe(2)
        })
    })

    it('rejects non-admin users without a client for tenant-scoped routes', async () => {
      const user = await createUser({ role: 'CLIENT_USER', clientId: null })
      await request(app).get('/api/dashboard').set(authHeader(user.user)).expect(401)
    })
  })

  describe('invoices', () => {
    it('lists invoices scoped to client users and validates status', async () => {
      const clientA = await createClient()
      const clientB = await createClient()
      const invoiceA = await createInvoice({ clientId: clientA.id, status: 'ISSUED' })
      await createInvoice({ clientId: clientB.id, status: 'ISSUED' })
      const scoped = await createUser({ role: 'CLIENT_USER', clientId: clientA.id })

      await request(app)
        .get(`/invoices?clientId=${clientB.id}`)
        .set(authHeader(scoped.user))
        .expect(200)
        .expect(({ body }) => {
          expect(body.total).toBe(1)
          expect(body.invoices[0].id).toBe(invoiceA.id)
        })

      await request(app).get('/invoices?status=not-a-status').set(authHeader(scoped.user)).expect(400)
    })

    it('lets platform admins filter invoices by client and status', async () => {
      const clientA = await createClient()
      const clientB = await createClient()
      const invoice = await createInvoice({ clientId: clientB.id, status: 'PAID' })
      await createInvoice({ clientId: clientA.id, status: 'PAID' })
      await createInvoice({ clientId: clientB.id, status: 'ISSUED' })
      const admin = await createUser({ role: 'PLATFORM_ADMIN', clientId: null })

      await request(app)
        .get(`/invoices?clientId=${clientB.id}&status=paid`)
        .set(authHeader(admin.user))
        .expect(200)
        .expect(({ body }) => expect(body.invoices.map((item) => item.id)).toEqual([invoice.id]))
    })
  })

  describe('admin', () => {
    it('creates and lists clients and users for platform admins', async () => {
      const admin = await createUser({ role: 'PLATFORM_ADMIN', clientId: null })

      const createClientResponse = await request(app)
        .post('/api/admin/clients')
        .set(authHeader(admin.user))
        .send({ name: 'Created Client', email: 'created-client@example.com' })
        .expect(201)

      await createUser({ role: 'CLIENT_USER', clientId: createClientResponse.body.id })

      await request(app)
        .get('/api/admin/clients')
        .set(authHeader(admin.user))
        .expect(200)
        .expect(({ body }) => expect(body).toEqual([expect.objectContaining({ id: createClientResponse.body.id, _count: expect.any(Object) })]))

      await request(app)
        .get(`/api/admin/users?clientId=${createClientResponse.body.id}`)
        .set(authHeader(admin.user))
        .expect(200)
        .expect(({ body }) => {
          expect(body).toHaveLength(1)
          expect(body[0].password).toBeUndefined()
        })
    })

    it('creates and patches invoices and service records', async () => {
      const client = await createClient()
      const location = await createLocation({ clientId: client.id })
      const admin = await createUser({ role: 'PLATFORM_ADMIN', clientId: null })

      const invoiceResponse = await request(app)
        .post('/api/admin/invoices')
        .set(authHeader(admin.user))
        .send({ clientId: client.id, locationId: location.id, type: 'ONEHORIZON_FEE', totalCents: 12345, number: 'ADM-1' })
        .expect(201)

      await request(app)
        .patch(`/api/admin/invoices/${invoiceResponse.body.id}`)
        .set(authHeader(admin.user))
        .send({ status: 'PAID', totalCents: 13000 })
        .expect(200)
        .expect(({ body }) => expect(body).toMatchObject({ status: 'PAID', totalCents: 13000 }))

      const serviceResponse = await request(app)
        .post('/api/admin/service-records')
        .set(authHeader(admin.user))
        .send({ clientId: client.id, locationId: location.id, title: 'Install', serviceDate: '2025-01-03T00:00:00.000Z', costCents: 2000 })
        .expect(201)

      await request(app)
        .patch(`/api/admin/service-records/${serviceResponse.body.id}`)
        .set(authHeader(admin.user))
        .send({ status: 'COMPLETED', costCents: 2500 })
        .expect(200)
        .expect(({ body }) => expect(body).toMatchObject({ status: 'COMPLETED', costCents: 2500 }))
    })

    it('returns inviteLink when creating invites', async () => {
      const client = await createClient()
      const admin = await createUser({ role: 'PLATFORM_ADMIN', clientId: null })

      await request(app)
        .post('/api/admin/invites')
        .set(authHeader(admin.user))
        .send({ clientId: client.id, email: 'invited@example.com', name: 'Invited User', role: 'CLIENT_USER' })
        .expect(200)
        .expect(({ body }) => {
          expect(body.ok).toBe(true)
          expect(body.inviteLink).toContain('/activate?token=')
        })
    })
  })

  describe('gdpr', () => {
    it('records public consent', async () => {
      await request(app)
        .post('/api/gdpr/consent')
        .send({ type: 'ANALYTICS', value: true, source: 'test' })
        .expect(200)
        .expect(({ body }) => expect(body.ok).toBe(true))

      const logs = await prisma.consentLog.findMany()
      expect(logs).toHaveLength(1)
      expect(logs[0]).toMatchObject({ type: 'ANALYTICS', value: true, source: 'test' })
    })

    it('returns sanitized authenticated data and export, and rejects token query auth', async () => {
      const { user } = await createActiveUser({ phone: '123', address: 'Street 1', docType: 'ID', docNumber: 'ABC' })
      await prisma.consentLog.create({ data: { userId: user.id, type: 'NECESSARY', value: true } })

      await request(app).get('/api/gdpr/me/data?token=bad').set(authHeader(user)).expect(400)

      await request(app)
        .get('/api/gdpr/me/data')
        .set(authHeader(user))
        .expect(200)
        .expect(({ body }) => {
          expect(body.user).toMatchObject({ id: user.id, phone: '123', docNumber: 'ABC' })
          expect(body.user.password).toBeUndefined()
        })

      await request(app)
        .get('/api/gdpr/me/export')
        .set(authHeader(user))
        .expect(200)
        .expect('Content-Type', /application\/json/)
        .expect(({ body }) => {
          expect(body.data.id).toBe(user.id)
          expect(body.data.password).toBeUndefined()
        })
    })

    it('rectifies and anonymizes user data', async () => {
      const { user } = await createActiveUser({ phone: '123', address: 'Street 1', docType: 'ID', docNumber: 'ABC' })

      await request(app)
        .put('/api/gdpr/me/rectify')
        .set(authHeader(user))
        .send({ name: 'Updated Name', phone: '456' })
        .expect(200)
        .expect(({ body }) => expect(body.user).toMatchObject({ id: user.id, name: 'Updated Name', phone: '456' }))

      await request(app).post('/api/gdpr/me/delete').set(authHeader(user)).expect(200).expect(({ body }) => expect(body.ok).toBe(true))

      const deleted = await prisma.user.findUnique({ where: { id: user.id } })
      expect(deleted).toMatchObject({ name: '[DELETED]', email: null, phone: null, status: 'DISABLED' })
      expect(deleted.username).toBe(`deleted_${user.id}`)
      expect(deleted.deletedAt).toBeInstanceOf(Date)
    })
  })
})
