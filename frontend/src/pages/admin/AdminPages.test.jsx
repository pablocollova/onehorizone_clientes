import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { AuthProvider } from '../../context/AuthContext'
import { clients, users } from '../../test/fixtures'
import { server } from '../../test/server'
import { Clients } from './Clients'
import { Invite } from './Invite'
import { Invoices } from './Invoices'
import { ServiceRecords } from './ServiceRecords'
import { Users } from './Users'

const renderAdminRoute = (element, path, authUser = users.platformAdmin) => {
  localStorage.setItem('user', JSON.stringify(authUser))
  localStorage.setItem('token', authUser.role === 'PLATFORM_ADMIN' ? 'admin-token' : 'client-token')

  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path={path} element={element} />
          <Route path="/app/dashboard" element={<h1>Client Dashboard</h1>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  )
}

describe('Admin Clients', () => {
  it('lists clients and creates a new client', async () => {
    const user = userEvent.setup()
    renderAdminRoute(<Clients />, '/app/admin/clients')

    expect(await screen.findByText('Horizon Corp')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /new client/i }))
    await user.type(screen.getByPlaceholderText('Mediterranean Villas'), 'New Tenant')
    await user.type(screen.getByPlaceholderText('hello@company.com'), 'new@tenant.test')
    await user.click(screen.getByRole('button', { name: /create client/i }))

    expect(await screen.findByText('New Tenant')).toBeInTheDocument()
    expect(screen.getByText('new@tenant.test')).toBeInTheDocument()
  })

  it('surfaces API validation errors when creating clients', async () => {
    const user = userEvent.setup()
    renderAdminRoute(<Clients />, '/app/admin/clients')

    await user.click(await screen.findByRole('button', { name: /new client/i }))
    await user.type(screen.getByPlaceholderText('Mediterranean Villas'), 'Existing Tenant')
    await user.type(screen.getByPlaceholderText('hello@company.com'), 'billing@horizon.test')
    await user.click(screen.getByRole('button', { name: /create client/i }))

    expect(await screen.findByText('A client with this email already exists.')).toBeInTheDocument()
  })
})

describe('Admin Users', () => {
  it('lists users and filters by client', async () => {
    const user = userEvent.setup()
    renderAdminRoute(<Users />, '/app/admin/users')

    expect(await screen.findByText('Platform Admin')).toBeInTheDocument()
    expect(screen.getByText('Villa User')).toBeInTheDocument()

    await user.selectOptions(screen.getByRole('combobox'), clients[1].id)

    await waitFor(() => expect(screen.queryByText('Platform Admin')).not.toBeInTheDocument())
    expect(screen.getByText('Villa User')).toBeInTheDocument()
  })

  it('redirects non-admin users away from users admin', async () => {
    renderAdminRoute(<Users />, '/app/admin/users', users.client)

    expect(await screen.findByRole('heading', { name: 'Client Dashboard' })).toBeInTheDocument()
  })
})

describe('Admin Invite', () => {
  it('loads clients and creates an invite link', async () => {
    const user = userEvent.setup()
    renderAdminRoute(<Invite />, '/app/admin/invite')

    await user.type(screen.getByPlaceholderText('user@example.com'), 'new.user@example.com')
    await user.type(screen.getByPlaceholderText('Jane Smith'), 'New User')
    await screen.findByRole('option', { name: 'Horizon Corp' })
    await user.selectOptions(screen.getAllByRole('combobox')[0], 'CLIENT_ADMIN')
    await user.selectOptions(screen.getAllByRole('combobox')[1], 'client-1')
    await user.click(screen.getByRole('button', { name: /send invitation/i }))

    expect(await screen.findByText(/invitation created/i)).toBeInTheDocument()
    expect(screen.getByText('http://localhost/activate?token=invite-new.user@example.com')).toBeInTheDocument()
  })

  it('shows invite API errors', async () => {
    const user = userEvent.setup()
    renderAdminRoute(<Invite />, '/app/admin/invite')

    await user.type(screen.getByPlaceholderText('user@example.com'), 'taken@example.com')
    await user.selectOptions(screen.getAllByRole('combobox')[1], 'client-1')
    await user.click(screen.getByRole('button', { name: /send invitation/i }))

    expect(await screen.findByText('User already exists')).toBeInTheDocument()
  })
})

describe('Admin Invoices', () => {
  it('lists invoices, creates one with client locations, and patches status', async () => {
    const user = userEvent.setup()
    renderAdminRoute(<Invoices />, '/app/admin/invoices')

    expect(await screen.findByText('ONEHORIZON FEE')).toBeInTheDocument()

    await user.selectOptions(screen.getAllByRole('combobox')[3], 'PAID')
    await waitFor(() => expect(screen.getAllByRole('combobox')[3]).toHaveValue('PAID'))

    await user.click(screen.getByRole('button', { name: /new invoice/i }))
    expect(screen.getByRole('heading', { name: 'New Invoice' })).toBeInTheDocument()
    const modal = screen.getByRole('button', { name: /create invoice/i }).closest('form')
    const selects = within(modal).getAllByRole('combobox')
    await user.selectOptions(selects[0], 'client-1')
    await user.selectOptions(await within(modal).findByRole('option', { name: 'Palma Office' }).then(() => selects[1]), 'location-1')
    await user.type(within(modal).getByPlaceholderText('250.00'), '300')
    await user.click(within(modal).getByRole('button', { name: /create invoice/i }))

    expect(await screen.findByText('€300.00')).toBeInTheDocument()
  })

  it('redirects non-admin users away from invoices admin', async () => {
    renderAdminRoute(<Invoices />, '/app/admin/invoices', users.client)

    expect(await screen.findByRole('heading', { name: 'Client Dashboard' })).toBeInTheDocument()
  })
})

describe('Admin ServiceRecords', () => {
  it('lists records, creates one with client locations, and patches status', async () => {
    const user = userEvent.setup()
    renderAdminRoute(<ServiceRecords />, '/app/admin/service-records')

    expect(await screen.findByText('HVAC Maintenance')).toBeInTheDocument()

    await user.selectOptions(screen.getAllByRole('combobox')[3], 'COMPLETED')
    await waitFor(() => expect(screen.getAllByRole('combobox')[3]).toHaveValue('COMPLETED'))

    await user.click(screen.getByRole('button', { name: /new service record/i }))
    expect(screen.getByRole('heading', { name: 'New Service Record' })).toBeInTheDocument()
    const modal = screen.getByRole('button', { name: /create record/i }).closest('form')
    const selects = within(modal).getAllByRole('combobox')
    await user.selectOptions(selects[0], 'client-1')
    await user.selectOptions(await within(modal).findByRole('option', { name: 'Palma Office' }).then(() => selects[1]), 'location-1')
    await user.type(within(modal).getByPlaceholderText('HVAC Maintenance'), 'Pool Repair')
    await user.type(within(modal).getByPlaceholderText('250.00'), '180')
    await user.type(modal.querySelector('input[type="date"]'), '2026-04-22')
    await user.click(within(modal).getByRole('button', { name: /create record/i }))

    expect(await screen.findByText('Pool Repair')).toBeInTheDocument()
  })

  it('shows service records API errors', async () => {
    server.use(
      http.get('http://localhost/api/admin/service-records', () => HttpResponse.json({ error: 'Records unavailable' }, { status: 500 }))
    )

    renderAdminRoute(<ServiceRecords />, '/app/admin/service-records')

    expect(await screen.findByText('Records unavailable')).toBeInTheDocument()
  })

  it('redirects non-admin users away from service records admin', async () => {
    renderAdminRoute(<ServiceRecords />, '/app/admin/service-records', users.client)

    expect(await screen.findByRole('heading', { name: 'Client Dashboard' })).toBeInTheDocument()
  })
})
