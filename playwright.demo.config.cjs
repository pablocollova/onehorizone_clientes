const { defineConfig } = require('@playwright/test');
const baseURL = process.env.E2E_BASE_URL || 'http://127.0.0.1:54221';
const target = new URL(baseURL);
if (target.protocol !== 'http:' || !['localhost', '127.0.0.1', '[::1]'].includes(target.hostname)) throw new Error('Demo tests are restricted to loopback.');
module.exports = defineConfig({ testDir: './e2e', testMatch: 'demo.spec.js', timeout: 60000, workers: 1, reporter: 'list', use: { baseURL, viewport: { width: 1440, height: 1000 }, headless: true, launchOptions: process.env.E2E_CHROMIUM_PATH ? { executablePath: process.env.E2E_CHROMIUM_PATH } : {} } });
