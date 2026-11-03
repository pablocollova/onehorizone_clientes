const { defineConfig } = require('@playwright/test');
const frontendUrl = process.env.E2E_BASE_URL || 'http://127.0.0.1:54211';
for (const value of [frontendUrl, process.env.VITE_API_URL || 'http://127.0.0.1:4000']) {
    const url = new URL(value);
    if (url.protocol !== 'http:' || !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)) {
        throw new Error('Workspace browser tests require explicit local HTTP endpoints.');
    }
}

// Explicitly started local API and frontend; never starts or targets a deployment.
module.exports = defineConfig({
    testDir: './e2e',
    testMatch: ['workspace-ui.spec.js', 'accounts.spec.js', 'documents.spec.js'],
    timeout: 60000,
    workers: 1,
    reporter: 'list',
    use: {
        baseURL: frontendUrl,
        headless: true,
        viewport: { width: 1440, height: 1000 },
        launchOptions: process.env.E2E_CHROMIUM_PATH ? { executablePath: process.env.E2E_CHROMIUM_PATH } : {},
        trace: 'retain-on-failure',
    },
});
