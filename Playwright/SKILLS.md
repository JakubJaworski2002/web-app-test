# Przewodnik po umiejętnościach Playwright – Salon Samochodowy 🚗

Dokument dla studentów zawierający praktyczne porady, techniki zaawansowane i wskazówki do dalszego rozwoju projektu testowego.

---

## Spis treści
1. [Testowanie API z fixture `request`](#1-testowanie-api-z-fixture-request)
2. [Mockowanie danych z `page.route()`](#2-mockowanie-danych-z-pageroute)
3. [Zarządzanie sesją (StorageState)](#3-zarządzanie-sesją-storagestate)
4. [Debugowanie testów](#4-debugowanie-testów)
5. [Rozszerzanie pomocników (utils)](#5-rozszerzanie-pomocników-utils)
6. [Best Practices](#6-best-practices)
7. [Przydatne komendy](#7-przydatne-komendy)

---

## 1. Testowanie API z fixture `request`

### Czym jest fixture `request`?

Playwright udostępnia wbudowany fixture `request`, który daje dostęp do obiektu `APIRequestContext`. Pozwala on wykonywać zapytania HTTP bezpośrednio do backendu, **bez uruchamiania przeglądarki**. Jest to idealne do:
- Testowania logiki backendowej (walidacja, autoryzacja)
- Weryfikacji struktury odpowiedzi JSON
- Przygotowania danych testowych przez API (zamiast przez UI)

### Podstawowe użycie

```typescript
import { test, expect } from '@playwright/test';

test('GET /cars zwraca listę samochodów', async ({ request }) => {
  const response = await request.get('http://localhost:3000/cars');
  
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(Array.isArray(body)).toBeTruthy();
});
```

### Logowanie przez API (zarządzanie sesją w testach API)

Ponieważ backend używa sesji (ciasteczek), fixture `request` automatycznie zarządza ciasteczkami w ramach jednego testu:

```typescript
test('Admin może dodać samochód', async ({ request }) => {
  // Krok 1: Zaloguj się – Playwright zapisze cookie sesji
  const loginRes = await request.post('http://localhost:3000/login', {
    data: { username: 'admin', password: 'Admin1!' }
  });
  expect(loginRes.status()).toBe(200);
  
  // Krok 2: Wywołaj chroniony endpoint – cookie jest automatycznie dołączone
  const carsRes = await request.post('http://localhost:3000/cars', {
    data: {
      brand: 'TestBrand',
      model: 'TestModel',
      year: 2023,
      vin: 'AAAAAAAAAAAAAAAAA',
      price: 50000,
      horsePower: 150,
      isAvailableForRent: true,
    }
  });
  expect(carsRes.status()).toBe(201);
});
```

### Metody APIRequestContext

| Metoda | Opis | Przykład |
|--------|------|---------|
| `request.get(url)` | Zapytanie GET | Pobierz listę aut |
| `request.post(url, {data})` | Zapytanie POST z JSON body | Logowanie, tworzenie |
| `request.put(url, {data})` | Zapytanie PUT | Aktualizacja |
| `request.delete(url)` | Zapytanie DELETE | Usuwanie |
| `response.status()` | Kod HTTP odpowiedzi | `expect(res.status()).toBe(200)` |
| `response.json()` | Parsuj body jako JSON | `const data = await res.json()` |
| `response.ok()` | Czy status 2xx? | `expect(res.ok()).toBeTruthy()` |
| `response.headers()` | Nagłówki odpowiedzi | Sprawdź Content-Type |

### Tworzenie niezależnego APIRequestContext

Kiedy potrzebujesz osobnej sesji (np. dwóch różnych użytkowników):

```typescript
import { test, expect, request as apiRequest } from '@playwright/test';

test('Dwa niezależne konteksty API', async () => {
  // Kontekst admina
  const adminCtx = await apiRequest.newContext({
    baseURL: 'http://localhost:3000'
  });
  await adminCtx.post('/login', { data: { username: 'admin', password: 'Admin1!' } });
  
  // Kontekst klienta
  const clientCtx = await apiRequest.newContext({
    baseURL: 'http://localhost:3000'
  });
  await clientCtx.post('/login', { data: { username: 'klient', password: 'Haslo123!' } });
  
  // Sprzątanie
  await adminCtx.dispose();
  await clientCtx.dispose();
});
```

---

## 2. Mockowanie danych z `page.route()`

### Czym jest mockowanie?

Mockowanie (`page.route()`) pozwala **przechwytywać zapytania HTTP** wychodzące z przeglądarki i zastępować je kontrolowanymi odpowiedziami. Używamy tego gdy:
- Backend jest niestabilny lub niedostępny
- Chcemy przetestować obsługę błędów (404, 500)
- Chcemy użyć deterministycznych danych testowych
- Chcemy przyspieszyć testy (brak prawdziwych zapytań)

### Podstawowe przechwytywanie

```typescript
test('Mock listy aut', async ({ page }) => {
  // Zdefiniuj mock PRZED przejściem na stronę
  await page.route('http://localhost:3000/cars', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, brand: 'Toyota', model: 'Supra', year: 2023, price: 300000 }
      ]),
    });
  });
  
  await page.goto('http://localhost:4200/cars');
  
  // UI wyświetli nasze mockowane dane
  await expect(page.locator('.card').filter({ hasText: 'Toyota' })).toBeVisible();
});
```

### Wzorce URL w page.route()

```typescript
// Dokładny URL
await page.route('http://localhost:3000/cars', handler);

// Wildcard – wszystkie zapytania do /cars/*
await page.route('http://localhost:3000/cars/**', handler);

// Glob – wszystkie zapytania do localhost:3000
await page.route('http://localhost:3000/**', handler);

// RegExp
await page.route(/\/cars\/\d+\/leasing$/, handler);
```

### Symulacja błędów

```typescript
// Błąd serwera (500)
await page.route('http://localhost:3000/cars', (route) => {
  route.fulfill({ status: 500, body: JSON.stringify({ error: 'Server Error' }) });
});

// Brak zasobu (404)
await page.route('http://localhost:3000/cars/9999', (route) => {
  route.fulfill({ status: 404, body: JSON.stringify({ error: 'Not Found' }) });
});

// Przerwanie połączenia
await page.route('http://localhost:3000/cars', (route) => {
  route.abort('failed');
});

// Timeout
await page.route('http://localhost:3000/cars', (route) => {
  route.abort('connectiontimedout');
});
```

### Modyfikacja prawdziwej odpowiedzi

```typescript
await page.route('http://localhost:3000/cars', async (route) => {
  // Pobierz prawdziwą odpowiedź
  const response = await route.fetch();
  const cars = await response.json();
  
  // Zmodyfikuj dane
  if (cars.length > 0) {
    cars[0].brand = 'ZMODYFIKOWANA_MARKA';
  }
  
  // Zwróć zmodyfikowane dane
  await route.fulfill({
    response,  // zachowaj oryginalne nagłówki
    body: JSON.stringify(cars),
    contentType: 'application/json',
  });
});
```

### Liczenie wywołań API

```typescript
let apiCallCount = 0;

await page.route('http://localhost:3000/cars', async (route) => {
  apiCallCount++;
  await route.continue(); // przepuść do prawdziwego backendu
});

await page.goto('http://localhost:4200/cars');
expect(apiCallCount).toBe(1); // UI powinno wywołać /cars tylko raz
```

---

## 3. Zarządzanie sesją (StorageState)

### Problem: Wolne UI login w każdym teście

Standardowy scenariusz: każdy test klika "Zaloguj się", wypełnia formularz, czeka na odpowiedź. Przy 15 testach to 15 × ~3 sekundy = ~45 sekund tylko na logowanie.

### Rozwiązanie: storageState

Playwright pozwala zapisać stan przeglądarki (ciasteczka, localStorage) do pliku JSON i wczytać go na początku każdego testu. Test startuje jako **już zalogowany użytkownik**.

### Konfiguracja globalSetup

W `playwright.config.ts`:
```typescript
export default defineConfig({
  // ...
  projects: [
    // 1. Projekt setup – uruchamia global.setup.ts PRZED testami
    {
      name: 'setup',
      testMatch: '**/setup/global.setup.ts',
    },
    // 2. Projekt testów – korzysta ze zapisanego stanu
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/admin.json', // 👈 załaduj stan admina
      },
      dependencies: ['setup'], // 👈 najpierw uruchom setup
    },
  ],
});
```

### Plik global.setup.ts

```typescript
import { test as setup, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

export const ADMIN_AUTH_FILE = path.join(__dirname, '../.auth/admin.json');

setup('authenticate as admin', async ({ page }) => {
  // Upewnij się, że katalog .auth istnieje
  fs.mkdirSync(path.dirname(ADMIN_AUTH_FILE), { recursive: true });
  
  await page.goto('http://localhost:4200/cars');
  
  await page.getByRole('button', { name: 'Zaloguj się' }).first().click();
  
  const dialog = page.getByRole('dialog', { name: 'Logowanie' });
  await expect(dialog).toBeVisible({ timeout: 10000 });
  
  await dialog.locator('#username').fill('admin');
  await dialog.locator('#password').fill('Admin1!');
  await dialog.getByRole('button', { name: 'Zaloguj się' }).click();
  
  await expect(page.getByRole('button', { name: 'Wyloguj się' })).toBeVisible({ timeout: 15000 });
  
  // 💾 Zapisz stan sesji (ciasteczka)
  await page.context().storageState({ path: ADMIN_AUTH_FILE });
});
```

### Kiedy NIE używać storageState

Niektóre testy celowo testują niezalogowany stan lub potrzebują świeżego konta:
- `Case_5_AG` – testuje brak dostępu dla niezalogowanego użytkownika
- `Case_7_NJ` – rejestracja nowego użytkownika
- Testy z `browser.newContext()` – już tworzą nowy, czysty kontekst

Dla takich testów używaj oddzielnego projektu bez `storageState`:
```typescript
{
  name: 'chromium-public',
  use: { ...devices['Desktop Chrome'] },
  testMatch: ['**/Case_5_AG.spec.ts', '**/Case_7_NJ.spec.ts'],
}
```

### Wielokrotne role (admin + klient)

```typescript
// setup/global.setup.ts
setup('authenticate admin', async ({ page }) => {
  // ... logowanie jako admin
  await page.context().storageState({ path: '.auth/admin.json' });
});

setup('authenticate customer', async ({ page }) => {
  // ... logowanie jako klient (jeśli mamy stałe konto testowe)
  await page.context().storageState({ path: '.auth/customer.json' });
});
```

---

## 4. Debugowanie testów

### Narzędzia do debugowania

#### Playwright Inspector (krok po kroku)
```bash
npx playwright test --debug
```
Otwiera okno debuggera – możesz kroczyć przez test, obserwować akcje na przeglądarce.

#### Tryb headed (z przeglądarką)
```bash
npx playwright test --headed
```

#### Wolniejsze wykonanie
```bash
npx playwright test --headed --slow-mo=1000
```
Każda akcja jest opóźniona o 1000ms.

#### Trace Viewer – pełne nagranie testu
```bash
npx playwright test --trace on
npx playwright show-report
```

### Debugowanie w kodzie

```typescript
test('debug example', async ({ page }) => {
  await page.goto('http://localhost:4200/cars');
  
  // Zatrzymaj test i otwórz Inspector
  await page.pause();
  
  // Zrób screenshot
  await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
  
  // Loguj do konsoli (widoczne z --debug lub --headed)
  console.log(await page.title());
  
  // Sprawdź co jest w DOM
  const html = await page.locator('body').innerHTML();
  console.log(html.substring(0, 500));
});
```

### Najczęstsze błędy i rozwiązania

| Błąd | Przyczyna | Rozwiązanie |
|------|-----------|-------------|
| `Timeout exceeded waiting for element` | Element nie pojawił się w czasie | Zwiększ timeout, sprawdź selektor |
| `Element not found` | Zły selektor | Użyj Playwright Inspector |
| `ERR_CONNECTION_REFUSED` | Backend/frontend nie działa | Uruchom serwery przed testami |
| `Modal-backdrop blocking click` | Bootstrap modal overlay | Użyj `.waitFor({ state: 'hidden' })` |
| `Test passed but shouldn't` | Zbyt luźny warunek | Bądź bardziej precyzyjny w asercjach |

---

## 5. Rozszerzanie pomocników (utils)

### Struktura utils

```
utils/
├── auth.utils.ts       ← logowanie/wylogowywanie przez UI
├── car.utils.ts        ← dodawanie/edytowanie samochodów
├── customer.utils.ts   ← zarządzanie klientami
├── dialog.utils.ts     ← obsługa dialogów
├── leasing.utils.ts    ← kalkulator leasingowy
└── transaction.utils.ts ← kupno/wynajem/zwrot
```

### Wzorzec tworzenia nowego utils

```typescript
// utils/search.utils.ts
import { Page } from '@playwright/test';

export interface SearchOptions {
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
}

export async function searchCars(page: Page, options: SearchOptions): Promise<void> {
  if (options.brand) {
    await page.getByPlaceholder('Wyszukaj markę').fill(options.brand);
  }
  // Dodatkowe filtry...
}

export async function clearSearch(page: Page): Promise<void> {
  await page.getByPlaceholder('Wyszukaj markę').clear();
}
```

### Wzorzec dla API utils (z request fixture)

```typescript
// utils/api.utils.ts
import { APIRequestContext } from '@playwright/test';

const API_BASE = 'http://localhost:3000';

export async function apiLogin(
  request: APIRequestContext,
  username: string,
  password: string
): Promise<void> {
  const res = await request.post(`${API_BASE}/login`, {
    data: { username, password }
  });
  if (!res.ok()) {
    throw new Error(`Login failed: ${res.status()}`);
  }
}

export async function apiCreateCar(
  request: APIRequestContext,
  carData: Record<string, unknown>
): Promise<{ id: number }> {
  const res = await request.post(`${API_BASE}/cars`, { data: carData });
  if (res.status() !== 201) {
    throw new Error(`Create car failed: ${res.status()}`);
  }
  return res.json();
}
```

---

## 6. Best Practices

### ✅ Dobre praktyki

1. **Używaj storageState** – loguj się raz, nie w każdym teście
2. **Izoluj testy** – każdy test powinien działać niezależnie
3. **Unikaj hardcoded timeoutów** (`await page.waitForTimeout(3000)`) – używaj warunków
4. **Używaj selektorów roli** (`getByRole`, `getByLabel`) zamiast CSS selektorów
5. **Mockuj zewnętrzne zależności** – testy UI nie powinny zależeć od stabilności backendu
6. **Testuj API osobno** – nie testuj logiki backendowej przez UI
7. **Używaj `baseURL`** – nie hardcoduj `http://localhost:4200` w każdym teście

### ❌ Anty-wzorce do unikania

```typescript
// ❌ Zły: hardcoded URL
await page.goto('http://localhost:4200/cars');

// ✅ Dobry: używaj baseURL z config
await page.goto('/cars');

// ❌ Zły: sleep zamiast wait
await page.waitForTimeout(3000);

// ✅ Dobry: czekaj na konkretny warunek
await expect(page.locator('.card')).toBeVisible();

// ❌ Zły: zbyt ogólny selektor
await page.locator('button').click();

// ✅ Dobry: precyzyjny selektor
await page.getByRole('button', { name: 'Dodaj Samochód' }).click();

// ❌ Zły: UI login w każdym teście
test.beforeEach(async ({ page }) => {
  await login(page, adminCredentials);
});

// ✅ Dobry: storageState w playwright.config.ts
// (globalny, nie powtarzany)
```

### Struktura dobrego testu

```typescript
test.describe('[R1] Scenariusz: Opis', () => {
  // Zmienne testowe na górze describe (nie global)
  const testData = {
    brand: `TestBrand_${Date.now()}`,
    // ...
  };

  // Setup przed każdym testem (jeśli potrzebne)
  test.beforeEach(async ({ page }) => {
    await page.goto('/cars');
  });

  // Test: Arrange → Act → Assert
  test('opis w języku biznesowym', async ({ page }) => {
    // Arrange: przygotuj dane
    // Act: wykonaj akcję
    // Assert: sprawdź wynik
  });
});
```

---

## 7. Przydatne komendy

```bash
# Uruchom wszystkie testy
npx playwright test

# Uruchom konkretny plik
npx playwright test tests/Case_1_JJ.spec.ts

# Uruchom z przeglądarką (headed)
npx playwright test --headed

# Uruchom tylko testy API
npx playwright test tests/api.spec.ts

# Uruchom z debuggerem
npx playwright test --debug

# Pokaż raport HTML
npx playwright show-report

# Lista wszystkich testów
npx playwright test --list

# Uruchom testy pasujące do frazy
npx playwright test --grep "API"

# Uruchom testy określonego projektu
npx playwright test --project=chromium

# Nagraj trace dla wszystkich testów
npx playwright test --trace on

# Uruchom tylko setup
npx playwright test --project=setup
```

---

## Struktura pliku api.spec.ts (szablon)

```typescript
import { test, expect, APIRequestContext } from '@playwright/test';

const API_BASE = 'http://localhost:3000';

// Helper do logowania
async function loginAs(request: APIRequestContext, user: {username: string, password: string}) {
  const res = await request.post(`${API_BASE}/login`, { data: user });
  expect(res.status()).toBe(200);
}

test.describe('Nazwa grupy testów', () => {
  test('opis scenariusza', async ({ request }) => {
    // Opcjonalnie: zaloguj się
    await loginAs(request, { username: 'admin', password: 'Admin1!' });
    
    // Wywołaj endpoint
    const res = await request.get(`${API_BASE}/endpoint`);
    
    // Sprawdź status
    expect(res.status()).toBe(200);
    
    // Sprawdź body
    const body = await res.json();
    expect(body).toHaveProperty('klucz');
    expect(body.wartość).toBe('oczekiwana');
  });
});
```

---

*Dokument wygenerowany dla projektu AiTSI – Salon Samochodowy | Playwright Testing*
