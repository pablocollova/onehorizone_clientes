const { expect, test } = require('@playwright/test')
const { login, users } = require('./helpers')

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
