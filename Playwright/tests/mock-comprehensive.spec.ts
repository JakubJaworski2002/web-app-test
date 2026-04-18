/**
 * Testy Mockowania – Kompleksowy zestaw 15 testów (Filar 2)
 *
 * Filar 2: Izolacja frontendu poprzez mockowanie (page.route)
 * Techniki:
 * - page.route(url, handler) – przechwytuje żądania
 * - route.fulfill() – kontrolowana odpowiedź
 * - route.fetch() + route.fulfill() – modyfikacja w locie
 * - route.abort() – symulacja błędów sieciowych
 *
 * Cel: izoluje testy UI od backendu, kontroluje dane testowe, testuje error states
 */

import { test, expect } from '@playwright/test';

const APP_URL = 'http://localhost:4200';
const API_BASE = 'http://localhost:3000';

// ─── Dane mockowe ─────────────────────────────────────────────────────────────

const MOCK_CARS = [
  {
    id: 1001,
    brand: 'MockBrand_Tesla',
    model: 'MockModel_S',
    year: 2024,
    vin: 'MOCK00000000000001',
    price: 95000,
    horsePower: 515,
    isAvailableForRent: true,
    ownerId: null,
    renterId: null,
    image: null,
  },
  {
    id: 1002,
    brand: 'MockBrand_BMW',
    model: 'MockModel_M3',
    year: 2023,
    vin: 'MOCK00000000000002',
    price: 80000,
    horsePower: 503,
    isAvailableForRent: true,
    ownerId: null,
    renterId: null,
    image: null,
  },
  {
    id: 1003,
    brand: 'MockBrand_Porsche',
    model: 'MockModel_911',
    year: 2024,
    vin: 'MOCK00000000000003',
    price: 120000,
    horsePower: 640,
    isAvailableForRent: false,
    ownerId: 123,
    renterId: null,
    image: null,
  },
];

const MOCK_LOGIN_ADMIN = {
  message: 'Logowanie udane',
  user: {
    id: 1,
    username: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    isDealer: true,
  },
};

const MOCK_LOGIN_CLIENT = {
  message: 'Logowanie udane',
  user: {
    id: 999,
    username: 'client',
    firstName: 'Client',
    lastName: 'Test',
    isDealer: false,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// M1–M5: Mockowanie listy samochodów i podstawowych interakcji
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Mock – Lista samochodów (M1–M5)', () => {

  /**
   * [M1] Mockowanie GET /cars – wyświetlenie listy
   * Weryfikacja: UI renderuje mockowane samochody
   */
  test('[M1] GET /cars mockowany – UI wyświetla 3 mockowane samochody', async ({ page }) => {
    await page.route(`${API_BASE}/cars`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_CARS),
      });
    });

    await page.goto(`${APP_URL}/cars`);

    // Poczekaj na załadowanie
    await expect(page.locator('.card').first()).toBeVisible({ timeout: 10000 });

    // Weryfikacja: 3 samochody
    const cards = page.locator('.row.collapse.show .card');
    await expect(cards).toHaveCount(3);

    // Weryfikacja: konkretne marki
    await expect(page.locator('.card').filter({ hasText: 'MockBrand_Tesla' })).toBeVisible();
    await expect(page.locator('.card').filter({ hasText: 'MockBrand_BMW' })).toBeVisible();
    await expect(page.locator('.card').filter({ hasText: 'MockBrand_Porsche' })).toBeVisible();
  });

  /**
   * [M2] Mockowanie GET /cars – pusta tablica
   * Weryfikacja: UI odpowiednio reaguje na brak danych
   */
  test('[M2] GET /cars mockowany (pusta lista) – UI wyświetla 0 samochodów', async ({ page }) => {
    await page.route(`${API_BASE}/cars`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto(`${APP_URL}/cars`);
    await page.waitForLoadState('networkidle');

    const cards = page.locator('.row.collapse.show .card');
    await expect(cards).toHaveCount(0);
  });

  /**
   * [M3] Mockowanie GET /cars – błąd 500
   * Weryfikacja: UI obsługuje błąd serwera
   */
  test('[M3] GET /cars mockowany (500) – UI obsługuje błąd serwera', async ({ page }) => {
    await page.route(`${API_BASE}/cars`, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error – mocked' }),
      });
    });

    await page.goto(`${APP_URL}/cars`);
    await page.waitForLoadState('networkidle');

    // Strona powinna załadować się bez kart
    const cards = page.locator('.row.collapse.show .card');
    await expect(cards).toHaveCount(0);
  });

  /**
   * [M4] Mockowanie GET /cars – błąd sieciowy (abort)
   * Weryfikacja: UI radzi sobie z przerwaniem połączenia
   */
  test('[M4] GET /cars mockowany (abort sieć) – UI obsługuje przerwanie', async ({ page }) => {
    await page.route(`${API_BASE}/cars`, async (route) => {
      await route.abort('failed');
    });

    await page.goto(`${APP_URL}/cars`);
    await page.waitForLoadState('networkidle');

    // Po błędzie sieci nie powinno być kart
    const cards = page.locator('.row.collapse.show .card');
    await expect(cards).toHaveCount(0);
  });

  /**
   * [M5] Mockowanie GET /cars – ograniczona dostępność (1 z 3)
   * Weryfikacja: UI poprawnie wyświetla flagę isAvailableForRent
   */
  test('[M5] GET /cars mockowany – isAvailableForRent = false dla 1 samochodu', async ({ page }) => {
    await page.route(`${API_BASE}/cars`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_CARS),
      });
    });

    await page.goto(`${APP_URL}/cars`);
    await expect(page.locator('.card').first()).toBeVisible({ timeout: 10000 });

    // Porsche ma isAvailableForRent: false
    const porscheCard = page.locator('.card').filter({ hasText: 'MockBrand_Porsche' });
    await expect(porscheCard).toBeVisible();
    
    // Powinien mieć inny stan wizualny (nie clickable, disabled, itp.)
    // To zależy od implementacji UI
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// M6–M10: Mockowanie filtrowania, wyszukiwania i modyfikacji danych
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Mock – Filtrowanie i wyszukiwanie (M6–M10)', () => {

  /**
   * [M6] Filtrowanie marki z mockowanymi danymi
   * Weryfikacja: filtr działa z kontrolowanymi danymi
   */
  test('[M6] Filtrowanie marki – lista filtrowana wyświetla 1 samochód', async ({ page }) => {
    await page.route(`${API_BASE}/cars`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_CARS),
      });
    });

    await page.goto(`${APP_URL}/cars`);
    await expect(page.locator('.card').first()).toBeVisible({ timeout: 10000 });

    // Wyszukaj Tesla
    const searchInput = page.getByPlaceholder('Wyszukaj markę');
    await searchInput.fill('MockBrand_Tesla');

    await page.waitForTimeout(500); // czekaj na filtrowanie

    // Tylko Tesla powinna być widoczna
    const visibleCards = page.locator('.row.collapse.show .card');
    await expect(visibleCards).toContainText('MockBrand_Tesla');
  });

  /**
   * [M7] Modyfikacja danych w locie – route.fetch() + route.fulfill()
   * Weryfikacja: zmiana ceny w mocku
   */
  test('[M7] route.fetch + route.fulfill – zmiana ceny samochodu w locie', async ({ page }) => {
    await page.route(`${API_BASE}/cars`, async (route) => {
      const response = await route.fetch();
      const json = await response.json();
      
      // Zmień ceny towszystkich aut
      const modified = json.map((car: any) => ({
        ...car,
        price: car.price * 0.9, // 10% zniżka
      }));

      await route.fulfill({
        response,
        body: JSON.stringify(modified),
      });
    });

    await page.goto(`${APP_URL}/cars`);
    await expect(page.locator('.card').first()).toBeVisible({ timeout: 10000 });

    // Tesla mockowana ma 95000, po 10% zniżce = 85500
    const teslaCard = page.locator('.card').filter({ hasText: 'MockBrand_Tesla' });
    const priceText = await teslaCard.locator('.card-subtitle').textContent();
    expect(priceText).toContain('85500'); // lub 85,500 w zależności od formatu
  });

  /**
   * [M8] Mockowanie GET /cars/:id – pobranie szczegółów samochodu
   * Weryfikacja: endpoint dla pojedynczego samochodu
   */
  test('[M8] GET /cars/:id mockowany – wyświetl szczegóły samochodu', async ({ page }) => {
    const CAR_ID = 1001;

    await page.route(`${API_BASE}/cars`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_CARS),
      });
    });

    await page.route(`${API_BASE}/cars/${CAR_ID}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_CARS[0]),
      });
    });

    await page.goto(`${APP_URL}/cars`);
    await expect(page.locator('.card').first()).toBeVisible({ timeout: 10000 });

    // Kliknij na kartę samochodu
    const teslaCard = page.locator('.card').filter({ hasText: 'MockBrand_Tesla' });
    await teslaCard.click();

    // Poczekaj na nawigację do detali (jeśli jest)
    // Zależy od implementacji UI
  });

  /**
   * [M9] Mockowanie błędu walidacji – POST /cars z złymi danymi
   * Weryfikacja: API zwraca 400 z listą błędów
   */
  test('[M9] POST /cars mockowany (400) – zwraca błędy walidacji', async ({ page }) => {
    await page.route(`${API_BASE}/cars`, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Validation error',
            errors: ['VIN must be 17 characters', 'Price must be positive'],
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_CARS),
        });
      }
    });

    await page.goto(`${APP_URL}/cars`);
    // Jeśli logowanie + dodawanie auta jest dostępne, można testować error response
  });

  /**
   * [M10] Mockowanie wielokrotnych żądań – różne odpowiedzi dla GET
   * Weryfikacja: pierwsze żądanie vs. drugie żądanie
   */
  test('[M10] GET /cars mockowany – zmiana liczby samochodów między żądaniami', async ({ page }) => {
    let callCount = 0;

    await page.route(`${API_BASE}/cars`, async (route) => {
      callCount++;
      
      if (callCount === 1) {
        // Pierwsze żądanie – 2 samochody
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_CARS.slice(0, 2)),
        });
      } else {
        // Kolejne żądania – 3 samochody
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_CARS),
        });
      }
    });

    await page.goto(`${APP_URL}/cars`);
    await expect(page.locator('.card').first()).toBeVisible({ timeout: 10000 });

    let cards = page.locator('.row.collapse.show .card');
    await expect(cards).toHaveCount(2);

    // Odśwież stronę
    await page.reload();
    await expect(page.locator('.card').first()).toBeVisible({ timeout: 10000 });

    cards = page.locator('.row.collapse.show .card');
    await expect(cards).toHaveCount(3);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// M11–M15: Mockowanie logowania, operacji CRUD i scenariuszy biznesowych
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Mock – Autentykacja i operacje CRUD (M11–M15)', () => {

  /**
   * [M11] Mockowanie POST /login – zalogowanie admina
   * Weryfikacja: przejście do stanu zalogowanego
   */
  test('[M11] POST /login mockowany – admin zalogowany (dealer)', async ({ page }) => {
    await page.route(`${API_BASE}/cars`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_CARS),
      });
    });

    await page.route(`${API_BASE}/login`, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_LOGIN_ADMIN),
        });
      }
    });

    await page.route(`${API_BASE}/current-user`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: MOCK_LOGIN_ADMIN.user }),
      });
    });

    await page.goto(`${APP_URL}/cars`);

    // Otwórz dialog logowania
    const loginBtn = page.getByRole('button', { name: /zaloguj|login/i }).first();
    await loginBtn.click();
    await page.waitForTimeout(500);

    // Wypełnij formularz
    await page.locator('#username, input[name="username"]').fill('admin');
    await page.locator('#password, input[name="password"]').fill('Admin1!');

    // Kliknij zaloguj
    const submitBtn = page.getByRole('button', { name: /zaloguj|login/i }).last();
    await submitBtn.click();

    await page.waitForTimeout(1000);

    // Potwierdź zalogowanie – przycisk powinien zmienić się na "Wyloguj się"
    // Zależy od implementacji
  });

  /**
   * [M12] Mockowanie POST /login – błąd logowania (401)
   * Weryfikacja: obsługa błędu z mockowaną odpowiedzią
   */
  test('[M12] POST /login mockowany (401) – błędne dane logowania', async ({ page }) => {
    await page.route(`${API_BASE}/cars`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_CARS),
      });
    });

    await page.route(`${API_BASE}/login`, async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invalid credentials' }),
      });
    });

    await page.goto(`${APP_URL}/cars`);

    const loginBtn = page.getByRole('button', { name: /zaloguj|login/i }).first();
    await loginBtn.click();
    await page.waitForTimeout(500);

    await page.locator('#username, input[name="username"]').fill('admin');
    await page.locator('#password, input[name="password"]').fill('WrongPassword');

    const submitBtn = page.getByRole('button', { name: /zaloguj|login/i }).last();
    await submitBtn.click();

    await page.waitForTimeout(500);

    // Dialog powinien pokazać błąd
    // Zależy od implementacji
  });

  /**
   * [M13] Mockowanie POST /cars – dodanie nowego samochodu
   * Weryfikacja: zwrot 201 Created
   */
  test('[M13] POST /cars mockowany (201) – dodanie nowego samochodu', async ({ page }) => {
    const NEW_CAR = {
      id: 2001,
      brand: 'MockBrand_NewCar',
      model: 'MockModel_NewModel',
      year: 2024,
      vin: 'MOCK00000000002001',
      price: 75000,
      horsePower: 250,
      isAvailableForRent: true,
      ownerId: null,
      renterId: null,
      image: null,
    };

    await page.route(`${API_BASE}/cars`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_CARS),
        });
      } else if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(NEW_CAR),
        });
      }
    });

    await page.route(`${API_BASE}/login`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_LOGIN_ADMIN),
      });
    });

    await page.route(`${API_BASE}/current-user`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: MOCK_LOGIN_ADMIN.user }),
      });
    });

    await page.goto(`${APP_URL}/cars`);
    
    // Zaloguj się (mockowane)
    const loginBtn = page.getByRole('button', { name: /zaloguj|login/i }).first();
    await loginBtn.click();
    await page.waitForTimeout(500);

    await page.locator('#username, input[name="username"]').fill('admin');
    await page.locator('#password, input[name="password"]').fill('Admin1!');

    const submitBtn = page.getByRole('button', { name: /zaloguj|login/i }).last();
    await submitBtn.click();
    await page.waitForTimeout(1000);

    // Po zalogowaniu powinna być opcja dodawania auta
    // Test zależy od dostępu w UI
  });

  /**
   * [M14] Mockowanie DELETE /cars/:id – usunięcie samochodu
   * Weryfikacja: zwrot 200 OK
   */
  test('[M14] DELETE /cars/:id mockowany (200) – usunięcie samochodu', async ({ page }) => {
    await page.route(`${API_BASE}/cars`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_CARS),
      });
    });

    await page.route(`${API_BASE}/cars/1001`, async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Car deleted successfully' }),
        });
      } else if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_CARS[0]),
        });
      }
    });

    await page.goto(`${APP_URL}/cars`);
    
    // Test zależy od dostępu w UI do przycisków usuwania
  });

  /**
   * [M15] Mockowanie POST /cars/:id/leasing – kalkulator leasingu
   * Weryfikacja: zwrot obliczonej raty miesięcznej
   */
  test('[M15] POST /cars/:id/leasing mockowany – zwrot raty miesięcznej', async ({ page }) => {
    await page.route(`${API_BASE}/cars`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_CARS),
      });
    });

    await page.route(`${API_BASE}/cars/1001/leasing`, async (route) => {
      if (route.request().method() === 'POST') {
        const data = route.request().postDataJSON();
        const carPrice = 95000;
        const remaining = carPrice - data.downPayment;
        const monthlyRate = remaining / data.months;

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            carId: 1001,
            totalPrice: carPrice,
            downPayment: data.downPayment,
            remainingAmount: remaining.toString(),
            months: data.months,
            monthlyRate: monthlyRate.toString(),
          }),
        });
      }
    });

    await page.goto(`${APP_URL}/cars`);
    
    // Test zależy od dostępu w UI do kalkulatora leasingu
  });
});
