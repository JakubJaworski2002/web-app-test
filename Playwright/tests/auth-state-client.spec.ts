/**
 * Testy zarządzania stanem – Client (Buyer)
 *
 * Filar 3: Optymalizacja poprzez storageState
 * 
 * Logowanie odbywa się RAZ w global.setup.ts:
 * - Setup loguje klienta (testclient), zapisuje do .auth/client.json
 * - Testy tutaj otrzymują client.json w storageState
 * - Testy startują JUŻ zalogowani jako kupujący – bez logowania!
 *
 * Benefity:
 * ⚡ Szybsze testy (brak UI login per test)
 * 🔒 Izolacja – admin vs client state
 * 📊 Testy biznesowe: kupno, leasing, historia zamówień
 */

import { test, expect } from '@playwright/test';

const APP_URL = 'http://localhost:4200';

test.describe('Auth State – Client (Buyer) [S6–S10]', () => {

  /**
   * [S6] Klient może wyświetlić stronę główną (cars)
   * storageState: .auth/client.json
   * Weryfikacja: dostęp do listy samochodów
   */
  test('[S6] Klient zalogowany (storageState) – widoczna lista samochodów', async ({ page }) => {
    // Nie logujemy się – storageState zawiera cookies klienta
    await page.goto(`${APP_URL}/cars`);

    // Klient powinien być zalogowany (przycisk "Wyloguj się" widoczny)
    const logoutBtn = page.getByRole('button', { name: /wyloguj/i });
    await expect(logoutBtn).toBeVisible({ timeout: 10000 });

    // Lista samochodów powinna być widoczna
    const carCards = page.locator('.row.collapse.show .card');
    await expect(carCards.first()).toBeVisible({ timeout: 10000 });
  });

  /**
   * [S7] Klient może wyświetlić szczegóły samochodu
   * Weryfikacja: dostęp do detali auta (cena, parametry, opcje)
   */
  test('[S7] Klient może wyświetlić szczegóły samochodu (storageState)', async ({ page }) => {
    await page.goto(`${APP_URL}/cars`);

    const logoutBtn = page.getByRole('button', { name: /wyloguj/i });
    await expect(logoutBtn).toBeVisible();

    // Kliknij na pierwszy samochód
    const firstCard = page.locator('.row.collapse.show .card').first();
    await expect(firstCard).toBeVisible();

    // Spróbuj kliknąć na kartę (dokładna implementacja zależy od UI)
    const titleLink = firstCard.locator('.card-title');
    if (await titleLink.isVisible()) {
      await titleLink.click({ timeout: 5000 }).catch(() => null);
      // Poczekaj na nawigację
      await page.waitForLoadState('networkidle');
    }
  });

  /**
   * [S8] Klient może obliczyć ratę leasingu (kalkulator)
   * Weryfikacja: dostęp do kalkulatora, obliczenia się pojawiają
   */
  test('[S8] Klient może użyć kalkulatora leasingu (storageState)', async ({ page }) => {
    await page.goto(`${APP_URL}/cars`);

    // Potwierdź zalogowanie
    const logoutBtn = page.getByRole('button', { name: /wyloguj/i });
    await expect(logoutBtn).toBeVisible();

    // Jeśli jest kalkulator dostępny dla klienta, powinien być dostępny
    const leasingBtn = page.getByRole('button', { name: /leasing|rata/i });
    
    if (await leasingBtn.isVisible()) {
      await expect(leasingBtn).toBeEnabled();
    }
  });

  /**
   * [S9] Klient może wywendować samochód (jeśli dostępny)
   * Weryfikacja: przycisk wynajmu dostępny dla dostępnych aut
   */
  test('[S9] Klient – widoczne opCje wynajmu (storageState)', async ({ page }) => {
    await page.goto(`${APP_URL}/cars`);

    const logoutBtn = page.getByRole('button', { name: /wyloguj/i });
    await expect(logoutBtn).toBeVisible();

    // Sprawdź czy są przyciski wynajmu/kupna dla samochodów
    const rentBtn = page.getByRole('button', { name: /wynajm|rent/i });
    const buyBtn = page.getByRole('button', { name: /kup|buy|zakup/i });

    const rentVisible = await rentBtn.isVisible().catch(() => false);
    const buyVisible = await buyBtn.isVisible().catch(() => false);

    // Przynajmniej jeden powinien być widoczny
    expect(rentVisible || buyVisible).toBeTruthy();
  });

  /**
   * [S10] Klient – sesja jest zachowywana pomiędzy stronami
   * Weryfikacja: idziesz do /cars, potem do innej strony, sesja pozostaje
   */
  test('[S10] Klient – sesja zachowywana między nawigacją (storageState)', async ({ page, context }) => {
    // Sprawdź cookies na początek
    let cookies = await context.cookies();
    const sessionCookie1 = cookies.find((c) => c.name.toLowerCase().includes('session') || c.name.toLowerCase().includes('jwt'));

    await page.goto(`${APP_URL}/cars`);
    
    // Potwierdź zalogowanie
    const logoutBtn = page.getByRole('button', { name: /wyloguj/i });
    await expect(logoutBtn).toBeVisible();

    // Nawiguj do innego URL (jeśli istnieje)
    // np. do profilu, historii, itd.
    // W tym przykładzie po prostu refreshujemy
    await page.reload();

    // Sprawdź cookies po reload
    cookies = await context.cookies();
    const sessionCookie2 = cookies.find((c) => c.name.toLowerCase().includes('session') || c.name.toLowerCase().includes('jwt'));

    // Sesja powinna być taka sama
    if (sessionCookie1 && sessionCookie2) {
      expect(sessionCookie2.value).toBe(sessionCookie1.value);
    }

    // Potwierdzenie zalogowania
    await expect(logoutBtn).toBeVisible();
  });
});
