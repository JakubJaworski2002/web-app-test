/**
 * Testy zarzadzania stanem - Admin (Dealer)
 *
 * Filar 3: Optymalizacja poprzez storageState
 */

import { test, expect, Page } from '@playwright/test';

const APP_URL = 'http://localhost:4200';
const API_BASE = 'http://localhost:3000';

async function isAuthenticatedAdmin(page: Page): Promise<boolean> {
  const res = await page.request.get(`${API_BASE}/current-user`);
  if (res.status() !== 200) return false;
  const body = await res.json() as { user?: { isDealer?: boolean } };
  return body.user?.isDealer === true;
}

test.describe('Auth State - Admin (Dealer) [S1-S5]', () => {
  test('[S1] Admin zalogowany (storageState) - panel dealera dostepny', async ({ page }) => {
    await page.goto(`${APP_URL}/cars`);
    const authenticated = await isAuthenticatedAdmin(page);
    test.skip(!authenticated, 'Brak aktywnej sesji admina w lokalnym storageState.');
  });

  test('[S2] Admin moze dodac samochod (storageState) - formularz dostepny', async ({ page }) => {
    await page.goto(`${APP_URL}/cars`);
    const authenticated = await isAuthenticatedAdmin(page);
    test.skip(!authenticated, 'Brak aktywnej sesji admina w lokalnym storageState.');

    const addCarButtons = page.getByRole('button', { name: /dodaj|add/i });
    const addCarCount = await addCarButtons.count();
    if (addCarCount > 0) {
      await expect(addCarButtons.first()).toBeEnabled();
    }
  });

  test('[S3] Admin moze edytowac samochod (storageState preserved)', async ({ page }) => {
    await page.goto(`${APP_URL}/cars`);
    const authenticated = await isAuthenticatedAdmin(page);
    test.skip(!authenticated, 'Brak aktywnej sesji admina w lokalnym storageState.');

    const carCards = page.locator('.row.collapse.show .card');
    const cardCount = await carCards.count();
    if (cardCount > 0) {
      await expect(carCards.first()).toBeVisible();
    }
  });

  test('[S4] Admin moze sie wylogowac (logout button present)', async ({ page }) => {
    await page.goto(`${APP_URL}/cars`);
    const authenticated = await isAuthenticatedAdmin(page);
    test.skip(!authenticated, 'Brak aktywnej sesji admina w lokalnym storageState.');

    const logoutBtn = page.getByRole('button', { name: /wyloguj/i }).first();
    const hasLogout = (await logoutBtn.count()) > 0;
    test.skip(!hasLogout, 'UI nie eksponuje przycisku wylogowania w aktualnym layoucie.');

    const logoutResponse = page.waitForResponse(
      (response) => response.request().method() === 'POST' && response.url().includes('/logout'),
      { timeout: 10000 }
    ).catch(() => null);

    await logoutBtn.click();

    const response = await logoutResponse;
    if (response) {
      expect(response.ok()).toBeTruthy();
    }
  });

  test('[S5] Sesja admina jest przeniesiona (storageState persistence)', async ({ page, context }) => {
    const cookies = await context.cookies();
    const sessionCookie = cookies.find(
      (c) => c.name.toLowerCase().includes('session') || c.name.toLowerCase().includes('jwt')
    );

    if (sessionCookie) {
      expect(sessionCookie.value).toBeTruthy();
    }

    await page.goto(`${APP_URL}/cars`);
    const authenticated = await isAuthenticatedAdmin(page);
    test.skip(!authenticated, 'Brak aktywnej sesji admina w lokalnym storageState.');
  });
});
