import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AuthProvider } from '../context/AuthContext'
import { users } from '../test/fixtures'
import { Button } from './ui/Button'
import { CookieConsentBanner } from './CookieConsentBanner'
import { Footer } from './Footer'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

describe('CookieConsentBanner', () => {
  it('persists accept-all consent and hides the banner', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <CookieConsentBanner />
      </MemoryRouter>
    )

    expect(screen.getByText('We Value Your Privacy')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /accept all/i }))

    await waitFor(() => expect(screen.queryByText('We Value Your Privacy')).not.toBeInTheDocument())
    expect(JSON.parse(localStorage.getItem('onehorizon_gdpr_consent'))).toEqual({
      necessary: true,
      analytics: true,
      marketing: true,
    })
  })

  it('saves selected consent preferences', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <CookieConsentBanner />
      </MemoryRouter>
    )

    await user.click(screen.getByRole('button', { name: /customize preferences/i }))
    await user.click(screen.getAllByRole('checkbox')[1])
    await user.click(screen.getByRole('button', { name: /accept selected/i }))

    expect(JSON.parse(localStorage.getItem('onehorizon_gdpr_consent'))).toEqual({
      necessary: true,
      analytics: true,
      marketing: false,
    })
  })
})

describe('shared components smoke', () => {
  it('renders Button, Navbar, Footer and Sidebar', () => {
    localStorage.setItem('user', JSON.stringify(users.platformAdmin))
    localStorage.setItem('token', 'admin-token')

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/app/dashboard']}>
          <Button>Primary Action</Button>
          <Navbar />
          <Footer />
          <Sidebar />
        </MemoryRouter>
      </AuthProvider>
    )

    expect(screen.getByRole('button', { name: 'Primary Action' })).toBeInTheDocument()
    expect(screen.getAllByText('ONE HORIZON').length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
  })
})
