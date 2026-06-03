import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { Activate } from './Activate'

const renderActivate = (entry = '/activate?token=valid-token') => render(
  <MemoryRouter initialEntries={[entry]}>
    <Routes>
      <Route path="/activate" element={<Activate />} />
    </Routes>
  </MemoryRouter>
)

describe('Activate', () => {
  it('activates an account with token and password flow', async () => {
    const user = userEvent.setup()
    const { container } = renderActivate()

    await user.type(screen.getByPlaceholderText('John Doe'), 'Horizon Admin')
    await user.type(container.querySelectorAll('input[type="password"]')[0], 'secret123')
    await user.type(container.querySelectorAll('input[type="password"]')[1], 'secret123')
    await user.click(screen.getByRole('button', { name: /activate & continue/i }))

    expect(await screen.findByRole('heading', { name: 'Account Activated!' })).toBeInTheDocument()
    expect(localStorage.getItem('token')).toBe('activated-token')
  })

  it('shows invalid link when activation token is missing', () => {
    renderActivate('/activate')

    expect(screen.getByRole('heading', { name: 'Invalid Link' })).toBeInTheDocument()
    expect(screen.getByText('No activation token provided in the URL.')).toBeInTheDocument()
  })

  it('shows invalid token errors returned by the API', async () => {
    const user = userEvent.setup()
    const { container } = renderActivate('/activate?token=bad-token')

    await user.type(container.querySelectorAll('input[type="password"]')[0], 'secret123')
    await user.type(container.querySelectorAll('input[type="password"]')[1], 'secret123')
    await user.click(screen.getByRole('button', { name: /activate & continue/i }))

    expect(await screen.findByText('Invalid activation token')).toBeInTheDocument()
  })
})
