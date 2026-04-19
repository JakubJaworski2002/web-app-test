/**
 * Testy API Backendowego – Salon Samochodowy
 *
 * Demonstracja użycia fixture 'request' (APIRequestContext) do testowania
 * logiki backendowej bezpośrednio, bez przeglądarki.
 *
 * Autor: Playwright API Tests
 */

import { test, expect, APIRequestContext } from '@playwright/test';

const API_BASE = 'http://localhost:3000';
const ADMIN = { username: 'admin', password: 'Admin1!' };

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function loginAs(
  request: APIRequestContext,
  credentials: { username: string; password: string }
): Promise<void> {
  const res = await request.post(`${API_BASE}/login`, { data: credentials });
  expect(res.status()).toBe(200);
}

function uniqueSuffix(): string {
  return Date.now().toString().slice(-8);
}

function makeVin(suffix: string): string {
  return `APITEST${suffix.padStart(10, '0')}`.slice(0, 17);
}

// ─── Blok 1: Autentykacja ─────────────────────────────────────────────────────

test.describe('API – Autentykacja', () => {

  test('POST /login zwraca 200 i dane użytkownika dla poprawnych danych', async ({ request }) => {
    const res = await request.post(`${API_BASE}/login`, {
      data: ADMIN,
    });

    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty('message');
    expect(body).toHaveProperty('user');
    expect(body.user).toMatchObject({
      username: 'admin',
      isDealer: true,
    });
    expect(body.user).toHaveProperty('id');
    expect(body.user).toHaveProperty('firstName');
    expect(body.user).toHaveProperty('lastName');
  });

  test('POST /login zwraca 400 dla błędnego hasła', async ({ request }) => {
    const res = await request.post(`${API_BASE}/login`, {
      data: { username: 'admin', password: 'ZleHaslo999!' },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty('error');
  });

  test('POST /login zwraca 400 dla nieistniejącego użytkownika', async ({ request }) => {
    const res = await request.post(`${API_BASE}/login`, {
      data: { username: 'nieistniejacy_user_xyz', password: 'haslo123' },
    });

    expect(res.status()).toBe(400);
  });

  test('POST /login zwraca 400 gdy username jest za krótki (< 3 znaki)', async ({ request }) => {
    const res = await request.post(`${API_BASE}/login`, {
      data: { username: 'ab', password: 'haslo123' },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty('errors');
  });

  test('GET /current-user zwraca 401 bez zalogowania', async ({ request }) => {
    const res = await request.get(`${API_BASE}/current-user`);
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body).toHaveProperty('error');
  });

  test('GET /current-user zwraca dane po zalogowaniu', async ({ request }) => {
    await loginAs(request, ADMIN);

    const res = await request.get(`${API_BASE}/current-user`);
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty('user');
    expect(body.user.username).toBe('admin');
    expect(body.user.isDealer).toBe(true);
  });

  test('POST /logout niszczy sesję', async ({ request }) => {
    await loginAs(request, ADMIN);

    const logoutRes = await request.post(`${API_BASE}/logout`);
    expect(logoutRes.status()).toBe(200);

    // Po wylogowaniu /current-user powinno zwrócić 401
    const meRes = await request.get(`${API_BASE}/current-user`);
    expect(meRes.status()).toBe(401);
  });

});

// ─── Blok 2: Rejestracja ──────────────────────────────────────────────────────

test.describe('API – Rejestracja', () => {

  test('POST /register tworzy nowego użytkownika', async ({ request }) => {
    const suffix = uniqueSuffix();
    const newUser = {
      username: `testuser${suffix}`,
      email: `testuser${suffix}@test.com`,
      password: 'TestHaslo1!',
      firstName: 'Test',
      lastName: 'Użytkownik',
    };

    const res = await request.post(`${API_BASE}/register`, { data: newUser });

    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body).toHaveProperty('message');
    expect(body.user.username).toBe(newUser.username);
    expect(body.user.isDealer).toBe(false);
    expect(body.user).not.toHaveProperty('password'); // hasło nie powinno być w odpowiedzi
  });

  test('POST /register zwraca 400 dla za krótkiego hasła', async ({ request }) => {
    const suffix = uniqueSuffix();
    const res = await request.post(`${API_BASE}/register`, {
      data: {
        username: `u${suffix}`,
        email: `u${suffix}@test.com`,
        password: '123', // za krótkie
        firstName: 'A',
        lastName: 'B',
      },
    });

    expect(res.status()).toBe(400);
  });

  test('POST /register zwraca 400 dla nieprawidłowego e-mail', async ({ request }) => {
    const suffix = uniqueSuffix();
    const res = await request.post(`${API_BASE}/register`, {
      data: {
        username: `u${suffix}`,
        email: 'to-nie-jest-email',
        password: 'Haslo123!',
        firstName: 'A',
        lastName: 'B',
      },
    });

    expect(res.status()).toBe(400);
  });

  test('POST /register zwraca 400 dla zduplikowanego username', async ({ request }) => {
    // Admin już istnieje
    const res = await request.post(`${API_BASE}/register`, {
      data: {
        username: 'admin',
        email: 'new@test.com',
        password: 'Haslo123!',
        firstName: 'A',
        lastName: 'B',
      },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/zajęta/i);
  });

});

// ─── Blok 3: Samochody (publiczne) ───────────────────────────────────────────

test.describe('API – Samochody (publiczne endpointy)', () => {

  test('GET /cars zwraca tablicę samochodów', async ({ request }) => {
    const res = await request.get(`${API_BASE}/cars`);

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBeTruthy();
    
    if (body.length > 0) {
      const car = body[0];
      expect(car).toHaveProperty('id');
      expect(car).toHaveProperty('brand');
      expect(car).toHaveProperty('model');
      expect(car).toHaveProperty('year');
      expect(car).toHaveProperty('vin');
      expect(car).toHaveProperty('price');
      expect(car).toHaveProperty('horsePower');
      expect(car).toHaveProperty('isAvailableForRent');
    }
  });

  test('GET /cars/:id zwraca 404 dla nieistniejącego ID', async ({ request }) => {
    const res = await request.get(`${API_BASE}/cars/9999999`);
    expect(res.status()).toBe(404);
  });

  test('GET /cars/:id zwraca 400 dla nieprawidłowego ID', async ({ request }) => {
    const res = await request.get(`${API_BASE}/cars/nievalid`);
    expect(res.status()).toBe(400);
  });

});

// ─── Blok 4: Samochody (chronione) ──────────────────────────────────────────

test.describe('API – Samochody (chronione endpointy)', () => {

  test('POST /cars zwraca 401 bez zalogowania', async ({ request }) => {
    const res = await request.post(`${API_BASE}/cars`, {
      data: {
        brand: 'Test',
        model: 'Model',
        year: 2020,
        vin: 'AAAAAAAAAAAAAAAAA',
        price: 50000,
        horsePower: 150,
        isAvailableForRent: true,
      },
    });
    expect(res.status()).toBe(401);
  });

  test('POST /cars tworzy samochód po zalogowaniu jako dealer', async ({ request }) => {
    await loginAs(request, ADMIN);

    const suffix = uniqueSuffix();
    const newCar = {
      brand: `APICar${suffix}`,
      model: `APIModel${suffix}`,
      year: 2023,
      vin: makeVin(suffix),
      price: 75000,
      horsePower: 200,
      isAvailableForRent: true,
    };

    const res = await request.post(`${API_BASE}/cars`, { data: newCar });

    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body).toHaveProperty('id');
    expect(body.brand).toBe(newCar.brand);
    expect(body.model).toBe(newCar.model);
    expect(body.horsePower).toBe(newCar.horsePower);
    expect(body.isAvailableForRent).toBe(true);
  });

  test('POST /cars zwraca 400 dla VIN o złej długości', async ({ request }) => {
    await loginAs(request, ADMIN);

    const res = await request.post(`${API_BASE}/cars`, {
      data: {
        brand: 'Test',
        model: 'Model',
        year: 2020,
        vin: 'ZA_KROTKI', // mniej niż 17 znaków
        price: 50000,
        horsePower: 150,
        isAvailableForRent: true,
      },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty('errors');
  });

  test('POST /cars zwraca 400 dla ujemnej ceny', async ({ request }) => {
    await loginAs(request, ADMIN);

    const suffix = uniqueSuffix();
    const res = await request.post(`${API_BASE}/cars`, {
      data: {
        brand: `Neg${suffix}`,
        model: `Neg${suffix}`,
        year: 2020,
        vin: makeVin(suffix),
        price: -1000, // ujemna cena
        horsePower: 150,
        isAvailableForRent: true,
      },
    });
    expect(res.status()).toBe(400);
  });

  test('PUT /cars/:id aktualizuje dane samochodu', async ({ request }) => {
    await loginAs(request, ADMIN);

    // Najpierw utwórz auto
    const suffix = uniqueSuffix();
    const createRes = await request.post(`${API_BASE}/cars`, {
      data: {
        brand: `UpdateBrand${suffix}`,
        model: `UpdateModel${suffix}`,
        year: 2022,
        vin: makeVin(suffix),
        price: 60000,
        horsePower: 180,
        isAvailableForRent: true,
      },
    });
    expect(createRes.status()).toBe(201);
    const created = await createRes.json();
    const carId = created.id;

    // Zaktualizuj cenę
    const updateRes = await request.put(`${API_BASE}/cars/${carId}`, {
      data: { price: 55000 },
    });
    expect(updateRes.status()).toBe(200);
    const updated = await updateRes.json();
    expect(updated.price).toBe(55000);
  });

  test('DELETE /cars/:id usuwa samochód (dealer)', async ({ request }) => {
    await loginAs(request, ADMIN);

    const suffix = uniqueSuffix();
    const createRes = await request.post(`${API_BASE}/cars`, {
      data: {
        brand: `DeleteBrand${suffix}`,
        model: `DeleteModel${suffix}`,
        year: 2021,
        vin: makeVin(suffix),
        price: 40000,
        horsePower: 130,
        isAvailableForRent: true,
      },
    });
    const created = await createRes.json();
    const carId = created.id;

    const deleteRes = await request.delete(`${API_BASE}/cars/${carId}`);
    expect(deleteRes.status()).toBe(200);

    // Weryfikacja – auto nie powinno już istnieć
    const getRes = await request.get(`${API_BASE}/cars/${carId}`);
    expect(getRes.status()).toBe(404);
  });

});

// ─── Blok 5: Kalkulator leasingowy ──────────────────────────────────────────

test.describe('API – Kalkulator leasingowy', () => {

  test('POST /cars/:id/leasing oblicza poprawną ratę miesięczną', async ({ request }) => {
    // Pobierz pierwsze dostępne auto
    const carsRes = await request.get(`${API_BASE}/cars`);
    const cars = await carsRes.json();
    expect(cars.length).toBeGreaterThan(0);
    const car = cars[0];

    const downPayment = 10000;
    const months = 24;

    const res = await request.post(`${API_BASE}/cars/${car.id}/leasing`, {
      data: { downPayment, months },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();

    expect(body.carId).toBe(car.id);
    expect(body.totalPrice).toBe(car.price);
    expect(body.downPayment).toBe(downPayment);
    expect(body.months).toBe(months);

    // Weryfikacja obliczeń
    const expectedRemaining = car.price - downPayment;
    const expectedMonthly = expectedRemaining / months;
    expect(parseFloat(body.remainingAmount)).toBeCloseTo(expectedRemaining, 2);
    expect(parseFloat(body.monthlyRate)).toBeCloseTo(expectedMonthly, 2);
  });

  test('POST /cars/:id/leasing zwraca 400 gdy wpłata > cena', async ({ request }) => {
    const carsRes = await request.get(`${API_BASE}/cars`);
    const cars = await carsRes.json();
    const car = cars[0];

    const res = await request.post(`${API_BASE}/cars/${car.id}/leasing`, {
      data: { downPayment: car.price + 99999, months: 12 },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/większa niż cena/i);
  });

});

// ─── Blok 6: Zarządzanie klientami (admin) ────────────────────────────────────

test.describe('API – Zarządzanie klientami (admin)', () => {

  test('GET /users zwraca 401 bez zalogowania', async ({ request }) => {
    const res = await request.get(`${API_BASE}/users`);
    expect(res.status()).toBe(401);
  });

  test('GET /users zwraca listę klientów po zalogowaniu admina', async ({ request }) => {
    await loginAs(request, ADMIN);

    const res = await request.get(`${API_BASE}/users`);
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(Array.isArray(body)).toBeTruthy();
    // Wszyscy użytkownicy na liście powinni być klientami (isDealer: false)
    for (const user of body) {
      expect(user.isDealer).toBe(false);
    }
  });

  test('POST /admin/create-customer tworzy nowego klienta', async ({ request }) => {
    await loginAs(request, ADMIN);

    const suffix = uniqueSuffix();
    const newCustomer = {
      username: `customer${suffix}`,
      email: `customer${suffix}@salon.com`,
      password: 'Klient123!',
      firstName: 'Nowy',
      lastName: 'Klient',
    };

    const res = await request.post(`${API_BASE}/admin/create-customer`, {
      data: newCustomer,
    });

    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.user.username).toBe(newCustomer.username);
    expect(body.user.isDealer).toBe(false);
  });

  test('POST /admin/create-customer zwraca 403 dla niezalogowanego użytkownika', async ({ request }) => {
    const suffix = uniqueSuffix();
    const res = await request.post(`${API_BASE}/admin/create-customer`, {
      data: {
        username: `x${suffix}`,
        email: `x${suffix}@test.com`,
        password: 'Haslo123!',
        firstName: 'X',
        lastName: 'Y',
      },
    });
    // 401 (brak sesji) lub 403 (brak uprawnień)
    expect([401, 403]).toContain(res.status());
  });

});

// ─── Blok 7: Wynajem i zwrot samochodów ──────────────────────────────────────

test.describe('API – Wynajem i zwrot samochodu', () => {

  test('POST /cars/:id/rent wynajmuje dostępny samochód', async ({ request }) => {
    await loginAs(request, ADMIN);

    // Utwórz auto dostępne do wynajmu
    const suffix = uniqueSuffix();
    const createRes = await request.post(`${API_BASE}/cars`, {
      data: {
        brand: `RentBrand${suffix}`,
        model: `RentModel${suffix}`,
        year: 2023,
        vin: makeVin(suffix),
        price: 50000,
        horsePower: 160,
        isAvailableForRent: true,
      },
    });
    const car = await createRes.json();
    expect(car.isAvailableForRent).toBe(true);

    // Wynajmij auto
    const rentRes = await request.post(`${API_BASE}/cars/${car.id}/rent`);
    expect(rentRes.status()).toBe(200);

    const rentBody = await rentRes.json();
    expect(rentBody.car.isAvailableForRent).toBe(false);
  });

  test('POST /cars/:id/rent zwraca 400 dla już wynajętego auta', async ({ request }) => {
    await loginAs(request, ADMIN);

    const suffix = uniqueSuffix();
    const createRes = await request.post(`${API_BASE}/cars`, {
      data: {
        brand: `DoubleRent${suffix}`,
        model: `DoubleRent${suffix}`,
        year: 2022,
        vin: makeVin(suffix),
        price: 45000,
        horsePower: 140,
        isAvailableForRent: true,
      },
    });
    const car = await createRes.json();

    // Pierwszy wynajem
    await request.post(`${API_BASE}/cars/${car.id}/rent`);

    // Drugi wynajem – powinien się nie udać
    const secondRentRes = await request.post(`${API_BASE}/cars/${car.id}/rent`);
    expect(secondRentRes.status()).toBe(400);
    const body = await secondRentRes.json();
    expect(body.error).toMatch(/już wynajęty/i);
  });

});
