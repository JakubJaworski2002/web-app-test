import { test as setup, expect, APIRequestContext, Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

export const ADMIN_AUTH_FILE = path.join(__dirname, '../.auth/admin.json');
export const CLIENT_AUTH_FILE = path.join(__dirname, '../.auth/client.json');
export const PUBLIC_AUTH_FILE = path.join(__dirname, '../.auth/public.json');

const FRONTEND_BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:4200';
const API_BASE_URL = process.env.PLAYWRIGHT_API_BASE ?? 'http://localhost:3000';

const ADMIN = { username: 'admin', password: 'Admin1!' };
const CLIENT = {
  username: 'e2e_client',
  password: 'E2eClient123!',
  email: 'e2e_client@test.local',
  firstName: 'E2E',
  lastName: 'Client',
};

function ensureAuthDirectory(): void {
  const authDir = path.dirname(ADMIN_AUTH_FILE);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  const gitignorePath = path.join(authDir, '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(gitignorePath, '# Auth state files contain session cookies - never commit them\n*.json\n');
  }

  const readmePath = path.join(authDir, 'README.md');
  if (!fs.existsSync(readmePath)) {
    fs.writeFileSync(
      readmePath,
      [
        '# Auth State',
        '',
        'This directory contains saved browser state (session cookies/localStorage) for Playwright.',
        '',
        '## Files',
        '- `admin.json` – session for admin/dealer tests',
        '- `client.json` – session for client tests',
        '- `public.json` – unauthenticated baseline state',
      ].join('\n')
    );
  }
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function loginViaUi(page: Page, credentials: { username: string; password: string }): Promise<boolean> {
  await page.goto(`${FRONTEND_BASE_URL}/cars`);
  await page.getByRole('button', { name: 'Zaloguj się' }).first().click();

  const dialog = page.getByRole('dialog', { name: 'Logowanie' });
  await expect(dialog).toBeVisible({ timeout: 10000 });

  await dialog.locator('#username').fill(credentials.username);
  await dialog.locator('#password').fill(credentials.password);

  const loginResponsePromise = page.waitForResponse(
    (response) => response.request().method() === 'POST' && response.url().includes('/login'),
    { timeout: 15000 }
  );

  await dialog.getByRole('button', { name: 'Zaloguj się' }).click();
  const loginResponse = await loginResponsePromise.catch(() => null);
  if (!loginResponse || !loginResponse.ok()) {
    return false;
  }

  await expect(dialog).toBeHidden({ timeout: 15000 });
  await expect(page.locator('.modal-backdrop.show')).toHaveCount(0, { timeout: 15000 });

  // Weryfikacja sesji przez API jest stabilniejsza niż asercja jednego elementu UI.
  const currentUser = await page.request.get(`${API_BASE_URL}/current-user`);
  return currentUser.ok();
}

async function ensureClientExists(request: APIRequestContext): Promise<boolean> {
  let registerRes = await request.post(`${API_BASE_URL}/register`, {
    data: {
      username: CLIENT.username,
      email: CLIENT.email,
      password: CLIENT.password,
      firstName: CLIENT.firstName,
      lastName: CLIENT.lastName,
    },
  });

  for (let i = 1; i <= 4 && registerRes.status() === 429; i++) {
    await sleep(300 * i);
    registerRes = await request.post(`${API_BASE_URL}/register`, {
      data: {
        username: CLIENT.username,
        email: CLIENT.email,
        password: CLIENT.password,
        firstName: CLIENT.firstName,
        lastName: CLIENT.lastName,
      },
    });
  }

  if (registerRes.status() === 201) {
    return true;
  }

  if (registerRes.status() === 400) {
    const body = await registerRes.json().catch(() => ({}));
    const text = JSON.stringify(body).toLowerCase();
    const isDuplicate = text.includes('zaj') || text.includes('exist') || text.includes('already');
    if (isDuplicate) {
      return true;
    }
  }

  if (registerRes.status() === 429) {
    console.warn('Client registration throttled (429). Continuing with existing account if present.');
    return false;
  }

  throw new Error(`Cannot ensure client account. /register returned status ${registerRes.status()}`);
}

setup('create admin auth state', async ({ page }) => {
  ensureAuthDirectory();
  const logged = await loginViaUi(page, ADMIN);
  if (!logged) {
    console.warn('Admin login failed in setup. Writing fallback storage state.');
  }
  await page.context().storageState({ path: ADMIN_AUTH_FILE });
});

setup('create client auth state', async ({ browser, request }) => {
  ensureAuthDirectory();
  await ensureClientExists(request);

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    const logged = await loginViaUi(page, { username: CLIENT.username, password: CLIENT.password });
    if (!logged) {
      console.warn('Client login failed in setup. Writing fallback storage state.');
    }
    await context.storageState({ path: CLIENT_AUTH_FILE });
  } finally {
    await context.close();
  }
});

setup('create public auth state', async ({ browser }) => {
  ensureAuthDirectory();
  const context = await browser.newContext();

  try {
    await context.storageState({ path: PUBLIC_AUTH_FILE });
  } finally {
    await context.close();
  }
});
