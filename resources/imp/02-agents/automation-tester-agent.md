# Agent: Automation QA Tester (Playwright)

## Profil Roli

| Atrybut | Wartość |
|---------|---------|
| **Rola** | Automation QA Engineer — Playwright Specialist |
| **Stack** | Playwright, TypeScript, POM pattern, CI/CD |
| **Odpowiada za** | `Playwright/tests/` — 60+ testów |

---

## Obecny Inwentarz Testów

| Folder | Pliki | Testy | Technika |
|--------|-------|-------|---------|
| `tests/` (root) | Case_1–15 | 15 UI | page.goto, locators |
| `tests/api/` | 3 pliki | 15 API | request fixture |
| `tests/mock/` | 4 pliki | 15 Mock | page.route() |
| `tests/auth/` | 4 pliki | 15 Auth | storageState |
| **Razem** | **26 plików** | **60 testów** | — |

---

## Page Object Model — Implementacja

```typescript
// Playwright/tests/pages/CarListPage.ts
import { Page, Locator } from '@playwright/test';

export class CarListPage {
    readonly page: Page;
    readonly brandSearchInput: Locator;
    readonly carCards: Locator;
    readonly addCarButton: Locator;
    readonly loginButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.brandSearchInput = page.locator('input[placeholder*="marka"], input[placeholder*="brand"]').first();
        this.carCards = page.locator('.card');
        this.addCarButton = page.getByText('Dodaj Samochód');
        this.loginButton = page.getByText('Zaloguj się');
    }

    async goto() {
        await this.page.goto('/cars');
    }

    async filterByBrand(brand: string) {
        await this.brandSearchInput.fill(brand);
    }

    async expandCarList() {
        const listButton = this.page.getByText('Lista Samochodów').or(this.page.getByText('Pokaż'));
        await listButton.click();
    }

    async getCarCount(): Promise<number> {
        return await this.carCards.count();
    }
}
```

---

## Data Factory

```typescript
// Playwright/tests/factories/car.factory.ts
let counter = 0;

export const createCarData = (overrides: Partial<CarPayload> = {}): CarPayload => {
    counter++;
    const ts = Date.now().toString().slice(-10);
    return {
        brand: 'Toyota',
        model: `TestModel-${counter}`,
        year: 2023,
        vin: `TEST${ts}${counter.toString().padStart(3, '0')}`.slice(0, 17),
        price: 120000,
        horsePower: 150,
        isAvailableForRent: true,
        ...overrides
    };
};

interface CarPayload {
    brand: string; model: string; year: number; vin: string;
    price: number; horsePower: number; isAvailableForRent: boolean;
}
```

---

## Plan Rozbudowy (+30 testów)

### Nowe testy UI (10)
- P01: CarDetail — nawigacja do `/cars/:id` i weryfikacja danych
- P02: EditCar — formularz edycji samochodu przez dealera
- P03: AddCustomer — modal dodawania klienta
- P04: CustomerList — wyświetlanie listy klientów
- P05: RentCar — pełny flow wynajmu przez klienta
- P06: BuyCar — pełny flow zakupu
- P07: LeasingCalc — kalkulator leasingu UI
- P08: UploadImage — upload zdjęcia do samochodu
- P09: MobileViewport — responsywność (iPhone 12)
- P10: NavigationFlow — breadcrumb i routing

### Nowe testy API (10) — po wdrożeniu /api/v1/
- PA01: GET /api/v1/cars?page=1&limit=5
- PA02: GET /api/v1/cars?brand=Toyota
- PA03: GET /api/v1/cars?minPrice=50000&maxPrice=200000
- PA04: GET /api/v1/cars?sort=price&order=desc
- PA05: GET /health → 200 OK
- PA06: POST /api/v1/transactions — historia transakcji
- PA07: PUT /users/:id — edycja klienta
- PA08: DELETE /users/:id — usunięcie klienta
- PA09: Rate limit — 11. żądanie POST /login → 429
- PA10: GET /api/v1/cars/:id/availability

### Nowe testy Auth (10)
- SA01: Wygasła sesja → przekierowanie
- SA02: Klient próbuje akcji dealera → 403
- SA03: Refresh strony z ważną sesją
- SA04: Logout przez API → storageState usunięty
- SA05: Multi-tab consistency
- SA06: Session timeout
- SA07: Parallel requests z tym samym storageState
- SA08: Public context — brak przycisku "Dodaj Samochód"
- SA09: Admin context — widoczne przyciski zarządzania
- SA10: Cookie flags (HttpOnly, SameSite)

---

## Anti-Patterns Do Unikania

```typescript
// ❌ ŹLE: hardcoded sleep
await page.waitForTimeout(3000);

// ✅ DOBRZE: czekaj na konkretny warunek
await page.waitForResponse(r => r.url().includes('/cars'));
await expect(page.locator('.card')).toHaveCount(5);

// ❌ ŹLE: fragile CSS selector
page.locator('div.col-md-4 > div > div:nth-child(2) button')

// ✅ DOBRZE: semantic selector
page.getByRole('button', { name: 'Wynajmij' })
page.getByTestId('rent-button')
```

---

## Reusable Prompt

```
Jesteś doświadczonym Automation QA Engineer specjalizującym się w Playwright.

PROJEKT: Salon Samochodowy
PLAYWRIGHT CONFIG: Playwright/playwright.config.ts
  - 3 projekty: setup, chromium (storageState), chromium-public
  - baseURL: http://localhost:4200
  - Admin auth: Playwright/.auth/admin.json (tworzy global.setup.ts)

ISTNIEJĄCE TESTY:
- 15 Case_X UI tests (Playwright/tests/Case_*.spec.ts)
- 15 API tests (Playwright/tests/api/) — używają request fixture
- 15 Mock tests (Playwright/tests/mock/) — używają page.route()
- 15 Auth tests (Playwright/tests/auth/) — używają storageState

DANE TESTOWE:
- Admin: username=admin, password=Admin1!, isDealer=true
- Backend: http://localhost:3000
- VIN musi mieć dokładnie 17 znaków

Twoje zadanie: [OPISZ TEST DO NAPISANIA]

Wymagania:
- Używaj POM jeśli test jest wielostronicowy
- Używaj data factory do generowania danych testowych
- Brak hardcoded sleep() — używaj waitFor* lub expect().toBeVisible()
- Dodaj komentarz z ID testu (np. // PA01)
- Testy muszą być idempotentne (cleanup po sobie)
```
