const { expect, test } = require('@playwright/test')
const { apiLogin, dismissCookieBanner, getSeedClient, loginAsAdmin, uniqueEmail, waitForApi } = require('./helpers')

test('platform admin invite link activates account and new user logs in', async ({ page, request }) => {
  const adminSession = await apiLogin(request)
  const client = await getSeedClient(request, adminSession.token)
  const email = uniqueEmail('invite')
  const name = `Invited ${email.split('@')[0]}`
  const password = 'invite123'

  await loginAsAdmin(page)
  await page.getByRole('link', { name: 'Invite User' }).click()
  await expect(page).toHaveURL(/\/app\/admin\/invite/)
  await expect(page.getByRole('heading', { name: 'Invite User' })).toBeVisible()

  await page.getByPlaceholder('user@example.com').fill(email)
  await page.getByPlaceholder('Jane Smith').fill(name)
  await page.locator('select').last().selectOption(client.id)
  await expect(page.locator('select').last()).toHaveValue(client.id)

  await waitForApi(page, 'POST', '/api/admin/invites', async () => {
    await page.getByRole('button', { name: 'Send Invitation' }).click()
  })

  const inviteLink = await page.locator('code').innerText()
  expect(inviteLink).toContain('/activate?token=')

  await page.goto(inviteLink)
  await dismissCookieBanner(page)
  await expect(page.getByRole('heading', { name: 'Activate Account' })).toBeVisible()
  await page.locator('input[type="password"]').nth(0).fill(password)
  await page.locator('input[type="password"]').nth(1).fill(password)

  await waitForApi(page, 'POST', '/api/auth/activate', async () => {
    await page.getByRole('button', { name: 'Activate & Continue' }).click()
  })
  await expect(page.getByRole('heading', { name: 'Account Activated!' })).toBeVisible()

  await page.evaluate(() => localStorage.clear())
  await page.goto('/login')
  await page.getByPlaceholder('Username').fill(email)
  await page.getByPlaceholder('Password').fill(password)
  await page.getByRole('button', { name: 'Login' }).click()
  await expect(page).toHaveURL(/\/app\/dashboard/)
  await expect(page.getByRole('heading', { name: 'Financial Overview' })).toBeVisible()
})
