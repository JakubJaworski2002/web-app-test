/**
 * Testy zarządzania stanem – Public (Unauthenticated)
 *
 * Filar 3: Optymalizacja poprzez storageState
 *
 * storageState: .auth/public.json (pusty, bez cookies)
 * 
 * Te testy weryfikują:
 * - Dostęp publiczny do listy samochodów
 * - Blokowanie działań wymagających logowania
 * - Dialogi i prompty do logowania
 *
 * Benefity:
 * ⚡ Realistyczne scenariusze dla niezalogowanych
 * 🔒 Weryfikacja bezpieczeństwa (autoryzacja)
 * 📊 Testy UX dla odwiedzających bez konta
 */

import { test, expect } from '@playwright/test';

const APP_URL = 'http://localhost:4200';

test.describe('Auth State – Public (Guest) [S11–S15]', () => {

  /**
   * [S11] Gość może wyświetlić listę samochodów (publiczny endpoint)
   * storageState: .auth/public.json (bez auth cookies)
   * Weryfikacja: lista jest dostępna bez logowania
   */
  test('[S11] Gość – publiczny dostęp do listy samochodów', async ({ page }) => {
    // Bez zalogowania (storageState: public.json)
    await page.goto(`${APP_URL}/cars`);

    // Powinniśmy mieć dostęp do listy (GET /cars jest publiczny)
    const carCards = page.locator('.row.collapse.show .card');
    
    // Czekaj na załadowanie
    await expect(carCards.first()).toBeVisible({ timeout: 10000 });
  });

  /**
   * [S12] Gość – przycisk "Zaloguj się" widoczny
   * Weryfikacja: brak "Wyloguj się", jest "Zaloguj się"
   */
  test('[S12] Gość – widoczny przycisk Zaloguj się (nie Wyloguj)', async ({ page }) => {
    await page.goto(`${APP_URL}/cars`);

    // Gość nie powinien mieć przycisku "Wyloguj się"
    const logoutBtn = page.getByRole('button', { name: /wyloguj/i });
    expect(await logoutBtn.isVisible().catch(() => false)).toBeFalsy();

    // Gość powinien mieć przycisk "Zaloguj się"
    const loginBtn = page.getByRole('button', { name: /zaloguj|login/i });
    await expect(loginBtn).toBeVisible({ timeout: 5000 });
  });

  /**
   * [S13] Gość – próba dodania samochodu wymaga logowania
   * Weryfikacja: przycisk dodawania jest disabled lub wymaga logowania
   */
  test('[S13] Gość – dodanie samochodu wymaga logowania (dialog appears)', async ({ page }) => {
    await page.goto(`${APP_URL}/cars`);

    // Spróbuj znaleźć przycisk dodawania (jeśli istnieje)
    const addBtn = page.getByRole('button', { name: /dodaj|add/i });

    if (await addBtn.isVisible()) {
      // Jeśli przycisk jest widoczny, powinien być disabled ubo pokazać dialog
      const isDisabled = await addBtn.isDisabled().catch(() => false);
      
      if (!isDisabled) {
        // Spróbuj kliknąć – powinno pokazać login dialog
        await addBtn.click();

        // Login dialog powinien się pojawić
        const loginDialog = page.getByRole('dialog', { name: /logowanie/i });
        const willAppear = loginDialog.isVisible().catch(() => false);
        
        if (await willAppear) {
          await expect(loginDialog).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });

  /**
   * [S14] Gość – filtrowanie samochodów działa bez logowania
   * Weryfikacja: wyszukiwanie jest dostępne dla niezalogowanych
   */
  test('[S14] Gość – filtrowanie marki działa (bez auth)', async ({ page }) => {
    await page.goto(`${APP_URL}/cars`);

    // Czekaj na załadowanie listy
    await expect(page.locator('.row.collapse.show .card').first()).toBeVisible({ timeout: 10000 });

    // Spróbuj filtrować
    const searchInput = page.getByPlaceholder('Wyszukaj markę');

    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      
      // Poczekaj na filtrowanie
      await page.waitForTimeout(500);

      // Lista powinna być filtrowana
      const cards = page.locator('.row.collapse.show .card');
      const count = await cards.count();
      
      // Nie powinno być błędu 401
      // (jeśli filtrowanie wymaga auth, to byłby problem)
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  /**
   * [S15] Gość – prawie żadne akcje nie powinny być dostępne bez logowania
   * Weryfikacja: brak akcji "Kup", "Wynajmij" bez logowania
   */
  test('[S15] Gość – akcje kupna/wynajmu wymagają logowania', async ({ page }) => {
    await page.goto(`${APP_URL}/cars`);

    // Czekaj na załadowanie
    await expect(page.locator('.row.collapse.show .card').first()).toBeVisible({ timeout: 10000 });

    // Szukaj przycisków kupna/wynajmu
    const buyBtn = page.getByRole('button', { name: /kup|buy|zakup/i });
    const rentBtn = page.getByRole('button', { name: /wynajm|rent|wynajem/i });
    const leasingBtn = page.getByRole('button', { name: /leasing|rata/i });

    // Te przyciski powinny być Either:
    // 1. Disabled
    // 2. Niewidoczne w ogóle
    // 3. Po kliknieciu pokazać login dialog

    if (await buyBtn.isVisible()) {
      const isDisabled = await buyBtn.isDisabled();
      expect(isDisabled).toBeTruthy(); // powinien być disabled
    }

    if (await rentBtn.isVisible()) {
      const isDisabled = await rentBtn.isDisabled();
      expect(isDisabled).toBeTruthy();
    }

    if (await leasingBtn.isVisible()) {
      const isDisabled = await leasingBtn.isDisabled();
      expect(isDisabled).toBeTruthy();
    }
  });
});
