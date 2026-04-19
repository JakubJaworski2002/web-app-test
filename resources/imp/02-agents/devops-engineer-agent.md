# Agent: DevOps Engineer

## Profil Roli

| Atrybut | Wartość |
|---------|---------|
| **Rola** | DevOps / Infrastructure Engineer |
| **Stack** | Docker, GitHub Actions, Nginx, Node.js 20, MySQL |
| **Odpowiada za** | Dockerfiles, docker-compose, CI/CD workflows, środowiska |

---

## Dockerfile — Backend (Node 20 Alpine)

```dockerfile
# salon-samochodowy-backend/Dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS production
COPY . .
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "server.js"]
```

---

## Dockerfile — Frontend (Multi-stage + Nginx)

```dockerfile
# salon-samochodowy-frontend/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine AS production
COPY --from=builder /app/dist/salon-samochodowy-frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

```nginx
# nginx.conf
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;
    
    # Angular routing - fallback to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy API calls to backend
    location /api/ {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## docker-compose.yml

```yaml
version: '3.9'

services:
  backend:
    build: ./salon-samochodowy-backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - SESSION_SECRET=${SESSION_SECRET}
      - DB_HOST=mysql
      - DB_NAME=salon_samochodowy
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - ALLOWED_ORIGINS=http://localhost:4200,http://localhost
    depends_on:
      mysql:
        condition: service_healthy
    volumes:
      - uploads:/app/uploads

  frontend:
    build: ./salon-samochodowy-frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: salon_samochodowy
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  adminer:
    image: adminer
    ports:
      - "8080:8080"
    depends_on:
      - mysql

volumes:
  mysql_data:
  uploads:
```

---

## GitHub Actions — PR Checks

```yaml
# .github/workflows/pr-checks.yml
name: PR Checks
on:
  pull_request:
    branches: [main, develop]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm', cache-dependency-path: 'salon-samochodowy-backend/package-lock.json' }
      - run: cd salon-samochodowy-backend && npm ci && npm test

  frontend-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm', cache-dependency-path: 'salon-samochodowy-frontend/package-lock.json' }
      - run: cd salon-samochodowy-frontend && npm ci && npm run build

  playwright-smoke:
    runs-on: ubuntu-latest
    needs: [backend-tests, frontend-build]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: cd Playwright && npm ci && npx playwright install --with-deps chromium
      - run: |
          cd salon-samochodowy-backend && node server.js &
          cd salon-samochodowy-frontend && npx ng serve --port 4200 &
          sleep 15
          cd Playwright && npx playwright test --project=setup
          npx playwright test tests/api/ --project=chromium
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: Playwright/playwright-report/
          retention-days: 7
```

---

## Reusable Prompt

```
Jesteś doświadczonym DevOps Engineer pracującym przy projekcie "Salon Samochodowy".

PROJEKT:
- Frontend: Angular 19 SPA (port 4200 dev, port 80 prod via nginx)
- Backend: Express.js + Sequelize (port 3000)
- DB: SQLite (dev) / MySQL 8.0 (prod)
- Testy: Playwright (Playwright/), Jest (salon-samochodowy-backend/tests/)

REPO: C:\Users\mixer\Documents\GitHub\Studia_magister_1\AiTSI\web-app-test

Twoje zadanie: [OPISZ ZADANIE]

Wymagania:
- Docker multi-stage builds (minimalne obrazy, alpine)
- Sekrety przez environment variables (nigdy hardcoded)
- Health checks dla wszystkich serwisów
- GitHub Actions: cache node_modules, upload artifacts przy błędach
```
