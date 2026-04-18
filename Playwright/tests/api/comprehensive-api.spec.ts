/**
 * Testy API – Kompleksowy zestaw 15 testów
 *
 * Filar 1: Testowanie API (APIRequestContext)
 * Pokrycie: autentykacja, operacje CRUD, scenariusze biznesowe
 * Backend: http://localhost:3000
 *
 * Każdy test weryfikuje kod statusu HTTP, strukturę odpowiedzi i logikę biznesową
 */

import { test, expect, APIRequestContext } from '@playwright/test';

const API_BASE = 'http://localhost:3000';
const ADMIN = { username: 'admin', password: 'Admin1!' };
const TEST_USER = {
  username: 'testuser2025',
  email: 'testuser2025@test.com',
  password: 'TestPass123!',
  firstName: 'Test',
  lastName: 'User',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function loginAs(
  request: APIRequestContext,
  credentials: { username: string; password: string } = ADMIN
): Promise<void> {
  const res = await request.post(`${API_BASE}/login`, { data: credentials });
  expect(res.status()).toBe(200);
}

function uniqueSuffix(): string {
  return Date.now().toString().slice(-9) + Math.floor(Math.random() * 1000);
}

function makeVin(suffix: string): string {
  const clean = suffix.replace(/\D/g, '').padStart(10, '0');
  return `TEST${clean}ABCD`.slice(0, 17).toUpperCase();
}

async function createTestCar(
  request: APIRequestContext,
  overrides: Record<string, unknown> = {}
): Promise<{ id: number; brand: string; model: string; vin: string; price: number }> {
  const s = uniqueSuffix();
  const res = await request.post(`${API_BASE}/cars`, {
    data: {
      brand: `TestBrand${s}`,
      model: `TestModel${s}`,
      year: 2024,
      vin: makeVin(s),
      price: 75000,
      horsePower: 200,
      isAvailableForRent: true,
      ...overrides,
    },
  });
  expect(res.status()).toBe(201);
  return res.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// FILAR 1: AUTENTYKACJA (Testy 1–5)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Testy autentykacji – weryfikacja logowania, sesji i uprawnień
 * Pokrytą endpointy: POST /login, GET /current-user, POST /logout
 */
test.describe('API – Filar 1: Autentykacja', () => {

  /**
   * [T1] POST /login – Poprawne logowanie admina
   * Weryfikacja: status 200, odpowiedź zawiera user z isDealer: true
   */
  test('[T1] POST /login – admin zwraca 200 z danymi użytkownika (isDealer: true)', async ({ request }) => {
    const res = await request.post(`${API_BASE}/login`, {
      data: ADMIN,
    });

    expect(res.status()).toBe(200);
    const body = await res.json() as {
      message: string;
      user: { id: number; username: string; isDealer: boolean };
    };

    expect(body).toHaveProperty('message');
    expect(body.message).toMatch(/logowanie|success/i);
    expect(body.user.username).toBe('admin');
    expect(body.user.isDealer).toBe(true);
    expect(body.user).not.toHaveProperty('password'); // bezpieczeństwo
  });

  /**
   * [T2] POST /login – Błędne hasło
   * Weryfikacja: status 400, odpowiedź zawiera error
   */
  test('[T2] POST /login – błędne hasło zwraca 400 z error message', async ({ request }) => {
    const res = await request.post(`${API_BASE}/login`, {
      data: { username: 'admin', password: 'ZleHaslo999!' },
    });

    expect(res.status()).toBe(400);
    const body = await res.json() as { error: string };
    expect(body).toHaveProperty('error');
    expect(body.error).toMatch(/nieprawidł|hasło/i);
  });

  /**
   * [T3] GET /current-user – Bez autentykacji
   * Weryfikacja: status 401, endpoint jest chroniony
   */
  test('[T3] GET /current-user – bez sesji zwraca 401 Unauthorized', async ({ request }) => {
    const res = await request.get(`${API_BASE}/current-user`);

    expect(res.status()).toBe(401);
    const body = await res.json() as { error: string };
    expect(body).toHaveProperty('error');
  });

  /**
   * [T4] GET /current-user – Po zalogowaniu
   * Weryfikacja: status 200, dane zalogowanego użytkownika
   */
  test('[T4] GET /current-user – po logowaniu zwraca dane admina', async ({ request }) => {
    await loginAs(request, ADMIN);

    const res = await request.get(`${API_BASE}/current-user`);

    expect(res.status()).toBe(200);
    const body = await res.json() as { user: { username: string; isDealer: boolean } };
    expect(body.user.username).toBe('admin');
    expect(body.user.isDealer).toBe(true);
  });

  /**
   * [T5] POST /logout – Zniszczenie sesji
   * Weryfikacja: login → logout → GET /current-user zwraca 401
   */
  test('[T5] POST /logout – niszczy sesję (GET /current-user potem zwraca 401)', async ({ request }) => {
    await loginAs(request, ADMIN);

    // Potwierdź że sesja działa
    let res = await request.get(`${API_BASE}/current-user`);
    expect(res.status()).toBe(200);

    // Wyloguj się
    res = await request.post(`${API_BASE}/logout`);
    expect(res.status()).toBe(200);

    // Sesja powinna być zniszczona
    res = await request.get(`${API_BASE}/current-user`);
    expect(res.status()).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FILAR 2: CRUD SAMOCHODÓW (Testy 6–10)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Testy CRUD – operacje na zasobach samochodów
 * Pokrycie endpointów: GET /cars, GET /cars/:id, POST /cars, PUT /cars/:id, DELETE /cars/:id
 */
test.describe('API – Filar 2: CRUD Samochodów', () => {

  /**
   * [T6] GET /cars – Publiczny endpoint
   * Weryfikacja: status 200, tablica samochodów z wymaganymi polami
   */
  test('[T6] GET /cars – publiczny endpoint (brak auth) zwraca tablicę samochodów', async ({ request }) => {
    const res = await request.get(`${API_BASE}/cars`);

    expect(res.status()).toBe(200);
    const cars = await res.json() as Array<Record<string, unknown>>;
    expect(Array.isArray(cars)).toBe(true);

    if (cars.length > 0) {
      const car = cars[0];
      expect(car).toHaveProperty('id');
      expect(car).toHaveProperty('brand');
      expect(car).toHaveProperty('model');
      expect(car).toHaveProperty('price');
      expect(car).toHaveProperty('isAvailableForRent');
    }
  });

  /**
   * [T7] POST /cars – Tworzenie nowego samochodu (wymaga auth)
   * Weryfikacja: status 201, nowe auto ma id, brand, model, price
   */
  test('[T7] POST /cars – tworzenie nowego samochodu (authorized) zwraca 201', async ({ request }) => {
    await loginAs(request, ADMIN);

    const s = uniqueSuffix();
    const createRes = await request.post(`${API_BASE}/cars`, {
      data: {
        brand: `NewBrand${s}`,
        model: `NewModel${s}`,
        year: 2024,
        vin: makeVin(s),
        price: 85000,
        horsePower: 220,
        isAvailableForRent: true,
      },
    });

    expect(createRes.status()).toBe(201);
    const created = await createRes.json() as { id: number; brand: string; model: string };
    expect(created).toHaveProperty('id');
    expect(created.brand).toMatch(/NewBrand/);
    expect(created.model).toMatch(/NewModel/);

    // Cleanup
    await request.delete(`${API_BASE}/cars/${created.id}`);
  });

  /**
   * [T8] PUT /cars/:id – Aktualizacja ceny samochodu
   * Weryfikacja: status 200, cena zmieniona w bazie
   */
  test('[T8] PUT /cars/:id – zmiana ceny (PUT) oddaje 200 i potwierdza zmianę', async ({ request }) => {
    await loginAs(request, ADMIN);

    const car = await createTestCar(request, { price: 70000 });
    const newPrice = 62500;

    const updateRes = await request.put(`${API_BASE}/cars/${car.id}`, {
      data: { price: newPrice },
    });

    expect(updateRes.status()).toBe(200);
    const updated = await updateRes.json() as { price: number };
    expect(updated.price).toBe(newPrice);

    // Weryfikacja przez GET
    const getRes = await request.get(`${API_BASE}/cars/${car.id}`);
    const fetched = await getRes.json() as { price: number };
    expect(fetched.price).toBe(newPrice);

    // Cleanup
    await request.delete(`${API_BASE}/cars/${car.id}`);
  });

  /**
   * [T9] DELETE /cars/:id – Usuwanie samochodu
   * Weryfikacja: status 200 przy usunięciu, 404 po usunięciu
   */
  test('[T9] DELETE /cars/:id – usuwanie samochodu daje 200, potem GET zwraca 404', async ({ request }) => {
    await loginAs(request, ADMIN);

    const car = await createTestCar(request);

    // Potwierdź że auto istnieje
    let res = await request.get(`${API_BASE}/cars/${car.id}`);
    expect(res.status()).toBe(200);

    // Usuń
    res = await request.delete(`${API_BASE}/cars/${car.id}`);
    expect(res.status()).toBe(200);

    // Potwierdź że się usunęło
    res = await request.get(`${API_BASE}/cars/${car.id}`);
    expect(res.status()).toBe(404);
  });

  /**
   * [T10] GET /cars/:id – Nieistniejące ID
   * Weryfikacja: status 404, error message
   */
  test('[T10] GET /cars/:id – nieistniejące ID zwraca 404', async ({ request }) => {
    const res = await request.get(`${API_BASE}/cars/9999999`);

    expect(res.status()).toBe(404);
    const body = await res.json() as { error: string };
    expect(body).toHaveProperty('error');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FILAR 3: SCENARIUSZE BIZNESOWE (Testy 11–15)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Testy scenariuszy biznesowych – logika leasing, kupno, wynajem
 * Pokrycie endpointów: POST /cars/:id/leasing, POST /cars/:id/buy, POST /cars/:id/rent
 */
test.describe('API – Filar 3: Scenariusze Biznesowe', () => {

  /**
   * [T11] POST /cars/:id/leasing – Kalkulator leasingu
   * Weryfikacja: rate = (cena - wpłata) / miesiące
   * Przykład: 100k - 20k = 80k / 24 m-cy = 3333.33
   */
  test('[T11] POST /cars/:id/leasing – poprawna rata miesięczna', async ({ request }) => {
    await loginAs(request, ADMIN);

    const car = await createTestCar(request, { price: 100000 });

    const downPayment = 20000;
    const months = 24;

    const res = await request.post(`${API_BASE}/cars/${car.id}/leasing`, {
      data: { downPayment, months },
    });

    expect(res.status()).toBe(200);
    const body = await res.json() as {
      carId: number;
      totalPrice: number;
      downPayment: number;
      months: number;
      monthlyRate: string;
    };

    expect(body.carId).toBe(car.id);
    expect(body.totalPrice).toBe(100000);
    expect(body.downPayment).toBe(downPayment);
    expect(body.months).toBe(months);

    const expectedMonthly = (100000 - 20000) / 24; // 3333.33
    expect(parseFloat(body.monthlyRate)).toBeCloseTo(expectedMonthly, 2);

    // Cleanup
    await request.delete(`${API_BASE}/cars/${car.id}`);
  });

  /**
   * [T12] POST /cars/:id/leasing – Validacja: wpłata > cena
   * Weryfikacja: status 400, error message
   */
  test('[T12] POST /cars/:id/leasing – wpłata większa niż cena zwraca 400', async ({ request }) => {
    await loginAs(request, ADMIN);

    const car = await createTestCar(request, { price: 50000 });

    const res = await request.post(`${API_BASE}/cars/${car.id}/leasing`, {
      data: { downPayment: 60000, months: 24 }, // wpłata > cena
    });

    expect(res.status()).toBe(400);
    const body = await res.json() as { error: string };
    expect(body).toHaveProperty('error');

    // Cleanup
    await request.delete(`${API_BASE}/cars/${car.id}`);
  });

  /**
   * [T13] POST /cars – Walidacja VIN (wymagane 17 znaków)
   * Weryfikacja: status 400 dla za krótkiego VIN
   */
  test('[T13] POST /cars – VIN za krótki (< 17) zwraca 400', async ({ request }) => {
    await loginAs(request, ADMIN);

    const res = await request.post(`${API_BASE}/cars`, {
      data: {
        brand: 'TestBrand',
        model: 'TestModel',
        year: 2024,
        vin: 'ZBYT_KROTKI', // tylko 11 znaków
        price: 50000,
        horsePower: 150,
        isAvailableForRent: true,
      },
    });

    expect(res.status()).toBe(400);
    const body = await res.json() as { error?: string; errors?: unknown };
    expect(body).toHaveProperty('error' || 'errors');
  });

  /**
   * [T14] POST /cars – Walidacja ceny (ujemna cena)
   * Weryfikacja: status 400 dla ujemnej ceny
   */
  test('[T14] POST /cars – ujemna cena zwraca 400', async ({ request }) => {
    await loginAs(request, ADMIN);

    const s = uniqueSuffix();
    const res = await request.post(`${API_BASE}/cars`, {
      data: {
        brand: `NegBrand${s}`,
        model: `NegModel${s}`,
        year: 2024,
        vin: makeVin(s),
        price: -5000, // ujemna
        horsePower: 150,
        isAvailableForRent: true,
      },
    });

    expect(res.status()).toBe(400);
  });

  /**
   * [T15] POST /cars – Wymaganego pola (brakuje brand)
   * Weryfikacja: status 400, error message o wymaganym polu
   */
  test('[T15] POST /cars – brak wymaganego pola (brand) zwraca 400', async ({ request }) => {
    await loginAs(request, ADMIN);

    const s = uniqueSuffix();
    const res = await request.post(`${API_BASE}/cars`, {
      data: {
        // brakuje: brand
        model: `Model${s}`,
        year: 2024,
        vin: makeVin(s),
        price: 50000,
        horsePower: 150,
        isAvailableForRent: true,
      },
    });

    expect(res.status()).toBe(400);
    const body = await res.json() as { error?: string; errors?: unknown };
    expect(body).toHaveProperty('error' || 'errors');
  });
});
