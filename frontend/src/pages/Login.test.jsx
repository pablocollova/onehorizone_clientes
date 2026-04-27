import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { AuthProvider } from '../context/AuthContext'
import { server } from '../test/server'
import { Login } from './Login'

const renderLogin = () => render(
  <AuthProvider>
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/app/dashboard" element={<h1>Client Dashboard</h1>} />
        <Route path="/app/admin/clients" element={<h1>Admin Clients</h1>} />
      </Routes>
    </MemoryRouter>
  </AuthProvider>
)

describe('Login', () => {
  it('authenticates a client user and navigates to dashboard', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByPlaceholderText('Username'), 'horizon_admin')
    await user.type(screen.getByPlaceholderText('Password'), 'admin123')
    await user.click(screen.getByRole('button', { name: 'Login' }))

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Client Dashboard' })).toBeInTheDocument())
  })

  it('authenticates a platform admin and navigates to admin clients', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByPlaceholderText('Username'), 'platform_admin')
    await user.type(screen.getByPlaceholderText('Password'), 'admin123')
    await user.click(screen.getByRole('button', { name: 'Login' }))

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Admin Clients' })).toBeInTheDocument())
  })

  it('shows backend validation errors', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByPlaceholderText('Username'), 'horizon_admin')
    await user.type(screen.getByPlaceholderText('Password'), 'wrong')
    await user.click(screen.getByRole('button', { name: 'Login' }))

    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument()
  })

  it('shows a loading state while credentials are submitted', async () => {
    server.use(
      http.post('http://localhost/api/auth/login', async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
        return HttpResponse.json({ token: 'client-token', user: { role: 'CLIENT_ADMIN' } })
      })
    )

    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByPlaceholderText('Username'), 'horizon_admin')
    await user.type(screen.getByPlaceholderText('Password'), 'admin123')
    const click = user.click(screen.getByRole('button', { name: 'Login' }))

    expect(await screen.findByRole('button', { name: 'Logging in...' })).toBeDisabled()
    await click
  })
})
