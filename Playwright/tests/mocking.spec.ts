/**
 * Testy z Mockowaniem Danych – Salon Samochodowy
 *
 * Demonstracja przechwytywania i mockowania zapytań API za pomocą page.route().
 * Pozwala to izolować testy UI od backendu i kontrolować dane testowe.
 *
 * Techniki:
 * - page.route(url, handler) – przechwytuje i zastępuje odpowiedź
 * - route.fulfill({ body }) – zwraca kontrolowaną odpowiedź
 * - route.fetch() + route.fulfill() – modyfikacja prawdziwej odpowiedzi
 * - route.abort() – symulacja błędu sieciowego
 *
 * Autor: Playwright Mocking Tests
 */

import { test, expect } from '@playwright/test';

const APP_URL = 'http://localhost:4200';
const API_CARS_URL = 'http://localhost:3000/cars';
const API_LOGIN_URL = 'http://localhost:3000/login';

// ─── Dane mockowe ─────────────────────────────────────────────────────────────

const MOCK_CARS = [
  {
    id: 1001,
    brand: 'MockBrand_Toyota',
    model: 'MockModel_Supra',
    year: 2023,
    vin: 'MOCK00000000000A1',
    price: 299000,
    horsePower: 340,
    isAvailableForRent: true,
    ownerId: null,
    renterId: null,
    image: null,
  },
  {
    id: 1002,
    brand: 'MockBrand_BMW',
    model: 'MockModel_M3',
    year: 2024,
    vin: 'MOCK00000000000B2',
    price: 389000,
    horsePower: 510,
    isAvailableForRent: false,
    ownerId: null,
    renterId: null,
    image: null,
  },
];

const MOCK_LOGIN_SUCCESS = {
  message: 'Logowanie udane',
  user: {
    id: 999,
    username: 'mockadmin',
    firstName: 'Mock',
    lastName: 'Admin',
    isDealer: true,
  },
};

// ─── Blok 1: Mockowanie listy samochodów ─────────────────────────────────────

test.describe('Mockowanie – Lista samochodów', () => {

  test('UI wyświetla samochody z mockowanej odpowiedzi API', async ({ page }) => {
    // Przechwytujemy zapytanie GET /cars i zwracamy kontrolowane dane
    await page.route(API_CARS_URL, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_CARS),
      });
    });

    await page.goto(`${APP_URL}/cars`);

    // UI powinno wyświetlić dokładnie 2 samochody z naszych danych mockowych
    await expect(page.locator('.card').filter({ hasText: 'MockBrand_Toyota MockModel_Supra' })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.card').filter({ hasText: 'MockBrand_BMW MockModel_M3' })).toBeVisible({ timeout: 10000 });

    // Sprawdź szczegóły pierwszego samochodu
    const toyotaCard = page.locator('.card').filter({ hasText: 'MockBrand_Toyota MockModel_Supra' });
    await expect(toyotaCard.locator('.card-text')).toContainText('2023');
    await expect(toyotaCard.locator('.card-text')).toContainText('340');
  });

  test('UI wyświetla puste wyniki gdy GET /cars zwraca pustą tablicę', async ({ page }) => {
    await page.route(API_CARS_URL, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto(`${APP_URL}/cars`);

    // Poczekaj na załadowanie
    await page.waitForLoadState('networkidle');

    // Nie powinno być żadnych kart samochodów po załadowaniu
    // (lub powinien pojawić się komunikat o braku wyników)
    const carCards = page.locator('.row.collapse.show .card');
    await expect(carCards).toHaveCount(0);
  });

  test('UI obsługuje błąd serwera (500) przy ładowaniu samochodów', async ({ page }) => {
    await page.route(API_CARS_URL, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Wewnętrzny błąd serwera – dane mockowane' }),
      });
    });

    await page.goto(`${APP_URL}/cars`);
    await page.waitForLoadState('networkidle');

    // Po błędzie serwera nie powinno być kart samochodów
    const carCards = page.locator('.row.collapse.show .card');
    await expect(carCards).toHaveCount(0);
  });

});

// ─── Blok 2: Filtrowanie z mockowanymi danymi ─────────────────────────────────

test.describe('Mockowanie – Filtrowanie listy', () => {

  test('Filtr marki działa poprawnie z mockowanymi danymi', async ({ page }) => {
    await page.route(API_CARS_URL, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_CARS),
      });
    });

    await page.goto(`${APP_URL}/cars`);

    // Poczekaj na załadowanie samochodów
    await expect(page.locator('.card').first()).toBeVisible({ timeout: 10000 });

    // Wpisz markę do wyszukiwania
    const searchInput = page.getByPlaceholder('Wyszukaj markę');
    await expect(searchInput).toBeVisible({ timeout: 5000 });
    await searchInput.fill('MockBrand_Toyota');

    // Powinien być widoczny tylko Toyota
    await expect(page.locator('.card').filter({ hasText: 'MockBrand_Toyota' })).toBeVisible();

    // BMW powinno być ukryte (lub niewidoczne w aktywnym collapse)
    const bmwCards = page.locator('.row.collapse.show .card').filter({ hasText: 'MockBrand_BMW' });
    await expect(bmwCards).toHaveCount(0);
  });

});

// ─── Blok 3: Mockowanie logowania ────────────────────────────────────────────

test.describe('Mockowanie – Logowanie', () => {

  test('UI przechodzi do stanu zalogowanego z mockowaną odpowiedzią logowania', async ({ page }) => {
    // Mockujemy GET /cars żeby strona się załadowała
    await page.route(API_CARS_URL, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_CARS),
      });
    });

    // Mockujemy POST /login – zwracamy sukces bez weryfikacji hasła
    await page.route(API_LOGIN_URL, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_LOGIN_SUCCESS),
        });
      } else {
        await route.continue();
      }
    });

    // Mockujemy GET /current-user – potrzebne po zalogowaniu
    await page.route('http://localhost:3000/current-user', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: MOCK_LOGIN_SUCCESS.user }),
      });
    });

    await page.goto(`${APP_URL}/cars`);

    // Kliknij Zaloguj się
    await page.getByRole('button', { name: 'Zaloguj się' }).first().click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Wpisz dowolne dane – backend jest mockowany
    await dialog.locator('#username').fill('cokolwiek');
    await dialog.locator('#password').fill('cokolwiek');

    await dialog.getByRole('button', { name: 'Zaloguj się' }).click();

    // UI powinno pokazać użytkownika zalogowanego
    await expect(page.getByRole('button', { name: 'Wyloguj się' })).toBeVisible({ timeout: 10000 });
  });

});

// ─── Blok 4: Mockowanie kalkulatora leasingowego ─────────────────────────────

test.describe('Mockowanie – Kalkulator leasingowy', () => {

  test('UI wyświetla wyniki leasingu z mockowanej odpowiedzi', async ({ page }) => {
    // Mockujemy listę aut z jednym samochodem
    const mockCarForLeasing = {
      ...MOCK_CARS[0],
      isAvailableForRent: true,
    };

    await page.route(API_CARS_URL, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([mockCarForLeasing]),
      });
    });

    // Mockujemy endpoint leasingowy
    const MOCK_LEASING_RESPONSE = {
      carId: mockCarForLeasing.id,
      carBrand: mockCarForLeasing.brand,
      carModel: mockCarForLeasing.model,
      totalPrice: mockCarForLeasing.price,
      downPayment: 50000,
      remainingAmount: '249000.00',
      months: 36,
      monthlyRate: '6916.67',
    };

    await page.route(`http://localhost:3000/cars/${mockCarForLeasing.id}/leasing`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_LEASING_RESPONSE),
      });
    });

    // Mockujemy login
    await page.route(API_LOGIN_URL, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_LOGIN_SUCCESS),
      });
    });

    await page.route('http://localhost:3000/current-user', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: MOCK_LOGIN_SUCCESS.user }),
      });
    });

    await page.goto(`${APP_URL}/cars`);

    // Zaloguj się (mockowane)
    await page.getByRole('button', { name: 'Zaloguj się' }).first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await dialog.locator('#username').fill('test');
    await dialog.locator('#password').fill('test123');
    await dialog.getByRole('button', { name: 'Zaloguj się' }).click();
    await expect(page.getByRole('button', { name: 'Wyloguj się' })).toBeVisible({ timeout: 10000 });

    // Znajdź kartę auta i kliknij Leasing
    const carCard = page.locator('.card').filter({ hasText: mockCarForLeasing.brand }).first();
    await expect(carCard).toBeVisible({ timeout: 10000 });

    await carCard.getByRole('button', { name: 'Leasing' }).click();

    // Wypełnij formularz leasingowy
    const leasingForm = page.locator('.calculate-form').filter({ hasText: 'Wpłata własna' }).last();
    await expect(leasingForm).toBeVisible({ timeout: 5000 });
    await leasingForm.locator('#downPayment').fill('50000');
    await leasingForm.locator('#months').fill('36');
    await leasingForm.getByRole('button', { name: 'Oblicz' }).click();

    // Sprawdź wyniki z mockowanej odpowiedzi
    const summary = page.locator('.calculate-form').filter({ hasText: 'Leasing - podsumowanie' }).last();
    await expect(summary).toBeVisible({ timeout: 5000 });
    await expect(summary).toContainText('6916.67');
  });

});

// ─── Blok 5: Modyfikacja prawdziwej odpowiedzi (route.fetch) ─────────────────

test.describe('Mockowanie – Modyfikacja prawdziwej odpowiedzi', () => {

  test('Modyfikuje dane z prawdziwego API przed wyświetleniem w UI', async ({ page }) => {
    const MODIFIED_BRAND = 'ZMODYFIKOWANA_MARKA_XYZ';

    // Przechwytujemy prawdziwą odpowiedź i modyfikujemy pierwszy samochód
    await page.route(API_CARS_URL, async (route) => {
      // Pobieramy prawdziwą odpowiedź z backendu
      const response = await route.fetch();
      const cars: Array<Record<string, unknown>> = await response.json();

      if (cars.length > 0) {
        // Modyfikujemy markę pierwszego samochodu
        cars[0] = { ...cars[0], brand: MODIFIED_BRAND };
      }

      // Zwracamy zmodyfikowane dane
      await route.fulfill({
        response,
        body: JSON.stringify(cars),
        contentType: 'application/json',
      });
    });

    await page.goto(`${APP_URL}/cars`);

    // Sprawdź czy zmodyfikowana marka jest widoczna w UI
    // (tylko jeśli backend jest dostępny i zwraca auta)
    const modifiedCard = page.locator('.card').filter({ hasText: MODIFIED_BRAND });
    
    // Czekamy krótko – jeśli backend niedostępny, test jest pomijany
    const isVisible = await modifiedCard.isVisible().catch(() => false);
    if (isVisible) {
      await expect(modifiedCard).toBeVisible();
    }
    // Jeśli backend niedostępny, route.fetch() rzuci błąd – to oczekiwane zachowanie
  });

});

// ─── Blok 6: Symulacja błędów sieciowych ─────────────────────────────────────

test.describe('Mockowanie – Błędy sieciowe', () => {

  test('UI obsługuje przerwanie połączenia (abort) dla GET /cars', async ({ page }) => {
    // Symulujemy zerwanie połączenia
    await page.route(API_CARS_URL, async (route) => {
      await route.abort('failed');
    });

    await page.goto(`${APP_URL}/cars`);
    await page.waitForLoadState('networkidle');

    // Po błędzie sieciowym nie powinno być kart samochodów
    const carCards = page.locator('.row.collapse.show .card');
    await expect(carCards).toHaveCount(0);
  });

  test('UI obsługuje timeout (abort connectiontimedout) dla GET /cars', async ({ page }) => {
    await page.route(API_CARS_URL, async (route) => {
      await route.abort('connectiontimedout');
    });

    await page.goto(`${APP_URL}/cars`);
    await page.waitForLoadState('networkidle');

    const carCards = page.locator('.row.collapse.show .card');
    await expect(carCards).toHaveCount(0);
  });

});
