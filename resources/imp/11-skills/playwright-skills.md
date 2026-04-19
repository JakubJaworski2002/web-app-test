# Przewodnik Umiejętności — Playwright

## Trzy Techniki w Tym Projekcie

### 1. request fixture — Testowanie API

```typescript
// Playwright/tests/api/cars-crud.spec.ts
import { test, expect } from '@playwright/test';

test('A01: GET /cars zwraca tablicę', async ({ request }) => {
    const response = await request.get('http://localhost:3000/cars');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
});

test('A04: POST /cars jako zalogowany admin', async ({ request }) => {
    // 1. Zaloguj się przez API
    const loginRes = await request.post('http://localhost:3000/login', {
        data: { username: 'admin', password: 'Admin1!' }
    });
    expect(loginRes.ok()).toBe(true);

    // 2. Teraz request ma cookie sesji — użyj go
    const createRes = await request.post('http://localhost:3000/cars', {
        data: {
            brand: 'Toyota', model: 'Camry', year: 2023,
            vin: 'TOY12345678901234', price: 120000,
            horsePower: 150, isAvailableForRent: true
        }
    });
    expect(createRes.status()).toBe(201);
});
```

### 2. page.route() — Mockowanie API

```typescript
// Playwright/tests/mock/cars-list-mock.spec.ts
import { test, expect } from '@playwright/test';

const MOCK_CARS = [
    { id: 1, brand: 'Toyota', model: 'Camry', year: 2023,
      price: 120000, horsePower: 150, isAvailableForRent: true,
      vin: 'TOY12345678901234' }
];

test('M01: Lista z zamockowanymi danymi', async ({ page }) => {
    // Przechwytuje żądanie PRZED nawigacją
    await page.route('**/cars', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(MOCK_CARS)
        });
    });

    await page.goto('/cars');
    // Frontend dostał mock zamiast prawdziwego API
    await expect(page.getByText('Toyota')).toBeVisible();
});

test('M03: Symulacja błędu 500', async ({ page }) => {
    await page.route('**/cars', route => {
        route.fulfill({ status: 500, body: '{"error":"Server Error"}' });
    });
    await page.goto('/cars');
    // Sprawdź czy aplikacja obsługuje błąd gracefully
});

test('M09: route.fetch() — modyfikacja odpowiedzi', async ({ page }) => {
    await page.route('**/cars', async route => {
        // Pobierz prawdziwą odpowiedź
        const response = await route.fetch();
        const cars = await response.json();
        // Zmodyfikuj — zmień cenę pierwszego samochodu
        if (cars.length > 0) cars[0].price = 999999;
        await route.fulfill({ json: cars });
    });
    await page.goto('/cars');
});
```

### 3. storageState — Zarządzanie Autentykacją

```typescript
// Playwright/tests/global.setup.ts
import { test as setup } from '@playwright/test';
import path from 'path';

const AUTH_FILE = path.join(__dirname, '../.auth/admin.json');

setup('authenticate as admin', async ({ page }) => {
    await page.goto('/cars');
    await page.getByText('Zaloguj się').click();
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'Admin1!');
    await page.getByRole('button', { name: 'Zaloguj' }).click();
    await expect(page.getByText(/Witaj,/)).toBeVisible();
    
    // Zapisz stan sesji — JEDEN RAZ dla wszystkich testów
    await page.context().storageState({ path: AUTH_FILE });
});
```

```typescript
// Playwright/tests/auth/admin-storagestate.spec.ts
import { test, expect } from '@playwright/test';
import path from 'path';

const ADMIN_AUTH = path.join(__dirname, '../../.auth/admin.json');

// Cały plik używa storageState — nie ma potrzeby logowania w każdym teście
test.use({ storageState: ADMIN_AUTH });

test('S01: Admin widzi panel dealera bez logowania przez UI', async ({ page }) => {
    await page.goto('/cars');
    // Sesja załadowana z pliku — użytkownik już zalogowany
    await expect(page.getByText('Dodaj Samochód')).toBeVisible();
});
```

---

## Anti-patterns

```typescript
// ❌ ŹLE
await page.waitForTimeout(3000);
page.locator('div > div:nth-child(3) > button');

// ✅ DOBRZE
await expect(page.locator('.car-card')).toBeVisible();
page.getByRole('button', { name: 'Wynajmij' });
```

---

## Uruchamianie

```bash
cd Playwright
npx playwright test                    # wszystkie
npx playwright test tests/api/         # tylko API
npx playwright test --ui               # interaktywny GUI
npx playwright test --debug            # debugger
npx playwright show-report             # raport HTML
```
