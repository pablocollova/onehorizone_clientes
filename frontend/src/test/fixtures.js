export const users = {
  client: {
    id: 'user-client-1',
    username: 'horizon_admin',
    email: 'horizon@example.com',
    name: 'Horizon Admin',
    role: 'CLIENT_ADMIN',
    status: 'ACTIVE',
    clientId: 'client-1',
  },
  platformAdmin: {
    id: 'user-admin-1',
    username: 'platform_admin',
    email: 'admin@example.com',
    name: 'Platform Admin',
    role: 'PLATFORM_ADMIN',
    status: 'ACTIVE',
    clientId: null,
  },
}

export const dashboardSummary = {
  currentBalance: 1250,
  balanceByLocation: 900,
  pendingInvoices: 2,
  recentDocuments: [
    {
      id: 'doc-1',
      name: 'Invoice April.pdf',
      type: 'application/pdf',
      date: '2026-04-20T00:00:00.000Z',
      size: '48 KB',
    },
  ],
}

export const clients = [
  {
    id: 'client-1',
    name: 'Horizon Corp',
    email: 'billing@horizon.test',
    _count: { users: 2, locations: 1, invoices: 3 },
  },
  {
    id: 'client-2',
    name: 'Mediterranean Villas',
    email: 'hello@villas.test',
    _count: { users: 1, locations: 2, invoices: 0 },
  },
]

export const locationsByClient = {
  'client-1': [
    { id: 'location-1', label: 'Palma Office', address: 'Main Street 1' },
  ],
  'client-2': [
    { id: 'location-2', label: 'Villa Norte', address: 'North Road 2' },
    { id: 'location-3', label: 'Villa Sur', address: 'South Road 3' },
  ],
}

export const adminUsers = [
  { ...users.platformAdmin, client: null },
  { ...users.client, client: clients[0] },
  {
    id: 'user-client-2',
    username: 'villa_user',
    email: 'villa@example.com',
    name: 'Villa User',
    role: 'CLIENT_USER',
    status: 'INVITED',
    clientId: 'client-2',
    client: clients[1],
  },
]

export const invoices = [
  {
    id: 'invoice-1',
    clientId: 'client-1',
    client: clients[0],
    locationId: 'location-1',
    location: locationsByClient['client-1'][0],
    type: 'ONEHORIZON_FEE',
    totalCents: 125000,
    currency: 'EUR',
    status: 'ISSUED',
    dueDate: '2026-05-15T00:00:00.000Z',
  },
]

export const serviceRecords = [
  {
    id: 'record-1',
    clientId: 'client-1',
    client: clients[0],
    locationId: 'location-1',
    location: locationsByClient['client-1'][0],
    vendor: { id: 'vendor-1', name: 'ACME Services' },
    title: 'HVAC Maintenance',
    description: 'Quarterly service',
    serviceDate: '2026-04-18T00:00:00.000Z',
    costCents: 45000,
    currency: 'EUR',
    billingMode: 'REBILL',
    status: 'PENDING',
  },
]

export const gdprUserData = {
  ...users.client,
  phone: '+34 600 000 000',
  address: 'Main Street 1',
  docType: 'ID',
  docNumber: 'ABC123',
  consentLogs: [
    { id: 'consent-1', type: 'ANALYTICS', value: true, createdAt: '2026-04-01T10:00:00.000Z' },
  ],
}
