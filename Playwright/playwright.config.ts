import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const ADMIN_AUTH_FILE = path.join(__dirname, '.auth/admin.json');
const CLIENT_AUTH_FILE = path.join(__dirname, '.auth/client.json');
const PUBLIC_AUTH_FILE = path.join(__dirname, '.auth/public.json');

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  projects: [
    // Project 1: Setup – runs global.setup.ts to create auth state
    {
      name: 'setup',
      testMatch: '**/global.setup.ts',
    },

    // Project 2: Tests running as authenticated admin (skips UI login)
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: ADMIN_AUTH_FILE,
      },
      testIgnore: ['**/global.setup.ts', '**/auth-state-client.spec.ts', '**/auth-state-public.spec.ts'],
      dependencies: ['setup'],
    },

    // Project 3: Tests running as authenticated client
    {
      name: 'chromium-client',
      use: {
        ...devices['Desktop Chrome'],
        storageState: CLIENT_AUTH_FILE,
      },
      testMatch: ['**/auth-state-client.spec.ts'],
      testIgnore: ['**/global.setup.ts'],
      dependencies: ['setup'],
    },

    // Project 4: Tests that need unauthenticated state
    {
      name: 'chromium-public',
      use: {
        ...devices['Desktop Chrome'],
        storageState: PUBLIC_AUTH_FILE,
      },
      testMatch: ['**/auth-state-public.spec.ts', '**/Case_5_AG.spec.ts', '**/Case_7_NJ.spec.ts'],
      testIgnore: ['**/global.setup.ts'],
      dependencies: ['setup'],
    },
  ],
});
