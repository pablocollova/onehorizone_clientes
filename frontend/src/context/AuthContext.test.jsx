import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { users } from '../test/fixtures'
import { http, HttpResponse } from 'msw'
import { server } from '../test/server'
import { AuthProvider, useAuth } from './AuthContext'

const Probe = () => {
  const { login, logout, logoutError, token, user } = useAuth()

  return (
    <div>
      <p data-testid="username">{user?.username || 'anonymous'}</p>
      <p data-testid="token">{token || 'no-token'}</p>
      <button type="button" onClick={() => login('horizon_admin', 'admin123')}>Login</button>
      <button type="button" onClick={logout}>Logout</button>
      {logoutError && <p role="alert">{logoutError}</p>}
    </div>
  )
}

describe('AuthContext', () => {
  it('sends the current token to revoke sessions before clearing local credentials', async () => {
    let authorization
    server.use(http.post('http://localhost/api/auth/logout', ({ request }) => {
      authorization = request.headers.get('authorization')
      expect(localStorage.getItem('token')).toBe('client-token')
      return HttpResponse.json({ ok: true })
    }))
    localStorage.setItem('user', JSON.stringify(users.client))
    localStorage.setItem('token', 'client-token')
    render(<AuthProvider><Probe /></AuthProvider>)
    screen.getByRole('button', { name: 'Logout' }).click()
    await waitFor(() => expect(screen.getByTestId('username')).toHaveTextContent('anonymous'))
    expect(authorization).toBe('Bearer client-token')
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('reports a revocation failure and allows retry instead of claiming success', async () => {
    server.use(http.post('http://localhost/api/auth/logout', () => HttpResponse.json({ error: 'Unavailable' }, { status: 503 })))
    localStorage.setItem('user', JSON.stringify(users.client))
    localStorage.setItem('token', 'client-token')
    render(<AuthProvider><Probe /></AuthProvider>)
    screen.getByRole('button', { name: 'Logout' }).click()
    await screen.findByRole('alert')
    expect(localStorage.getItem('token')).toBe('client-token')
    server.use(http.post('http://localhost/api/auth/logout', () => HttpResponse.json({ ok: true })))
    screen.getByRole('button', { name: 'Logout' }).click()
    await waitFor(() => expect(localStorage.getItem('token')).toBeNull())
  })

  it('clears credentials when the server confirms the session is already invalid', async () => {
    server.use(http.post('http://localhost/api/auth/logout', () => HttpResponse.json({ error: 'Session revoked' }, { status: 401 })))
    localStorage.setItem('user', JSON.stringify(users.client))
    localStorage.setItem('token', 'client-token')
    render(<AuthProvider><Probe /></AuthProvider>)
    screen.getByRole('button', { name: 'Logout' }).click()
    await waitFor(() => expect(localStorage.getItem('token')).toBeNull())
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
  it('stores authenticated user and token, then clears them on logout', async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    )

    screen.getByRole('button', { name: 'Login' }).click()

    await waitFor(() => expect(screen.getByTestId('username')).toHaveTextContent('horizon_admin'))
    expect(screen.getByTestId('token')).toHaveTextContent('client-token')
    expect(localStorage.getItem('token')).toBe('client-token')

    screen.getByRole('button', { name: 'Logout' }).click()

    await waitFor(() => expect(screen.getByTestId('username')).toHaveTextContent('anonymous'))
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('hydrates user and token from localStorage', () => {
    localStorage.setItem('user', JSON.stringify(users.platformAdmin))
    localStorage.setItem('token', 'admin-token')

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    )

    expect(screen.getByTestId('username')).toHaveTextContent('platform_admin')
    expect(screen.getByTestId('token')).toHaveTextContent('admin-token')
  })

  it('propagates login errors without mutating storage', async () => {
    const ErrorProbe = () => {
      const { login, user } = useAuth()

      return (
        <div>
          <p data-testid="username">{user?.username || 'anonymous'}</p>
          <button type="button" onClick={() => login('horizon_admin', 'wrong').catch((err) => localStorage.setItem('login-error', err.message))}>Bad Login</button>
        </div>
      )
    }

    render(
      <AuthProvider>
        <ErrorProbe />
      </AuthProvider>
    )

    screen.getByRole('button', { name: 'Bad Login' }).click()

    await waitFor(() => expect(localStorage.getItem('login-error')).toBe('Invalid credentials'))
    expect(screen.getByTestId('username')).toHaveTextContent('anonymous')
    expect(localStorage.getItem('token')).toBeNull()
  })
})
