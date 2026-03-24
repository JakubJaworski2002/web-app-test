import { Page } from '@playwright/test';

export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * Loguje użytkownika przez modal logowania.
 * @param page    - instancja Playwright Page
 * @param credentials - dane logowania { username, password }
 */
export async function login(page: Page, credentials: LoginCredentials): Promise<void> {
  await page.getByRole('button', { name: 'Zaloguj się' }).click();

  const dialog = page.getByRole('dialog', { name: 'Logowanie' });
  await dialog.locator('#username').fill(credentials.username);
  await dialog.locator('#password').fill(credentials.password);

  await page.getByLabel('Logowanie').getByRole('button', { name: 'Zaloguj się' }).click();

  // Poczekaj na zamknięcie modalu – znak udanego logowania
  await dialog.waitFor({ state: 'hidden' });
}
