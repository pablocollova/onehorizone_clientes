import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { AuthProvider } from '../context/AuthContext'
import { server } from '../test/server'
import { users } from '../test/fixtures'
import { Dashboard } from './Dashboard'

const renderDashboard = (user = users.client) => {
  localStorage.setItem('user', JSON.stringify(user))
  localStorage.setItem('token', user.role === 'PLATFORM_ADMIN' ? 'admin-token' : 'client-token')

  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/app/dashboard']}>
        <Routes>
          <Route path="/app/dashboard" element={<Dashboard />} />
          <Route path="/app/admin/clients" element={<h1>Admin Clients</h1>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  )
}

describe('Dashboard', () => {
  it('loads financial overview data through MSW', async () => {
    renderDashboard()

    expect(await screen.findByText('Current Balance')).toBeInTheDocument()
    expect(await screen.findByText('Invoice April.pdf')).toBeInTheDocument()
  })

  it('shows an error state when dashboard data cannot load', async () => {
    server.use(
      http.get('http://localhost/api/dashboard', () => HttpResponse.json({ error: 'Dashboard unavailable' }, { status: 500 }))
    )

    renderDashboard()

    expect(await screen.findByText('Could not load dashboard data')).toBeInTheDocument()
    expect(screen.getByText('Dashboard unavailable')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  it('redirects platform admins to the admin console', async () => {
    renderDashboard(users.platformAdmin)

    expect(await screen.findByRole('heading', { name: 'Admin Clients' })).toBeInTheDocument()
  })
})
