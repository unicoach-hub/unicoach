import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 45000,
  expect: {
    timeout: 15000,
  },
  fullyParallel: true,
  retries: 1,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }]
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:4173',
    trace: 'on-first-retry',
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
