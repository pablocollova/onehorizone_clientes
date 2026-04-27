const { expect, test } = require('@playwright/test')
const { loginAsClient } = require('./helpers')

test('client can view and export GDPR data', async ({ page }) => {
  await loginAsClient(page)

  await page.goto('/app/privacy-settings')
  await expect(page.getByRole('heading', { name: 'Privacy & GDPR Settings' })).toBeVisible()
  await page.getByRole('button', { name: 'View My Data' }).click()
  await expect(page.getByRole('heading', { name: 'Your Personal Data' })).toBeVisible()
  const personalData = page.getByRole('main')
  await expect(personalData.getByText('Horizon Admin')).toBeVisible()
  await expect(personalData.getByText('horizon_admin')).toBeVisible()

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export JSON' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('my-gdpr-data.json')
})
