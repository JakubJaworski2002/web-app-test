/**
 * Testy Mockowania – Transakcje (wynajem, leasing, dostępność)
 *
 * Playlista: M10–M13
 * Pokryte scenariusze UI:
 *   R3 (wynajem auta), R8/R11 (konflikt – zajęte auto), R2/R9 (leasing), R1 (optymalizacja)
 *
 * Technika: page.route() z kontrolowanymi danymi – izolacja logiki UI od backendu.
 * Testy weryfikują renderowanie przycisków i kalkulatora na podstawie pola isAvailableForRent.
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

const MOCK_CLIENT_USER = {
  user: { id: 888, username: 'mockclient', firstName: 'Klient', lastName: 'Mockowy', isDealer: false },
};

async function mockLoginAsClient(page: import('@playwright/test').Page) {
  await page.route(LOGIN_URL, async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_CLIENT_LOGIN),
      });
    } else {
      await route.continue();
    }
  });
  await page.route(CURRENT_USER_URL, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_CLIENT_USER),
    });
  });
}

async function performMockLogin(page: import('@playwright/test').Page) {
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
   * Scenariusz UI: R3 – klient widzi przycisk Wypożycz i może wynająć auto
   * Cel: weryfikacja że UI wyświetla przycisk Wypożycz i badge "Tak" tylko gdy isAvailableForRent = true
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
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([availableCar]),
        });
      } else {
        await route.continue();
      }
    });
    await mockLoginAsClient(page);

    await page.goto(`${APP}/cars`);
    await performMockLogin(page);

    const card = page.locator('.card').filter({ hasText: 'MockAvailable RentMe' });
    await expect(card).toBeVisible({ timeout: 10000 });

    // Badge "Tak" = dostępne do wynajmu
    await expect(card.locator('.badge')).toContainText('Tak');
    // Przycisk Wypożycz widoczny
    await expect(card.getByRole('button', { name: 'Wypożycz' })).toBeVisible();
  });

  /**
   * [M11] Przycisk Wypożycz ukryty dla auta niedostępnego (isAvailableForRent: false)
   * Scenariusz UI: R8/R11 – klient B widzi że auto jest zajęte przez klienta A
   * Cel: UI nie pokazuje przycisku Wypożycz dla zajętego auta (badge "Nie", klasa bg-danger)
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
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([rentedCar]),
        });
      } else {
        await route.continue();
      }
    });
    await mockLoginAsClient(page);

    await page.goto(`${APP}/cars`);
    await performMockLogin(page);

    const card = page.locator('.card').filter({ hasText: 'MockRented Occupied' });
    await expect(card).toBeVisible({ timeout: 10000 });

    // Badge "Nie" = niedostępne, klasa bg-danger
    await expect(card.locator('.badge')).toContainText('Nie');
    await expect(card.locator('.badge')).toHaveClass(/bg-danger/);
    // Przycisk Wypożycz NIE widoczny
    await expect(card.getByRole('button', { name: 'Wypożycz' })).toHaveCount(0);
  });

  /**
   * [M12] UI wyświetla wynik leasingu z mockowanej odpowiedzi POST /cars/:id/leasing
   * Scenariusz UI: R2 (kalkulator leasingowy), R9 (porównanie leasingów)
   * Cel: weryfikacja że UI poprawnie wyświetla mockowane wartości kalkulatora (rata: 2000.00 zł)
   */
  test('[M12] UI wyświetla wynik leasingu z mockowanej odpowiedzi (rata 2 000,00 zł)', async ({ page }) => {
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
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([leasingCar]),
        });
      } else {
        await route.continue();
      }
    });

    // Mock endpointu leasingowego – zwraca gotowy wynik bez obliczeń
    await page.route(`http://localhost:3000/cars/${leasingCar.id}/leasing`, async (route) => {
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
      } else {
        await route.continue();
      }
    });

    await mockLoginAsClient(page);
    await page.goto(`${APP}/cars`);
    await performMockLogin(page);

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
    // Sprawdź wartość raty z mockowanej odpowiedzi
    await expect(summary).toContainText('2000.00');
  });

  /**
   * [M13] GET /cars wywoływany dokładnie 1 raz przy załadowaniu strony
   * Scenariusz UI: R1 – optymalizacja żądań (Angular nie powinien fetchować listy wielokrotnie)
   * Cel: weryfikacja że nie ma zbędnych wywołań API przy inicjalizacji komponentu
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
            {
              id: 4001,
              brand: 'CountCar',
              model: 'OneCall',
              year: 2023,
              vin: 'COUNTCAR00000001A',
              price: 50000,
              horsePower: 150,
              isAvailableForRent: true,
              ownerId: null,
              renterId: null,
              image: null,
            },
          ]),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto(`${APP}/cars`);
    await page.waitForLoadState('networkidle');
    // Dodatkowe 500ms na ewentualne opóźnione zapytania
    await page.waitForTimeout(500);

    expect(getCallCount, `GET /cars powinien być wywołany 1 raz, wywołano: ${getCallCount}`).toBe(1);
  });

});
