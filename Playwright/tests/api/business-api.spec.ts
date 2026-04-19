/**
 * Testy API – Scenariusze biznesowe (leasing, wynajem, zakup)
 *
 * Playlista: A11–A15
 * Pokryte scenariusze UI:
 *   R2 (leasing + zakup), R3 (wynajem), R8/R11 (konflikt wynajmu),
 *   R9 (porównanie leasingu), R10/R13/R15 (zakup auta przez klienta)
 *
 * Technika: fixture 'request' – testowanie logiki biznesowej bez przeglądarki
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
  return `BIZ${clean}ABCD`.slice(0, 17).toUpperCase();
}

async function createAndLoginCustomer(request: APIRequestContext) {
  await loginAs(request);
  const s = uniqueSuffix();
  const customer = {
    username: `buyer${s}`,
    email: `buyer${s}@test.com`,
    password: 'Klient123!',
    firstName: 'Jan',
    lastName: 'Testowy',
  };
  const res = await request.post(`${API}/admin/create-customer`, { data: customer });
  expect(res.status()).toBe(201);
  await request.post(`${API}/logout`);
  await request.post(`${API}/login`, {
    data: { username: customer.username, password: customer.password },
  });
  return customer;
}

test.describe('API – Scenariusze biznesowe', () => {

  /**
   * [A11] Kalkulator leasingowy – poprawna rata miesięczna
   * Scenariusz UI: R2 (klient oblicza leasing i kupuje auto), R9 (porównanie leasingu)
   * Cel: weryfikacja algorytmu: monthlyRate = (cena - wpłata) / miesiące
   * Przykład: cena=100000, wpłata=20000, 24 miesiące → rata=3333.33
   */
  test('[A11] POST /cars/:id/leasing – rata miesięczna = (cena - wpłata) / miesiące', async ({ request }) => {
    await loginAs(request);

    const s = uniqueSuffix();
    const carPrice = 100000;
    const createRes = await request.post(`${API}/cars`, {
      data: {
        brand: `LeasingBrand${s}`,
        model: `LeasingModel${s}`,
        year: 2023,
        vin: makeVin(s),
        price: carPrice,
        horsePower: 200,
        isAvailableForRent: true,
      },
    });
    const car = await createRes.json() as { id: number };

    const downPayment = 20000;
    const months = 24;
    const leasingRes = await request.post(`${API}/cars/${car.id}/leasing`, {
      data: { downPayment, months },
    });

    expect(leasingRes.status()).toBe(200);
    const body = await leasingRes.json() as {
      carId: number;
      totalPrice: number;
      downPayment: number;
      remainingAmount: string;
      months: number;
      monthlyRate: string;
    };

    expect(body.carId).toBe(car.id);
    expect(body.totalPrice).toBe(carPrice);
    expect(body.downPayment).toBe(downPayment);
    expect(body.months).toBe(months);

    const expectedRemaining = carPrice - downPayment; // 80000
    const expectedMonthly = expectedRemaining / months; // 3333.333...
    expect(parseFloat(body.remainingAmount)).toBeCloseTo(expectedRemaining, 2);
    expect(parseFloat(body.monthlyRate)).toBeCloseTo(expectedMonthly, 2);

    // Sprzątanie
    await request.delete(`${API}/cars/${car.id}`);
  });

  /**
   * [A12] Kalkulator leasingowy – wpłata większa od ceny auta
   * Scenariusz UI: R2 – walidacja kalkulatora leasingowego
   * Cel: backend musi odrzucić request gdy wpłata własna > cena auta
   */
  test('[A12] POST /cars/:id/leasing zwraca 400 gdy wpłata własna przekracza cenę auta', async ({ request }) => {
    await loginAs(request);

    const s = uniqueSuffix();
    const carPrice = 50000;
    const createRes = await request.post(`${API}/cars`, {
      data: {
        brand: `LeaseValidBrand${s}`,
        model: `LeaseValidModel${s}`,
        year: 2022,
        vin: makeVin(s),
        price: carPrice,
        horsePower: 150,
        isAvailableForRent: true,
      },
    });
    const car = await createRes.json() as { id: number };

    const tooHighDownPayment = carPrice + 1000; // 51000 > 50000
    const res = await request.post(`${API}/cars/${car.id}/leasing`, {
      data: { downPayment: tooHighDownPayment, months: 12 },
    });

    expect(res.status()).toBe(400);
    const body = await res.json() as { error: string };
    expect(body).toHaveProperty('error');
    expect(body.error).toMatch(/większa niż cena|wpłata/i);

    // Sprzątanie
    await request.delete(`${API}/cars/${car.id}`);
  });

  /**
   * [A13] Wynajem dostępnego samochodu
   * Scenariusz UI: R3 – klient wypożycza auto, badge zmienia się na "Nie"
   * Cel: POST /cars/:id/rent zmienia isAvailableForRent na false w bazie danych
   */
  test('[A13] POST /cars/:id/rent wynajmuje dostępne auto – isAvailableForRent zmienia się na false', async ({ request }) => {
    await loginAs(request);

    const s = uniqueSuffix();
    const createRes = await request.post(`${API}/cars`, {
      data: {
        brand: `RentBrand${s}`,
        model: `RentModel${s}`,
        year: 2023,
        vin: makeVin(s),
        price: 45000,
        horsePower: 160,
        isAvailableForRent: true,
      },
    });
    const car = await createRes.json() as { id: number; isAvailableForRent: boolean };
    expect(car.isAvailableForRent).toBe(true);

    // Wynajmij jako admin
    const rentRes = await request.post(`${API}/cars/${car.id}/rent`);
    expect(rentRes.status()).toBe(200);
    const rentBody = await rentRes.json() as { message: string; car: { isAvailableForRent: boolean; renterId: number } };
    expect(rentBody.message).toMatch(/wynajęty/i);
    expect(rentBody.car.isAvailableForRent).toBe(false);
    expect(rentBody.car.renterId).toBeTruthy();

    // Weryfikacja przez GET
    const getRes = await request.get(`${API}/cars/${car.id}`);
    const fetched = await getRes.json() as { isAvailableForRent: boolean };
    expect(fetched.isAvailableForRent).toBe(false);

    // Sprzątanie – zwróć auto przed usunięciem
    await request.post(`${API}/cars/${car.id}/return`);
    await request.delete(`${API}/cars/${car.id}`);
  });

  /**
   * [A14] Konflikt wynajmu – Klient B nie może wynająć auta zajętego przez Klienta A
   * Scenariusz UI: R8 (walidacja wynajmu), R11 (drugi klient próbuje wynająć)
   * Cel: drugi POST /cars/:id/rent na zajęte auto zwraca 400 z komunikatem błędu
   */
  test('[A14] Drugi POST /cars/:id/rent na zajęte auto zwraca 400 – konflikt wynajmu', async ({ request }) => {
    await loginAs(request);

    const s = uniqueSuffix();
    const createRes = await request.post(`${API}/cars`, {
      data: {
        brand: `ConflictBrand${s}`,
        model: `ConflictModel${s}`,
        year: 2021,
        vin: makeVin(s),
        price: 38000,
        horsePower: 130,
        isAvailableForRent: true,
      },
    });
    const car = await createRes.json() as { id: number };

    // Pierwszy wynajem przez admina – sukces
    const firstRent = await request.post(`${API}/cars/${car.id}/rent`);
    expect(firstRent.status()).toBe(200);

    // Drugi wynajem przez admina – musi się nie udać
    const secondRent = await request.post(`${API}/cars/${car.id}/rent`);
    expect(secondRent.status()).toBe(400);

    const errBody = await secondRent.json() as { error: string };
    expect(errBody).toHaveProperty('error');
    expect(errBody.error).toMatch(/już wynajęty/i);

    // Sprzątanie
    await request.post(`${API}/cars/${car.id}/return`);
    await request.delete(`${API}/cars/${car.id}`);
  });

  /**
   * [A15] Zakup samochodu przez klienta
   * Scenariusz UI: R10 (pełna ścieżka admin+klient), R13 (filtr+zakup), R15 (minimalny profil)
   * Cel: POST /cars/:id/buy ustawia ownerId, GET /cars/:id potwierdza właściciela
   */
  test('[A15] POST /cars/:id/buy kupuje auto – GET /cars/:id zwraca ownerId klienta', async ({ request }) => {
    // Krok 1: Admin tworzy auto
    await loginAs(request);

    const s = uniqueSuffix();
    const createRes = await request.post(`${API}/cars`, {
      data: {
        brand: `BuyBrand${s}`,
        model: `BuyModel${s}`,
        year: 2024,
        vin: makeVin(s),
        price: 75000,
        horsePower: 220,
        isAvailableForRent: true,
      },
    });
    const car = await createRes.json() as { id: number };

    // Krok 2: Admin tworzy klienta
    const customerSuffix = uniqueSuffix();
    const customerData = {
      username: `klient${customerSuffix}`,
      email: `klient${customerSuffix}@test.com`,
      password: 'Klient123!',
      firstName: 'Marek',
      lastName: 'Kupiec',
    };
    const createCustomer = await request.post(`${API}/admin/create-customer`, { data: customerData });
    expect(createCustomer.status()).toBe(201);
    const newCustomer = await createCustomer.json() as { user: { id: number } };
    const customerId = newCustomer.user.id;

    // Krok 3: Admin wylogowuje się, klient loguje się
    await request.post(`${API}/logout`);
    await request.post(`${API}/login`, {
      data: { username: customerData.username, password: customerData.password },
    });

    // Krok 4: Klient kupuje auto
    const buyRes = await request.post(`${API}/cars/${car.id}/buy`);
    expect(buyRes.status()).toBe(200);
    const buyBody = await buyRes.json() as { message: string; car: { ownerId: number; isAvailableForRent: boolean } };
    expect(buyBody.message).toMatch(/kupiony/i);
    expect(buyBody.car.ownerId).toBe(customerId);
    expect(buyBody.car.isAvailableForRent).toBe(false);

    // Krok 5: Weryfikacja przez GET
    const getRes = await request.get(`${API}/cars/${car.id}`);
    const fetched = await getRes.json() as { ownerId: number };
    expect(fetched.ownerId).toBe(customerId);

    // Sprzątanie – logujemy się jako admin żeby usunąć
    await request.post(`${API}/logout`);
    await loginAs(request);
    await request.delete(`${API}/cars/${car.id}`);
  });

});
