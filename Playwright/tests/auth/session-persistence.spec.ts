/**
 * Testy StorageState – Trwalosc sesji
 *
 * Playlista: S07-S10
 * Pokryte scenariusze UI: R5 (logowanie), R7 (nawigacja)
 *
 * Technika: weryfikacja ze storageState przetrwa reload, nawigacje i wiele stron
 */

import { test, expect } from '@playwright/test';
import path from 'path';

const ADMIN_AUTH_FILE = path.join(__dirname, '../../.auth/admin.json');
const APP = 'http://localhost:4200';

test.use({ storageState: ADMIN_AUTH_FILE });

test.describe('StorageState – Trwalosc sesji', () => {

  /**
   * [S07] Sesja admina przetrwa page.reload()
   * Scenariusz UI: R5 – uzytkownik odswieza strone i pozostaje zalogowany
   * Cel: weryfikacja ze cookies sesji sa prawidlowo zapisane i przetrwaja reload
   */
  test('[S07] Sesja admina przetrwa page.reload() – Wyloguj sie nadal widoczne', async ({ page }) => {
    await page.goto(`${APP}/cars`);
    await expect(page.getByRole('button', { name: 'Wyloguj się' })).toBeVisible({ timeout: 5000 });

    // Odswiez strone
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Sesja powinna przetrwac
    await expect(page.getByRole('button', { name: 'Wyloguj się' })).toBeVisible({ timeout: 8000 });
    await expect(page.getByRole('button', { name: 'Zaloguj się' })).not.toBeVisible();
  });

  /**
   * [S08] Sesja admina przetrwa nawigacje miedzy stronami
   * Scenariusz UI: R7 (nawigacja do Privacy Policy) + R5 (stan zalogowania)
   * Cel: cookies sesji sa zachowane przy przejsciu na inna podstrone i powrocie
   */
  test('[S08] Sesja admina przetrwa nawigacje /cars -> /privacy-policy -> /cars', async ({ page }) => {
    await page.goto(`${APP}/cars`);
    await expect(page.getByRole('button', { name: 'Wyloguj się' })).toBeVisible({ timeout: 5000 });

    // Przejdz na Privacy Policy
    await page.goto(`${APP}/privacy-policy`);
    await page.waitForLoadState('domcontentloaded');

    // Wróc na /cars
    await page.goto(`${APP}/cars`);
    await page.waitForLoadState('networkidle');

    // Sesja nadal aktywna
    await expect(page.getByRole('button', { name: 'Wyloguj się' })).toBeVisible({ timeout: 8000 });
    await expect(page.getByRole('button', { name: 'Dodaj Samochód' })).toBeVisible({ timeout: 5000 });
  });

  /**
   * [S09] Dwie strony z tego samego kontekstu dziela storageState
   * Scenariusz UI: R5 – sesja jest wspolna dla calego kontekstu przegladarki
   * Cel: nowa zakladka (page) otwarta w tym samym kontekscie automatycznie dziedziczy sesje
   */
  test('[S09] Dwie strony z tego samego kontekstu dziela storageState admina', async ({ page, context }) => {
    await page.goto(`${APP}/cars`);
    await expect(page.getByRole('button', { name: 'Wyloguj się' })).toBeVisible({ timeout: 5000 });

    // Otwórz druga strone w tym samym kontekscie
    const page2 = await context.newPage();
    await page2.goto(`${APP}/cars`);
    await page2.waitForLoadState('networkidle');

    // Druga strona takze powinna byc zalogowana
    await expect(page2.getByRole('button', { name: 'Wyloguj się' })).toBeVisible({ timeout: 8000 });
    await expect(page2.getByRole('button', { name: 'Dodaj Samochód' })).toBeVisible({ timeout: 5000 });

    await page2.close();
  });

  /**
   * [S10] Cookies zawieraja connect.sid po zaladowaniu storageState
   * Scenariusz UI: backend sesja Express
   * Cel: weryfikacja ze cookie sesji (connect.sid) jest prawidlowo ustawione w przegladarce
   */
  test('[S10] Cookies zawieraja connect.sid po zaladowaniu storageState', async ({ page, context }) => {
    await page.goto(`${APP}/cars`);

    const cookies = await context.cookies();

    // Szukamy cookie sesji backendu
    const sessionCookie = cookies.find((c) => c.name === 'connect.sid');

    expect(sessionCookie, 'Cookie connect.sid powinno istniesc po zaladowaniu storageState').toBeDefined();
    expect(sessionCookie!.value).toBeTruthy();
    expect(sessionCookie!.httpOnly).toBe(true); // Bezpieczenstwo: httpOnly
  });

});
