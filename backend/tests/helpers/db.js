const bcrypt = require('bcryptjs')
const prisma = require('../../src/prisma')
const { signAuthToken } = require('../../src/middleware/auth')

let sequence = 0

function nextId(prefix) {
  sequence += 1
  return `${prefix}-${sequence}`
}

async function cleanTestDb() {
  await prisma.auditLog.deleteMany()
  await prisma.gdprRequest.deleteMany()
  await prisma.consentLog.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.document.deleteMany()
  await prisma.serviceRecord.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.location.deleteMany()
  await prisma.inviteToken.deleteMany()
  await prisma.user.deleteMany()
  await prisma.vendor.deleteMany()
  await prisma.client.deleteMany()
}

async function createClient(overrides = {}) {
  const id = nextId('client')
  return prisma.client.create({
    data: {
      name: overrides.name || `Test Client ${id}`,
      email: overrides.email || `${id}@example.com`,
    },
  })
}

async function createUser(overrides = {}) {
  const id = nextId('user')
  const password = overrides.password || 'admin123'
  const hashedPassword = overrides.password === null ? null : await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      username: overrides.username || id.replace('-', '_'),
      email: overrides.email === null ? null : overrides.email || `${id}@example.com`,
      password: hashedPassword,
      name: overrides.name || `Test User ${id}`,
      status: overrides.status || 'ACTIVE',
      role: overrides.role || 'CLIENT_ADMIN',
      clientId: overrides.clientId === undefined ? null : overrides.clientId,
      phone: overrides.phone,
      address: overrides.address,
      docType: overrides.docType,
      docNumber: overrides.docNumber,
    },
  })

  return { password, user }
}

async function createActiveUser(overrides = {}) {
  const client = overrides.clientId === null
    ? null
    : overrides.client || await createClient({ name: overrides.clientName, email: overrides.clientEmail })
  const { password, user } = await createUser({
    ...overrides,
    status: 'ACTIVE',
    clientId: overrides.clientId === null ? null : overrides.clientId || client.id,
  })

  return { client, password, user }
}

function authHeader(user) {
  return { Authorization: `Bearer ${signAuthToken(user)}` }
}

async function createLocation(overrides = {}) {
  const id = nextId('location')
  return prisma.location.create({
    data: {
      clientId: overrides.clientId,
      label: overrides.label || `Location ${id}`,
      address: overrides.address || `${id} Main St`,
      city: overrides.city || 'Madrid',
      country: overrides.country || 'ES',
    },
  })
}

async function createInvoice(overrides = {}) {
  const id = nextId('invoice')
  return prisma.invoice.create({
    data: {
      clientId: overrides.clientId,
      locationId: overrides.locationId || null,
      vendorId: overrides.vendorId || null,
      type: overrides.type || 'ONEHORIZON_FEE',
      status: overrides.status || 'ISSUED',
      number: overrides.number || id.toUpperCase(),
      issueDate: overrides.issueDate || new Date('2025-01-01T00:00:00.000Z'),
      dueDate: overrides.dueDate || null,
      currency: overrides.currency || 'EUR',
      totalCents: overrides.totalCents === undefined ? 10000 : overrides.totalCents,
    },
  })
}

async function createServiceRecord(overrides = {}) {
  const id = nextId('service')
  return prisma.serviceRecord.create({
    data: {
      clientId: overrides.clientId,
      locationId: overrides.locationId || null,
      vendorId: overrides.vendorId || null,
      invoiceId: overrides.invoiceId || null,
      title: overrides.title || `Service ${id}`,
      description: overrides.description || null,
      serviceDate: overrides.serviceDate || new Date('2025-01-02T00:00:00.000Z'),
      costCents: overrides.costCents === undefined ? 5000 : overrides.costCents,
      currency: overrides.currency || 'EUR',
      billingMode: overrides.billingMode || 'REBILL',
      status: overrides.status || 'PENDING',
    },
  })
}

module.exports = {
  authHeader,
  cleanTestDb,
  createActiveUser,
  createClient,
  createInvoice,
  createLocation,
  createServiceRecord,
  createUser,
  prisma,
}
