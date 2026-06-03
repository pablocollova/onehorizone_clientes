import { http, HttpResponse } from 'msw'
import {
  adminUsers,
  clients,
  dashboardSummary,
  gdprUserData,
  invoices,
  locationsByClient,
  serviceRecords,
  users,
} from './fixtures'

const API_URL = 'http://localhost'

export const handlers = [
  http.post(`${API_URL}/api/auth/login`, async ({ request }) => {
    const body = await request.json()

    if (body.username === 'platform_admin') {
      return HttpResponse.json({ token: 'admin-token', user: users.platformAdmin })
    }

    if (body.username === 'horizon_admin' && body.password === 'admin123') {
      return HttpResponse.json({ token: 'client-token', user: users.client })
    }

    return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }),
  http.post(`${API_URL}/api/auth/activate`, async ({ request }) => {
    const body = await request.json()

    if (body.token === 'valid-token') {
      return HttpResponse.json({ token: 'activated-token', user: users.client })
    }

    return HttpResponse.json({ error: 'Invalid activation token' }, { status: 400 })
  }),
  http.get(`${API_URL}/api/dashboard`, () => HttpResponse.json(dashboardSummary)),
  http.get(`${API_URL}/api/admin/clients`, () => HttpResponse.json(clients)),
  http.post(`${API_URL}/api/admin/clients`, async ({ request }) => {
    const body = await request.json()

    if (!body.name || !body.email) {
      return HttpResponse.json({ error: 'VALIDATION_ERROR' }, { status: 400 })
    }

    if (body.email === 'billing@horizon.test') {
      return HttpResponse.json({ error: 'CLIENT_EMAIL_EXISTS' }, { status: 409 })
    }

    return HttpResponse.json({
      id: 'client-created',
      name: body.name,
      email: body.email,
    }, { status: 201 })
  }),
  http.get(`${API_URL}/api/admin/users`, ({ request }) => {
    const clientId = new URL(request.url).searchParams.get('clientId')
    return HttpResponse.json(clientId ? adminUsers.filter(user => user.clientId === clientId) : adminUsers)
  }),
  http.post(`${API_URL}/api/admin/invites`, async ({ request }) => {
    const body = await request.json()

    if (body.email === 'taken@example.com') {
      return HttpResponse.json({ error: 'User already exists' }, { status: 409 })
    }

    return HttpResponse.json({ inviteLink: `http://localhost/activate?token=invite-${body.email}` }, { status: 201 })
  }),
  http.get(`${API_URL}/api/admin/invoices`, () => HttpResponse.json(invoices)),
  http.post(`${API_URL}/api/admin/invoices`, async ({ request }) => {
    const body = await request.json()
    const location = locationsByClient[body.clientId]?.find(item => item.id === body.locationId) ?? null
    const client = clients.find(item => item.id === body.clientId)

    return HttpResponse.json({
      id: 'invoice-created',
      ...body,
      client,
      location,
      currency: 'EUR',
      dueDate: body.dueDate ? `${body.dueDate}T00:00:00.000Z` : null,
    }, { status: 201 })
  }),
  http.patch(`${API_URL}/api/admin/invoices/:id`, async ({ params, request }) => {
    const body = await request.json()
    const invoice = invoices.find(item => item.id === params.id) ?? invoices[0]
    return HttpResponse.json({ ...invoice, status: body.status })
  }),
  http.get(`${API_URL}/api/admin/service-records`, ({ request }) => {
    const url = new URL(request.url)
    if (url.searchParams.get('_vendors')) return HttpResponse.json([])
    return HttpResponse.json(serviceRecords)
  }),
  http.post(`${API_URL}/api/admin/service-records`, async ({ request }) => {
    const body = await request.json()
    const location = locationsByClient[body.clientId]?.find(item => item.id === body.locationId) ?? null
    const client = clients.find(item => item.id === body.clientId)

    return HttpResponse.json({
      id: 'record-created',
      ...body,
      client,
      location,
      vendor: null,
      currency: 'EUR',
      serviceDate: body.serviceDate ? `${body.serviceDate}T00:00:00.000Z` : null,
    }, { status: 201 })
  }),
  http.patch(`${API_URL}/api/admin/service-records/:id`, async ({ params, request }) => {
    const body = await request.json()
    const record = serviceRecords.find(item => item.id === params.id) ?? serviceRecords[0]
    return HttpResponse.json({ ...record, status: body.status })
  }),
  http.get(`${API_URL}/api/clients/:clientId/locations`, ({ params }) => HttpResponse.json({
    clientId: params.clientId,
    locations: locationsByClient[params.clientId] ?? [],
  })),
  http.get(`${API_URL}/api/gdpr/me/data`, () => HttpResponse.json({ user: gdprUserData })),
  http.get(`${API_URL}/api/gdpr/me/export`, () => HttpResponse.json(gdprUserData)),
  http.put(`${API_URL}/api/gdpr/me/rectify`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ ok: true, user: { ...gdprUserData, ...body } })
  }),
  http.post(`${API_URL}/api/gdpr/me/delete`, () => HttpResponse.json({ ok: true })),
  http.post(`${API_URL}/api/gdpr/consent`, () => HttpResponse.json({ ok: true })),
]
