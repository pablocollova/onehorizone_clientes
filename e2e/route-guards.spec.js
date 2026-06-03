const { expect, test } = require('@playwright/test')
const { loginAsClient } = require('./helpers')

test('client user cannot access platform admin clients route', async ({ page }) => {
  await loginAsClient(page)

  await page.goto('/app/admin/clients')

  await expect(page).toHaveURL(/\/app\/dashboard/)
  await expect(page.getByRole('heading', { name: 'Financial Overview' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'All Clients' })).toHaveCount(0)
})
