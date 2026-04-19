# Agent Auth/StorageState – Instrukcje i Procedury 🔐

## Cel agenta

Agent Auth generuje testy Playwright używające `storageState` do zarządzania sesją uwierzytelniania. Testy startują jako **już zalogowany użytkownik**, eliminując powtarzalne UI login w każdym teście.

## Kiedy używać

✅ Testy wymagające zalogowanego użytkownika (admin lub klient)
✅ Testowanie chronionych widoków i akcji dealerskich
✅ Weryfikacja trwałości sesji (reload, nawigacja)
✅ Testy porównawcze: zalogowany vs niezalogowany
✅ Optymalizacja prędkości testów (brak UI login per test)

❌ Nie używaj gdy test celowo testuje proces logowania UI
❌ Nie używaj gdy test wymaga świeżej sesji (np. test rejestracji)

## Jak działa storageState

### 1. Global Setup (global.setup.ts)
```
setup → loguje admina przez przeglądarkę → zapisuje cookies → .auth/admin.json
```

### 2. Playwright Config
```typescript
projects: [
  { name: 'setup', testMatch: '**/global.setup.ts' },
  {
    name: 'chromium',
    use: { storageState: '.auth/admin.json' },
    dependencies: ['setup'],
  }
]
```

### 3. W pliku testowym
```typescript
import path from 'path';
const ADMIN_AUTH_FILE = path.join(__dirname, '../../.auth/admin.json');

test.use({ storageState: ADMIN_AUTH_FILE });

test('admin widzi panel dealera', async ({ page }) => {
  await page.goto('/cars');
  // Już zalogowany! Bez UI login.
  await expect(page.getByRole('button', { name: 'Dodaj Samochód' })).toBeVisible();
});
```

## Wzorzec pliku testowego

```typescript
/**
 * Testy StorageState – [Opis grupy]
 * Playlista: S01–S15
 * Technika: storageState – admin zalogowany bez UI login
 */
import { test, expect } from '@playwright/test';
import path from 'path';

const ADMIN_AUTH_FILE = path.join(__dirname, '../../.auth/admin.json');
const APP = 'http://localhost:4200';

// Wszystkie testy w tym pliku używają sesji admina
test.use({ storageState: ADMIN_AUTH_FILE });

test.describe('StorageState – [Nazwa grupy]', () => {
  /**
   * [SXX] Krótki opis
   * Scenariusz UI: RX – opis
   * Cel: co weryfikuje
   */
  test('[SXX] Opis testu', async ({ page }) => {
    await page.goto(`${APP}/cars`);
    // Test startuje jako zalogowany admin
    await expect(page.getByRole('button', { name: 'Wyloguj się' })).toBeVisible();
  });
});
```

## Tryby storageState

### Tryb 1: Zalogowany admin (normalny)
```typescript
test.use({ storageState: path.join(__dirname, '../../.auth/admin.json') });
```

### Tryb 2: Niezalogowany (pusty stan)
```typescript
test.use({ storageState: { cookies: [], origins: [] } });
```

### Tryb 3: Konkretna przeglądarka (override projektu)
```typescript
test.use({ storageState: path.join(__dirname, '../../.auth/customer.json') });
```

## Elementy UI do sprawdzenia

### Zalogowany admin (isDealer: true)
| Element | Selektor | Opis |
|---------|----------|------|
| Wyloguj się | `getByRole('button', { name: 'Wyloguj się' })` | Potwierdza zalogowanie |
| Witaj, | `getByText(/Witaj,/)` | Powitanie z imieniem |
| Dodaj Samochód | `getByRole('button', { name: 'Dodaj Samochód' })` | Panel dealera |
| Lista Klientów | `locator('button[data-bs-target="#customerListModal"]')` | Panel dealera |
| Dodaj Klienta | `locator('button[data-bs-target="#addCustomerModal"]')` | Panel dealera |

### Niezalogowany (publiczny)
| Element | Selektor | Opis |
|---------|----------|------|
| Zaloguj się | `getByRole('button', { name: 'Zaloguj się' })` | Potwierdza brak sesji |

## Procedura tworzenia testów auth

### Krok 1: Uruchom setup (raz, przed pierwszym testem)
```bash
npx playwright test --project=setup
```

### Krok 2: Sprawdź czy .auth/admin.json istnieje
```bash
# Windows
dir Playwright\.auth\
# Powinien być admin.json
```

### Krok 3: Napisz test
```typescript
test.use({ storageState: ADMIN_AUTH_FILE });
test('...', async ({ page }) => {
  await page.goto(`${APP}/cars`);
  // Bez page.fill('#username', ...) – już zalogowany!
  await expect(page.getByRole('button', { name: 'Dodaj Samochód' })).toBeVisible();
});
```

### Krok 4: Zweryfikuj brak UI login w teście
Sprawdź że test NIE wywołuje `login()` z `auth.utils.ts` – to oznacza sukces optymalizacji.

## Oszczędność czasu

| Podejście | Czas logowania per test | 15 testów |
|-----------|------------------------|-----------|
| UI login (login()) | ~3 s | ~45 s |
| storageState | ~0 s | ~0 s |
| **Oszczędność** | **~3 s** | **~45 s** |

## Checklist testów auth ✅

- [ ] Test ma ID [SXX] i komentarz z Scenariusz UI: RX
- [ ] `test.use({ storageState: ADMIN_AUTH_FILE })` na poziomie describe lub pliku
- [ ] Test NIE wywołuje `login()` z auth.utils
- [ ] `ADMIN_AUTH_FILE` to `path.join(__dirname, '../../.auth/admin.json')`
- [ ] Testy niezalogowane używają `{ cookies: [], origins: [] }`
- [ ] Test sprawdza BRAK elementów dealera dla użytkownika publicznego
- [ ] Komentarze po polsku

## Prompt agenta (do ponownego użycia)

```
Jesteś agentem auth/storageState dla projektu "Salon Samochodowy" (Playwright).
Stwórz test storageState w pliku Playwright/tests/auth/[nazwa].spec.ts.

Kontekst:
- Frontend: Angular na http://localhost:4200
- Admin auth file: path.join(__dirname, '../../.auth/admin.json')
- Technika: test.use({ storageState }) – brak UI login
- Konwencja ID: [SXX]
- Elementy UI admina: 'Wyloguj się', 'Dodaj Samochód', 'Lista Klientów', /Witaj,/

Scenariusz do przetestowania: [OPISZ SCENARIUSZ]

Wymagania:
1. Użyj test.use({ storageState: ADMIN_AUTH_FILE })
2. NIE wywołuj funkcji login() z auth.utils
3. Sprawdzaj że UI jest w stanie zalogowanym od razu
4. Komentarz z Scenariusz UI: RX
5. Język komentarzy: polski
```

## Znane pułapki

1. **Brak .auth/admin.json**: plik generuje się przez `npx playwright test --project=setup`. Bez niego wszystkie testy auth failują.
2. **Wygasła sesja**: sessions wygasają po 1 godzinie (konfiguracja backendu). Uruchom setup ponownie jeśli testy failują z powodu 401.
3. **Ścieżka do pliku**: `path.join(__dirname, '../../.auth/admin.json')` – od `tests/auth/` to dwa poziomy do `.auth/`.
4. **test.use() musi być na poziomie describe**: nie wewnątrz `test()`.
5. **Projekt chromium-public**: testy w `Case_5_AG.spec.ts` i `Case_7_NJ.spec.ts` używają projektu bez storageState – nie konfiguraj tam `test.use()`.
