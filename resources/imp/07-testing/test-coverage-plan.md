# Plan Pokrycia Testami

## Obecny Stan

| Obszar | Testy E2E Playwright | Testy Jednostkowe |
|--------|---------------------|-------------------|
| API (request fixture) | 15 testów ✅ | Brak |
| Mocking (page.route) | 15 testów ✅ | Brak |
| Auth (storageState) | 15 testów ✅ | Brak |
| Testy Backend (Supertest) | 0 | Brak |
| Testy Frontend (Jest) | 0 | Brak |

## Docelowe Pokrycie

```
Backend (server.js): >80% line coverage
Frontend (components): >70% statement coverage  
Playwright E2E: wszystkie scenariusze krytyczne
```

## Luki do Uzupełnienia

### Backend (Supertest/Jest)
```
tests/backend/
├── auth.test.js       — POST /login, POST /register, /logout
├── cars.test.js       — GET/POST/PUT/DELETE /api/v1/cars
├── transactions.test.js — leasing, wynajem, zakup
└── validation.test.js — walidacja danych wejściowych
```

### Frontend (Angular Testing Library)
```
src/app/components/
├── car-list.component.spec.ts
├── car-detail.component.spec.ts
└── auth.service.spec.ts
```

## Jak Uruchamiać Testy

```bash
# E2E Playwright
cd Playwright && npx playwright test tests/api/
cd Playwright && npx playwright test tests/mock/
cd Playwright && npx playwright test tests/auth/

# Backend Supertest (po implementacji)
cd salon-samochodowy-backend && npm test

# Frontend (po implementacji)
cd salon-samochodowy-frontend && npm test

# Raport pokrycia
cd salon-samochodowy-backend && npm run test:coverage
```

## Quality Gates (CI/CD)

- Playwright: 100% testów przeszło (0 failed)
- Backend coverage: >80%
- Frontend coverage: >70%
- Brak testów pominiętych (test.skip)
