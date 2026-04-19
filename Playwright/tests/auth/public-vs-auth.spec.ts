/**
 * Testy StorageState – Porownanie publiczny vs zalogowany admin
 *
 * Playlista: S11-S13
 * Pokryte scenariusze UI: R5 (ochrona dostepu), R1 (publiczna lista aut)
 *
 * Technika: uzycie pustego storageState do symulacji niezalogowanego uzytkownika
 * Kontrast: publiczny widok vs widok z sesja admina
 */

import { test, expect } from '@playwright/test';
import type { Cookie, OriginState } from '@playwright/test';

const APP = 'http://localhost:4200';

// Pusty storageState = brak sesji = uzytkownik niezalogowany
const EMPTY_STORAGE: { cookies: Cookie[]; origins: OriginState[] } = { cookies: [], origins: [] };

test.describe('StorageState – Publiczny vs zalogowany admin', () => {

  /**
   * [S11] Publiczny kontekst nie widzi przyciskow dealera
   * Scenariusz UI: R5 – niezalogowany uzytkownik nie ma dostepu do akcji dealerskich
   * Cel: weryfikacja ze bez storageState UI wyswietla widok publiczny
   */
  test('[S11] Publiczny kontekst (bez storageState) nie widzi przyciskow dealera', async ({ browser }) => {
    const context = await browser.newContext({ storageState: EMPTY_STORAGE });
    const page = await context.newPage();

    await page.goto(`${APP}/cars`);
    await page.waitForLoadState('networkidle');

    // Bez sesji: przycisk logowania widoczny
    await expect(page.getByRole('button', { name: 'Zaloguj się' })).toBeVisible({ timeout: 8000 });

    // Bez sesji: przyciski dealera NIEWIDOCZNE
    await expect(page.getByRole('button', { name: 'Wyloguj się' })).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Dodaj Samochód' })).not.toBeVisible();
    await expect(page.locator('button[data-bs-target="#addCustomerModal"]')).not.toBeVisible();
    await expect(page.locator('button[data-bs-target="#customerListModal"]')).not.toBeVisible();

    await context.close();
  });

  /**
   * [S12] Publiczny kontekst widzi liste aut (GET /cars jest publiczne)
   * Scenariusz UI: R1 – lista aut dostepna publicznie bez logowania
   * Cel: weryfikacja ze publiczne endpointy dzialaja bez sesji
   */
  test('[S12] Publiczny kontekst widzi liste aut bez logowania (GET /cars publiczne)', async ({ browser }) => {
    const context = await browser.newContext({ storageState: EMPTY_STORAGE });
    const page = await context.newPage();

    await page.goto(`${APP}/cars`);
    await page.waitForLoadState('networkidle');

    // Strona powinna sie zaladowac bez bledow
    await expect(page).toHaveURL(/\/cars/);

    // Przycisk logowania widoczny (niezalogowany)
    await expect(page.getByRole('button', { name: 'Zaloguj się' })).toBeVisible({ timeout: 8000 });

    // Lista aut powinna sie zaladowac (backend GET /cars jest publiczny)
    await page.waitForTimeout(2000); // Daj czas na zaladowanie
    // Test sprawdza ze strona nie wyswietla bledu autoryzacji
    await expect(page.locator('body')).not.toContainText('401');
    await expect(page.locator('body')).not.toContainText('Unauthorized');

    await context.close();
  });

  /**
   * [S13] Kontrast: publiczny (bez storageState) vs admin (ze storageState)
   * Scenariusz UI: R5 – wyrazne rozroznienie uprawnien
   * Cel: demonstracja roznicy miedzy widokiem publicznym a panelem dealera
   * Uwaga: ten test pokazuje widok publiczny. Admin ZE storageState mialbys dostep do Dodaj Samochod.
   */
  test('[S13] Kontrast – publiczny widok nie ma panelu dealera (admin ze storageState mialbby)', async ({ browser }) => {
    // Ten test uzywa pustego stanu = widok publiczny
    const context = await browser.newContext({ storageState: EMPTY_STORAGE });
    const page = await context.newPage();

    await page.goto(`${APP}/cars`);
    await page.waitForLoadState('networkidle');

    // === WIDOK PUBLICZNY (ten test) ===
    // Brak przyciskow dealera
    const addCarButton = page.getByRole('button', { name: 'Dodaj Samochód' });
    const logoutButton = page.getByRole('button', { name: 'Wyloguj się' });

    await expect(addCarButton).not.toBeVisible();
    await expect(logoutButton).not.toBeVisible();

    // Przycisk Zaloguj sie widoczny
    await expect(page.getByRole('button', { name: 'Zaloguj się' })).toBeVisible({ timeout: 8000 });

    // Komentarz: Admin ze storageState (test.use({ storageState: ADMIN_AUTH_FILE }))
    // widzialby: Dodaj Samochód, Lista Klientow, Wyloguj się, Witaj, [imie]
    // Porownaj z testami S01-S06 w admin-storagestate.spec.ts

    await context.close();
  });

});
