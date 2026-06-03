const { expect } = require('@playwright/test')

const backendUrl = process.env.VITE_API_URL || 'http://127.0.0.1:4000'

const users = {
  client: {
    username: process.env.E2E_CLIENT_USERNAME || 'horizon_admin',
    password: process.env.E2E_CLIENT_PASSWORD || 'admin123',
  },
  admin: {
    username: process.env.E2E_ADMIN_USERNAME || 'platform_admin',
    password: process.env.E2E_ADMIN_PASSWORD || 'admin123',
  },
}

function uniqueEmail(prefix) {
  return `${prefix}.${Date.now()}.${Math.random().toString(36).slice(2)}@example.test`
}

async function login(page, username, password) {
  await page.goto('/login')
  await dismissCookieBanner(page)
  await page.getByPlaceholder('Username').fill(username)
  await page.getByPlaceholder('Password').fill(password)
  await page.getByRole('button', { name: 'Login' }).click()
}

async function dismissCookieBanner(page) {
  const acceptAll = page.getByRole('button', { name: 'Accept All' })
  if (await acceptAll.isVisible().catch(() => false)) {
    await acceptAll.click()
    await expect(acceptAll).toBeHidden()
  }
}

async function loginAsAdmin(page) {
  await login(page, users.admin.username, users.admin.password)
  await expect(page).toHaveURL(/\/app\/admin\/clients/)
  await expect(page.getByRole('heading', { name: 'All Clients' })).toBeVisible()
}

async function loginAsClient(page) {
  await login(page, users.client.username, users.client.password)
  await expect(page).toHaveURL(/\/app\/dashboard/)
  await expect(page.getByRole('heading', { name: 'Financial Overview' })).toBeVisible()
}

async function waitForApi(page, method, pathPart, action) {
  const [response] = await Promise.all([
    page.waitForResponse(response => {
      const request = response.request()
      return request.method() === method && response.url().includes(pathPart)
    }),
    action(),
  ])

  expect(response.ok()).toBeTruthy()
  return response
}

async function apiLogin(request, username = users.admin.username, password = users.admin.password) {
  const response = await request.post(`${backendUrl}/api/auth/login`, {
    data: { username, password },
  })
  expect(response.ok()).toBeTruthy()
  return response.json()
}

async function getSeedClient(request, token, name = 'Horizon Corp') {
  const response = await request.get(`${backendUrl}/api/admin/clients`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  expect(response.ok()).toBeTruthy()
  const clients = await response.json()
  const client = clients.find(item => item.name === name) || clients[0]
  expect(client).toBeTruthy()
  return client
}

module.exports = {
  backendUrl,
  users,
  uniqueEmail,
  login,
  loginAsAdmin,
  loginAsClient,
  dismissCookieBanner,
  waitForApi,
  apiLogin,
  getSeedClient,
}
