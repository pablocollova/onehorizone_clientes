const { expect, test } = require('@playwright/test')
const { login, users } = require('./helpers')
const { backendUrl } = require('./helpers')

test('sign out revokes the browser token and a fresh login works', async ({ page, request }) => {
  await login(page, 'manager', 'admin123')
  await expect(page).toHaveURL(/\/app\/dashboard/)
  const token = await page.evaluate(() => localStorage.getItem('token'))
  const logout = page.waitForResponse(r => r.url().endsWith('/api/auth/logout') && r.request().method() === 'POST')
  await page.getByRole('button', { name: 'Sign Out' }).click()
  expect((await logout).ok()).toBeTruthy()
  await expect(page).toHaveURL(/\/login/)
  expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull()
  const rejected = await request.get(`${backendUrl}/me`, { headers: { Authorization: `Bearer ${token}` } })
  expect(rejected.status()).toBe(401)
  await login(page, 'manager', 'admin123')
  await expect(page).toHaveURL(/\/app\/dashboard/)
})

test('client can log in and reach dashboard', async ({ page }) => {
  await login(page, users.client.username, users.client.password)

  await expect(page).toHaveURL(/\/app\/dashboard/)
  await expect(page.getByRole('heading', { name: 'Financial Overview' })).toBeVisible()
})

test('platform admin can log in and reach admin clients', async ({ page }) => {
  await login(page, users.admin.username, users.admin.password)

  await expect(page).toHaveURL(/\/app\/admin\/clients/)
  await expect(page.getByRole('heading', { name: 'All Clients' })).toBeVisible()
})
