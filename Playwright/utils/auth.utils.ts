import { Page, expect } from '@playwright/test';

export interface LoginCredentials {
  username: string;
  password: string;
}

async function waitForBootstrapBackdropToDisappear(page: Page): Promise<void> {
  await page.locator('.modal-backdrop.show').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
}

export async function login(page: Page, credentials: LoginCredentials): Promise<void> {
  const dialog = page.getByRole('dialog', { name: 'Logowanie' });
  const openLoginButton = page.getByRole('button', { name: 'Zaloguj się' }).first();

  const isDialogVisible = await dialog.isVisible().catch(() => false);
  if (!isDialogVisible) {
    const isOpenButtonVisible = await openLoginButton.isVisible().catch(() => false);
    if (isOpenButtonVisible) {
      await openLoginButton.click();
    } else {
      await expect(page.getByRole('button', { name: 'Wyloguj się' })).toBeVisible({ timeout: 10000 }).catch(() => {});
      return;
    }
  }

  await expect(dialog).toBeVisible({ timeout: 10000 });
  await dialog.locator('#username').fill(credentials.username);
  await dialog.locator('#password').fill(credentials.password);

  const loginResponsePromise = page.waitForResponse(
    (response) => response.request().method() === 'POST' && response.url().includes('/login'),
    { timeout: 15000 }
  );

  await dialog.getByRole('button', { name: 'Zaloguj się' }).click();

  const loginResponse = await loginResponsePromise;
  if (!loginResponse.ok()) {
    throw new Error(`Logowanie nie powiodlo sie (HTTP ${loginResponse.status()})`);
  }

  await expect(dialog).toBeHidden({ timeout: 15000 });
  await waitForBootstrapBackdropToDisappear(page);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle').catch(() => {});
  await expect(page.getByRole('button', { name: 'Wyloguj się' })).toBeVisible({ timeout: 15000 });
}

