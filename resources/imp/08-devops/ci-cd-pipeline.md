# CI/CD Pipeline — GitHub Actions

## Workflow 1: PR Checks

```yaml
# .github/workflows/pr-checks.yml
name: PR Checks
on:
  pull_request:
    branches: [main, develop]

jobs:
  backend-tests:
    name: Backend Unit Tests
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: salon-samochodowy-backend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: salon-samochodowy-backend/package-lock.json
      - run: npm ci
      - run: npm test -- --coverage
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: backend-coverage
          path: salon-samochodowy-backend/coverage/

  frontend-build:
    name: Frontend Build Check
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: salon-samochodowy-frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: salon-samochodowy-frontend/package-lock.json
      - run: npm ci
      - run: npm run build -- --configuration=production

  playwright-api-tests:
    name: Playwright API Tests
    runs-on: ubuntu-latest
    needs: [backend-tests]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - name: Install backend deps
        run: cd salon-samochodowy-backend && npm ci
      - name: Install Playwright
        run: cd Playwright && npm ci && npx playwright install --with-deps chromium
      - name: Start backend
        run: cd salon-samochodowy-backend && node server.js &
      - name: Wait for backend
        run: npx wait-on http://localhost:3000/health --timeout 30000
      - name: Run API tests
        run: cd Playwright && npx playwright test tests/api/ --project=chromium
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-api-report
          path: Playwright/playwright-report/
          retention-days: 7
```

## Workflow 2: Full E2E (on merge to main)

```yaml
# .github/workflows/e2e.yml
name: Full E2E Suite
on:
  push:
    branches: [main]

jobs:
  e2e-full:
    name: Full Playwright Suite
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: cd salon-samochodowy-backend && npm ci
      - run: cd salon-samochodowy-frontend && npm ci
      - run: cd Playwright && npm ci && npx playwright install --with-deps
      - name: Start servers
        run: |
          cd salon-samochodowy-backend && node server.js &
          cd salon-samochodowy-frontend && npx ng serve --port 4200 &
          npx wait-on http://localhost:3000 http://localhost:4200 --timeout 60000
      - name: Run all tests
        run: cd Playwright && npx playwright test
        env:
          CI: true
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-full-report
          path: Playwright/playwright-report/
          retention-days: 14
```

## Branch Strategy

```
main          ← production-ready, protected
develop       ← integration branch
feature/xxx   ← nowe funkcjonalności (z develop)
fix/xxx       ← bugfixy (z develop lub main)
hotfix/xxx    ← krytyczne naprawy na produkcji (z main)
```

## GitHub Secrets (do skonfigurowania)

| Secret | Opis |
|--------|------|
| `SESSION_SECRET` | Tajny klucz sesji (min. 32 znaki) |
| `DB_PASSWORD` | Hasło do MySQL |
| `DB_ROOT_PASSWORD` | Root MySQL password |
| `DOCKER_USERNAME` | Docker Hub username |
| `DOCKER_PASSWORD` | Docker Hub token |
