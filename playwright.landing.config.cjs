const { defineConfig } = require('@playwright/test');
const baseURL = process.env.E2E_BASE_URL || 'http://127.0.0.1:54213';
const url = new URL(baseURL);
if (url.protocol !== 'http:' || !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)) throw new Error('Landing tests require a local HTTP frontend.');
module.exports = defineConfig({
 testDir: './e2e', testMatch: 'landing.spec.js', timeout: 45000, workers: 1, reporter: 'list',
 use: { baseURL, headless: true, viewport: { width: 1440, height: 1000 }, launchOptions: process.env.E2E_CHROMIUM_PATH ? { executablePath: process.env.E2E_CHROMIUM_PATH } : {} },
});
