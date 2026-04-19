/**
 * Testy Mockowania – Zaawansowane scenariusze
 *
 * Playlista: M14–M15
 * Pokryte scenariusze UI: R1+R5 (pełna sesja dealer), R14 (zmiana ceny auta)
 *
 * Technika: mockowanie wielu endpointów jednocześnie (pełna izolacja UI)
 * oraz weryfikacja wyświetlania zaktualizowanej ceny z mockowanej odpowiedzi.
 */

import { test, expect } from '@playwright/test';

const APP = 'http://localhost:4200';
const CARS_URL = 'http://localhost:3000/cars';
const LOGIN_URL = 'http://localhost:3000/login';
const CURRENT_USER_URL = 'http://localhost:3000/current-user';

const MOCK_CARS_FULL = [
  {
    id: 5001,
    brand: 'FullMockAlfa',
    model: 'Romeo',
    year: 2023,
    vin: 'FULLMOCK000000001',
    price: 150000,
    horsePower: 280,
    isAvailableForRent: true,
    ownerId: null,
    renterId: null,
    image: null,
  },
  {
    id: 5002,
    brand: 'FullMockFord',
    model: 'Mustang',
    year: 2024,
    vin: 'FULLMOCK000000002',
    price: 250000,
    horsePower: 450,
    isAvailableForRent: true,
    ownerId: null,
    renterId: null,
    image: null,
  },
];

const MOCK_DEALER = {
  message: 'Logowanie udane',
  user: { id: 999, username: 'fullmockdealer', firstName: 'Full', lastName: 'MockDealer', isDealer: true },
};

test.describe('Mockowanie – Zaawansowane scenariusze', () => {

  /**
   * [M14] Pełna izolacja UI – mockowanie GET /cars + POST /login + GET /current-user
   * Scenariusz UI: R1 (lista aut) + R5 (logowanie dealera)
   * Cel: całe środowisko UI działa w trybie mock – kompletna izolacja od backendu.
   * Przydatne gdy backend jest niedostępny lub niestabilny w środowisku CI/CD.
   */
  test('[M14] Pełna izolacja UI – mockowanie GET /cars + POST /login + GET /current-user', async ({ page }) => {
    // Mock 1: Lista samochodów
    await page.route(CARS_URL, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_CARS_FULL),
        });
      } else {
        await route.continue();
      }
    });

    // Mock 2: Logowanie (akceptuje dowolne dane)
    await page.route(LOGIN_URL, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_DEALER),
        });
      } else {
        await route.continue();
      }
    });

    // Mock 3: Aktualny użytkownik (zwraca dealera)
    await page.route(CURRENT_USER_URL, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: MOCK_DEALER.user }),
      });
    });

    await page.goto(`${APP}/cars`);

    // Sprawdź listę aut przed logowaniem
    await expect(page.locator('.card').filter({ hasText: 'FullMockAlfa Romeo' })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.card').filter({ hasText: 'FullMockFord Mustang' })).toBeVisible({ timeout: 5000 });

    // Zaloguj się (wszystkie dane akceptowane – backend zastąpiony)
    await page.getByRole('button', { name: 'Zaloguj się' }).first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await dialog.locator('#username').fill('dowolny');
    await dialog.locator('#password').fill('dowolne123');
    await dialog.getByRole('button', { name: 'Zaloguj się' }).click();

    // Weryfikacja stanu zalogowanego dealera
    await expect(page.getByRole('button', { name: 'Wyloguj się' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Witaj,/)).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: 'Dodaj Samochód' })).toBeVisible({ timeout: 5000 });

    // Obie karty nadal widoczne po logowaniu
    await expect(page.locator('.card').filter({ hasText: 'FullMockAlfa Romeo' })).toBeVisible();
    await expect(page.locator('.card').filter({ hasText: 'FullMockFord Mustang' })).toBeVisible();
  });

  /**
   * [M15] UI pokazuje zmienioną cenę z mockowanej odpowiedzi (250 000 zamiast 389 000)
   * Scenariusz UI: R14 – admin zmienia cenę auta, klient widzi zaktualizowaną cenę
   * Cel: weryfikacja że UI wyświetla cenę dokładnie z danych API bez transformacji
   */
  test('[M15] UI pokazuje cenę 250 000 zamiast 389 000 z mockowanej odpowiedzi', async ({ page }) => {
    const carWithUpdatedPrice = {
      id: 5003,
      brand: 'MockBMW',
      model: 'MockM3',
      year: 2024,
      vin: 'PRICEMOCK00000003',
      price: 250000, // cena zaktualizowana przez "admina" – była 389 000
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
          body: JSON.stringify([carWithUpdatedPrice]),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto(`${APP}/cars`);
    await page.waitForLoadState('networkidle');

    const card = page.locator('.card').filter({ hasText: 'MockBMW MockM3' });
    await expect(card).toBeVisible({ timeout: 10000 });

    // Nowa cena 250 000 powinna być widoczna w card-subtitle
    const subtitle = card.locator('.card-subtitle');
    await expect(subtitle).toContainText('250');

    // Stara cena 389 000 NIE powinna być widoczna
    const cardText = await card.textContent() ?? '';
    expect(cardText, 'Stara cena 389 000 nie powinna być widoczna w UI').not.toContain('389');
  });

});
