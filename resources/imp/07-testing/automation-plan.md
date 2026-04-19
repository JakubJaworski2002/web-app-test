# Plan Automatyzacji Testów

## Architektura POM (Page Object Model)

```
Playwright/
├── pages/
│   ├── cars-list.page.ts      — Lista samochodów
│   ├── car-detail.page.ts     — Szczegóły samochodu
│   ├── auth.page.ts           — Logowanie/Rejestracja
│   └── base.page.ts           — Bazowa klasa
├── data/
│   ├── test-cars.factory.ts   — Fabryka danych testowych
│   └── test-users.factory.ts  — Fabryka użytkowników
├── tests/
│   ├── api/                   — 15 testów API ✅
│   ├── mock/                  — 15 testów mock ✅
│   └── auth/                  — 15 testów auth ✅
```

## Przykład Page Object

```typescript
// pages/cars-list.page.ts
import { type Page, type Locator } from '@playwright/test';

export class CarsListPage {
    readonly page: Page;
    readonly searchInput: Locator;
    readonly carCards: Locator;
    readonly addCarButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.searchInput = page.locator('[placeholder*="Szukaj"]').first();
        this.carCards = page.locator('.card, [data-testid="car-card"]');
        this.addCarButton = page.getByText('Dodaj Samochód');
    }

    async goto() {
        await this.page.goto('/cars');
    }

    async searchByBrand(brand: string) {
        await this.searchInput.fill(brand);
        await this.page.waitForTimeout(300); // debounce
    }

    async getCarCount(): Promise<number> {
        return await this.carCards.count();
    }
}
```

## Data Factory

```typescript
// data/test-cars.factory.ts
export const createTestCar = (overrides = {}) => ({
    brand: 'TestBrand',
    model: 'TestModel',
    year: 2023,
    price: 50000,
    horsePower: 150,
    vin: `VIN-TEST-${Date.now()}`,
    isAvailableForRent: true,
    ...overrides
});
```

## Planowane Testy (+30)

### Seria E2E UI (do implementacji)
| ID | Tytuł | Priorytet |
|----|-------|-----------|
| U01 | Pełny user journey: przegląd → wynajem → zwrot | Wysoki |
| U02 | Dealer: dodaj → edytuj → usuń samochód | Wysoki |
| U03 | Rejestracja nowego użytkownika end-to-end | Wysoki |
| U04 | Filtrowanie listy samochodów | Średni |
| U05 | Kalkulacja leasingu — formula check | Średni |
| U06 | Zakup samochodu (zmiana statusu) | Wysoki |
| U07 | Upload zdjęcia samochodu | Średni |
| U08 | Sesja wygasa → redirect do logowania | Wysoki |
| U09 | Responsywność — mobile viewport | Niski |
| U10 | Nawigacja breadcrumb | Niski |

## Anti-patterns do Unikania

```typescript
// ❌ ŹLE — test zależy od kolejności innych testów
test('Edytuj samochód', async ({ page }) => {
    // Zakłada że poprzedni test dodał samochód!
});

// ✅ DOBRZE — test jest samodzielny (tworzy własne dane przez API)
test('Edytuj samochód', async ({ request, page }) => {
    const car = await request.post('/api/v1/cars', { data: createTestCar() });
    // ...test...
    await request.delete(`/api/v1/cars/${car.id}`); // cleanup
});

// ❌ ŹLE — hardcoded waits
await page.waitForTimeout(3000);

// ✅ DOBRZE — wait for element
await page.waitForSelector('.car-card', { state: 'visible' });
```

## CI Integration

```yaml
# .github/workflows/playwright.yml (fragment)
- name: Run all Playwright tests
  run: npx playwright test
  working-directory: Playwright
  
- name: Upload test report
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: playwright-report
    path: Playwright/playwright-report/
```
