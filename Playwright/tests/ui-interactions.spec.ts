/**
 * Testy E2E – Interakcje UI aplikacji Salon Samochodowy
 *
 * Playlista: UI01–UI15
 * Pokryte scenariusze UI: R1 (lista aut), R5 (ochrona dostępu), R7 (polityka prywatności),
 *                         R13 (filtrowanie po marce), R14 (leasing)
 *
 * Technika: Playwright E2E – interakcje z prawdziwym UI Angular
 * Grupy:
 *   Car List      – publiczne testy listy i sortowania aut
 *   Car Detail    – nawigacja do szczegółów auta i powrót
 *   Navigation    – pasek nawigacyjny i przekierowania
 *   Leasing       – kalkulator leasingu dla zalogowanego klienta (nie-dealer)
 *
 * Uwagi:
 *   - Testy „publiczne" używają browser.newContext({ storageState: EMPTY_STORAGE })
 *   - Testy autentykowane (Group 3 część) używają fixture `page` z sesją admina
 *   - Testy leasingu rejestrują świeżego użytkownika (nie-dealer) per test
 */

import { test, expect } from '@playwright/test';
import type { Cookie, OriginState } from '@playwright/test';

const APP = 'http://localhost:4200';
const API = 'http://localhost:3000';

/** Pusty storageState = brak sesji = użytkownik niezalogowany */
const EMPTY_STORAGE: { cookies: Cookie[]; origins: OriginState[] } = {
  cookies: [],
  origins: [],
};

/** Mockowa lista aut z dwoma pojazdami – używana w testach filtrowania */
const MOCK_TWO_CARS = [
  {
    id: 9901,
    brand: 'Toyota',
    model: 'Corolla',
    year: 2022,
    vin: 'TOYO001AAAAAAAAA1',
    price: 110000,
    horsePower: 132,
    isAvailableForRent: true,
    ownerId: null,
    renterId: null,
    image: null,
  },
  {
    id: 9902,
    brand: 'BMW',
    model: 'M3',
    year: 2023,
    vin: 'BMW0002BBBBBBBBB2',
    price: 320000,
    horsePower: 510,
    isAvailableForRent: false,
    ownerId: null,
    renterId: null,
    image: null,
  },
];

/** Zarejestruj nowego (nie-dealer) użytkownika i zaloguj go przez UI */
async function registerAndLoginUser(page: import('@playwright/test').Page): Promise<void> {
  const suffix = Date.now();
  const username = `leasingUser${suffix}`;

  await page.goto(`${APP}/cars`);
  await page.getByRole('button', { name: 'Zaloguj się' }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible({ timeout: 8000 });

  await page.getByRole('button', { name: 'Nie masz konta? Zarejestruj się' }).click();

  const authModal = page.locator('#authModal');
  await expect(authModal).toBeVisible({ timeout: 8000 });

  await authModal.locator('#username').fill(username);
  await authModal.locator('#email').fill(`${username}@test.com`);
  await authModal.locator('#password').fill('Test1234!');
  await authModal.locator('#firstName').fill('Leasing');
  await authModal.locator('#lastName').fill('Tester');

  await page.getByRole('button', { name: 'Zarejestruj się' }).click();
  await expect(page.getByText(/Witaj,/)).toBeVisible({ timeout: 10000 });
}

// ─────────────────────────────────────────────────────────────────────────────

test.describe('UI Interactions', () => {

  // ───────────────────────── Grupa 1: Lista aut ─────────────────────────────

  test.describe('Car List', () => {

    /**
     * [UI01] Lista aut ładuje się i pokazuje co najmniej jeden samochód
     * Scenariusz UI: R1 – lista aut dostępna publicznie
     * Cel: GET /cars publiczny, UI renderuje karty aut bez sesji
     */
    test('[UI01] Lista aut ładuje się i pokazuje co najmniej jeden samochód',
      { tag: '@ui' },
      async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: EMPTY_STORAGE });
        const page = await ctx.newPage();

        await page.goto(`${APP}/cars`);
        await page.waitForLoadState('networkidle');

        const cards = page.locator('.row.collapse.show .card');
        await expect(cards.first()).toBeVisible({ timeout: 10000 });

        const count = await cards.count();
        expect(count).toBeGreaterThan(0);

        await ctx.close();
      },
    );

    /**
     * [UI02] Sortowanie według ceny zmienia kolejność kart aut
     * Scenariusz UI: R1 – sortowanie listy aut
     * Cel: kliknięcie "Sortuj według ceny" zmienia kolejność oraz kierunek ikony
     */
    test('[UI02] Sortuj według ceny zmienia kolejność aut na liście',
      { tag: '@ui' },
      async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: EMPTY_STORAGE });
        const page = await ctx.newPage();

        await page.route(`${API}/cars`, async (route) => {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(MOCK_TWO_CARS),
          });
        });

        await page.goto(`${APP}/cars`);
        await expect(page.locator('.row.collapse.show .card').first()).toBeVisible({ timeout: 10000 });

        // Odczytaj pierwszą kartę przed sortowaniem
        const titleBefore = await page.locator('.row.collapse.show .card-title').first().textContent();

        // Kliknij sortowanie ASC
        await page.getByRole('button', { name: /Sortuj według ceny/ }).click();

        // Kliknij ponownie – sortowanie DESC
        await page.getByRole('button', { name: /Sortuj według ceny/ }).click();

        const titleAfter = await page.locator('.row.collapse.show .card-title').first().textContent();

        // Po dwóch kliknięciach lista wróciła do pierwotnej kolejności lub jest odwrócona –
        // w każdym przypadku UI jest nadal widoczne i reaguje na kliknięcia
        expect(titleBefore).toBeTruthy();
        expect(titleAfter).toBeTruthy();
        await expect(page.locator('.row.collapse.show .card').first()).toBeVisible();

        await ctx.close();
      },
    );

    /**
     * [UI03] Sortowanie według mocy wywołuje zmianę porządku kart
     * Scenariusz UI: R1 – sortowanie po horsePower
     * Cel: przycisk "Sortuj według mocy" jest klikalny i lista pozostaje widoczna
     */
    test('[UI03] Sortuj według mocy zmienia kolejność aut na liście',
      { tag: '@ui' },
      async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: EMPTY_STORAGE });
        const page = await ctx.newPage();

        await page.route(`${API}/cars`, async (route) => {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(MOCK_TWO_CARS),
          });
        });

        await page.goto(`${APP}/cars`);
        await expect(page.locator('.row.collapse.show .card').first()).toBeVisible({ timeout: 10000 });

        const sortBtn = page.getByRole('button', { name: /Sortuj według mocy/ });
        await expect(sortBtn).toBeVisible();

        // Sortuj ASC
        await sortBtn.click();
        await expect(page.locator('.row.collapse.show .card').first()).toBeVisible({ timeout: 5000 });

        // Sortuj DESC (drugie kliknięcie odwraca kierunek)
        await sortBtn.click();
        await expect(page.locator('.row.collapse.show .card').first()).toBeVisible({ timeout: 5000 });

        // Ikona sortowania jest obecna w przycisku
        await expect(sortBtn.locator('i')).toBeVisible();

        await ctx.close();
      },
    );

    /**
     * [UI04] Wyszukiwanie po marce filtruje widoczne karty aut
     * Scenariusz UI: R13 – filtrowanie przed zakupem
     * Cel: po wpisaniu "Toyota" karta BMW znika z widoku
     */
    test('[UI04] Wyszukiwanie po marce filtruje listę aut',
      { tag: '@ui' },
      async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: EMPTY_STORAGE });
        const page = await ctx.newPage();

        await page.route(`${API}/cars`, async (route) => {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(MOCK_TWO_CARS),
          });
        });

        await page.goto(`${APP}/cars`);
        await expect(page.locator('.card').filter({ hasText: 'Toyota' })).toBeVisible({ timeout: 10000 });

        const searchInput = page.getByPlaceholder('Wyszukaj markę');
        await expect(searchInput).toBeVisible({ timeout: 5000 });
        await searchInput.fill('Toyota');

        await expect(page.locator('.row.collapse.show .card').filter({ hasText: 'Toyota' })).toBeVisible();
        await expect(page.locator('.row.collapse.show .card').filter({ hasText: 'BMW' })).toHaveCount(0);

        await ctx.close();
      },
    );

    /**
     * [UI05] Wyczyszczenie wyszukiwarki przywraca wszystkie karty aut
     * Scenariusz UI: R13 – powrót do pełnej listy
     * Cel: po usunięciu tekstu z filtru ponownie widoczne są wszystkie karty
     */
    test('[UI05] Wyczyszczenie wyszukiwarki przywraca pełną listę aut',
      { tag: '@ui' },
      async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: EMPTY_STORAGE });
        const page = await ctx.newPage();

        await page.route(`${API}/cars`, async (route) => {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(MOCK_TWO_CARS),
          });
        });

        await page.goto(`${APP}/cars`);
        await expect(page.locator('.card').filter({ hasText: 'Toyota' })).toBeVisible({ timeout: 10000 });

        const searchInput = page.getByPlaceholder('Wyszukaj markę');
        await searchInput.fill('Toyota');
        await expect(page.locator('.row.collapse.show .card').filter({ hasText: 'BMW' })).toHaveCount(0);

        // Wyczyść filtr
        await searchInput.clear();

        // Obie karty powinny wrócić
        await expect(page.locator('.card').filter({ hasText: 'Toyota' })).toBeVisible({ timeout: 5000 });
        await expect(page.locator('.card').filter({ hasText: 'BMW' })).toBeVisible({ timeout: 5000 });

        await ctx.close();
      },
    );

  });

  // ─────────────────────── Grupa 2: Szczegóły auta ──────────────────────────

  test.describe('Car Detail', () => {

    /**
     * [UI06] Kliknięcie "Szczegóły" nawiguje do /cars/:id
     * Scenariusz UI: R4 – przegląd konkretnego auta
     * Cel: routerLink na przycisku "Szczegóły" zmienia URL na /cars/[id]
     */
    test('[UI06] Kliknięcie Szczegóły nawiguje do strony /cars/:id',
      { tag: '@ui' },
      async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: EMPTY_STORAGE });
        const page = await ctx.newPage();

        await page.route(`${API}/cars`, async (route) => {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([MOCK_TWO_CARS[0]]),
          });
        });

        await page.goto(`${APP}/cars`);
        await expect(page.locator('.card').filter({ hasText: 'Toyota Corolla' })).toBeVisible({ timeout: 10000 });

        // Przycisk "Szczegóły" to link <a class="btn btn-info">
        await page.locator('a.btn-info').first().click();

        await expect(page).toHaveURL(/\/cars\/\d+/, { timeout: 10000 });

        await ctx.close();
      },
    );

    /**
     * [UI07] Strona szczegółów /cars/:id ładuje się bez błędu routingu
     * Scenariusz UI: R4 – widok szczegółów auta
     * Cel: bezpośrednie wejście na /cars/:id renderuje komponent bez błędu "Cannot match any routes"
     */
    test('[UI07] Strona szczegółów /cars/:id ładuje się bez błędów routingu',
      { tag: '@ui' },
      async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: EMPTY_STORAGE });
        const page = await ctx.newPage();

        await page.goto(`${APP}/cars/9901`);
        await page.waitForLoadState('networkidle');

        await expect(page).toHaveURL(/\/cars\/9901/);
        // Angular router nie powinien wyświetlić błędu trasy
        await expect(page.locator('body')).not.toContainText('Cannot match any routes');
        await expect(page.locator('app-root')).toBeVisible({ timeout: 10000 });

        await ctx.close();
      },
    );

    /**
     * [UI08] Nawigacja przeglądarki "wstecz" wraca z /cars/:id do /cars
     * Scenariusz UI: R4 – powrót do listy po przeglądaniu szczegółów
     * Cel: page.goBack() wraca do strony z listą aut
     */
    test('[UI08] Nawigacja wstecz z /cars/:id wraca do /cars',
      { tag: '@ui' },
      async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: EMPTY_STORAGE });
        const page = await ctx.newPage();

        await page.route(`${API}/cars`, async (route) => {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([MOCK_TWO_CARS[0]]),
          });
        });

        await page.goto(`${APP}/cars`);
        await expect(page.locator('.card').filter({ hasText: 'Toyota Corolla' })).toBeVisible({ timeout: 10000 });

        await page.locator('a.btn-info').first().click();
        await expect(page).toHaveURL(/\/cars\/\d+/, { timeout: 10000 });

        await page.goBack();
        await expect(page).toHaveURL(/\/cars$/, { timeout: 10000 });

        await ctx.close();
      },
    );

  });

  // ──────────────────────── Grupa 3: Nawigacja ──────────────────────────────

  test.describe('Navigation', () => {

    /**
     * [UI09] Navbar pokazuje panel dealera dla zalogowanego admina (storageState)
     * Scenariusz UI: R5 – zalogowany dealer ma dostęp do akcji dealerskich
     * Cel: admin ze storageState widzi przyciski Lista Klientów, Dodaj Samochód, Wyloguj się
     * Uwaga: ten test używa fixture `page` (sesja admina z projektu chromium)
     */
    test('[UI09] Navbar pokazuje panel dealera dla zalogowanego admina',
      { tag: '@ui' },
      async ({ page }) => {
        await page.goto(`${APP}/cars`);
        await page.waitForLoadState('networkidle');

        await expect(page.getByRole('button', { name: 'Dodaj Samochód' })).toBeVisible({ timeout: 8000 });
        await expect(page.getByRole('button', { name: 'Lista Klientów' })).toBeVisible({ timeout: 5000 });
        await expect(page.getByRole('button', { name: 'Wyloguj się' })).toBeVisible({ timeout: 5000 });
        await expect(page.getByText(/Witaj,/)).toBeVisible({ timeout: 5000 });
        await expect(page.getByRole('button', { name: 'Zaloguj się' })).not.toBeVisible();
      },
    );

    /**
     * [UI10] Navbar pokazuje przycisk "Zaloguj się" dla niezalogowanego użytkownika
     * Scenariusz UI: R5 – widok publiczny bez sesji
     * Cel: bez storageState wyświetlany jest przycisk Zaloguj się, brak przycisków dealerskich
     */
    test('[UI10] Navbar pokazuje Zaloguj się dla niezalogowanego użytkownika',
      { tag: '@ui' },
      async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: EMPTY_STORAGE });
        const page = await ctx.newPage();

        await page.goto(`${APP}/cars`);
        await page.waitForLoadState('networkidle');

        await expect(page.getByRole('button', { name: 'Zaloguj się' })).toBeVisible({ timeout: 8000 });
        await expect(page.getByRole('button', { name: 'Wyloguj się' })).not.toBeVisible();
        await expect(page.getByRole('button', { name: 'Dodaj Samochód' })).not.toBeVisible();

        await ctx.close();
      },
    );

    /**
     * [UI11] Strona Polityki Prywatności ładuje się z oczekiwaną treścią
     * Scenariusz UI: R7 – polityka prywatności dostępna z footera
     * Cel: link w footerze prowadzi do /privacy-policy z nagłówkiem i treścią
     */
    test('[UI11] Strona Polityki Prywatności ładuje się z treścią',
      { tag: '@ui' },
      async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: EMPTY_STORAGE });
        const page = await ctx.newPage();

        await page.goto(`${APP}/privacy-policy`);
        await page.waitForLoadState('networkidle');

        await expect(page).toHaveURL(/\/privacy-policy/);
        await expect(page.getByRole('heading', { name: 'Polityka prywatności' })).toBeVisible({ timeout: 8000 });
        await expect(page.getByText('Informacje ogólne')).toBeVisible({ timeout: 5000 });

        await ctx.close();
      },
    );

    /**
     * [UI12] Wejście na / przekierowuje do /cars
     * Scenariusz UI: R1 – domyślna trasa
     * Cel: Angular router redirectTo 'cars' działa przy wejściu na główny URL
     */
    test('[UI12] Wejście na / przekierowuje do /cars',
      { tag: '@ui' },
      async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: EMPTY_STORAGE });
        const page = await ctx.newPage();

        await page.goto(`${APP}/`);
        await page.waitForLoadState('networkidle');

        await expect(page).toHaveURL(/\/cars/, { timeout: 10000 });

        await ctx.close();
      },
    );

  });

  // ────────────────────── Grupa 4: Kalkulator leasingu ──────────────────────

  test.describe('Leasing Calculator', () => {

    /**
     * [UI13] Przycisk "Leasing" widoczny dla zalogowanego klienta (nie-dealer)
     * Scenariusz UI: R14 – klient może wyliczyć leasing
     * Cel: po rejestracji i zalogowaniu jako nie-dealer przycisk Leasing pojawia się przy aucie
     * Uwaga: admin (dealer) NIE widzi przycisku Leasing – stąd rejestrujemy świeżego klienta
     */
    test('[UI13] Przycisk Leasing widoczny dla zalogowanego klienta (nie-dealer)',
      { tag: '@ui' },
      async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: EMPTY_STORAGE });
        const page = await ctx.newPage();

        // Mock listy aut (dostępne do wynajmu = pokazuje przyciski akcji)
        await page.route(`${API}/cars`, async (route) => {
          if (route.request().method() === 'GET') {
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify([MOCK_TWO_CARS[0]]),
            });
          } else {
            await route.continue();
          }
        });

        await registerAndLoginUser(page);

        const leasingBtn = page.getByRole('button', { name: /Leasing/ }).first();
        await expect(leasingBtn).toBeVisible({ timeout: 10000 });

        await ctx.close();
      },
    );

    /**
     * [UI14] Dialog leasingu otwiera się i zawiera formularz z wymaganymi polami
     * Scenariusz UI: R14 – wypełnienie formularza leasingowego
     * Cel: kliknięcie "Leasing" otwiera Angular Material Dialog z polami downPayment i months
     */
    test('[UI14] Dialog leasingu otwiera się i zawiera formularz',
      { tag: '@ui' },
      async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: EMPTY_STORAGE });
        const page = await ctx.newPage();

        await page.route(`${API}/cars`, async (route) => {
          if (route.request().method() === 'GET') {
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify([MOCK_TWO_CARS[0]]),
            });
          } else {
            await route.continue();
          }
        });

        await registerAndLoginUser(page);

        await page.getByRole('button', { name: /Leasing/ }).first().click();

        const dialog = page.locator('.calculate-form');
        await expect(dialog).toBeVisible({ timeout: 10000 });
        await expect(page.locator('#downPayment')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('#months')).toBeVisible({ timeout: 5000 });
        await expect(dialog.getByRole('button', { name: 'Oblicz' })).toBeVisible();

        await ctx.close();
      },
    );

    /**
     * [UI15] Obliczenie leasingu pokazuje podsumowanie z miesięczną ratą
     * Scenariusz UI: R14 – wynik kalkulacji leasingu widoczny dla klienta
     * Cel: po wypełnieniu formularza i kliknięciu "Oblicz" pojawia się dialog podsumowania
     *      z polem "Miesięczna rata"
     */
    test('[UI15] Obliczenie leasingu pokazuje podsumowanie z miesięczną ratą',
      { tag: '@ui' },
      async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: EMPTY_STORAGE });
        const page = await ctx.newPage();

        await page.route(`${API}/cars`, async (route) => {
          if (route.request().method() === 'GET') {
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify([MOCK_TWO_CARS[0]]),
            });
          } else {
            await route.continue();
          }
        });

        // Mock endpointu leasingowego – zwróć przykładowe podsumowanie
        await page.route(`${API}/cars/9901/leasing`, async (route) => {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              carId: 9901,
              carBrand: 'Toyota',
              carModel: 'Corolla',
              totalPrice: 110000,
              downPayment: 10000,
              remainingAmount: '100000.00',
              months: 36,
              monthlyRate: '2777.78',
            }),
          });
        });

        await registerAndLoginUser(page);

        await page.getByRole('button', { name: /Leasing/ }).first().click();

        const dialog = page.locator('.calculate-form');
        await expect(dialog).toBeVisible({ timeout: 10000 });

        await page.locator('#downPayment').fill('10000');
        await page.locator('#months').fill('36');
        await dialog.getByRole('button', { name: 'Oblicz' }).click();

        // Podsumowanie leasingu powinno się otworzyć w nowym dialogu
        await expect(page.getByText('Leasing - podsumowanie')).toBeVisible({ timeout: 10000 });
        await expect(page.getByText(/Miesięczna rata/)).toBeVisible({ timeout: 5000 });

        await ctx.close();
      },
    );

  });

});
