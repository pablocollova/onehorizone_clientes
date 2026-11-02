const { test, expect } = require('@playwright/test');
const { backendUrl, apiLogin, login, dismissCookieBanner } = require('./helpers');

for (const role of ['PLATFORM_ADMIN', 'CLIENT_ADMIN']) {
    test(`${role} records, reviews, confirms and allocates a partial payment in its account`, async ({ page, request }, testInfo) => {
        const adminAuth = await apiLogin(request);
        const adminHeaders = { Authorization: `Bearer ${adminAuth.token}` };
        const suffix = `${Date.now()}-${role}`;
        const clientResponse = await request.post(`${backendUrl}/api/admin/clients`, { headers: adminHeaders, data: { name: `Fictional financial account ${suffix}`, email: `finance-${suffix}@example.test` } });
        expect(clientResponse.ok()).toBeTruthy();
        const company = await clientResponse.json();
        const invoiceResponse = await request.post(`${backendUrl}/api/admin/invoices`, { headers: adminHeaders, data: { clientId: company.id, totalCents: 10000, currency: 'EUR', type: 'ONEHORIZON_FEE', number: `FICTIONAL-${suffix}` } });
        expect(invoiceResponse.ok()).toBeTruthy();
        const invoice = await invoiceResponse.json();
        let actorAuth = adminAuth;
        if (role === 'CLIENT_ADMIN') {
            const email = `operator-${suffix}@example.test`;
            const invite = await request.post(`${backendUrl}/api/admin/invites`, { headers: adminHeaders, data: { clientId: company.id, role, email, name: 'Fictional financial operator' } });
            expect(invite.ok()).toBeTruthy();
            const token = new URL((await invite.json()).inviteLink).searchParams.get('token');
            const activated = await request.post(`${backendUrl}/api/auth/activate`, { data: { token, password: 'Fictional-local-password-123' } });
            expect(activated.ok()).toBeTruthy(); actorAuth = await activated.json();
            await login(page, email, 'Fictional-local-password-123');
            await expect(page).toHaveURL(/\/app\/dashboard/);
            await page.goto('/app/payments');
        } else {
            await login(page, 'platform_admin', 'admin123');
            await expect(page).toHaveURL(/\/app\/admin\/clients/);
            await page.getByRole('link', { name: 'Cuenta corriente y pagos' }).click();
            await page.getByLabel('Empresa', { exact: true }).selectOption(company.id);
        }
        await dismissCookieBanner(page);
        const browserErrors = [];
        page.on('pageerror', error => browserErrors.push(error.message));
        await expect(page.getByText(invoice.number, { exact: true })).toBeVisible();
        await page.getByLabel('Importe del pago', { exact: true }).fill('40.00');
        await page.getByLabel('Referencia del pago', { exact: true }).fill(`Fictional receipt ${suffix}`);
        await page.getByRole('button', { name: 'Registrar pago', exact: true }).click();
        await page.getByRole('button', { name: `Enviar a revisión: Fictional receipt ${suffix}` }).click();
        await page.getByRole('button', { name: `Confirmar pago: Fictional receipt ${suffix}` }).click();
        const state = await request.get(`${backendUrl}/api/accounts/statement?clientId=${company.id}`, { headers: { Authorization: `Bearer ${actorAuth.token}` } });
        expect(state.ok()).toBeTruthy();
        const receipt = (await state.json()).receipts[0];
        expect(receipt.status).toBe('CONFIRMED');
        await page.getByRole('combobox', { name: 'Pago confirmado', exact: true }).selectOption(receipt.id);
        await page.getByRole('combobox', { name: 'Factura a imputar', exact: true }).selectOption(invoice.id);
        await page.getByLabel('Importe a imputar', { exact: true }).fill('40.00');
        await page.getByRole('button', { name: 'Imputar pago', exact: true }).click();
        const balance = page.locator('section').filter({ has: page.getByRole('heading', { name: 'One Horizon · EUR' }) });
        await expect(balance).toContainText('60,00');
        const persisted = await request.get(`${backendUrl}/api/accounts/statement?clientId=${company.id}`, { headers: adminHeaders });
        const result = await persisted.json();
        expect(result.balances.find(x => x.currency === 'EUR' && x.recipient === 'ONE_HORIZON')).toMatchObject({ outstandingCents: 6000, appliedCents: 4000, unappliedCents: 0 });
        expect(result.events.find(x => x.action === 'PAYMENT_CONFIRMED').actorRole).toBe(role);
        await page.reload();
        if (role === 'PLATFORM_ADMIN') await page.getByLabel('Empresa', { exact: true }).selectOption(company.id);
        await expect(balance).toContainText('60,00');
        expect(browserErrors).toEqual([]);
        await page.screenshot({ path: testInfo.outputPath(`account-${role}.png`), fullPage: true });
    });
}
