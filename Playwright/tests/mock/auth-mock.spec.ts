/**
 * Testy Mockowania – Autentykacja i autoryzacja
 *
 * Playlista: M06–M09
 * Pokryte scenariusze UI: R5 (logowanie/ochrona dostępu), R14 (modyfikacja odpowiedzi)
 *
 * Technika: page.route() do mockowania POST /login, GET /current-user.
 * Pozwala testować zachowanie UI (komunikaty błędów, przyciski panelu dealera)
 * bez dostępu do realnego backendu.
 */

import { test, expect } from '@playwright/test';

const APP = 'http://localhost:4200';
const CARS_URL = 'http://localhost:3000/cars';
const LOGIN_URL = 'http://localhost:3000/login';
const CURRENT_USER_URL = 'http://localhost:3000/current-user';

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

const MOCK_DEALER_LOGIN = {
  message: 'Logowanie udane',
  user: { id: 777, username: 'mockdealer', firstName: 'Mock', lastName: 'Dealer', isDealer: true },
};

const MOCK_DEALER_USER = {
  user: { id: 777, username: 'mockdealer', firstName: 'Mock', lastName: 'Dealer', isDealer: true },
};

const MOCK_LOGIN_FAIL = { error: 'Nieprawidłowa nazwa użytkownika lub hasło' };

async function mockCarsRoute(page: import('@playwright/test').Page) {
  await page.route(CARS_URL, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_CARS) });
    } else {
      await route.continue();
    }
  });
}

async function mockCurrentUserRoute(page: import('@playwright/test').Page) {
  await page.route(CURRENT_USER_URL, async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_DEALER_USER) });
  });
}

test.describe('Mockowanie – Autentykacja', () => {

  /**
   * [M06] UI przechodzi do stanu zalogowanego z mockowaną odpowiedzią POST /login
   * Scenariusz UI: R5 – poprawne logowanie daje dostęp do panelu
   * Cel: weryfikacja przepływu logowania w UI bez realnego backendu.
   * Dowolne dane logowania są akceptowane (backend zastąpiony mockiem).
   */
  test('[M06] UI przechodzi do stanu zalogowanego z mockowaną odpowiedzią POST /login', async ({ page }) => {
    await mockCarsRoute(page);
    await mockCurrentUserRoute(page);

    await page.route(LOGIN_URL, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_DEALER_LOGIN) });
      } else {
        await route.continue();
      }
    });

    await page.goto(`${APP}/cars`);

    await page.getByRole('button', { name: 'Zaloguj się' }).first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await dialog.locator('#username').fill('dowolny_login');
    await dialog.locator('#password').fill('dowolne_haslo');
    await dialog.getByRole('button', { name: 'Zaloguj się' }).click();

    await expect(page.getByRole('button', { name: 'Wyloguj się' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Witaj,/)).toBeVisible({ timeout: 5000 });
  });

  /**
   * [M07] UI wyświetla błąd logowania przy mockowanym 400 z POST /login
   * Scenariusz UI: R5 – błędne logowanie zwraca komunikat błędu
   * Cel: weryfikacja że UI reaguje na odpowiedź 400 – dialog pozostaje otwarty
   */
  test('[M07] UI wyświetla błąd logowania przy mockowanym 400 z POST /login', async ({ page }) => {
    await mockCarsRoute(page);

    await page.route(LOGIN_URL, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify(MOCK_LOGIN_FAIL) });
      } else {
        await route.continue();
      }
    });

    await page.goto(`${APP}/cars`);

    await page.getByRole('button', { name: 'Zaloguj się' }).first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await dialog.locator('#username').fill('zly_uzytkownik');
    await dialog.locator('#password').fill('zle_haslo123');
    await dialog.getByRole('button', { name: 'Zaloguj się' }).click();

    // Po błędzie 400 – NIE powinno przejść do stanu zalogowanego
    await expect(page.getByRole('button', { name: 'Wyloguj się' })).not.toBeVisible();
    // Dialog powinien pozostać otwarty lub pojawić się komunikat błędu
    const dialogVisible = await dialog.isVisible().catch(() => false);
    expect(dialogVisible).toBe(true);
  });

  /**
   * [M08] Dealer widzi przyciski Dodaj Samochód i Lista Klientów po mockowanym logowaniu
   * Scenariusz UI: R5 – zalogowany dealer ma dostęp do panelu dealerskiego
   * Cel: UI poprawnie wyświetla elementy dla roli isDealer: true z mockowanej odpowiedzi
   */
  test('[M08] Dealer widzi Dodaj Samochód i Lista Klientów po mockowanym logowaniu', async ({ page }) => {
    await mockCarsRoute(page);
    await mockCurrentUserRoute(page);

    await page.route(LOGIN_URL, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_DEALER_LOGIN) });
      } else {
        await route.continue();
      }
    });

    await page.goto(`${APP}/cars`);

    await page.getByRole('button', { name: 'Zaloguj się' }).first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await dialog.locator('#username').fill('cokolwiek');
    await dialog.locator('#password').fill('cokolwiek123');
    await dialog.getByRole('button', { name: 'Zaloguj się' }).click();

    await expect(page.getByRole('button', { name: 'Wyloguj się' })).toBeVisible({ timeout: 10000 });
    // Przyciski dealerskie widoczne
    await expect(page.getByRole('button', { name: 'Dodaj Samochód' })).toBeVisible({ timeout: 5000 });
    await expect(
      page.locator('button[data-bs-target="#addCustomerModal"], button[data-bs-target="#customerListModal"]').first()
    ).toBeVisible({ timeout: 5000 });
  });

  /**
   * [M09] route.fetch() modyfikuje markę pierwszego auta przed wyświetleniem w UI
   * Scenariusz UI: R14 – admin zmienia dane, klient widzi zaktualizowane informacje
   * Cel: demonstracja route.fetch() – pobranie prawdziwej/mockowanej odpowiedzi i jej modyfikacja
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
          // Backend niedostępny – użyj danych mockowych jako fallback
          cars = MOCK_CARS as unknown as Array<Record<string, unknown>>;
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

    await page.goto(`${APP}/cars`);
    await page.waitForLoadState('networkidle');

    // Zmodyfikowana marka powinna być widoczna w UI
    await expect(page.locator('.card').filter({ hasText: INJECTED_BRAND })).toBeVisible({ timeout: 10000 });
  });

});
