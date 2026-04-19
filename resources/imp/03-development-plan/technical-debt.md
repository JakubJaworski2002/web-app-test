# Rejestr Długu Technicznego

## Podsumowanie

| Kategoria | Liczba | Priorytet |
|-----------|--------|-----------|
| Bezpieczeństwo | 4 | 🔴 Krytyczny / 🟠 Wysoki |
| Architektura | 4 | 🟡 Średni |
| Kod Angular | 4 | 🟡 Średni / 🔵 Niski |
| DevOps | 3 | 🟡 Średni |
| **Razem** | **15** | - |

---

## DEBT-001 — Hasła w Plaintext
- **Lokalizacja:** `server.js:107, 156`
- **Opis:** bcrypt zainstalowany ale nieużywany
- **Wpływ:** Krytyczna luka bezpieczeństwa, naruszenie RODO
- **Wysiłek:** M (3-4h)
- **Fix:** `bcrypt.hash()` przy rejestracji, `bcrypt.compare()` przy logowaniu
- **Sprint:** 0

## DEBT-002 — isDealer Default True
- **Lokalizacja:** `models.js:178`
- **Opis:** Nowi użytkownicy domyślnie są dealerami
- **Wpływ:** Błędy uprawnień przy tworzeniu użytkowników programowo
- **Wysiłek:** XS (15 min)
- **Fix:** `defaultValue: false`
- **Sprint:** 0

## DEBT-003 — Brak Rate Limitingu
- **Lokalizacja:** `server.js` (brak)
- **Opis:** `/login` i `/register` bez ograniczeń
- **Wpływ:** Podatność na brute-force
- **Wysiłek:** S (1h)
- **Fix:** `express-rate-limit`
- **Sprint:** 0

## DEBT-004 — CORS Hardcoded
- **Lokalizacja:** `server.js:37`
- **Opis:** `origin: 'http://localhost:4200'` zawsze
- **Wpływ:** Nie działa poza lokalnym środowiskiem
- **Wysiłek:** S (30 min)
- **Fix:** `process.env.ALLOWED_ORIGINS`
- **Sprint:** 1

## DEBT-005 — Brak API Versioning
- **Lokalizacja:** Wszystkie endpointy
- **Opis:** `/cars` zamiast `/api/v1/cars`
- **Wpływ:** Brak możliwości evolucji API bez breaking changes
- **Wysiłek:** L (1-2 dni)
- **Fix:** Express Router z prefixem, backward compat.
- **Sprint:** 2

## DEBT-006 — Brak Paginacji
- **Lokalizacja:** `server.js:193` (`GET /cars`)
- **Opis:** Zwraca wszystkie samochody naraz
- **Wpływ:** Problemy wydajnościowe przy dużej bazie
- **Wysiłek:** M (4h)
- **Fix:** `LIMIT/OFFSET` + query params `?page=1&limit=10`
- **Sprint:** 2

## DEBT-007 — Brak Transaction Model
- **Lokalizacja:** Backend (brak modelu)
- **Opis:** Historia rent/buy/leasing nigdzie nie zapisywana
- **Wpływ:** Brak audytu, brak historii transakcji
- **Wysiłek:** XL (2-3 dni)
- **Fix:** Sequelize model + migracja + endpointy
- **Sprint:** 2

## DEBT-008 — Brak Angular Route Guards
- **Lokalizacja:** `app.routes.ts`
- **Opis:** Żadna trasa nie jest chroniona przez guard
- **Wpływ:** Zepsuty UX dla niezalogowanych
- **Wysiłek:** M (3h)
- **Fix:** `AuthGuard`, `DealerGuard`
- **Sprint:** 1

## DEBT-009 — Memory Leak w CarListComponent
- **Lokalizacja:** `car-list.component.ts:52`
- **Opis:** `combineLatest` bez `takeUntilDestroyed()`
- **Wpływ:** Rosnące zużycie pamięci przy nawigacji
- **Wysiłek:** S (1h)
- **Fix:** `.pipe(takeUntilDestroyed())`
- **Sprint:** 3

## DEBT-010 — alert() Zamiast Angular Material
- **Lokalizacja:** `car-list`, `buy-car`, `rent-car` components
- **Opis:** 4 wywołania `alert()`, 1 `confirm()`
- **Wpływ:** Zły UX, brak dostępności
- **Wysiłek:** M (2h)
- **Fix:** `MatSnackBar`, `MatDialog`
- **Sprint:** 3

## DEBT-011 — Literówka brandserch
- **Lokalizacja:** `car-list.component.ts:33,138`, template
- **Opis:** `brandserch` zamiast `brandSearch`
- **Wpływ:** Mylący kod dla deweloperów
- **Wysiłek:** XS (15 min)
- **Fix:** Rename everywhere
- **Sprint:** 3

## DEBT-012 — console.log w Produkcji
- **Lokalizacja:** `server.js:253`
- **Opis:** `console.log(error)` wewnątrz catch bloku
- **Wpływ:** Wycieki stacktrace'ów do logów produkcyjnych
- **Wysiłek:** XS (5 min)
- **Fix:** Zastąpić Winstonem lub usunąć
- **Sprint:** 2

## DEBT-013 — Brak Docker
- **Lokalizacja:** Root projektu
- **Opis:** Brak Dockerfile i docker-compose
- **Wpływ:** Trudny onboarding, brak env parity
- **Wysiłek:** L (1 dzień)
- **Fix:** Multi-stage Dockerfiles + compose
- **Sprint:** 1

## DEBT-014 — Brak CI/CD Pipeline
- **Lokalizacja:** `.github/` (brak workflows)
- **Opis:** Żaden automatyczny check przy PR/merge
- **Wpływ:** Możliwość merge'u złamanego kodu
- **Wysiłek:** L (1 dzień)
- **Fix:** GitHub Actions workflows
- **Sprint:** 1

## DEBT-015 — Słabe Pokrycie Testów Frontend
- **Lokalizacja:** `salon-samochodowy-frontend/src/app/**/*.spec.ts`
- **Opis:** Spec pliki istnieją ale testy minimalne (~20%)
- **Wpływ:** Regresje niewykrywane automatycznie
- **Wysiłek:** XL (3-4 dni)
- **Fix:** TestBed tests dla wszystkich komponentów
- **Sprint:** 4

---

## Legenda Wysiłku

| Symbol | Czas |
|--------|------|
| XS | < 30 min |
| S | 30 min – 2h |
| M | 2h – 1 dzień |
| L | 1-3 dni |
| XL | 3+ dni |
