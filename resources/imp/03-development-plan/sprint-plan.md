# Plan Sprintów — Salon Samochodowy

## Sprint 0 — Audyt i Krytyczne Poprawki (Tydzień 1-2)

**Cel:** Naprawić incydenty CRITICAL/HIGH, skonfigurować środowisko dev, stworzyć dokumentację.

### User Stories

| ID | Tytuł | Punkty | Priorytet |
|----|-------|--------|-----------|
| US-001 | Jako deweloper chcę zahaszowane hasła (bcrypt) | 5 | Must |
| US-002 | Jako deweloper chcę isDealer default=false | 1 | Must |
| US-003 | Jako deweloper chcę rate limiting na /login | 3 | Must |
| US-004 | Jako deweloper chcę skrypt migracji haseł | 3 | Must |
| US-005 | Jako deweloper chcę pełną dokumentację projektu | 8 | Must |

**Velocity:** 20 SP

### Zadania Techniczne
- [ ] `npm install express-rate-limit` (backend)
- [ ] Implementacja bcrypt w server.js (rejestracja + logowanie)
- [ ] Skrypt `migrate-passwords.js`
- [ ] Zmiana `isDealer: { defaultValue: false }` w models.js
- [ ] Uzupełnienie `resources/imp/` dokumentacji
- [ ] Baseline test run — 60 testów Playwright

---

## Sprint 1 — Bezpieczeństwo i Infrastruktura (Tydzień 3-4)

**Cel:** Wdrożyć guards Angular, Docker, szkielet CI/CD.

### User Stories

| ID | Tytuł | Punkty | Priorytet |
|----|-------|--------|-----------|
| US-006 | Jako użytkownik chcę być przekierowany do logowania | 5 | Must |
| US-007 | Jako deweloper chcę CORS konfigurowalny przez env | 2 | Must |
| US-008 | Jako deweloper chcę Dockerfile dla backendu | 5 | Must |
| US-009 | Jako deweloper chcę Dockerfile dla frontendu | 5 | Must |
| US-010 | Jako deweloper chcę docker-compose.yml | 3 | Must |
| US-011 | Jako deweloper chcę GitHub Actions PR checks | 5 | Should |

**Velocity:** 25 SP

### Zadania Techniczne
- [ ] `auth.guard.ts` + `dealer.guard.ts` w Angular
- [ ] Update `app.routes.ts` z guards
- [ ] CORS fix (process.env.ALLOWED_ORIGINS)
- [ ] `Dockerfile` backend (Node 20 alpine)
- [ ] `Dockerfile` frontend (multi-stage: build + nginx)
- [ ] `docker-compose.yml` (frontend, backend, mysql, adminer)
- [ ] `.github/workflows/pr-checks.yml`

---

## Sprint 2 — Refaktoryzacja Backendu (Tydzień 5-6)

**Cel:** API v1, paginacja, Transaction model, RBAC.

### User Stories

| ID | Tytuł | Punkty | Priorytet |
|----|-------|--------|-----------|
| US-012 | Jako deweloper chcę API pod /api/v1/ | 5 | Must |
| US-013 | Jako użytkownik chcę paginację listy samochodów | 5 | Must |
| US-014 | Jako użytkownik chcę filtrowanie po marce i cenie | 5 | Must |
| US-015 | Jako system chcę model Transaction | 8 | Must |
| US-016 | Jako deweloper chcę standaryzowane błędy API | 3 | Should |
| US-017 | Jako deweloper chcę health check endpoint | 2 | Should |
| US-018 | Jako deweloper chcę pole isSold w Car | 3 | Should |

**Velocity:** 31 SP

### Zadania Techniczne
- [ ] Express Router z prefixem `/api/v1/`
- [ ] Middleware paginacji
- [ ] Query params: brand, minPrice, maxPrice, sort, order
- [ ] Sequelize migration: Transaction table
- [ ] Sequelize migration: isSold column in Car
- [ ] Error handler middleware (standardowe odpowiedzi)
- [ ] `GET /health` endpoint
- [ ] Update Playwright tests dla nowych URLi

---

## Sprint 3 — Redesign Frontendu (Tydzień 7-8)

**Cel:** Angular Signals, nowy design system, poprawki UX.

### User Stories

| ID | Tytuł | Punkty | Priorytet |
|----|-------|--------|-----------|
| US-019 | Jako deweloper chcę AuthService na Signals | 8 | Must |
| US-020 | Jako użytkownik chcę loading spinner | 3 | Must |
| US-021 | Jako użytkownik chcę powiadomienia toast | 5 | Must |
| US-022 | Jako użytkownik chcę nowy wygląd kart samochodów | 8 | Should |
| US-023 | Jako deweloper chcę naprawione literówki | 1 | Must |
| US-024 | Jako deweloper chcę naprawione memory leaki | 3 | Must |
| US-025 | Jako użytkownik chcę responsive layout | 5 | Should |

**Velocity:** 33 SP

### Zadania Techniczne
- [ ] Migracja `AuthenticationService` → Signals
- [ ] `LoadingSpinnerComponent` standalone
- [ ] Globalny error handler → MatSnackBar
- [ ] Zastąpienie `alert()`/`confirm()` (INC-008)
- [ ] Fix memory leak `takeUntilDestroyed()` (INC-009)
- [ ] Fix `brandserch` → `brandSearch` (INC-007)
- [ ] Nowe zmienne CSS (design tokens)
- [ ] Redesign `car-list.component.html` (nowe karty)
- [ ] Bootstrap responsive grid audit

---

## Sprint 4 — Testy i Jakość (Tydzień 9-10)

**Cel:** >80% coverage, 90 testów E2E, CI integration.

### User Stories

| ID | Tytuł | Punkty | Priorytet |
|----|-------|--------|-----------|
| US-026 | Jako QA chcę pokrycie testów BE ≥80% | 8 | Must |
| US-027 | Jako QA chcę pokrycie testów FE ≥80% | 8 | Must |
| US-028 | Jako QA chcę 30 nowych testów Playwright | 13 | Must |
| US-029 | Jako deweloper chcę testy w GitHub Actions | 5 | Must |
| US-030 | Jako QA chcę raport Allure | 3 | Should |

**Velocity:** 37 SP

### Zadania Techniczne
- [ ] Jest unit tests dla brakujących endpointów
- [ ] Angular TestBed dla wszystkich komponentów
- [ ] Page Object Model (`Playwright/tests/pages/`)
- [ ] Data factories (`Playwright/tests/factories/`)
- [ ] 10 nowych testów UI (CarDetail, EditCar, AddCustomer)
- [ ] 10 nowych testów API (nowe endpointy v1)
- [ ] 10 nowych testów Auth (edge cases)
- [ ] `playwright.config.ts` — update dla /api/v1/
- [ ] Allure reporter setup
- [ ] GitHub Actions: pełna suita E2E
