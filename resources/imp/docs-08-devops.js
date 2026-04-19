'use strict';
const fs = require('fs');
const path = require('path');
const BASE = path.join(__dirname, '08-devops');
fs.mkdirSync(BASE, { recursive: true });

// ─────────────────────────────────────────────────────────────────────────────
// FILE 5: docker-setup.md
// ─────────────────────────────────────────────────────────────────────────────
fs.writeFileSync(path.join(BASE, 'docker-setup.md'), `# Konfiguracja Docker – Salon Samochodowy

> Kompletna konfiguracja Docker dla środowisk development i production.

---

## Architektura kontenerów

\`\`\`
┌─────────────────────────────────────────────┐
│              docker-compose                  │
│                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ frontend │  │ backend  │  │  mysql   │  │
│  │ :4200    │  │ :3000    │  │  :3306   │  │
│  │ nginx    │  │ node:20  │  │  8.0     │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│                               ┌──────────┐  │
│                               │ adminer  │  │
│                               │  :8080   │  │
│                               └──────────┘  │
└─────────────────────────────────────────────┘
\`\`\`

---

## Dockerfile – Frontend (Angular 19)

Plik: \`salon-samochodowy-frontend/Dockerfile\`

\`\`\`dockerfile
# ──────────────────────────────────────────────
# Etap 1: Build Angular
# ──────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Kopiuj pliki zależności (cache layer)
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline

# Kopiuj kod źródłowy i buduj
COPY . .
RUN npm run build -- --configuration production

# ──────────────────────────────────────────────
# Etap 2: Nginx do serwowania aplikacji
# ──────────────────────────────────────────────
FROM nginx:1.25-alpine AS production

# Skopiuj zbudowaną aplikację
COPY --from=builder /app/dist/salon-samochodowy-frontend/browser /usr/share/nginx/html

# Skopiuj konfigurację Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Utwórz użytkownika bez uprawnień root
RUN addgroup -g 1001 -S nodejs && \\
    adduser -S angular -u 1001 && \\
    chown -R angular:nodejs /usr/share/nginx/html && \\
    chown -R angular:nodejs /var/cache/nginx

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

USER angular

CMD ["nginx", "-g", "daemon off;"]
\`\`\`

---

## nginx.conf – Konfiguracja Nginx dla Angular

Plik: \`salon-samochodowy-frontend/nginx.conf\`

\`\`\`nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Kompresja gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript
               text/xml application/xml application/xml+rss text/javascript
               application/wasm;

    # Nagłówki bezpieczeństwa
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
        always;

    # Cache dla statycznych zasobów
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Proxy do backendu API
    location /api/ {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # Angular SPA – wszystkie trasy do index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Zdrowie
    location /health {
        access_log off;
        return 200 '{"status":"ok"}';
        add_header Content-Type application/json;
    }
}
\`\`\`

---

## Dockerfile – Backend (Express.js)

Plik: \`salon-samochodowy-backend/Dockerfile\`

\`\`\`dockerfile
# ──────────────────────────────────────────────
# Etap 1: Zależności produkcyjne
# ──────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production --prefer-offline

# ──────────────────────────────────────────────
# Etap 2: Środowisko produkcyjne
# ──────────────────────────────────────────────
FROM node:20-alpine AS production

# Metadane
LABEL maintainer="salon-samochodowy-team"
LABEL version="1.0"

WORKDIR /app

# Utwórz użytkownika bez uprawnień root
RUN addgroup -g 1001 -S nodejs && \\
    adduser -S nodeuser -u 1001

# Skopiuj zależności i kod
COPY --from=deps --chown=nodeuser:nodejs /app/node_modules ./node_modules
COPY --chown=nodeuser:nodejs . .

# Usuń pliki deweloperskie
RUN rm -f .env.* *.test.js

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \\
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

USER nodeuser

CMD ["node", "src/app.js"]
\`\`\`

---

## docker-compose.yml

Plik: \`docker-compose.yml\` (root projektu)

\`\`\`yaml
version: '3.9'

services:

  # ─────────────────────────────────────────────
  # Frontend Angular
  # ─────────────────────────────────────────────
  frontend:
    build:
      context: ./salon-samochodowy-frontend
      dockerfile: Dockerfile
      target: production
    ports:
      - "4200:80"
    depends_on:
      backend:
        condition: service_healthy
    environment:
      - NODE_ENV=production
    networks:
      - salon-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3

  # ─────────────────────────────────────────────
  # Backend Express.js
  # ─────────────────────────────────────────────
  backend:
    build:
      context: ./salon-samochodowy-backend
      dockerfile: Dockerfile
      target: production
    ports:
      - "3000:3000"
    depends_on:
      mysql:
        condition: service_healthy
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_NAME=\${DB_NAME:-salon_db}
      - DB_USER=\${DB_USER:-salon_user}
      - DB_PASS=\${DB_PASS}
      - SESSION_SECRET=\${SESSION_SECRET}
      - JWT_SECRET=\${JWT_SECRET}
      - JWT_REFRESH_SECRET=\${JWT_REFRESH_SECRET}
      - ALLOWED_ORIGINS=\${ALLOWED_ORIGINS:-http://localhost:4200}
      - RATE_LIMIT_GENERAL=\${RATE_LIMIT_GENERAL:-100}
      - RATE_LIMIT_LOGIN=\${RATE_LIMIT_LOGIN:-5}
    volumes:
      - sqlite-data:/app/data
    networks:
      - salon-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/api/health', r => process.exit(r.statusCode === 200 ? 0 : 1))"]
      interval: 30s
      timeout: 10s
      start_period: 10s
      retries: 3

  # ─────────────────────────────────────────────
  # MySQL 8.0
  # ─────────────────────────────────────────────
  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=\${MYSQL_ROOT_PASS}
      - MYSQL_DATABASE=\${DB_NAME:-salon_db}
      - MYSQL_USER=\${DB_USER:-salon_user}
      - MYSQL_PASSWORD=\${DB_PASS}
    volumes:
      - mysql-data:/var/lib/mysql
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql:ro
    networks:
      - salon-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p\${MYSQL_ROOT_PASS}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s

  # ─────────────────────────────────────────────
  # Adminer – GUI dla bazy danych
  # ─────────────────────────────────────────────
  adminer:
    image: adminer:4.8.1
    ports:
      - "8080:8080"
    depends_on:
      - mysql
    networks:
      - salon-network
    restart: unless-stopped
    profiles:
      - dev  # uruchamia się tylko z: docker-compose --profile dev up

networks:
  salon-network:
    driver: bridge

volumes:
  mysql-data:
    driver: local
  sqlite-data:
    driver: local
\`\`\`

---

## docker-compose.dev.yml

Nadpisanie dla trybu development:

\`\`\`yaml
version: '3.9'

services:
  frontend:
    build:
      target: builder  # nie używaj nginx, uruchom ng serve
    command: npm start
    volumes:
      - ./salon-samochodowy-frontend:/app
      - /app/node_modules  # nie nadpisuj node_modules
    ports:
      - "4200:4200"
    environment:
      - NODE_ENV=development

  backend:
    command: npm run dev  # nodemon z hot-reload
    volumes:
      - ./salon-samochodowy-backend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - DB_HOST=mysql
\`\`\`

Uruchomienie dev: \`docker-compose -f docker-compose.yml -f docker-compose.dev.yml up\`

---

## .dockerignore – Frontend

Plik: \`salon-samochodowy-frontend/.dockerignore\`

\`\`\`
node_modules
dist
.git
.gitignore
*.md
.env*
coverage
.nyc_output
playwright-report
test-results
e2e
\`\`\`

## .dockerignore – Backend

Plik: \`salon-samochodowy-backend/.dockerignore\`

\`\`\`
node_modules
.git
.gitignore
*.md
.env*
coverage
*.test.js
tests/
*.sqlite
\`\`\`

---

## Strategia zmiennych środowiskowych

### Hierarchia plików .env

\`\`\`
.env                 ← wartości domyślne (nie commituj!)
.env.example         ← szablon (commituj do repozytorium)
.env.development     ← dev override
.env.production      ← prod override (tylko CI/CD)
\`\`\`

### Klasy zmiennych

| Klasa | Przykłady | Jak zarządzać |
|-------|-----------|---------------|
| Sekrety | JWT_SECRET, DB_PASS | GitHub Secrets, Vault |
| Konfiguracja | PORT, LOG_LEVEL | .env.* plik |
| Zmienne build | NODE_ENV | Argument Dockerfile |

---

## Zarządzanie woluminami

| Wolumin | Cel | Backup |
|---------|-----|--------|
| \`mysql-data\` | Dane MySQL | Tak – mysqldump |
| \`sqlite-data\` | Plik SQLite | Tak – cp |

### Backup MySQL (cron):

\`\`\`bash
docker exec salon-mysql mysqldump -u root -p"\${MYSQL_ROOT_PASS}" salon_db \\
  > backup_\$(date +%Y%m%d_%H%M%S).sql
\`\`\`

---

## Health Check – podsumowanie

| Serwis | Endpoint | Interval | Retries |
|--------|----------|----------|---------|
| frontend | \`GET /\` | 30s | 3 |
| backend | \`GET /api/health\` | 30s | 3 |
| mysql | \`mysqladmin ping\` | 10s | 5 |

---

*Dokumentacja Docker – Salon Samochodowy AiTSI | Wersja 1.0 | 2025*
`, 'utf8');

// ─────────────────────────────────────────────────────────────────────────────
// FILE 6: ci-cd-pipeline.md
// ─────────────────────────────────────────────────────────────────────────────
fs.writeFileSync(path.join(BASE, 'ci-cd-pipeline.md'), `# Pipeline CI/CD – Salon Samochodowy

> GitHub Actions: walidacja PR + deployment.

---

## Strategia branch'owania

\`\`\`
main          ← produkcja (tylko merge z develop)
  └── develop ← integracja (merge z feature/*)
        └── feature/US-001-bcrypt    ← nowa funkcja
        └── feature/US-009-pagination
        └── hotfix/DEBT-001-passwords ← pilna naprawa
\`\`\`

**Zasady:**
- Bezpośrednie push do \`main\` → zablokowane (branch protection)
- PR do \`main\` wymaga: 2 approvals + zielony CI + brak konfliktów
- PR do \`develop\` wymaga: 1 approval + zielony CI

---

## Workflow 1: Walidacja PR

Plik: \`.github/workflows/pr-checks.yml\`

\`\`\`yaml
name: PR Validation

on:
  pull_request:
    branches: [develop, main]
    types: [opened, synchronize, reopened]

concurrency:
  group: pr-\${{ github.event.pull_request.number }}
  cancel-in-progress: true

jobs:

  # ─────────────────────────────────────────────
  # 1. Lint Backend
  # ─────────────────────────────────────────────
  lint-backend:
    name: Lint Backend (ESLint)
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

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

  # ─────────────────────────────────────────────
  # 2. Lint Frontend
  # ─────────────────────────────────────────────
  lint-frontend:
    name: Lint Frontend (ESLint + Angular)
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

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

  # ─────────────────────────────────────────────
  # 3. Unit Tests Backend
  # ─────────────────────────────────────────────
  test-backend:
    name: Unit Tests Backend (Jest)
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

      - name: Install dependencies
        run: npm ci

      - name: Run tests with coverage
        run: npm run test -- --coverage --coverageReporters=lcov --coverageReporters=text-summary

      - name: Check coverage threshold
        run: |
          COVERAGE=\$(cat coverage/coverage-summary.json | node -e "
            const data = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
            console.log(data.total.branches.pct)
          ")
          echo "Branch coverage: \${COVERAGE}%"
          if [ "\$(echo "\${COVERAGE} < 80" | bc)" = "1" ]; then
            echo "Coverage \${COVERAGE}% is below 80% threshold!"
            exit 1
          fi

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          files: ./salon-samochodowy-backend/coverage/lcov.info
          flags: backend
        continue-on-error: true

  # ─────────────────────────────────────────────
  # 4. Build Frontend
  # ─────────────────────────────────────────────
  build-frontend:
    name: Build Angular (production)
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

      - name: Install dependencies
        run: npm ci

      - name: Build production
        run: npm run build -- --configuration production

      - name: Check bundle size
        run: |
          MAX_SIZE=512000  # 500KB
          for f in dist/salon-samochodowy-frontend/browser/*.js; do
            SIZE=\$(wc -c < "\$f")
            NAME=\$(basename "\$f")
            if [ \$SIZE -gt \$MAX_SIZE ]; then
              echo "Bundle \${NAME} (\${SIZE}B) exceeds max \${MAX_SIZE}B!"
              exit 1
            fi
          done
          echo "All bundles within size limits."

  # ─────────────────────────────────────────────
  # 5. Playwright Smoke Tests
  # ─────────────────────────────────────────────
  playwright-smoke:
    name: Playwright Smoke Tests
    runs-on: ubuntu-latest
    needs: [lint-backend, lint-frontend, test-backend, build-frontend]
    timeout-minutes: 15

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: Playwright/package-lock.json

      - name: Install backend dependencies
        run: npm ci
        working-directory: salon-samochodowy-backend

      - name: Install frontend dependencies
        run: npm ci
        working-directory: salon-samochodowy-frontend

      - name: Install Playwright
        run: npm ci && npx playwright install --with-deps chromium
        working-directory: Playwright

      - name: Start backend
        run: |
          NODE_ENV=test npm start &
          npx wait-on http://localhost:3000/api/health --timeout 30000
        working-directory: salon-samochodowy-backend
        env:
          SESSION_SECRET: test-secret-ci
          JWT_SECRET: test-jwt-secret-ci
          JWT_REFRESH_SECRET: test-refresh-secret-ci

      - name: Start frontend
        run: |
          npm run build -- --configuration development
          npx http-server dist/salon-samochodowy-frontend/browser -p 4200 &
          npx wait-on http://localhost:4200 --timeout 30000
        working-directory: salon-samochodowy-frontend

      - name: Run smoke tests (UI subset)
        run: npx playwright test tests/ui/ --reporter=list --project=chromium
        working-directory: Playwright
        env:
          BASE_URL: http://localhost:4200
          API_URL: http://localhost:3000

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-smoke-results
          path: Playwright/playwright-report/
          retention-days: 7

  # ─────────────────────────────────────────────
  # 6. Security Audit
  # ─────────────────────────────────────────────
  security-audit:
    name: Security Audit (npm audit)
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Audit backend
        run: npm audit --audit-level=high
        working-directory: salon-samochodowy-backend

      - name: Audit frontend
        run: npm audit --audit-level=high
        working-directory: salon-samochodowy-frontend
\`\`\`

---

## Workflow 2: Deployment (main branch)

Plik: \`.github/workflows/deploy.yml\`

\`\`\`yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Target environment'
        required: true
        default: 'staging'
        type: choice
        options: [staging, production]

env:
  REGISTRY: ghcr.io
  IMAGE_PREFIX: \${{ github.repository_owner }}/salon-samochodowy

jobs:

  # ─────────────────────────────────────────────
  # 1. Pełne testy E2E Playwright
  # ─────────────────────────────────────────────
  e2e-tests:
    name: Full E2E Playwright Suite
    runs-on: ubuntu-latest
    timeout-minutes: 30

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install all dependencies
        run: |
          cd salon-samochodowy-backend && npm ci
          cd ../salon-samochodowy-frontend && npm ci
          cd ../Playwright && npm ci
          npx playwright install --with-deps
        working-directory: Playwright

      - name: Start services
        run: |
          cd salon-samochodowy-backend && NODE_ENV=test npm start &
          cd salon-samochodowy-frontend && npm run build -- --configuration development && \\
            npx http-server dist/salon-samochodowy-frontend/browser -p 4200 &
          npx wait-on http://localhost:3000/api/health http://localhost:4200 --timeout 60000
        env:
          SESSION_SECRET: \${{ secrets.TEST_SESSION_SECRET }}
          JWT_SECRET: \${{ secrets.TEST_JWT_SECRET }}
          JWT_REFRESH_SECRET: \${{ secrets.TEST_JWT_REFRESH_SECRET }}

      - name: Run full Playwright suite
        run: npx playwright test --reporter=html,list
        working-directory: Playwright
        env:
          BASE_URL: http://localhost:4200
          API_URL: http://localhost:3000
          PLAYWRIGHT_WORKERS: 4

      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-full-report
          path: Playwright/playwright-report/
          retention-days: 30

  # ─────────────────────────────────────────────
  # 2. Build & Push Docker Images
  # ─────────────────────────────────────────────
  build-docker:
    name: Build & Push Docker Images
    runs-on: ubuntu-latest
    needs: [e2e-tests]
    outputs:
      backend-tag: \${{ steps.meta-backend.outputs.tags }}
      frontend-tag: \${{ steps.meta-frontend.outputs.tags }}

    steps:
      - uses: actions/checkout@v4

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: \${{ env.REGISTRY }}
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata – backend
        id: meta-backend
        uses: docker/metadata-action@v5
        with:
          images: \${{ env.REGISTRY }}/\${{ env.IMAGE_PREFIX }}-backend
          tags: |
            type=sha,prefix=sha-
            type=ref,event=branch
            type=semver,pattern=\{{version}}
            latest

      - name: Build & push backend
        uses: docker/build-push-action@v5
        with:
          context: ./salon-samochodowy-backend
          push: true
          tags: \${{ steps.meta-backend.outputs.tags }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Extract metadata – frontend
        id: meta-frontend
        uses: docker/metadata-action@v5
        with:
          images: \${{ env.REGISTRY }}/\${{ env.IMAGE_PREFIX }}-frontend

      - name: Build & push frontend
        uses: docker/build-push-action@v5
        with:
          context: ./salon-samochodowy-frontend
          push: true
          tags: \${{ steps.meta-frontend.outputs.tags }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # ─────────────────────────────────────────────
  # 3. Deploy
  # ─────────────────────────────────────────────
  deploy:
    name: Deploy to \${{ inputs.environment || 'production' }}
    runs-on: ubuntu-latest
    needs: [build-docker]
    environment:
      name: \${{ inputs.environment || 'production' }}
      url: \${{ vars.APP_URL }}

    steps:
      - uses: actions/checkout@v4

      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: \${{ secrets.DEPLOY_HOST }}
          username: \${{ secrets.DEPLOY_USER }}
          key: \${{ secrets.DEPLOY_SSH_KEY }}
          script: |
            cd /opt/salon-samochodowy
            echo "\${{ secrets.GITHUB_TOKEN }}" | docker login ghcr.io -u \${{ github.actor }} --password-stdin
            docker-compose pull
            docker-compose up -d --remove-orphans
            docker image prune -f

      - name: Smoke test after deploy
        run: |
          sleep 10
          curl --fail \${{ vars.APP_URL }}/api/health
\`\`\`

---

## Promocja środowisk

\`\`\`
feature/* → develop → staging → production
               ↑CI          ↑Manual     ↑Manual+Approval
\`\`\`

| Środowisko | Branch | Deployment | URL |
|------------|--------|------------|-----|
| development | feature/* | lokalny docker-compose | localhost:4200 |
| staging | develop | auto na push | staging.salon.example.com |
| production | main | manualny (workflow_dispatch) | salon.example.com |

---

## Lista sekretów GitHub

Konfiguruj w: \`Settings → Secrets and variables → Actions\`

| Sekret | Opis | Środowisko |
|--------|------|------------|
| \`SESSION_SECRET\` | Klucz sesji Express | production, staging |
| \`JWT_SECRET\` | Klucz JWT | production, staging |
| \`JWT_REFRESH_SECRET\` | Klucz refresh JWT | production, staging |
| \`DB_PASS\` | Hasło MySQL | production, staging |
| \`MYSQL_ROOT_PASS\` | Root hasło MySQL | production, staging |
| \`TEST_SESSION_SECRET\` | Klucz sesji testów | (repozytorium) |
| \`TEST_JWT_SECRET\` | Klucz JWT testów | (repozytorium) |
| \`DEPLOY_HOST\` | IP serwera | production, staging |
| \`DEPLOY_USER\` | SSH user | production, staging |
| \`DEPLOY_SSH_KEY\` | Klucz prywatny SSH | production, staging |

---

## Procedura rollback

### Automatyczny rollback (z błędem smoke test):

\`\`\`bash
# Na serwerze produkcyjnym
cd /opt/salon-samochodowy

# Sprawdź poprzednią wersję
docker ps -a | grep salon

# Przywróć poprzednią wersję
docker-compose down
docker tag ghcr.io/org/salon-backend:previous ghcr.io/org/salon-backend:latest
docker-compose up -d
\`\`\`

### Ręczny rollback przez GitHub:

1. Otwórz zakładkę **Actions** w repozytorium
2. Wybierz workflow **Deploy to Production**
3. Kliknij **Run workflow** → wybierz poprzedni tag jako input
4. Potwierdź

---

*Dokumentacja CI/CD – Salon Samochodowy AiTSI | Wersja 1.0 | 2025*
`, 'utf8');

// ─────────────────────────────────────────────────────────────────────────────
// FILE 7: environment-config.md
// ─────────────────────────────────────────────────────────────────────────────
fs.writeFileSync(path.join(BASE, 'environment-config.md'), `# Zarządzanie Środowiskami – Salon Samochodowy

> Kompletna strategia konfiguracji środowisk development, staging i production.

---

## Tabela zmiennych środowiskowych

### Backend (Express.js)

| Zmienna | Development | Staging | Production | Opis |
|---------|-------------|---------|------------|------|
| \`NODE_ENV\` | \`development\` | \`staging\` | \`production\` | Tryb Node.js |
| \`PORT\` | \`3000\` | \`3000\` | \`3000\` | Port serwera |
| \`SESSION_SECRET\` | dowolny lokalny | **sekret** | **sekret** | Klucz sesji Express |
| \`JWT_SECRET\` | dowolny lokalny | **sekret** | **sekret** | Klucz JWT access token |
| \`JWT_REFRESH_SECRET\` | dowolny lokalny | **sekret** | **sekret** | Klucz JWT refresh token |
| \`DB_TYPE\` | \`sqlite\` | \`mysql\` | \`mysql\` | Typ bazy danych |
| \`DB_HOST\` | \`localhost\` | \`mysql\` | \`mysql\` | Host bazy danych |
| \`DB_PORT\` | \`3306\` | \`3306\` | \`3306\` | Port bazy danych |
| \`DB_NAME\` | \`salon_dev\` | \`salon_staging\` | \`salon_prod\` | Nazwa bazy |
| \`DB_USER\` | \`root\` | \`salon_user\` | \`salon_user\` | Użytkownik DB |
| \`DB_PASS\` | \`root\` | **sekret** | **sekret** | Hasło DB |
| \`ALLOWED_ORIGINS\` | \`http://localhost:4200\` | \`https://staging.example.com\` | \`https://salon.example.com\` | CORS whitelist |
| \`RATE_LIMIT_GENERAL\` | \`1000\` | \`200\` | \`100\` | Limit req/min na IP |
| \`RATE_LIMIT_LOGIN\` | \`100\` | \`10\` | \`5\` | Limit logowań/15min |
| \`LOG_LEVEL\` | \`debug\` | \`info\` | \`warn\` | Poziom logowania |
| \`BCRYPT_ROUNDS\` | \`10\` | \`10\` | \`12\` | Rundy bcrypt (prod mocniej) |
| \`JWT_EXPIRES_IN\` | \`24h\` | \`24h\` | \`1h\` | Czas życia access token |
| \`JWT_REFRESH_EXPIRES_IN\` | \`30d\` | \`7d\` | \`7d\` | Czas życia refresh token |

### Frontend (Angular)

| Zmienna | Development | Production | Opis |
|---------|-------------|------------|------|
| \`apiUrl\` | \`http://localhost:3000/api/v1\` | \`/api/v1\` | URL API |
| \`production\` | \`false\` | \`true\` | Tryb produkcyjny |
| \`enableDevTools\` | \`true\` | \`false\` | Narzędzia deweloperskie |

---

## Pliki .env

### .env.example (commitowany do repozytorium)

\`\`\`dotenv
# ════════════════════════════════════════
# Salon Samochodowy – zmienne środowiskowe
# Skopiuj jako .env i uzupełnij wartości
# NIGDY nie commituj .env!
# ════════════════════════════════════════

# Serwer
NODE_ENV=development
PORT=3000

# Sekrety (wygeneruj: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
SESSION_SECRET=CHANGE_ME_RANDOM_64_CHARS
JWT_SECRET=CHANGE_ME_ANOTHER_RANDOM_64_CHARS
JWT_REFRESH_SECRET=CHANGE_ME_YET_ANOTHER_RANDOM_64_CHARS

# Baza danych
DB_TYPE=sqlite
# DB_TYPE=mysql  # odkomentuj dla MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=salon_dev
DB_USER=root
DB_PASS=CHANGE_ME_DB_PASSWORD

# CORS – oddzielone przecinkami
ALLOWED_ORIGINS=http://localhost:4200

# Rate limiting
RATE_LIMIT_GENERAL=1000
RATE_LIMIT_LOGIN=100

# Logowanie
LOG_LEVEL=debug

# Bcrypt
BCRYPT_ROUNDS=10

# JWT expiry
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
\`\`\`

### .env.staging

\`\`\`dotenv
NODE_ENV=staging
PORT=3000
DB_TYPE=mysql
DB_HOST=mysql
DB_PORT=3306
DB_NAME=salon_staging
DB_USER=salon_user
ALLOWED_ORIGINS=https://staging.salon.example.com
RATE_LIMIT_GENERAL=200
RATE_LIMIT_LOGIN=10
LOG_LEVEL=info
BCRYPT_ROUNDS=10
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
# Sekrety pobierane z GitHub Secrets / Vault
\`\`\`

### .env.production

\`\`\`dotenv
NODE_ENV=production
PORT=3000
DB_TYPE=mysql
DB_HOST=mysql
DB_PORT=3306
DB_NAME=salon_prod
DB_USER=salon_user
ALLOWED_ORIGINS=https://salon.example.com
RATE_LIMIT_GENERAL=100
RATE_LIMIT_LOGIN=5
LOG_LEVEL=warn
BCRYPT_ROUNDS=12
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
\`\`\`

---

## Angular Environment Files

### \`environment.ts\` (development)

\`\`\`typescript
// salon-samochodowy-frontend/src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1',
  enableDevTools: true,
  logLevel: 'debug',
  version: require('../../package.json').version + '-dev'
};
\`\`\`

### \`environment.prod.ts\` (production)

\`\`\`typescript
// salon-samochodowy-frontend/src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: '/api/v1',  // relatywny URL – nginx proxy
  enableDevTools: false,
  logLevel: 'error',
  version: require('../../package.json').version
};
\`\`\`

### Konfiguracja angular.json

\`\`\`json
"configurations": {
  "production": {
    "fileReplacements": [
      {
        "replace": "src/environments/environment.ts",
        "with": "src/environments/environment.prod.ts"
      }
    ]
  }
}
\`\`\`

---

## Walidacja konfiguracji przy starcie

\`\`\`javascript
// salon-samochodowy-backend/src/config/validate.js
const required = [
  'SESSION_SECRET',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
];

const production_required = [
  'DB_HOST',
  'DB_NAME',
  'DB_USER',
  'DB_PASS',
  'ALLOWED_ORIGINS',
];

module.exports = function validateConfig() {
  const missing = [];

  for (const key of required) {
    if (!process.env[key] || process.env[key].includes('CHANGE_ME')) {
      missing.push(key);
    }
  }

  if (process.env.NODE_ENV === 'production') {
    for (const key of production_required) {
      if (!process.env[key]) missing.push(key);
    }

    // Sprawdź długość sekretów w produkcji
    const minLength = 32;
    ['SESSION_SECRET', 'JWT_SECRET', 'JWT_REFRESH_SECRET'].forEach(key => {
      if (process.env[key] && process.env[key].length < minLength) {
        missing.push(\`\${key} zbyt krótki (min. \${minLength} znaków)\`);
      }
    });
  }

  if (missing.length > 0) {
    console.error('❌ Brakujące lub niepoprawne zmienne środowiskowe:');
    missing.forEach(k => console.error('   -', k));
    process.exit(1);
  }

  console.log('✅ Konfiguracja środowiskowa poprawna');
};
\`\`\`

---

## Separacja sekretów od konfiguracji

| Kategoria | Co to | Jak przechowywać |
|-----------|-------|------------------|
| **Sekrety** | JWT_SECRET, DB_PASS, SSH keys | GitHub Secrets / HashiCorp Vault |
| **Konfiguracja** | PORT, LOG_LEVEL, ALLOWED_ORIGINS | .env pliki + zmienne środowiskowe |
| **Stałe build** | NODE_ENV, VERSION | Argumenty docker build |

---

*Dokumentacja konfiguracji środowisk – Salon Samochodowy AiTSI | Wersja 1.0 | 2025*
`, 'utf8');

console.log('✅ 08-devops: 3 pliki utworzone (docker-setup.md, ci-cd-pipeline.md, environment-config.md)');
