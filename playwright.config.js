const { defineConfig, devices } = require('@playwright/test')

const frontendUrl = process.env.E2E_BASE_URL || 'http://127.0.0.1:5173'
const backendUrl = process.env.VITE_API_URL || 'http://127.0.0.1:4000'
const testDatabaseUrl = process.env.DATABASE_URL_TEST || 'postgresql://onehorizon:onehorizon@localhost:5432/onehorizon_test'

module.exports = defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: frontendUrl,
    trace: 'on-first-retry',
  },
  webServer: process.env.E2E_SKIP_WEBSERVER === '1'
    ? undefined
    : {
      command: `npx concurrently -k -s first -n backend,frontend "npm run dev --prefix backend" "npm run dev --prefix frontend -- --host 127.0.0.1"`,
      url: frontendUrl,
      env: {
        ...process.env,
        NODE_ENV: 'test',
        DATABASE_URL_TEST: testDatabaseUrl,
        JWT_SECRET: process.env.JWT_SECRET || 'test_secret',
        FRONTEND_URL: frontendUrl,
        SMTP_HOST: '',
        SMTP_USER: '',
        SMTP_PASS: '',
        VITE_API_URL: backendUrl,
      },
      reuseExistingServer: false,
      timeout: 120_000,
    },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
