/**
 * Testy Mockowania – Lista samochodów (GET /cars)
 *
 * Playlista: M01–M05
 * Pokryte scenariusze UI: R1 (lista aut), R13 (filtrowanie)
 *
 * Technika: page.route() – przechwytywanie zapytań, route.fulfill() – kontrolowane odpowiedzi
 * Pozwala testować UI niezależnie od stanu backendu.
 * Wszystkie mocki rejestruje się PRZED page.goto(), żeby interceptor działał od pierwszego requesta.
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
   * Cel: weryfikacja że UI poprawnie renderuje dane z API (testujemy z kontrolowanymi danymi).
   * Mockowanie eliminuje zależność od aktualnej zawartości bazy danych.
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

    await page.goto(`${APP}/cars`);
    await page.waitForLoadState('networkidle');

    // Sprawdź oba samochody z mockowanych danych
    await expect(page.locator('.card').filter({ hasText: 'MockToyota MockSupra' })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.card').filter({ hasText: 'MockBMW MockM3' })).toBeVisible({ timeout: 10000 });

    // Sprawdź szczegóły Toyota
    const toyotaCard = page.locator('.card').filter({ hasText: 'MockToyota MockSupra' });
    await expect(toyotaCard.locator('.card-text')).toContainText('2023');
    await expect(toyotaCard.locator('.card-text')).toContainText('340');

    // Sprawdź dostępność: Toyota dostępna (Tak), BMW niedostępne (Nie)
    await expect(toyotaCard.locator('.badge')).toContainText('Tak');
    const bmwCard = page.locator('.card').filter({ hasText: 'MockBMW MockM3' });
    await expect(bmwCard.locator('.badge')).toContainText('Nie');
  });

  /**
   * [M02] UI nie pokazuje kart aut gdy GET /cars zwraca pustą tablicę
   * Scenariusz UI: R1 – stan pustej listy (np. brak aut w katalogu)
   * Cel: aplikacja powinna obsłużyć empty state bez błędów JS
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

    await page.goto(`${APP}/cars`);
    await page.waitForLoadState('networkidle');

    const visibleCards = page.locator('.row.collapse.show .card');
    await expect(visibleCards).toHaveCount(0);
  });

  /**
   * [M03] UI obsługuje błąd serwera 500 z GET /cars – brak kart
   * Scenariusz UI: R1 – obsługa błędu backendu
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

    await page.goto(`${APP}/cars`);
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/cars/);
    const visibleCards = page.locator('.row.collapse.show .card');
    await expect(visibleCards).toHaveCount(0);
  });

  /**
   * [M04] UI obsługuje zerwanie połączenia sieciowego (abort) dla GET /cars
   * Scenariusz UI: R1 – obsługa błędu sieciowego (brak internetu, serwer niedostępny)
   * Cel: aplikacja nie crashuje gdy sieć jest niedostępna
   */
  test('[M04] UI obsługuje zerwanie połączenia sieciowego – brak kart aut', async ({ page }) => {
    await page.route(CARS_URL, async (route) => {
      if (route.request().method() === 'GET') {
        await route.abort('failed');
      } else {
        await route.continue();
      }
    });

    await page.goto(`${APP}/cars`);
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/cars/);
    const visibleCards = page.locator('.row.collapse.show .card');
    await expect(visibleCards).toHaveCount(0);
  });

  /**
   * [M05] Filtrowanie marki działa poprawnie z mockowaną listą aut
   * Scenariusz UI: R13 – filtrowanie po marce przed zakupem
   * Cel: logika filtrowania po stronie frontendu (Angular) działa z kontrolowanymi danymi
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

    await page.goto(`${APP}/cars`);
    await expect(page.locator('.card').filter({ hasText: 'MockToyota' })).toBeVisible({ timeout: 10000 });

    const searchInput = page.getByPlaceholder('Wyszukaj markę');
    await expect(searchInput).toBeVisible({ timeout: 5000 });
    await searchInput.fill('MockToyota');

    await expect(page.locator('.row.collapse.show .card').filter({ hasText: 'MockToyota' })).toBeVisible();
    await expect(page.locator('.row.collapse.show .card').filter({ hasText: 'MockBMW' })).toHaveCount(0);
  });

});
