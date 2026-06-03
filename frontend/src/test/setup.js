import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import { server } from './server'

window.scrollTo = vi.fn()

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

afterEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  server.resetHandlers()
})

afterAll(() => server.close())
