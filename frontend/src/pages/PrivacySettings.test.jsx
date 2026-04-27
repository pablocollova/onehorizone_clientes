import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../test/server'
import { PrivacySettings } from './PrivacySettings'

describe('PrivacySettings', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('loads and displays personal data', async () => {
    const user = userEvent.setup()
    render(<PrivacySettings />)

    await user.click(screen.getByRole('button', { name: /view my data/i }))

    expect(await screen.findByText('Your Personal Data')).toBeInTheDocument()
    expect(screen.getByText('horizon_admin')).toBeInTheDocument()
    expect(screen.getByText('+34 600 000 000')).toBeInTheDocument()
  })

  it('exports personal data as a downloadable blob', async () => {
    const user = userEvent.setup()
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:gdpr-export')
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)

    render(<PrivacySettings />)

    await user.click(screen.getByRole('button', { name: /export json/i }))

    await waitFor(() => expect(createObjectURL).toHaveBeenCalled())
    expect(click).toHaveBeenCalled()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:gdpr-export')
  })

  it('rectifies personal data', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'alert').mockImplementation(() => undefined)

    render(<PrivacySettings />)

    await user.click(screen.getByRole('button', { name: /edit data/i }))
    const nameInput = await screen.findByDisplayValue('Horizon Admin')
    await user.clear(nameInput)
    await user.type(nameInput, 'Updated Horizon')
    await user.click(screen.getByRole('button', { name: /save changes/i }))

    expect(await screen.findByText('Updated Horizon')).toBeInTheDocument()
  })

  it('anonymizes account data after confirmation', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    vi.spyOn(window, 'alert').mockImplementation(() => undefined)
    localStorage.setItem('token', 'client-token')
    sessionStorage.setItem('token', 'client-token')

    render(<PrivacySettings />)

    await user.click(screen.getByRole('button', { name: /forget me/i }))

    await waitFor(() => expect(localStorage.getItem('token')).toBeNull())
    expect(sessionStorage.getItem('token')).toBeNull()
  })

  it('shows API errors for GDPR actions', async () => {
    const user = userEvent.setup()
    server.use(
      http.get('http://localhost/api/gdpr/me/data', () => HttpResponse.json({ error: 'GDPR unavailable' }, { status: 500 }))
    )

    render(<PrivacySettings />)

    await user.click(screen.getByRole('button', { name: /view my data/i }))

    expect(await screen.findByText('Could not load personal data (HTTP 500)')).toBeInTheDocument()
  })
})
