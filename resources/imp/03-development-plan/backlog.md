# Product Backlog — Salon Samochodowy

## EPIC 1: Bezpieczeństwo (CRITICAL/HIGH)

| ID | Tytuł | MoSCoW | SP | Sprint | Zależności |
|----|-------|--------|-----|--------|------------|
| US-001 | Hashowanie haseł bcrypt | Must | 5 | 0 | — |
| US-002 | isDealer default=false | Must | 1 | 0 | — |
| US-003 | Rate limiting /login /register | Must | 3 | 0 | — |
| US-004 | Skrypt migracji haseł | Must | 3 | 0 | US-001 |
| US-005 | CORS z env variables | Must | 2 | 1 | — |
| US-006 | Helmet.js security headers | Should | 2 | 1 | — |
| US-007 | CSRF protection | Could | 5 | 2 | — |

**Acceptance Criteria US-001:**
```
Given: Użytkownik rejestruje konto z hasłem "Admin1!"
When: Hasło zostaje zapisane do bazy
Then: Pole password w DB zaczyna się od "$2b$12$" (bcrypt hash)

Given: Użytkownik loguje się hasłem "Admin1!"
When: System porównuje hasło
Then: bcrypt.compare() zwraca true, logowanie udane
```

---

## EPIC 2: Infrastruktura (HIGH)

| ID | Tytuł | MoSCoW | SP | Sprint |
|----|-------|--------|-----|--------|
| US-008 | Dockerfile backend (Node 20) | Must | 5 | 1 |
| US-009 | Dockerfile frontend (multi-stage) | Must | 5 | 1 |
| US-010 | docker-compose.yml | Must | 3 | 1 |
| US-011 | GitHub Actions PR checks | Must | 5 | 1 |
| US-012 | GitHub Actions CD deploy | Should | 8 | 4 |

---

## EPIC 3: API Refaktoryzacja (HIGH)

| ID | Tytuł | MoSCoW | SP | Sprint |
|----|-------|--------|-----|--------|
| US-013 | API versioning /api/v1/ | Must | 5 | 2 |
| US-014 | Paginacja GET /api/v1/cars | Must | 5 | 2 |
| US-015 | Filtrowanie: brand, minPrice, maxPrice | Must | 5 | 2 |
| US-016 | Sortowanie: price, year, horsePower | Should | 3 | 2 |
| US-017 | Model Transaction | Must | 8 | 2 |
| US-018 | GET /api/v1/transactions | Should | 5 | 2 |
| US-019 | Pole isSold w Car | Must | 3 | 2 |
| US-020 | Standardowe odpowiedzi błędów | Should | 3 | 2 |
| US-021 | GET /health endpoint | Must | 2 | 2 |
| US-022 | Winston logger | Could | 3 | 3 |

---

## EPIC 4: Angular Guards i Routing (HIGH)

| ID | Tytuł | MoSCoW | SP | Sprint |
|----|-------|--------|-----|--------|
| US-023 | AuthGuard (CanActivate) | Must | 5 | 1 |
| US-024 | DealerGuard (CanActivate) | Must | 3 | 1 |
| US-025 | Przekierowanie niezalogowanych | Must | 2 | 1 |

---

## EPIC 5: Frontend Redesign (MEDIUM)

| ID | Tytuł | MoSCoW | SP | Sprint |
|----|-------|--------|-----|--------|
| US-026 | Angular Signals — AuthService | Must | 8 | 3 |
| US-027 | Angular Signals — CarService | Should | 5 | 3 |
| US-028 | Loading spinner component | Must | 3 | 3 |
| US-029 | Toast notifications (MatSnackBar) | Must | 5 | 3 |
| US-030 | Naprawić memory leak (INC-009) | Must | 3 | 3 |
| US-031 | Naprawić literówkę brandserch | Must | 1 | 3 |
| US-032 | Reactive Forms dla formularzy | Should | 8 | 3 |
| US-033 | Nowy design system (CSS variables) | Should | 5 | 3 |
| US-034 | Redesign car card | Should | 8 | 3 |
| US-035 | Responsywność mobile | Could | 5 | 3 |
| US-036 | Dark mode | Won't | 8 | — |

---

## EPIC 6: Testy i Jakość (HIGH)

| ID | Tytuł | MoSCoW | SP | Sprint |
|----|-------|--------|-----|--------|
| US-037 | Jest coverage backend ≥80% | Must | 8 | 4 |
| US-038 | Angular tests coverage ≥80% | Must | 8 | 4 |
| US-039 | +30 testów Playwright (POM pattern) | Must | 13 | 4 |
| US-040 | Playwright w GitHub Actions CI | Must | 5 | 4 |
| US-041 | Allure reporting | Should | 3 | 4 |
| US-042 | axe-playwright accessibility tests | Could | 5 | 4 |

---

## Podsumowanie

| Epic | Stories | Story Points | Sprint |
|------|---------|-------------|--------|
| Bezpieczeństwo | 7 | 21 | 0-2 |
| Infrastruktura | 5 | 26 | 1+4 |
| API Refaktoryzacja | 10 | 42 | 2-3 |
| Guards/Routing | 3 | 10 | 1 |
| Frontend Redesign | 11 | 59 | 3 |
| Testy i Jakość | 6 | 42 | 4 |
| **Razem** | **42** | **200** | — |
