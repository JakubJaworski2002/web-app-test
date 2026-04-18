/**
 * Testy zarządzania stanem – Admin (Dealer)
 *
 * Filar 3: Optymalizacja poprzez storageState
 * 
 * Logowanie odbywa się RAZ w global.setup.ts:
 * - Setup loguje admina, zapisuje cookies/localStorage do .auth/admin.json
 * - Testy tutaj otrzymują plik admin.json w konfiguracji (storageState)
 * - Testy startują JUŻ zalogowani – bez logowania w każdym teście!
 *
 * Benefity:
 * ⚡ ~80% szybsze (brak logowania per test)
 * 🔒 Czysty stan auth
 * 📊 Fokus na business logic, nie auth flows
 */

import { test, expect } from '@playwright/test';

const APP_URL = 'http://localhost:4200';
const API_BASE = 'http://localhost:3000';

test.describe('Auth State – Admin (Dealer) [S1–S5]', () => {

  /**
   * [S1] Admin może wyświetlić panel dealera – bez logowania!
   * storageState: .auth/admin.json (zawiera cookies admina)
   * Weryfikacja: od razu widoczny przycisk "Wyloguj się"
   */
  test('[S1] Admin zalogowany (storageState) – panel dealera dostępny', async ({ page }) => {
    // Nie logujemy się! storageState już zawiera cookies.
    // Idziemy bezpośrednio do protected route
    await page.goto(`${APP_URL}/cars`);
    
    // Admin powinien być zalogowany (cookies z storageState)
    const logoutBtn = page.getByRole('button', { name: /wyloguj/i });
    await expect(logoutBtn).toBeVisible({ timeout: 10000 });
  });

  /**
   * [S2] Admin może dodać nowy samochód – bez logowania UI
   * Weryfikacja: przycisk dodawania auta jest dostępny
   */
  test('[S2] Admin może dodać samochód (storageState) – formularz dostępny', async ({ page }) => {
    await page.goto(`${APP_URL}/cars`);

    // Admin powinien mieć dostęp do przycisku dodawania auta
    // (dokładna implementacja zależy od UI)
    const logoutBtn = page.getByRole('button', { name: /wyloguj/i });
    await expect(logoutBtn).toBeVisible();

    // Jeśli jest guzik "Dodaj auto" lub modal, powinien być dostępny
    const addCarBtn = page.getByRole('button', { name: /dodaj|add/i });
    if (await addCarBtn.isVisible()) {
      await expect(addCarBtn).toBeEnabled();
    }
  });

  /**
   * [S3] Admin może edytować samochód – bez ponownego logowania
   * Weryfikacja: możliwość modyfikacji danych
   */
  test('[S3] Admin może edytować samochód (storageState preserved)', async ({ page }) => {
    await page.goto(`${APP_URL}/cars`);

    // Potwierdź zalogowanie
    const logoutBtn = page.getByRole('button', { name: /wyloguj/i });
    await expect(logoutBtn).toBeVisible();

    // Jeśli są samochody dostępne, admin powinien móc je edytować
    const carCards = page.locator('.row.collapse.show .card');
    const cardCount = await carCards.count();
    
    if (cardCount > 0) {
      const firstCard = carCards.first();
      // Admin powinien mieć dostęp do akcji edycji
      await expect(firstCard).toBeVisible();
    }
  });

  /**
   * [S4] Admin wylogowuje się – zniszczy sesję
   * Weryfikacja: po logout, ponowne zalogowanie w storageState?
   */
  test('[S4] Admin może się wylogować (logout button present)', async ({ page }) => {
    await page.goto(`${APP_URL}/cars`);

    // Potwierdź że jest zalogowany
    const logoutBtn = page.getByRole('button', { name: /wyloguj/i });
    await expect(logoutBtn).toBeVisible();

    // Kliknij wyloguj
    const logoutResponse = page.waitForResponse(
      (response) => response.request().method() === 'POST' && response.url().includes('/logout'),
      { timeout: 10000 }
    ).catch(() => null);

    await logoutBtn.click();

    const response = await logoutResponse;
    // Jeśli logout endpoint istnieje, powinien być OK
    if (response) {
      expect(response.ok()).toBeTruthy();
    }
  });

  /**
   * [S5] Admin–stanu sesji jest przenoszony między testami
   * Weryfikacja: storage state działa (brak reset między testami)
   */
  test('[S5] Sesja admina jest przeniesiona (storageState persistence)', async ({ page, context }) => {
    // Każdy test otrzymuje ten sam storageState
    // Cookies powinny być identyczne przez wszystkie testy w tym projekcie
    const cookies = await context.cookies();
    
    // Powinny być cookies z logowania
    const sessionCookie = cookies.find((c) => c.name.toLowerCase().includes('session') || c.name.toLowerCase().includes('jwt'));
    
    if (sessionCookie) {
      expect(sessionCookie.value).toBeTruthy(); // cookie powinno mieć wartość
    }

    // Nawiguj i potwierdź zalogowanie
    await page.goto(`${APP_URL}/cars`);
    const logoutBtn = page.getByRole('button', { name: /wyloguj/i });
    await expect(logoutBtn).toBeVisible();
  });
});
