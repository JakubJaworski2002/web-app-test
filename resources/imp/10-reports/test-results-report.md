# Raport Wyników Testów — Salon Samochodowy

**Data:** 2026-03-29  
**Wersja testów:** 1.0 (po Fazie 1)

## Podsumowanie Suity Playwright

| Kategoria | Pliki | Testów | Technika |
|-----------|-------|--------|---------|
| UI Tests (Case_X) | 15 | 15 | page.goto + locators |
| API Tests | 3 | 15 | request fixture |
| Mock Tests | 4 | 15 | page.route() |
| Auth Tests | 4 | 15 | storageState |
| **Razem** | **26** | **60** | — |

## Konfiguracja Playwright

```typescript
// playwright.config.ts — 3 projekty
projects: [
    { name: 'setup', testMatch: '**/global.setup.ts' },
    { name: 'chromium', use: { storageState: '.auth/admin.json' }, dependencies: ['setup'] },
    { name: 'chromium-public', use: { /* bez storageState */ } }
]
```

## Testy API (A01-A15)

| ID | Tytuł | Endpoint | Oczekiwany status |
|----|-------|----------|------------------|
| A01 | GET /cars zwraca tablicę | GET /cars | 200 |
| A02 | GET /cars/:id istniejący | GET /cars/1 | 200 |
| A03 | GET /cars/:id nieistniejący | GET /cars/99999 | 404 |
| A04 | POST /cars jako admin | POST /cars | 201 |
| A05 | POST /cars bez auth | POST /cars | 401 |
| A06 | VIN validation (≠17 znaków) | POST /cars | 400 |
| A07 | Login success | POST /login | 200 |
| A08 | Login błędne hasło | POST /login | 400 |
| A09 | GET /current-user bez auth | GET /current-user | 401 |
| A10 | Logout niszczy sesję | POST /logout | 200 |
| A11 | Leasing — prawidłowe dane | POST /cars/:id/leasing | 200 |
| A12 | Leasing — wpłata > cena | POST /cars/:id/leasing | 400 |
| A13 | Rent car | POST /cars/:id/rent | 200 |
| A14 | Rent conflict | POST /cars/:id/rent | 400 |
| A15 | Buy car | POST /cars/:id/buy | 200 |

## Testy Mock (M01-M15)

| ID | Tytuł | Technika |
|----|-------|---------|
| M01 | Lista z zamockowanymi danymi | route.fulfill() |
| M02 | Pusta lista | route.fulfill([]) |
| M03 | Błąd 500 backendu | route.fulfill(500) |
| M04 | Abort network request | route.abort() |
| M05 | Filtr po marce w mock | route.fulfill(filtered) |
| M06 | Mock logowania success | route.fulfill(200) |
| M07 | Mock logowania 400 error | route.fulfill(400) |
| M08 | Przyciski dealera po mock login | page.route + UI check |
| M09 | route.fetch() modyfikacja odpowiedzi | route.fetch() |
| M10 | isAvailableForRent=true → Wynajmij widoczny | route.fulfill() |
| M11 | isAvailableForRent=false → Wynajmij ukryty | route.fulfill() |
| M12 | Kalkulator leasingu z mock ceną | route.fulfill() |
| M13 | Licznik wywołań API | request count assertion |
| M14 | Izolacja sesji — 3 endpointy | multiple routes |
| M15 | Zmiana ceny w mock | route.fulfill(modified) |

## Testy Auth (S01-S15)

| ID | Tytuł | Technika |
|----|-------|---------|
| S01 | Admin bez UI login | storageState |
| S02 | Logout button widoczny | storageState + UI |
| S03 | Tekst Witaj widoczny | storageState + UI |
| S04 | Panel dealera dostępny | storageState + UI |
| S05 | Formularz dodania samochodu | storageState + UI |
| S06 | Modal listy klientów | storageState + UI |
| S07 | Reload — sesja persists | reload() |
| S08 | Nawigacja — sesja persists | goto() x2 |
| S09 | Multi-tab — shared state | context.newPage() |
| S10 | Cookie connect.sid istnieje | cookies() |
| S11 | Publiczny kontekst — brak dealer buttons | newContext({}) |
| S12 | Publiczny — lista samochodów widoczna | newContext({}) |
| S13 | Kontrast public vs auth | parallel contexts |
| S14 | Admin dodaje samochód bez UI login | storageState + API |
| S15 | Admin lista klientów bez UI login | storageState + UI |

## Uruchamianie Testów

```bash
# Wymagania: backend na :3000, frontend na :4200
cd Playwright

# Setup (tworzy .auth/admin.json)
npx playwright test --project=setup

# Wszystkie testy
npx playwright test

# Raport HTML
npx playwright show-report
```

## Znane Ograniczenia

- Testy wymagają działającego backendu i frontendu
- `.auth/admin.json` nie jest commitowane do repozytorium
- Po wdrożeniu bcrypt (INC-001) — testy A07, S01 itp. wymagają re-run setup
