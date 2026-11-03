const { test, expect } = require('@playwright/test');
const fs = require('node:fs/promises');
const { backendUrl, apiLogin, login } = require('./helpers');
const bytes = Buffer.from('%PDF-1.4\nFictional private proof\n%%EOF');

for (const role of ['PLATFORM_ADMIN', 'CLIENT_ADMIN']) {
    test(`${role} uploads, organizes and privately downloads invoice/payment proof`, async ({ page, request }, testInfo) => {
        test.setTimeout(45000);
        const auth = await apiLogin(request), headers = { Authorization: `Bearer ${auth.token}` };
        const suffix = `${Date.now()}-${role}`;
        const companyResponse = await request.post(`${backendUrl}/api/admin/clients`, { headers, data: { name: `Fictional documents ${suffix}`, email: `documents-${suffix}@example.test` } });
        expect(companyResponse.ok()).toBeTruthy(); const company = await companyResponse.json();
        const invoiceResponse = await request.post(`${backendUrl}/api/admin/invoices`, { headers, data: { clientId: company.id, totalCents: 10000, currency: 'EUR', type: 'ONEHORIZON_FEE', number: `FICTITIOUS-${suffix}` } });
        expect(invoiceResponse.ok()).toBeTruthy(); const invoice = await invoiceResponse.json();
        const paymentResponse = await request.post(`${backendUrl}/api/accounts/payments`, { headers, data: { clientId: company.id, amountCents: 4000, currency: 'EUR', recipient: 'ONE_HORIZON', reference: `Fictional receipt ${suffix}`, paidAt: '2026-01-01', requestKey: suffix } });
        expect(paymentResponse.ok()).toBeTruthy(); const payment = await paymentResponse.json();
        async function invite(targetRole) {
            const email = `doc-${targetRole}-${suffix}@example.test`;
            const response = await request.post(`${backendUrl}/api/admin/invites`, { headers, data: { clientId: company.id, role: targetRole, email, name: `Fictional ${targetRole}` } });
            expect(response.ok()).toBeTruthy();
            const token = new URL((await response.json()).inviteLink).searchParams.get('token');
            const activated = await request.post(`${backendUrl}/api/auth/activate`, { data: { token, password: 'Fictional-doc-password-123' } });
            expect(activated.ok()).toBeTruthy();
            return email;
        }
        const errors = []; page.on('pageerror', error => errors.push(error.message));
        if (role === 'CLIENT_ADMIN') {
            await login(page, await invite(role), 'Fictional-doc-password-123');
            await expect(page).toHaveURL(/\/app\/dashboard/); await page.goto('/app/payments');
        } else {
            await login(page, 'platform_admin', 'admin123');
            await expect(page).toHaveURL(/\/app\/admin\/clients/);
            await page.getByRole('link', { name: 'Cuenta corriente y pagos' }).click();
            await page.getByRole('combobox', { name: 'Empresa', exact: true }).selectOption(company.id);
        }
        await page.getByRole('link', { name: 'Comprobantes del pago' }).click();
        await expect(page.getByRole('heading', { name: 'Documentación privada' })).toBeVisible();
        await page.getByRole('combobox', { name: 'Vincular factura', exact: true }).selectOption(invoice.id);
        await page.getByLabel('Archivo', { exact: true }).setInputFiles({ name: 'proof.pdf', mimeType: 'application/pdf', buffer: bytes });
        await page.getByLabel('Carpeta de carga', { exact: true }).fill('2026/Pagos');
        await page.getByRole('button', { name: 'Cargar archivo', exact: true }).click();
        await expect(page.getByRole('heading', { name: 'proof.pdf', exact: true })).toBeVisible();
        const [download, response] = await Promise.all([
            page.waitForEvent('download'), page.waitForResponse(x => x.url().includes('/api/documents/') && x.url().endsWith('/download')),
            page.getByRole('button', { name: 'Descargar proof.pdf', exact: true }).click(),
        ]);
        expect(response.status()).toBe(200); expect(response.headers()['cache-control']).toContain('no-store');
        expect(response.request().headers().authorization).toMatch(/^Bearer /);
        expect(download.suggestedFilename()).toBe('proof.pdf');
        expect((await fs.readFile(await download.path())).equals(bytes)).toBe(true); await download.delete();
        await page.getByRole('button', { name: 'Organizar proof.pdf', exact: true }).click();
        await page.getByLabel('Nombre del documento', { exact: true }).fill('organized.pdf');
        await page.getByLabel('Carpeta del documento', { exact: true }).fill('Archivados');
        await page.getByRole('button', { name: 'Guardar organización', exact: true }).click();
        await expect(page.getByRole('heading', { name: 'organized.pdf', exact: true })).toBeVisible();
        await page.reload();
        await expect(page.getByRole('heading', { name: 'organized.pdf', exact: true })).toBeVisible();
        const records = await request.get(`${backendUrl}/api/documents?clientId=${company.id}&receiptId=${payment.id}`, { headers });
        const result = await records.json();
        expect(result.documents).toHaveLength(1); expect(result.documents[0]).toMatchObject({ invoiceId: invoice.id, receiptId: payment.id, folder: 'Archivados' });
        expect(JSON.stringify(result)).not.toMatch(/storagePath|uploadKey|checksum/);
        const statement = await request.get(`${backendUrl}/api/accounts/statement?clientId=${company.id}`, { headers });
        expect((await statement.json()).receipts[0].status).toBe('PROCESSING');
        const foreign = await apiLogin(request, 'manager', 'admin123');
        expect((await request.get(`${backendUrl}/api/documents/${result.documents[0].id}/download`, { headers: { Authorization: `Bearer ${foreign.token}` } })).status()).toBe(404);
        if (role === 'CLIENT_ADMIN') {
            const readerEmail = await invite('CLIENT_USER');
            await page.getByRole('button', { name: 'Sign Out' }).click(); await expect(page).toHaveURL(/\/login/);
            await login(page, readerEmail, 'Fictional-doc-password-123'); await expect(page).toHaveURL(/\/app\/dashboard/);
            await page.goto(`/app/documents?receiptId=${payment.id}`);
            await expect(page.getByRole('heading', { name: 'organized.pdf', exact: true })).toBeVisible();
            await expect(page.getByRole('form', { name: 'Cargar archivo privado' })).toHaveCount(0);
            await expect(page.getByRole('button', { name: 'Organizar organized.pdf' })).toHaveCount(0);
            const [readerDownload] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Descargar organized.pdf' }).click()]);
            expect((await fs.readFile(await readerDownload.path())).equals(bytes)).toBe(true); await readerDownload.delete();
        }
        expect(errors).toEqual([]);
        await page.screenshot({ path: testInfo.outputPath(`private-documents-${role}.png`), fullPage: true });
    });
}
