import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './',
  testMatch: ['**/tests/**/*.test.ts', '**/app/api/**/*.test.ts'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: `http://localhost:3000${process.env.NEXT_PUBLIC_BASE_PATH || '/openmic'}/`,
    trace: 'on-first-retry',
  },

  webServer: {
    command: 'npm run dev',
    url: `http://localhost:3000${process.env.NEXT_PUBLIC_BASE_PATH || '/openmic'}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
