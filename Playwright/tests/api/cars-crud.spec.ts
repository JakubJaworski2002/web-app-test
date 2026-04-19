/**
 * Testy API – Operacje CRUD na samochodach
 *
 * Playlista: A01–A06
 * Pokryte scenariusze UI: R1 (dodawanie auta), R4 (edycja auta), R6 (walidacja), R14 (zmiana ceny)
 *
 * Technika: fixture 'request' (APIRequestContext) – brak przeglądarki
 * Backend: http://localhost:3000
 */

import { test, expect, APIRequestContext } from '@playwright/test';

const API = 'http://localhost:3000';
const ADMIN = { username: 'admin', password: 'Admin1!' };

async function loginAs(request: APIRequestContext, creds = ADMIN): Promise<void> {
  const res = await request.post(`${API}/login`, { data: creds });
  expect(res.status()).toBe(200);
}

function uniqueSuffix(): string {
  return Date.now().toString().slice(-9) + Math.floor(Math.random() * 100);
}

function makeVin(s: string): string {
  const clean = s.replace(/\D/g, '').padStart(10, '0');
  return `API${clean}ABCD`.slice(0, 17).toUpperCase();
}

async function createTestCar(request: APIRequestContext, overrides: Partial<Record<string, unknown>> = {}) {
  const s = uniqueSuffix();
  const res = await request.post(`${API}/cars`, {
    data: {
      brand: `ApiBrand${s}`,
      model: `ApiModel${s}`,
      year: 2022,
      vin: makeVin(s),
      price: 55000,
      horsePower: 180,
      isAvailableForRent: true,
      ...overrides,
    },
  });
  expect(res.status()).toBe(201);
  return res.json() as Promise<{ id: number; brand: string; model: string; price: number; isAvailableForRent: boolean }>;
}

// ─────────────────────────────────────────────────────────────────────────────

test.describe('API CRUD – Samochody', () => {

  /**
   * [A01] Weryfikacja schematu listy samochodów
   * Scenariusz UI: R1 – po dodaniu auta pojawia się na liście
   * Cel: sprawdzenie że GET /cars zwraca tablicę obiektów z kompletem wymaganych pól
   */
  test('[A01] GET /cars zwraca tablicę z wymaganymi polami', async ({ request }) => {
    const res = await request.get(`${API}/cars`);

    expect(res.status()).toBe(200);
    const cars = await res.json() as Array<Record<string, unknown>>;
    expect(Array.isArray(cars)).toBe(true);

    if (cars.length > 0) {
      const car = cars[0];
      const requiredFields = ['id', 'brand', 'model', 'year', 'vin', 'price', 'horsePower', 'isAvailableForRent'];
      for (const field of requiredFields) {
        expect(car, `Brakuje pola: ${field}`).toHaveProperty(field);
      }
      expect(typeof car.id).toBe('number');
      expect(typeof car.brand).toBe('string');
      expect(typeof car.price).toBe('number');
      expect(typeof car.isAvailableForRent).toBe('boolean');
    }
  });

  /**
   * [A02] Nieistniejące ID zwraca 404
   * Scenariusz UI: R4 – wyszukiwanie konkretnego auta po ID
   * Cel: sprawdzenie obsługi błędu 404 dla nieistniejącego zasobu
   */
  test('[A02] GET /cars/:id zwraca 404 dla nieistniejącego ID 9999999', async ({ request }) => {
    const res = await request.get(`${API}/cars/9999999`);

    expect(res.status()).toBe(404);
    const body = await res.json() as { error: string };
    expect(body).toHaveProperty('error');
    expect(body.error).toMatch(/nie znalezion/i);
  });

  /**
   * [A03] Tworzenie nowego samochodu przez dealera
   * Scenariusz UI: R1 – Admin dodaje nowy samochód i pojawia się na liście
   * Cel: pełna ścieżka POST /cars z weryfikacją odpowiedzi i GET /cars
   */
  test('[A03] POST /cars tworzy nowe auto jako dealer – odpowiedź zawiera id, brand i isAvailableForRent', async ({ request }) => {
    await loginAs(request);

    const s = uniqueSuffix();
    const newCar = {
      brand: `R1Brand${s}`,
      model: `R1Model${s}`,
      year: 2024,
      vin: makeVin(s),
      price: 89900,
      horsePower: 250,
      isAvailableForRent: true,
    };

    const createRes = await request.post(`${API}/cars`, { data: newCar });
    expect(createRes.status()).toBe(201);

    const created = await createRes.json() as { id: number; brand: string; model: string; isAvailableForRent: boolean };
    expect(created).toHaveProperty('id');
    expect(created.brand).toBe(newCar.brand);
    expect(created.model).toBe(newCar.model);
    expect(created.isAvailableForRent).toBe(true);

    // Weryfikacja: auto jest widoczne w GET /cars
    const listRes = await request.get(`${API}/cars`);
    const list = await listRes.json() as Array<{ id: number }>;
    const found = list.find((c) => c.id === created.id);
    expect(found, 'Nowe auto powinno być widoczne w GET /cars').toBeDefined();

    // Sprzątanie
    await request.delete(`${API}/cars/${created.id}`);
  });

  /**
   * [A04] Aktualizacja ceny auta przez dealera
   * Scenariusz UI: R4 (Admin modyfikuje dane auta), R14 (zmiana ceny widoczna dla klienta)
   * Cel: PUT /cars/:id zmienia cenę, GET /cars/:id potwierdza zmianę w bazie danych
   */
  test('[A04] PUT /cars/:id aktualizuje cenę – GET /cars/:id potwierdza zmianę', async ({ request }) => {
    await loginAs(request);
    const car = await createTestCar(request, { price: 70000 });

    const newPrice = 62500;
    const updateRes = await request.put(`${API}/cars/${car.id}`, {
      data: { price: newPrice },
    });
    expect(updateRes.status()).toBe(200);
    const updated = await updateRes.json() as { price: number };
    expect(updated.price).toBe(newPrice);

    // Weryfikacja przez GET
    const getRes = await request.get(`${API}/cars/${car.id}`);
    expect(getRes.status()).toBe(200);
    const fetched = await getRes.json() as { price: number };
    expect(fetched.price).toBe(newPrice);

    // Sprzątanie
    await request.delete(`${API}/cars/${car.id}`);
  });

  /**
   * [A05] Usunięcie auta przez dealera
   * Scenariusz UI: R1 (zarządzanie pulą aut dealera)
   * Cel: DELETE /cars/:id usuwa auto, kolejne GET /cars/:id zwraca 404
   */
  test('[A05] DELETE /cars/:id usuwa auto – GET /cars/:id zwraca 404', async ({ request }) => {
    await loginAs(request);
    const car = await createTestCar(request);

    // Upewnij się że auto istnieje
    const beforeRes = await request.get(`${API}/cars/${car.id}`);
    expect(beforeRes.status()).toBe(200);

    // Usuń
    const deleteRes = await request.delete(`${API}/cars/${car.id}`);
    expect(deleteRes.status()).toBe(200);
    const deleteBody = await deleteRes.json() as { message: string };
    expect(deleteBody.message).toMatch(/usunięty|usunięto/i);

    // Weryfikacja braku
    const afterRes = await request.get(`${API}/cars/${car.id}`);
    expect(afterRes.status()).toBe(404);
  });

  /**
   * [A06] Walidacja – za krótki VIN blokuje zapis
   * Scenariusz UI: R6 – formularz blokuje zapis niepoprawnych danych
   * Cel: backend odrzuca POST /cars gdy VIN ma mniej niż 17 znaków
   */
  test('[A06] POST /cars zwraca 400 gdy VIN ma złą długość (< 17 znaków)', async ({ request }) => {
    await loginAs(request);

    const res = await request.post(`${API}/cars`, {
      data: {
        brand: 'TestBrand',
        model: 'TestModel',
        year: 2020,
        vin: 'ZBYT_KROTKI', // 11 znaków zamiast 17
        price: 50000,
        horsePower: 150,
        isAvailableForRent: true,
      },
    });

    expect(res.status()).toBe(400);
    const body = await res.json() as { errors: Array<{ msg: string }> };
    expect(body).toHaveProperty('errors');
    expect(body.errors.length).toBeGreaterThan(0);
    const vinError = body.errors.find((e) => e.msg.toLowerCase().includes('vin'));
    expect(vinError, 'Powinien być błąd walidacji VIN').toBeDefined();
  });

});
