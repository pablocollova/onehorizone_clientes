const { test, expect } = require('@playwright/test');
const fs = require('node:fs/promises');

test.beforeEach(async ({ page }) => {
 await page.addInitScript(() => { if (!sessionStorage.getItem('demo-e2e-initialized')) { localStorage.clear(); sessionStorage.setItem('demo-e2e-initialized', 'yes'); } localStorage.setItem('onehorizon_gdpr_consent', JSON.stringify({ necessary: true, analytics: false, marketing: false })); });
});
async function enter(page, username) {
 await page.goto('/login');
 await page.getByRole('button', { name: `Entrar como ${username}`, exact: true }).click();
 await expect(page.getByRole('heading', { level: 1 })).toContainText(username.startsWith('demo_admin') || username === 'demo_lector_oh' ? 'Una visión clara' : 'Hola,');
}

test('administrator creates an invoice and service, then records, confirms and allocates a payment without network API calls', async ({ page }, testInfo) => {
 const calls = [], errors = [];
 page.on('request', request => { if (request.url().includes('/api/')) calls.push(request.url()); });
 page.on('pageerror', error => errors.push(error.message));
 await enter(page, 'demo_admin');
 await page.screenshot({ path: testInfo.outputPath('demo-admin.png') });
 await page.getByRole('navigation').getByRole('link', { name: 'Facturas', exact: true }).click();
 await page.getByRole('button', { name: 'Nueva factura', exact: true }).click();
 const dialog = page.getByRole('dialog');
 await dialog.getByRole('combobox', { name: 'Empresa', exact: true }).selectOption('demo-costa');
 await dialog.getByLabel('Número de factura', { exact: true }).fill('DEMO-E2E-100');
 await dialog.getByLabel('Importe', { exact: true }).fill('100,00');
 await dialog.getByRole('button', { name: 'Guardar factura', exact: true }).click();
 await expect(page.getByText('Factura registrada.', { exact: true })).toBeVisible();
 await page.getByRole('navigation').getByRole('link', { name: 'Servicios', exact: true }).click();
 await page.getByRole('button', { name: 'Registrar servicio', exact: true }).click();
 await dialog.getByRole('combobox', { name: 'Empresa', exact: true }).selectOption('demo-costa');
 await dialog.getByLabel('Nombre del servicio', { exact: true }).fill('Trabajo ficticio E2E');
 await dialog.getByLabel('Fecha de trabajo', { exact: true }).fill('2026-11-04');
 await dialog.getByLabel('Coste registrado', { exact: true }).fill('35,00');
 await dialog.getByRole('button', { name: 'Guardar servicio', exact: true }).click();
 await page.getByLabel('Estado de Trabajo ficticio E2E', { exact: true }).selectOption('COMPLETED');
 await page.goto('/app/admin/accounts?clientId=demo-costa');
 await page.getByLabel('Importe del pago', { exact: true }).fill('40.00');
 await page.getByLabel('Referencia del pago', { exact: true }).fill('DEMO-E2E-40');
 await page.getByRole('button', { name: 'Registrar pago', exact: true }).click();
 await page.getByRole('button', { name: 'Enviar a revisión: DEMO-E2E-40', exact: true }).click();
 await page.getByRole('button', { name: 'Confirmar pago: DEMO-E2E-40', exact: true }).click();
 const state = await page.evaluate(() => JSON.parse(localStorage.getItem('onehorizon-dashboard-demo-v1')));
 const payment = state.receipts.find(x => x.reference === 'DEMO-E2E-40'), invoice = state.invoices.find(x => x.number === 'DEMO-E2E-100');
 await page.getByRole('combobox', { name: 'Pago confirmado', exact: true }).selectOption(payment.id);
 await page.getByRole('combobox', { name: 'Factura a imputar', exact: true }).selectOption(invoice.id);
 await page.getByLabel('Importe a imputar', { exact: true }).fill('40.00');
 await page.getByRole('button', { name: 'Imputar pago', exact: true }).click();
 await page.getByRole('button', { name: 'Facturas de cuenta', exact: true }).click();
 await expect(page.getByRole('row').filter({ hasText: 'DEMO-E2E-100' })).toContainText('60,00');
 await page.reload();
 await page.getByRole('button', { name: 'Facturas de cuenta', exact: true }).click();
 await expect(page.getByRole('row').filter({ hasText: 'DEMO-E2E-100' })).toContainText('60,00');
 expect(calls).toEqual([]); expect(errors).toEqual([]);
});

test('client uploads and downloads a local document; readers cannot write or inspect another company', async ({ page }, testInfo) => {
 await enter(page, 'demo_cliente');
 await page.screenshot({ path: testInfo.outputPath('demo-client.png') });
 await page.getByRole('navigation').getByRole('link', { name: 'Facturas', exact: true }).click();
 await expect(page.getByRole('button', { name: 'Nueva factura', exact: true })).toHaveCount(0);
 await expect(page.getByText('OH-DEMO-SIERRA', { exact: true })).toHaveCount(0);
 await page.goto('/app/documents');
 const file = Buffer.from('Documento ficticio. Demo sin servidor.');
 await page.getByLabel('Archivo', { exact: true }).setInputFiles({ name: 'demo-prueba.txt', mimeType: 'text/plain', buffer: file });
 await page.getByRole('button', { name: 'Cargar archivo', exact: true }).click();
 await expect(page.getByRole('heading', { name: 'demo-prueba.txt', exact: true })).toBeVisible();
 const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Descargar demo-prueba.txt', exact: true }).click()]);
 expect((await fs.readFile(await download.path())).equals(file)).toBe(true); await download.delete();
 await page.reload();
 await expect(page.getByRole('heading', { name: 'demo-prueba.txt', exact: true })).toBeVisible();
 await page.getByRole('button', { name: 'Accesos demo', exact: true }).click();
 await page.getByRole('button', { name: 'Entrar como demo_lector', exact: true }).click();
 await page.goto('/app/documents');
 await expect(page.getByRole('form', { name: 'Cargar archivo privado', exact: true })).toHaveCount(0);
 const denied = await page.evaluate(async () => {
  const token = localStorage.getItem('token'), headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const read = await fetch('/preview-api-disabled/api/accounts/statement?clientId=demo-sierra', { headers });
  const write = await fetch('/preview-api-disabled/api/accounts/payments', { method: 'POST', headers, body: '{}' });
  return [read.status, write.status];
 });
 expect(denied).toEqual([403, 403]);
});

test('manual credentials, read-only internal role, mobile and reset work', async ({ page }) => {
 await page.setViewportSize({ width: 390, height: 844 });
 await page.goto('/login');
 await page.getByRole('button', { name: 'Cerrar accesos de prueba', exact: true }).click();
 await page.getByPlaceholder('Username', { exact: true }).fill('demo_lector_oh');
 await page.getByPlaceholder('Password', { exact: true }).fill('DemoHorizon2026!');
 await page.getByRole('button', { name: 'Login', exact: true }).click();
 await expect(page).toHaveURL(/\/app\/admin\/clients/);
 await page.getByRole('button', { name: 'Abrir menú', exact: true }).click();
 await page.getByRole('navigation').getByRole('link', { name: 'Facturas', exact: true }).click();
 await expect(page.getByRole('button', { name: 'Nueva factura', exact: true })).toHaveCount(0);
 expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
 await page.getByRole('button', { name: 'Reiniciar datos demo', exact: true }).click();
 await expect(page.getByText('OH-DEMO-001', { exact: true })).toBeVisible();
 await expect(page.getByLabel('Entorno de demostración', { exact: true })).toBeVisible();
});

test('client administrator can confirm and allocate its own payment in the demo', async ({ page }) => {
 await enter(page, 'demo_cliente');
 await page.goto('/app/payments');
 await page.getByLabel('Importe del pago', { exact: true }).fill('20.00');
 await page.getByLabel('Referencia del pago', { exact: true }).fill('Pago cliente demo');
 await page.getByRole('button', { name: 'Registrar pago', exact: true }).click();
 await page.getByRole('button', { name: 'Enviar a revisión: Pago cliente demo', exact: true }).click();
 await page.getByRole('button', { name: 'Confirmar pago: Pago cliente demo', exact: true }).click();
 const payment = await page.evaluate(() => JSON.parse(localStorage.getItem('onehorizon-dashboard-demo-v1')).receipts.find(x => x.reference === 'Pago cliente demo'));
 await page.getByRole('combobox', { name: 'Pago confirmado', exact: true }).selectOption(payment.id);
 await page.getByRole('combobox', { name: 'Factura a imputar', exact: true }).selectOption('demo-invoice');
 await page.getByLabel('Importe a imputar', { exact: true }).fill('20.00');
 await page.getByRole('button', { name: 'Imputar pago', exact: true }).click();
 await page.getByRole('button', { name: 'Facturas de cuenta', exact: true }).click();
 await expect(page.getByRole('row').filter({ hasText: 'OH-DEMO-001' })).toContainText('40,00');
});
