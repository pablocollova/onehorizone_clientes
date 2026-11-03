const { defineConfig } = require('@playwright/test');

// Explicitly started local API and frontend; never starts or targets a deployment.
module.exports = defineConfig({
    testDir: './e2e',
    testMatch: ['workspace-ui.spec.js', 'accounts.spec.js'],
    timeout: 60000,
    workers: 1,
    reporter: 'list',
    use: {
        baseURL: process.env.E2E_BASE_URL || 'http://127.0.0.1:54211',
        headless: true,
        viewport: { width: 1440, height: 1000 },
        launchOptions: process.env.E2E_CHROMIUM_PATH ? { executablePath: process.env.E2E_CHROMIUM_PATH } : {},
        trace: 'retain-on-failure',
    },
});
