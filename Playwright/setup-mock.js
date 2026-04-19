#!/usr/bin/env node
/**
 * Setup script: creates Playwright/tests/mock/ and writes all 4 mock test files.
 * Run once: node setup-mock.js
 * Or automatically via: npm run setup:mock
 */

const fs = require('fs');
const path = require('path');

const MOCK_DIR = path.join(__dirname, 'tests', 'mock');

fs.mkdirSync(MOCK_DIR, { recursive: true });
console.log('Created:', MOCK_DIR);

// ─── File 1: cars-list-mock.spec.ts ──────────────────────────────────────────

const carsListMock = `/**
 * Testy Mockowania – Lista samochodów (GET /cars)
 *
 * Playlista: M01–M05
 * Pokryte scenariusze UI: R1 (lista aut), R13 (filtrowanie)
 *
 * Technika: page.route() – przechwytywanie zapytań, route.fulfill() – kontrolowane odpowiedzi
 * Pozwala testować UI niezależnie od stanu backendu
 */

import { test, expect } from '@playwright/test';

const APP = 'http://localhost:4200';
const CARS_URL = 'http://localhost:3000/cars';

const MOCK_CARS = [
  {
    id: 2001,
    brand: 'MockToyota',
    model: 'MockSupra',
    year: 2023,
    vin: 'MOCK001AAAAAAAA01',
    price: 299000,
    horsePower: 340,
    isAvailableForRent: true,
    ownerId: null,
    renterId: null,
    image: null,
  },
  {
    id: 2002,
    brand: 'MockBMW',
    model: 'MockM3',
    year: 2024,
    vin: 'MOCK002BBBBBBBBB2',
    price: 389000,
    horsePower: 510,
    isAvailableForRent: false,
    ownerId: null,
    renterId: null,
    image: null,
  },
];

test.describe('Mockowanie – Lista samochodów', () => {

  /**
   * [M01] UI wyświetla samochody z mockowanej odpowiedzi GET /cars
   * Scenariusz UI: R1 – po dodaniu auta pojawia się na liście
   * Cel: weryfikacja że UI poprawnie renderuje dane z API (testujemy z kontrolowanymi danymi)
   */
  test('[M01] UI wyświetla samochody z mockowanej odpowiedzi GET /cars', async ({ page }) => {
    await page.route(CARS_URL, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_CARS),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto(\`\${APP}/cars\`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('.card').filter({ hasText: 'MockToyota MockSupra' })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.card').filter({ hasText: 'MockBMW MockM3' })).toBeVisible({ timeout: 10000 });

    const toyotaCard = page.locator('.card').filter({ hasText: 'MockToyota MockSupra' });
    await expect(toyotaCard.locator('.card-text')).toContainText('2023');
    await expect(toyotaCard.locator('.card-text')).toContainText('340');

    await expect(toyotaCard.locator('.badge')).toContainText('Tak');
    const bmwCard = page.locator('.card').filter({ hasText: 'MockBMW MockM3' });
    await expect(bmwCard.locator('.badge')).toContainText('Nie');
  });

  /**
   * [M02] UI nie pokazuje kart aut gdy GET /cars zwraca pustą tablicę
   * Scenariusz UI: R1 – stan pustej listy
   * Cel: UI powinno obsłużyć empty state bez błędów
   */
  test('[M02] UI nie pokazuje kart aut gdy GET /cars zwraca pustą tablicę', async ({ page }) => {
    await page.route(CARS_URL, async (route) => {
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

    await page.goto(\`\${APP}/cars\`);
    await page.waitForLoadState('networkidle');

    const visibleCards = page.locator('.row.collapse.show .card');
    await expect(visibleCards).toHaveCount(0);
  });

  /**
   * [M03] UI obsługuje błąd serwera 500 z GET /cars – brak kart
   * Scenariusz UI: R1 – obsługa błędu backendu w UI
   * Cel: aplikacja nie powinna się crashować przy statusie 500
   */
  test('[M03] UI obsługuje błąd serwera 500 z GET /cars – brak kart aut', async ({ page }) => {
    await page.route(CARS_URL, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Wewnętrzny błąd serwera – dane mockowane' }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto(\`\${APP}/cars\`);
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\\/cars/);
    const visibleCards = page.locator('.row.collapse.show .card');
    await expect(visibleCards).toHaveCount(0);
  });

  /**
   * [M04] UI obsługuje zerwanie połączenia sieciowego (abort) dla GET /cars
   * Scenariusz UI: R1 – obsługa błędu sieciowego
   * Cel: aplikacja nie crashuje gdy sieć jest niedostępna
   */
  test('[M04] UI obsługuje zerwanie połączenia sieciowego (abort) dla GET /cars – brak kart', async ({ page }) => {
    await page.route(CARS_URL, async (route) => {
      if (route.request().method() === 'GET') {
        await route.abort('failed');
      } else {
        await route.continue();
      }
    });

    await page.goto(\`\${APP}/cars\`);
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\\/cars/);
    const visibleCards = page.locator('.row.collapse.show .card');
    await expect(visibleCards).toHaveCount(0);
  });

  /**
   * [M05] Filtrowanie marki działa poprawnie z mockowaną listą aut
   * Scenariusz UI: R13 – filtrowanie po marce przed zakupem
   * Cel: logika filtrowania po stronie frontendu działa z kontrolowanymi danymi
   */
  test('[M05] Filtrowanie marki działa z mockowaną listą – Toyota widoczna, BMW ukryte', async ({ page }) => {
    await page.route(CARS_URL, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_CARS),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto(\`\${APP}/cars\`);

    await expect(page.locator('.card').filter({ hasText: 'MockToyota' })).toBeVisible({ timeout: 10000 });

    const searchInput = page.getByPlaceholder('Wyszukaj markę');
    await expect(searchInput).toBeVisible({ timeout: 5000 });
    await searchInput.fill('MockToyota');

    await expect(page.locator('.row.collapse.show .card').filter({ hasText: 'MockToyota' })).toBeVisible();
    await expect(page.locator('.row.collapse.show .card').filter({ hasText: 'MockBMW' })).toHaveCount(0);
  });

});
`;

// ─── File 2: auth-mock.spec.ts ────────────────────────────────────────────────

const authMock = `/**
 * Testy Mockowania – Autentykacja i autoryzacja
 *
 * Playlista: M06–M09
 * Pokryte scenariusze UI: R5 (logowanie/ochrona dostępu), R14 (modyfikacja odpowiedzi)
 *
 * Technika: page.route() do mockowania POST /login, GET /current-user
 * Pozwala testować zachowanie UI bez dostępu do backendu
 */

import { test, expect } from '@playwright/test';

const APP = 'http://localhost:4200';
const CARS_URL = 'http://localhost:3000/cars';
const LOGIN_URL = 'http://localhost:3000/login';
const CURRENT_USER_URL = 'http://localhost:3000/current-user';

const MOCK_CARS = [
  { id: 2001, brand: 'MockToyota', model: 'MockSupra', year: 2023, vin: 'MOCK001AAAAAAAA01', price: 299000, horsePower: 340, isAvailableForRent: true, ownerId: null, renterId: null, image: null },
  { id: 2002, brand: 'MockBMW', model: 'MockM3', year: 2024, vin: 'MOCK002BBBBBBBBB2', price: 389000, horsePower: 510, isAvailableForRent: false, ownerId: null, renterId: null, image: null },
];

const MOCK_DEALER_LOGIN = {
  message: 'Logowanie udane',
  user: { id: 777, username: 'mockdealer', firstName: 'Mock', lastName: 'Dealer', isDealer: true },
};

const MOCK_DEALER_USER = { user: { id: 777, username: 'mockdealer', firstName: 'Mock', lastName: 'Dealer', isDealer: true } };

const MOCK_LOGIN_FAIL = { error: 'Nieprawidłowa nazwa użytkownika lub hasło' };

async function mockBaseRoutes(page: import('@playwright/test').Page, loginResponse = { status: 200, data: MOCK_DEALER_LOGIN }) {
  await page.route(CARS_URL, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_CARS) });
    } else { await route.continue(); }
  });

  await page.route(LOGIN_URL, async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({ status: loginResponse.status, contentType: 'application/json', body: JSON.stringify(loginResponse.data) });
    } else { await route.continue(); }
  });

  await page.route(CURRENT_USER_URL, async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_DEALER_USER) });
  });
}

async function performLogin(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Zaloguj się' }).first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible({ timeout: 5000 });
  await dialog.locator('#username').fill('cokolwiek');
  await dialog.locator('#password').fill('cokolwiek123');
  await dialog.getByRole('button', { name: 'Zaloguj się' }).click();
}

test.describe('Mockowanie – Autentykacja', () => {

  /**
   * [M06] UI przechodzi do stanu zalogowanego z mockowaną odpowiedzią POST /login
   * Scenariusz UI: R5 – poprawne logowanie daje dostęp
   * Cel: weryfikacja przepływu logowania w UI bez realnego backendu
   */
  test('[M06] UI przechodzi do stanu zalogowanego z mockowaną odpowiedzią POST /login', async ({ page }) => {
    await mockBaseRoutes(page);
    await page.goto(\`\${APP}/cars\`);

    await performLogin(page);

    await expect(page.getByRole('button', { name: 'Wyloguj się' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Witaj,/)).toBeVisible({ timeout: 5000 });
  });

  /**
   * [M07] UI wyświetla błąd logowania przy mockowanym 400 z POST /login
   * Scenariusz UI: R5 – błędne logowanie zwraca komunikat błędu
   * Cel: UI reaguje na odpowiedź 400 wyświetlając komunikat błędu
   */
  test('[M07] UI wyświetla błąd logowania przy mockowanym 400 z POST /login', async ({ page }) => {
    await mockBaseRoutes(page, { status: 400, data: MOCK_LOGIN_FAIL });
    await page.goto(\`\${APP}/cars\`);

    await page.getByRole('button', { name: 'Zaloguj się' }).first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await dialog.locator('#username').fill('zlyuser');
    await dialog.locator('#password').fill('zlehaslo123');
    await dialog.getByRole('button', { name: 'Zaloguj się' }).click();

    await expect(page.getByRole('button', { name: 'Wyloguj się' })).not.toBeVisible();

    const dialogStillVisible = await dialog.isVisible().catch(() => false);
    expect(dialogStillVisible, 'Dialog powinien pozostać otwarty po błędzie logowania').toBe(true);
  });

  /**
   * [M08] Dealer widzi przyciski Dodaj Samochód i Lista Klientów po mockowanym logowaniu
   * Scenariusz UI: R5 – po zalogowaniu jako dealer, dostęp do panelu dealera
   * Cel: UI poprawnie wyświetla elementy dla roli dealera (isDealer: true)
   */
  test('[M08] Dealer widzi Dodaj Samochód i Lista Klientów po mockowanym logowaniu', async ({ page }) => {
    await mockBaseRoutes(page);
    await page.goto(\`\${APP}/cars\`);

    await performLogin(page);
    await expect(page.getByRole('button', { name: 'Wyloguj się' })).toBeVisible({ timeout: 10000 });

    await expect(page.getByRole('button', { name: 'Dodaj Samochód' })).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button[data-bs-target="#customerListModal"], button[data-bs-target="#addCustomerModal"]').first()).toBeVisible({ timeout: 5000 });
  });

  /**
   * [M09] route.fetch() modyfikuje markę pierwszego auta przed wyświetleniem w UI
   * Scenariusz UI: R14 – admin zmienia dane, klient widzi zaktualizowane dane
   * Cel: demonstracja route.fetch() – pobranie prawdziwej odpowiedzi i jej modyfikacja
   */
  test('[M09] route.fetch() zmienia markę pierwszego auta – UI wyświetla zmodyfikowane dane', async ({ page }) => {
    const INJECTED_BRAND = 'ZMODYFIKOWANA_MARKA_XYZ_789';

    await page.route(CARS_URL, async (route) => {
      if (route.request().method() === 'GET') {
        let cars: Array<Record<string, unknown>>;
        try {
          const response = await route.fetch();
          cars = await response.json() as Array<Record<string, unknown>>;
        } catch {
          cars = [...MOCK_CARS] as unknown as Array<Record<string, unknown>>;
        }

        if (cars.length > 0) {
          cars[0] = { ...cars[0], brand: INJECTED_BRAND };
        }

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(cars),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto(\`\${APP}/cars\`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('.card').filter({ hasText: INJECTED_BRAND })).toBeVisible({ timeout: 10000 });
  });

});
`;

// ─── File 3: transactions-mock.spec.ts ────────────────────────────────────────

const transactionsMock = `/**
 * Testy Mockowania – Transakcje (wynajem, zakup, leasing)
 *
 * Playlista: M10–M13
 * Pokryte scenariusze UI: R2 (leasing), R3 (wynajem), R8/R11 (konflikt), R13 (zliczanie)
 *
 * Technika: page.route() z kontrolowanymi danymi biznesowymi
 */

import { test, expect } from '@playwright/test';

const APP = 'http://localhost:4200';
const CARS_URL = 'http://localhost:3000/cars';
const LOGIN_URL = 'http://localhost:3000/login';
const CURRENT_USER_URL = 'http://localhost:3000/current-user';

const MOCK_CLIENT_LOGIN = {
  message: 'Logowanie udane',
  user: { id: 888, username: 'mockclient', firstName: 'Klient', lastName: 'Mockowy', isDealer: false },
};

const MOCK_CLIENT_USER = { user: { id: 888, username: 'mockclient', firstName: 'Klient', lastName: 'Mockowy', isDealer: false } };

async function mockLoginAsClient(page: import('@playwright/test').Page) {
  await page.route(LOGIN_URL, async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_CLIENT_LOGIN) });
    } else { await route.continue(); }
  });
  await page.route(CURRENT_USER_URL, async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_CLIENT_USER) });
  });
}

async function performLogin(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Zaloguj się' }).first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible({ timeout: 5000 });
  await dialog.locator('#username').fill('mockclient');
  await dialog.locator('#password').fill('haslo123');
  await dialog.getByRole('button', { name: 'Zaloguj się' }).click();
  await expect(page.getByRole('button', { name: 'Wyloguj się' })).toBeVisible({ timeout: 10000 });
}

test.describe('Mockowanie – Transakcje', () => {

  /**
   * [M10] Przycisk Wypożycz jest widoczny dla auta dostępnego (isAvailableForRent: true)
   * Scenariusz UI: R3 (klient wypożycza auto), R8 (walidacja dostępności)
   * Cel: UI wyświetla przycisk Wypożycz tylko dla dostępnych aut
   */
  test('[M10] Przycisk Wypożycz widoczny dla auta dostępnego (isAvailableForRent: true)', async ({ page }) => {
    const availableCar = {
      id: 3001,
      brand: 'MockAvailable',
      model: 'RentMe',
      year: 2023,
      vin: 'AVAIL00000000003A',
      price: 45000,
      horsePower: 160,
      isAvailableForRent: true,
      ownerId: null,
      renterId: null,
      image: null,
    };

    await page.route(CARS_URL, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([availableCar]) });
      } else { await route.continue(); }
    });
    await mockLoginAsClient(page);

    await page.goto(\`\${APP}/cars\`);
    await performLogin(page);

    const card = page.locator('.card').filter({ hasText: 'MockAvailable RentMe' });
    await expect(card).toBeVisible({ timeout: 10000 });

    await expect(card.locator('.badge')).toContainText('Tak');
    await expect(card.getByRole('button', { name: 'Wypożycz' })).toBeVisible();
  });

  /**
   * [M11] Przycisk Wypożycz ukryty dla auta niedostępnego (isAvailableForRent: false)
   * Scenariusz UI: R8 – klient B widzi że auto jest zajęte przez klienta A
   * Cel: UI nie pokazuje przycisku Wypożycz dla zajętego auta
   */
  test('[M11] Przycisk Wypożycz ukryty dla auta niedostępnego (isAvailableForRent: false)', async ({ page }) => {
    const rentedCar = {
      id: 3002,
      brand: 'MockRented',
      model: 'Occupied',
      year: 2022,
      vin: 'RENTED0000000003B',
      price: 38000,
      horsePower: 130,
      isAvailableForRent: false,
      ownerId: null,
      renterId: 1,
      image: null,
    };

    await page.route(CARS_URL, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([rentedCar]) });
      } else { await route.continue(); }
    });
    await mockLoginAsClient(page);

    await page.goto(\`\${APP}/cars\`);
    await performLogin(page);

    const card = page.locator('.card').filter({ hasText: 'MockRented Occupied' });
    await expect(card).toBeVisible({ timeout: 10000 });

    await expect(card.locator('.badge')).toContainText('Nie');
    await expect(card.locator('.badge')).toHaveClass(/bg-danger/);
    await expect(card.getByRole('button', { name: 'Wypożycz' })).toHaveCount(0);
  });

  /**
   * [M12] UI wyświetla wynik leasingu z mockowanej odpowiedzi POST /cars/:id/leasing
   * Scenariusz UI: R2 (kalkulator leasingowy), R9 (porównanie leasingów)
   * Cel: UI poprawnie wyświetla mockowane wartości kalkulatora bez backendu
   */
  test('[M12] UI wyświetla wynik leasingu z mockowanej odpowiedzi (rata 2000.00 zł)', async ({ page }) => {
    const leasingCar = {
      id: 3003,
      brand: 'MockLeasing',
      model: 'Finance',
      year: 2023,
      vin: 'LEASING000000003C',
      price: 120000,
      horsePower: 200,
      isAvailableForRent: true,
      ownerId: null,
      renterId: null,
      image: null,
    };

    await page.route(CARS_URL, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([leasingCar]) });
      } else { await route.continue(); }
    });

    await page.route(\`http://localhost:3000/cars/\${leasingCar.id}/leasing\`, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            carId: leasingCar.id,
            carBrand: leasingCar.brand,
            carModel: leasingCar.model,
            totalPrice: 120000,
            downPayment: 24000,
            remainingAmount: '96000.00',
            months: 48,
            monthlyRate: '2000.00',
          }),
        });
      } else { await route.continue(); }
    });

    await mockLoginAsClient(page);
    await page.goto(\`\${APP}/cars\`);
    await performLogin(page);

    const card = page.locator('.card').filter({ hasText: 'MockLeasing Finance' });
    await expect(card).toBeVisible({ timeout: 10000 });

    await card.getByRole('button', { name: 'Leasing' }).click();

    const leasingForm = page.locator('.calculate-form').filter({ hasText: 'Wpłata własna' }).last();
    await expect(leasingForm).toBeVisible({ timeout: 5000 });

    await leasingForm.locator('#downPayment').fill('24000');
    await leasingForm.locator('#months').fill('48');
    await leasingForm.getByRole('button', { name: 'Oblicz' }).click();

    const summary = page.locator('.calculate-form').filter({ hasText: 'Leasing - podsumowanie' }).last();
    await expect(summary).toBeVisible({ timeout: 5000 });
    await expect(summary).toContainText('2000.00');
  });

  /**
   * [M13] Zliczanie wywołań API – GET /cars wywoływany tylko raz przy wejściu na stronę
   * Scenariusz UI: R1 – optymalizacja: Angular nie powinien pobierać listy aut wielokrotnie
   * Cel: weryfikacja że nie ma zbędnych zapytań do backendu
   */
  test('[M13] GET /cars wywoływany dokładnie 1 raz przy załadowaniu strony', async ({ page }) => {
    let getCallCount = 0;

    await page.route(CARS_URL, async (route) => {
      if (route.request().method() === 'GET') {
        getCallCount++;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: 4001, brand: 'CountCar', model: 'One', year: 2023, vin: 'COUNTCAR000000001', price: 50000, horsePower: 150, isAvailableForRent: true, ownerId: null, renterId: null, image: null }
          ]),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto(\`\${APP}/cars\`);
    await page.waitForLoadState('networkidle');

    await page.waitForTimeout(500);

    expect(getCallCount, \`GET /cars powinien być wywołany 1 raz, wywołano: \${getCallCount}\`).toBe(1);
  });

});
`;

// ─── File 4: advanced-mock.spec.ts ────────────────────────────────────────────

const advancedMock = `/**
 * Testy Mockowania – Zaawansowane scenariusze
 *
 * Playlista: M14–M15
 * Pokryte scenariusze UI: R1+R5 (pełna sesja dealer), R14 (zmiana ceny)
 *
 * Technika: mockowanie wielu endpointów jednocześnie, modyfikacja ceny przez route
 */

import { test, expect } from '@playwright/test';

const APP = 'http://localhost:4200';
const CARS_URL = 'http://localhost:3000/cars';
const LOGIN_URL = 'http://localhost:3000/login';
const CURRENT_USER_URL = 'http://localhost:3000/current-user';

const MOCK_CARS_FULL = [
  { id: 5001, brand: 'FullMockAlfa', model: 'Romeo', year: 2023, vin: 'FULLMOCK000000001', price: 150000, horsePower: 280, isAvailableForRent: true, ownerId: null, renterId: null, image: null },
  { id: 5002, brand: 'FullMockFord', model: 'Mustang', year: 2024, vin: 'FULLMOCK000000002', price: 250000, horsePower: 450, isAvailableForRent: true, ownerId: null, renterId: null, image: null },
];

const MOCK_DEALER = {
  message: 'Logowanie udane',
  user: { id: 999, username: 'fullmockdealer', firstName: 'Full', lastName: 'MockDealer', isDealer: true },
};

test.describe('Mockowanie – Zaawansowane scenariusze', () => {

  /**
   * [M14] Mockowanie wielu endpointów naraz – pełna sesja dealera bez backendu
   * Scenariusz UI: R1 (lista aut) + R5 (logowanie dealera)
   * Cel: cała aplikacja działa w trybie mock – UI kompletnie odizolowane od backendu
   */
  test('[M14] Pełna izolacja UI – mockowanie GET /cars + POST /login + GET /current-user', async ({ page }) => {
    await page.route(CARS_URL, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_CARS_FULL) });
      } else { await route.continue(); }
    });

    await page.route(LOGIN_URL, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_DEALER) });
      } else { await route.continue(); }
    });

    await page.route(CURRENT_USER_URL, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: MOCK_DEALER.user }),
      });
    });

    await page.goto(\`\${APP}/cars\`);

    await expect(page.locator('.card').filter({ hasText: 'FullMockAlfa Romeo' })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.card').filter({ hasText: 'FullMockFord Mustang' })).toBeVisible({ timeout: 5000 });

    await page.getByRole('button', { name: 'Zaloguj się' }).first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await dialog.locator('#username').fill('dowolny');
    await dialog.locator('#password').fill('dowolne123');
    await dialog.getByRole('button', { name: 'Zaloguj się' }).click();

    await expect(page.getByRole('button', { name: 'Wyloguj się' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Witaj,/)).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: 'Dodaj Samochód' })).toBeVisible({ timeout: 5000 });

    await expect(page.locator('.card').filter({ hasText: 'FullMockAlfa Romeo' })).toBeVisible();
    await expect(page.locator('.card').filter({ hasText: 'FullMockFord Mustang' })).toBeVisible();
  });

  /**
   * [M15] Mockowanie ceny auta – UI wyświetla zmienioną cenę z mockowanej odpowiedzi
   * Scenariusz UI: R14 – admin zmienia cenę auta, klient widzi zaktualizowaną cenę
   * Cel: weryfikacja że UI wyświetla cenę dokładnie z danych API
   */
  test('[M15] Mockowanie ceny – UI pokazuje 250000 zamiast 389000 dla MockBMW MockM3', async ({ page }) => {
    const carWithChangedPrice = {
      id: 5003,
      brand: 'MockBMW',
      model: 'MockM3',
      year: 2024,
      vin: 'PRICEMOCK00000003',
      price: 250000,
      horsePower: 510,
      isAvailableForRent: true,
      ownerId: null,
      renterId: null,
      image: null,
    };

    await page.route(CARS_URL, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([carWithChangedPrice]),
        });
      } else { await route.continue(); }
    });

    await page.goto(\`\${APP}/cars\`);
    await page.waitForLoadState('networkidle');

    const card = page.locator('.card').filter({ hasText: 'MockBMW MockM3' });
    await expect(card).toBeVisible({ timeout: 10000 });

    const subtitle = card.locator('.card-subtitle');
    await expect(subtitle).toContainText('250');

    const cardText = await card.textContent() ?? '';
    expect(cardText, 'Stara cena 389000 nie powinna być widoczna').not.toContain('389');
  });

});
`;

// ─── Write all files ──────────────────────────────────────────────────────────

const files = [
  { name: 'cars-list-mock.spec.ts', content: carsListMock },
  { name: 'auth-mock.spec.ts', content: authMock },
  { name: 'transactions-mock.spec.ts', content: transactionsMock },
  { name: 'advanced-mock.spec.ts', content: advancedMock },
];

for (const { name, content } of files) {
  const filePath = path.join(MOCK_DIR, name);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Written:', filePath);
}

console.log('\nAll 4 mock test files created successfully in:', MOCK_DIR);
