import { Page, expect } from '@playwright/test';

export interface LoginCredentials {
  username: string;
  password: string;
}

async function waitForBootstrapBackdropToDisappear(page: Page): Promise<void> {
  await page.locator('.modal-backdrop.show').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
}

async function closeLoginDialogIfStillVisible(page: Page, dialog: ReturnType<Page['getByRole']>): Promise<void> {
  const stillVisible = await dialog.isVisible().catch(() => false);
  if (!stillVisible) {
    return;
  }

  await dialog.locator('.btn-close, button[data-bs-dismiss="modal"]').first().click({ force: true }).catch(() => {});
  await page.keyboard.press('Escape').catch(() => {});

  await dialog.waitFor({ state: 'hidden', timeout: 5000 }).catch(async () => {
    // Fallback: jeśli Bootstrap nie domknie modala, schowaj go ręcznie, aby nie blokował kliknięć.
    await page.evaluate(() => {
      const modal = document.getElementById('authModal');
      if (!modal) {
        return;
      }
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
      (modal as HTMLElement).style.display = 'none';
      document.querySelectorAll('.modal-backdrop').forEach((backdrop) => backdrop.remove());
      document.body.classList.remove('modal-open');
      document.body.style.removeProperty('padding-right');
    });
  });
}

export async function login(page: Page, credentials: LoginCredentials): Promise<void> {
  const dialog = page.getByRole('dialog', { name: 'Logowanie' });
  const openLoginButton = page.getByRole('button', { name: 'Zaloguj się' }).first();
  const logoutButton = page.getByRole('button', { name: 'Wyloguj się' });

  const isDialogVisible = await dialog.isVisible().catch(() => false);
  if (!isDialogVisible) {
    const isOpenButtonVisible = await openLoginButton.isVisible().catch(() => false);
    if (!isOpenButtonVisible) {
      const isLogoutButtonVisible = await logoutButton.isVisible().catch(() => false);
      if (isLogoutButtonVisible) {
        await logoutButton.click();
      }
    }

    await expect(openLoginButton).toBeVisible({ timeout: 15000 });
    await openLoginButton.click();
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

  await closeLoginDialogIfStillVisible(page, dialog);
  await expect(dialog).toBeHidden({ timeout: 15000 });
  await waitForBootstrapBackdropToDisappear(page);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle').catch(() => {});
  await expect(page.getByRole('button', { name: 'Wyloguj się' })).toBeVisible({ timeout: 15000 });
}

