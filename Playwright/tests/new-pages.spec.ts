/**
 * Testy nowych stron – Dashboard, Historia transakcji, 404, Navbar
 *
 * Playlista: NP01–NP15
 * Pokryte scenariusze: dashboard dealera, historia transakcji, strona 404, linki nawigacji
 *
 * Techniki:
 *   - storageState: sesja admina z global.setup.ts (dealer/admin)
 *   - storageState pusty: anonimowy użytkownik (chromium-public)
 *   - page.route() + route.fulfill(): mockowanie odpowiedzi API niezależnie od backendu
 *
 * Warunek wstępny: projekt 'setup' musi być uruchomiony wcześniej (npx playwright test --project=setup)
 */

import { test, expect } from '@playwright/test';
import path from 'path';

const APP = 'http://localhost:4200';
const ADMIN_AUTH_FILE = path.join(__dirname, '../.auth/admin.json');

// ---------------------------------------------------------------------------
// GROUP 1: Dashboard (dealer only)
// ---------------------------------------------------------------------------

test.describe('Dashboard – Panel Dealera (zalogowany admin/dealer)', () => {
  // Wszystkie testy w tej grupie startują z sesją admina (dealer)
  test.use({ storageState: ADMIN_AUTH_FILE });

  /**
   * [NP01] Dealer może przejść na /dashboard i widzi nagłówek "Panel Dealera"
   * Scenariusz: chroniona trasa dealera ładuje się poprawnie dla zalogowanego dealera
   */
  test('[NP01] Dealer przechodzi na /dashboard i widzi "Panel Dealera"', async ({ page }) => {
    await page.goto(`${APP}/dashboard`);
    await page.waitForLoadState('networkidle');

    // Weryfikacja że adres nie zmienił się na inną trasę (brak przekierowania)
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText(/Panel Dealera/i)).toBeVisible({ timeout: 10000 });
  });

  /**
   * [NP02] Dashboard wyświetla 4 karty statystyk z wartościami numerycznymi
   * Scenariusz: strona dashboardu renderuje kompletny zestaw kart KPI
   */
  test('[NP02] Dashboard pokazuje 4 karty statystyk z wartościami numerycznymi', async ({ page }) => {
    await page.goto(`${APP}/dashboard`);
    await page.waitForLoadState('networkidle');

    // Oczekujemy co najmniej 4 kart ze statystykami (liczby lub wartości)
    const statCards = page.locator('.stat-card, .card.stat, [data-testid="stat-card"], .dashboard-card');
    await expect(statCards).toHaveCount(4, { timeout: 10000 });

    // Każda karta powinna zawierać jakąś wartość numeryczną
    for (let i = 0; i < 4; i++) {
      await expect(statCards.nth(i).locator('text=/\\d+/')).toBeVisible({ timeout: 5000 });
    }
  });

  /**
   * [NP03] Dashboard wyświetla kartę z wartością floty (fleet value)
   * Scenariusz: dealer widzi łączną wartość pojazdów w salonie
   */
  test('[NP03] Dashboard pokazuje kartę z wartością floty', async ({ page }) => {
    await page.goto(`${APP}/dashboard`);
    await page.waitForLoadState('networkidle');

    // Karta wartości floty – szukamy tekstu "wartość", "flota" lub "fleet"
    await expect(
      page.getByText(/wartość floty|wartość.*flot|fleet value/i)
    ).toBeVisible({ timeout: 10000 });
  });

  /**
   * [NP04] Szybki link "Lista samochodów" na dashboardzie nawiguje do /cars
   * Scenariusz: quick action link działa poprawnie
   */
  test('[NP04] Kliknięcie "Lista samochodów" na dashboardzie nawiguje do /cars', async ({ page }) => {
    await page.goto(`${APP}/dashboard`);
    await page.waitForLoadState('networkidle');

    // Znajdź link/przycisk "Lista samochodów" (quick action)
    const carsLink = page.getByRole('link', { name: /lista samochodów/i })
      .or(page.getByRole('button', { name: /lista samochodów/i }));
    await expect(carsLink).toBeVisible({ timeout: 10000 });
    await carsLink.click();

    await expect(page).toHaveURL(/\/cars/, { timeout: 10000 });
  });

  /**
   * [NP05] Użytkownik bez roli dealera (isDealer: false) jest przekierowany z /dashboard
   * Scenariusz: guard trasy odrzuca dostęp dla zwykłego zalogowanego użytkownika
   * Technika: page.route() mockuje GET /api/v1/auth/profile, zwracając isDealer: false
   */
  test('[NP05] Niezalogowany dealer (isDealer: false) jest przekierowany z /dashboard', async ({ page }) => {
    // Mockuj endpoint profilu użytkownika – zwróć użytkownika bez roli dealera
    await page.route('**/api/v1/auth/profile', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 99,
          username: 'regularuser',
          firstName: 'Jan',
          lastName: 'Kowalski',
          isDealer: false,
        }),
      });
    });

    await page.goto(`${APP}/dashboard`);
    await page.waitForLoadState('networkidle');

    // Użytkownik bez roli dealera powinien być przekierowany (nie widzi /dashboard)
    await expect(page).not.toHaveURL(/\/dashboard/, { timeout: 8000 });
  });
});

// ---------------------------------------------------------------------------
// GROUP 2: Transaction History
// ---------------------------------------------------------------------------

test.describe('Historia transakcji – /transactions', () => {

  /**
   * [NP06] Zalogowany użytkownik może przejść na /transactions i widzi nagłówek
   * Scenariusz: chroniona trasa transakcji ładuje się poprawnie dla zalogowanego użytkownika
   */
  test.describe('Zalogowany użytkownik', () => {
    test.use({ storageState: ADMIN_AUTH_FILE });

    test('[NP06] Zalogowany user widzi "Historia transakcji" na /transactions', async ({ page }) => {
      await page.goto(`${APP}/transactions`);
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveURL(/\/transactions/);
      await expect(page.getByText(/Historia transakcji/i)).toBeVisible({ timeout: 10000 });
    });
  });

  /**
   * [NP07] Niezalogowany użytkownik odwiedzający /transactions jest przekierowany
   * Scenariusz: guard trasy wymaga autentykacji
   * Projekt: chromium-public (brak storageState – anonimowy)
   */
  test.describe('Niezalogowany użytkownik (publiczny)', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('[NP07] Niezalogowany user odwiedzający /transactions jest przekierowany', async ({ page }) => {
      await page.goto(`${APP}/transactions`);
      await page.waitForLoadState('networkidle');

      // Niezalogowany użytkownik NIE powinien zobaczyć strony transakcji
      await expect(page).not.toHaveURL(/\/transactions/, { timeout: 8000 });
    });

    /**
     * [NP10] Nieznany URL /xyz-not-found wyświetla stronę 404 z tekstem "404"
     * Scenariusz: nieistniejące trasy są obsługiwane przez komponent 404
     */
    test('[NP10] Nieznany URL /xyz-not-found wyświetla stronę 404 z tekstem "404"', async ({ page }) => {
      await page.goto(`${APP}/xyz-not-found`);
      await page.waitForLoadState('networkidle');

      // Strona 404 powinna wyświetlać kod błędu "404"
      await expect(page.getByText(/404/)).toBeVisible({ timeout: 10000 });
    });

    /**
     * [NP11] Strona 404 zawiera link "Wróć do listy samochodów"
     * Scenariusz: strona 404 ma przycisk powrotu do głównego katalogu
     */
    test('[NP11] Strona 404 ma link "Wróć do listy samochodów"', async ({ page }) => {
      await page.goto(`${APP}/xyz-not-found`);
      await page.waitForLoadState('networkidle');

      const backLink = page.getByRole('link', { name: /Wróć do listy samochodów/i })
        .or(page.getByRole('button', { name: /Wróć do listy samochodów/i }))
        .or(page.getByText(/Wróć do listy samochodów/i));
      await expect(backLink).toBeVisible({ timeout: 10000 });
    });

    /**
     * [NP12] Kliknięcie linku powrotu na stronie 404 nawiguje do /cars
     * Scenariusz: użytkownik może wrócić do katalogu aut ze strony błędu
     */
    test('[NP12] Kliknięcie linku powrotu na stronie 404 nawiguje do /cars', async ({ page }) => {
      await page.goto(`${APP}/xyz-not-found`);
      await page.waitForLoadState('networkidle');

      const backLink = page.getByRole('link', { name: /Wróć do listy samochodów/i });
      await expect(backLink).toBeVisible({ timeout: 10000 });
      await backLink.click();

      await expect(page).toHaveURL(/\/cars/, { timeout: 10000 });
    });
  });

  /**
   * [NP08] page.route() mock – GET /api/v1/transactions zwraca 3 transakcje, tabela ma 3 wiersze
   * Scenariusz: UI poprawnie renderuje dane transakcji z API
   * Technika: mockowanie odpowiedzi API niezależnie od stanu bazy danych
   */
  test.describe('Mockowanie transakcji (zalogowany)', () => {
    test.use({ storageState: ADMIN_AUTH_FILE });

    test('[NP08] Mock 3 transakcji – tabela wyświetla 3 wiersze', async ({ page }) => {
      const MOCK_TRANSACTIONS = [
        { id: 1, carId: 101, userId: 1, type: 'purchase', amount: 150000, date: '2024-01-15T10:00:00Z' },
        { id: 2, carId: 102, userId: 1, type: 'rental',   amount:   5000, date: '2024-02-20T12:00:00Z' },
        { id: 3, carId: 103, userId: 1, type: 'purchase', amount: 220000, date: '2024-03-10T09:30:00Z' },
      ];

      // Zarejestruj mock PRZED page.goto(), żeby interceptor działał od pierwszego requesta
      await page.route('**/api/v1/transactions', async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(MOCK_TRANSACTIONS),
          });
        } else {
          await route.continue();
        }
      });

      await page.goto(`${APP}/transactions`);
      await page.waitForLoadState('networkidle');

      // Tabela powinna mieć dokładnie 3 wiersze danych (tbody tr)
      const rows = page.locator('table tbody tr');
      await expect(rows).toHaveCount(3, { timeout: 10000 });
    });

    /**
     * [NP09] page.route() mock – GET /api/v1/transactions zwraca pustą tablicę, widoczny empty-state
     * Scenariusz: UI obsługuje brak transakcji wyświetlając komunikat o pustej liście
     */
    test('[NP09] Mock pustej tablicy transakcji – widoczny komunikat empty-state', async ({ page }) => {
      // Mockuj endpoint transakcji z pustą odpowiedzią
      await page.route('**/api/v1/transactions', async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([]),
          });
        } else {
          await route.continue();
        }
      });

      await page.goto(`${APP}/transactions`);
      await page.waitForLoadState('networkidle');

      // Brak wierszy w tabeli i/lub widoczny komunikat o braku transakcji
      const rows = page.locator('table tbody tr');
      const emptyMessage = page.getByText(/brak transakcji|no transactions|brak danych|lista jest pusta/i);
      const isEmpty = await rows.count() === 0 || await emptyMessage.isVisible();
      expect(isEmpty).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// GROUP 3: 404 Page (remaining tests in separate describe for clarity)
// ---------------------------------------------------------------------------

// NP10, NP11, NP12 are located inside the 'Niezalogowany użytkownik (publiczny)' describe above
// to reuse the { storageState: { cookies: [], origins: [] } } setting.

// ---------------------------------------------------------------------------
// GROUP 4: Navbar integration
// ---------------------------------------------------------------------------

test.describe('Navbar – widoczność linków nawigacji', () => {

  /**
   * [NP13] Admin widzi link "Dashboard" w nawigacji
   * Scenariusz: menu nawigacji dealera zawiera skrót do panelu
   */
  test.describe('Zalogowany admin (dealer)', () => {
    test.use({ storageState: ADMIN_AUTH_FILE });

    test('[NP13] Admin widzi link "Dashboard" w navbar', async ({ page }) => {
      await page.goto(`${APP}/cars`);
      await page.waitForLoadState('networkidle');

      // Link "Dashboard" powinien być widoczny w nawigacji dla dealera
      const dashboardLink = page.getByRole('link', { name: /Dashboard/i })
        .or(page.locator('nav').getByText(/Dashboard/i));
      await expect(dashboardLink).toBeVisible({ timeout: 10000 });
    });

    /**
     * [NP14] Admin widzi link "Historia transakcji" w nawigacji
     * Scenariusz: menu nawigacji zalogowanego użytkownika zawiera link do transakcji
     */
    test('[NP14] Admin widzi link "Historia transakcji" w navbar', async ({ page }) => {
      await page.goto(`${APP}/cars`);
      await page.waitForLoadState('networkidle');

      // Link do historii transakcji powinien być widoczny dla zalogowanego użytkownika
      const transactionsLink = page.getByRole('link', { name: /Historia transakcji/i })
        .or(page.locator('nav').getByText(/Historia transakcji/i));
      await expect(transactionsLink).toBeVisible({ timeout: 10000 });
    });
  });

  /**
   * [NP15] Niezalogowany użytkownik NIE widzi linków "Dashboard" ani "Historia transakcji"
   * Scenariusz: nawigacja anonimowego użytkownika nie ujawnia chronionych sekcji
   * Projekt: chromium-public (brak storageState – anonimowy)
   */
  test.describe('Niezalogowany użytkownik (publiczny)', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('[NP15] Niezalogowany user NIE widzi "Dashboard" ani "Historia transakcji" w navbar', async ({ page }) => {
      await page.goto(`${APP}/cars`);
      await page.waitForLoadState('networkidle');

      // Anonimowy użytkownik NIE powinien widzieć chronionych linków w nawigacji
      await expect(page.locator('nav').getByText(/Dashboard/i)).not.toBeVisible({ timeout: 5000 });
      await expect(page.locator('nav').getByText(/Historia transakcji/i)).not.toBeVisible({ timeout: 5000 });
    });
  });

});
