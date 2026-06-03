import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { users } from '../test/fixtures'
import { AuthProvider, useAuth } from './AuthContext'

const Probe = () => {
  const { login, logout, token, user } = useAuth()

  return (
    <div>
      <p data-testid="username">{user?.username || 'anonymous'}</p>
      <p data-testid="token">{token || 'no-token'}</p>
      <button type="button" onClick={() => login('horizon_admin', 'admin123')}>Login</button>
      <button type="button" onClick={logout}>Logout</button>
    </div>
  )
}

describe('AuthContext', () => {
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
