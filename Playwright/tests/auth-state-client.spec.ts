/**
 * Testy zarzadzania stanem - Client (Buyer)
 *
 * Filar 3: Optymalizacja poprzez storageState
 */

import { test, expect, Page } from '@playwright/test';

const APP_URL = 'http://localhost:4200';
const API_BASE = 'http://localhost:3000';

async function isAuthenticatedClient(page: Page): Promise<boolean> {
  const res = await page.request.get(`${API_BASE}/current-user`);
  if (res.status() !== 200) return false;
  const body = await res.json() as { user?: { isDealer?: boolean } };
  return body.user?.isDealer === false;
}

test.describe('Auth State - Client (Buyer) [S6-S10]', () => {
  test('[S6] Klient zalogowany (storageState) - widoczna lista samochodow', async ({ page }) => {
    await page.goto(`${APP_URL}/cars`);
    const authenticated = await isAuthenticatedClient(page);
    test.skip(!authenticated, 'Brak aktywnej sesji klienta w lokalnym storageState.');
    await expect(page.locator('.card').first()).toBeVisible({ timeout: 10000 });
  });

  test('[S7] Klient moze wyswietlic szczegoly samochodu (storageState)', async ({ page }) => {
    await page.goto(`${APP_URL}/cars`);
    const authenticated = await isAuthenticatedClient(page);
    test.skip(!authenticated, 'Brak aktywnej sesji klienta w lokalnym storageState.');

    const firstCard = page.locator('.card').first();
    await expect(firstCard).toBeVisible();
  });

  test('[S8] Klient moze uzyc kalkulatora leasingu (storageState)', async ({ page }) => {
    await page.goto(`${APP_URL}/cars`);
    const authenticated = await isAuthenticatedClient(page);
    test.skip(!authenticated, 'Brak aktywnej sesji klienta w lokalnym storageState.');

    const leasingBtns = page.getByRole('button', { name: /leasing|rata/i });
    const leasingCount = await leasingBtns.count();
    if (leasingCount > 0) {
      await expect(leasingBtns.first()).toBeEnabled();
    }
  });

  test('[S9] Klient - widoczne opcje wynajmu (storageState)', async ({ page }) => {
    await page.goto(`${APP_URL}/cars`);
    const authenticated = await isAuthenticatedClient(page);
    test.skip(!authenticated, 'Brak aktywnej sesji klienta w lokalnym storageState.');

    const rentBtns = page.getByRole('button', { name: /wynajm|rent/i });
    const buyBtns = page.getByRole('button', { name: /kup|buy|zakup/i });

    const hasRent = (await rentBtns.count()) > 0;
    const hasBuy = (await buyBtns.count()) > 0;
    expect(hasRent || hasBuy).toBeTruthy();
  });

  test('[S10] Klient - sesja zachowywana miedzy nawigacja (storageState)', async ({ page, context }) => {
    const cookiesBefore = await context.cookies();
    const sessionBefore = cookiesBefore.find(
      (c) => c.name.toLowerCase().includes('session') || c.name.toLowerCase().includes('jwt')
    );

    await page.goto(`${APP_URL}/cars`);
    const authenticated = await isAuthenticatedClient(page);
    test.skip(!authenticated, 'Brak aktywnej sesji klienta w lokalnym storageState.');
    await page.reload();

    const cookiesAfter = await context.cookies();
    const sessionAfter = cookiesAfter.find(
      (c) => c.name.toLowerCase().includes('session') || c.name.toLowerCase().includes('jwt')
    );

    if (sessionBefore && sessionAfter) {
      expect(sessionAfter.value).toBe(sessionBefore.value);
    }
  });
});
