const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
 await page.route('**/api/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
 await page.addInitScript(() => localStorage.setItem('onehorizon_gdpr_consent', JSON.stringify({ necessary: true, analytics: false, marketing: false })));
});

test('business landing, service anchors, FAQ and honest consultation draft on desktop', async ({ page }, testInfo) => {
 const errors = []; page.on('pageerror', error => errors.push(error.message));
 const apiCalls = []; page.on('request', request => { if (request.url().includes('/api/')) apiCalls.push(request.url()); });
 await page.goto('/');
 await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Your business in Spain/);
 await expect(page.locator('.business-hero-visual img')).toHaveJSProperty('complete', true);
 await expect(page.locator('.business-service-grid article')).toHaveCount(6);
 await page.getByRole('link', { name: 'Explore our services', exact: true }).click();
 await expect(page).toHaveURL(/#services/);
 await page.locator('summary').filter({ hasText: 'Can you help with an existing business?' }).click();
 await expect(page.getByText('Yes. The starting point can be an opening,', { exact: false })).toBeVisible();
 await page.getByRole('link', { name: 'Tell us about your business', exact: true }).click();
 await expect(page).toHaveURL(/#contact/);
 const form = page.getByRole('form', { name: 'Prepare a business consultation' });
 await form.getByLabel('Full name', { exact: true }).fill('Fictional operator');
 await form.getByLabel('Email address', { exact: true }).fill('operator@example.test');
 await form.getByRole('combobox', { name: 'What do you need?', exact: true }).selectOption('0');
 await form.getByLabel('Tell us about your project', { exact: true }).fill('Fictional opening: café & supplies.');
 await form.getByRole('button', { name: 'Prepare consultation email', exact: true }).click();
 await expect(form.getByRole('status')).toContainText('Your email draft is ready');
 const draft = new URL(await form.getByRole('link', { name: 'Open email application', exact: true }).getAttribute('href'));
 expect(draft.searchParams.get('body')).toContain('Fictional opening: café & supplies.');
 expect(apiCalls).toEqual([]);
 expect(errors).toEqual([]);
 await page.goto('/');
 await page.screenshot({ path: testInfo.outputPath('landing-desktop-hero.png') });
 await page.screenshot({ path: testInfo.outputPath('landing-desktop.png'), fullPage: true });
});

test('mobile Spanish navigation, Family, privacy and portal preserve their routes', async ({ page }, testInfo) => {
 await page.setViewportSize({ width: 390, height: 844 });
 await page.goto('/');
 await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
 await page.getByRole('button', { name: 'Switch to Spanish', exact: true }).click();
 await expect(page.locator('html')).toHaveAttribute('lang', 'es');
 await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Tu negocio en España/);
 expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
 await page.screenshot({ path: testInfo.outputPath('landing-mobile-es.png'), fullPage: true });
 await page.getByRole('button', { name: 'Abrir navegación', exact: true }).click();
 await page.keyboard.press('Escape');
 await expect(page.getByRole('button', { name: 'Abrir navegación', exact: true })).toBeFocused();
 await page.getByRole('link', { name: 'Conocé los servicios Family', exact: true }).click();
 await expect(page).toHaveURL(/\/private-services/);
 await expect(page.getByText('One Horizon Family', { exact: true }).first()).toBeVisible();
 await expect(page).toHaveTitle('One Horizon Family | Costa del Sol');
 await page.getByRole('link', { name: 'One Horizon — Home', exact: true }).click();
 await page.locator('footer').getByRole('link', { name: 'Política de privacidad', exact: true }).click();
 await expect(page).toHaveURL(/\/privacy-policy/);
 await page.getByRole('button', { name: 'Abrir navegación', exact: true }).click();
 await page.getByRole('navigation').getByRole('link', { name: 'Portal de clientes', exact: true }).click();
 await expect(page).toHaveURL(/\/login/);
 await expect(page.getByRole('button', { name: 'Login', exact: true })).toBeVisible();
});

test('Spanish header and content fit tablet widths without horizontal overflow', async ({ page }) => {
 await page.goto('/');
 for (const width of [768, 1100, 1280]) {
  await page.setViewportSize({ width, height: 1024 });
  if (width === 768) { await page.getByRole('button', { name: 'Open navigation', exact: true }).click(); await page.getByRole('button', { name: 'Switch to Spanish', exact: true }).click(); }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
 }
});
