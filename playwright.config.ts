import { defineConfig, devices } from '@playwright/test';

const port = 19006;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './e2e/web',
  fullyParallel: false,
  workers: 1,
  timeout: 120_000,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI
    ? [['line'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command:
      `npx cross-env EXPO_PUBLIC_DEMO_MODE=true EXPO_NO_TELEMETRY=1 CI=1 expo start --web --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 360_000,
  },
});
