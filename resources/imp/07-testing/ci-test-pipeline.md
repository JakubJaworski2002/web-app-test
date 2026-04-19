# Playwright w CI/CD — Integracja Pipeline

## GitHub Actions — Pełny Workflow

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  e2e:
    runs-on: ubuntu-latest
    timeout-minutes: 30

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: |
            Playwright/package-lock.json
            salon-samochodowy-backend/package-lock.json
            salon-samochodowy-frontend/package-lock.json

      - name: Install Backend Dependencies
        run: npm ci
        working-directory: salon-samochodowy-backend

      - name: Install Frontend Dependencies
        run: npm ci
        working-directory: salon-samochodowy-frontend

      - name: Build Frontend
        run: npm run build
        working-directory: salon-samochodowy-frontend

      - name: Start Backend
        run: node server.js &
        working-directory: salon-samochodowy-backend
        env:
          SESSION_SECRET: ${{ secrets.SESSION_SECRET }}
          NODE_ENV: test
          PORT: 3000

      - name: Wait for Backend
        run: npx wait-on http://localhost:3000/health --timeout 30000

      - name: Serve Frontend
        run: npx serve -s dist/salon-samochodowy-frontend/browser -l 4200 &
        working-directory: salon-samochodowy-frontend

      - name: Wait for Frontend
        run: npx wait-on http://localhost:4200 --timeout 30000

      - name: Install Playwright Browsers
        run: npx playwright install chromium --with-deps
        working-directory: Playwright

      - name: Run E2E Tests
        run: npx playwright test
        working-directory: Playwright
        env:
          BASE_URL: http://localhost:4200
          API_URL: http://localhost:3000

      - name: Upload Test Report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report-${{ github.run_id }}
          path: Playwright/playwright-report/
          retention-days: 7

      - name: Upload Screenshots on Failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: screenshots-${{ github.run_id }}
          path: Playwright/test-results/
```

## Matryca Testów według Środowisk

| Środowisko | Testy API | Testy Mock | Testy Auth | Testy UI |
|-----------|-----------|------------|------------|----------|
| Local Dev | ✅ | ✅ | ✅ | ✅ |
| CI/PR | ✅ | ✅ | ✅ | ✅ |
| Staging | ✅ | ❌ (real data) | ✅ | ✅ |
| Production | ✅ (smoke) | ❌ | ❌ | ✅ (smoke) |

## Konfiguracja dla CI

```typescript
// playwright.config.ts — tryb CI
import { defineConfig } from '@playwright/test';

export default defineConfig({
    reporter: process.env.CI
        ? [['github'], ['html', { open: 'never' }]]
        : [['html', { open: 'on-failure' }]],
    
    use: {
        video: process.env.CI ? 'retain-on-failure' : 'off',
        screenshot: 'only-on-failure',
        trace: 'retain-on-failure',
    },
    
    // Mniej równoległe w CI (zasoby ograniczone)
    workers: process.env.CI ? 2 : undefined,
    retries: process.env.CI ? 1 : 0,
});
```

## Metryki Raportowania

```bash
# Uruchom z raportem JSON
npx playwright test --reporter=json > results.json

# Konwertuj do badge
cat results.json | jq '{
    total: .stats.expected,
    passed: .stats.expected,
    failed: .stats.unexpected,
    duration: .stats.duration
}'
```
