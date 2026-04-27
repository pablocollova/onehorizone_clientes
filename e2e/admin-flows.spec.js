const { expect, test } = require('@playwright/test')
const { loginAsAdmin, uniqueEmail, waitForApi } = require('./helpers')

test('platform admin creates a client from clients page', async ({ page }) => {
  await loginAsAdmin(page)

  const email = uniqueEmail('client')
  const companyName = `E2E Client ${email.split('@')[0]}`

  await page.getByRole('button', { name: 'New Client' }).click()
  await expect(page.getByRole('heading', { name: 'New Client' })).toBeVisible()
  await page.getByPlaceholder('Mediterranean Villas').fill(companyName)
  await page.getByPlaceholder('hello@company.com').fill(email)

  await waitForApi(page, 'POST', '/api/admin/clients', async () => {
    await page.getByRole('button', { name: 'Create Client' }).click()
  })

  await expect(page.getByRole('heading', { name: 'New Client' })).toBeHidden()
  await expect(page.getByText(companyName)).toBeVisible()
  await expect(page.getByText(email)).toBeVisible()
})

test('platform admin creates an invoice after locations load for selected client', async ({ page }) => {
  await loginAsAdmin(page)
  const amount = ((Date.now() % 90000) + 10000) / 100
  const amountText = new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR' }).format(amount)
  await page.getByRole('link', { name: 'Invoices' }).click()
  await expect(page).toHaveURL(/\/app\/admin\/invoices/)
  await expect(page.getByRole('heading', { name: 'Invoices' })).toBeVisible()

  await page.getByRole('button', { name: 'New Invoice' }).click()
  await expect(page.getByRole('heading', { name: 'New Invoice' })).toBeVisible()

  const form = page.locator('form').last()
  const clientSelect = form.locator('select').nth(0)
  const locationSelect = form.locator('select').nth(1)
  await waitForApi(page, 'GET', '/api/clients/', async () => {
    await clientSelect.selectOption({ label: 'Horizon Corp' })
  })
  await expect(locationSelect.locator('option', { hasText: 'Horizon HQ' })).toHaveCount(1)
  await locationSelect.selectOption({ label: 'Horizon HQ' })
  await form.locator('input[type="number"]').fill(amount.toFixed(2))
  await form.locator('input[type="date"]').fill('2026-05-15')

  await waitForApi(page, 'POST', '/api/admin/invoices', async () => {
    await page.getByRole('button', { name: 'Create Invoice' }).click()
  })

  await expect(page.getByRole('heading', { name: 'New Invoice' })).toBeHidden()
  await expect(page.getByRole('row').filter({ hasText: 'Horizon Corp' }).filter({ hasText: 'Horizon HQ' }).filter({ hasText: amountText })).toBeVisible()
})

test('platform admin creates a service record after locations load for selected client', async ({ page }) => {
  await loginAsAdmin(page)
  await page.getByRole('link', { name: 'Service Records' }).click()
  await expect(page).toHaveURL(/\/app\/admin\/service-records/)
  await expect(page.getByRole('heading', { name: 'Service Records' })).toBeVisible()

  await page.getByRole('button', { name: 'New Service Record' }).click()
  await expect(page.getByRole('heading', { name: 'New Service Record' })).toBeVisible()

  const form = page.locator('form').last()
  const clientSelect = form.locator('select').nth(0)
  const locationSelect = form.locator('select').nth(1)
  const title = `E2E HVAC ${Date.now()}`

  await waitForApi(page, 'GET', '/api/clients/', async () => {
    await clientSelect.selectOption({ label: 'Horizon Corp' })
  })
  await expect(locationSelect.locator('option', { hasText: 'Horizon Branch' })).toHaveCount(1)
  await locationSelect.selectOption({ label: 'Horizon Branch' })
  await form.locator('input[type="text"]').fill(title)
  await form.locator('textarea').fill('Created by Playwright E2E')
  await form.locator('input[type="date"]').fill('2026-05-16')
  await form.locator('input[type="number"]').fill('234.56')

  await waitForApi(page, 'POST', '/api/admin/service-records', async () => {
    await page.getByRole('button', { name: 'Create Record' }).click()
  })

  await expect(page.getByRole('heading', { name: 'New Service Record' })).toBeHidden()
  await expect(page.getByRole('row').filter({ hasText: 'Horizon Corp' }).filter({ hasText: title }).filter({ hasText: '€234.56' })).toBeVisible()
})
