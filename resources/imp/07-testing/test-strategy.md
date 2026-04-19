# Strategia Testowania — Salon Samochodowy

## Piramida Testów

```
        /\
       /  \
      / E2E \     ← 10%: Playwright (60 → 90 testów)
     /────────\
    / Integr.  \  ← 20%: Supertest API, Angular HTTP
   /────────────\
  /  Unit Tests  \ ← 70%: Jest (BE), Karma/Jasmine (FE)
 /────────────────\
```

## Narzędzia

| Typ | Narzędzie | Zakres | Właściciel |
|-----|-----------|--------|------------|
| Unit BE | Jest + Supertest | server.js, models, utils | Backend Dev |
| Unit FE | Angular TestBed + Karma | Komponenty, serwisy | Frontend Dev |
| E2E UI | Playwright | Pełne user journeys | Automation QA |
| E2E API | Playwright (request) | Wszystkie endpointy | Automation QA |
| E2E Mock | Playwright (page.route) | UI z mockowanym API | Automation QA |
| E2E Auth | Playwright (storageState) | Przepływy auth | Automation QA |
| Dostępność | axe-playwright | WCAG 2.1 AA | Automation QA |
| Bezpieczeństwo | npm audit + OWASP ZAP | Zależności, API | DevOps |

## Cele Pokrycia

| Warstwa | Obecny stan | Cel | Sprint |
|---------|-------------|-----|--------|
| Backend (Jest) | ~40% | ≥80% | Sprint 4 |
| Frontend (Angular) | ~20% | ≥80% | Sprint 4 |
| E2E (Playwright) | 60 testów | 90 testów | Sprint 4 |
| Krytyczne ścieżki | ~70% | 100% | Sprint 2 |

## Środowiska Testowe

| Środowisko | Backend | Frontend | Baza | Kiedy |
|------------|---------|---------|------|-------|
| Local | localhost:3000 | localhost:4200 | SQLite | Dev |
| CI | localhost:3000 | localhost:4200 | SQLite | PR/merge |
| Staging | staging-api.example.com | staging.example.com | MySQL | Pre-release |

## Polityka Testowania

### Quality Gates
- ❌ Nie merge'uj PR bez przechodzących unit testów
- ❌ Nie release'uj z coverage <80%
- ❌ Nie release'uj z otwartymi CRITICAL/HIGH bugami
- ❌ Nie merge'uj kodu który łamie istniejące Playwright testy

### Flaky Test Policy
1. Test flaky 2x z rzędu → oznacz jako `@flaky`
2. Test flaky 5x → izoluj do osobnej suity
3. Napraw lub usuń w ciągu 1 sprintu

## Uruchamianie Testów

```bash
# Backend unit tests
cd salon-samochodowy-backend
npm test
npm run test:coverage

# Frontend unit tests
cd salon-samochodowy-frontend
ng test --watch=false

# Playwright — wszystkie
cd Playwright
npx playwright test

# Playwright — tylko API
npx playwright test tests/api/

# Playwright — tylko Mock
npx playwright test tests/mock/

# Playwright — tylko Auth
npx playwright test tests/auth/

# Playwright — z GUI
npx playwright test --ui

# Playwright — debug
npx playwright test --debug tests/api/cars-crud.spec.ts
```
