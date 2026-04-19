# Docker Implementation — Salon Samochodowy

## Overview

The project runs two containers orchestrated with Docker Compose:

| Service | Image | Host port | Container port |
|---------|-------|-----------|----------------|
| `backend` | Node 20 Alpine | 3000 | 3000 |
| `frontend` | nginx Alpine | 4200 | 80 |

The frontend is a static Angular 19 SPA built at image-build time and served by nginx.
The backend is an Express.js 4.21 API with SQLite (default) or MySQL support.

---

## Quick Start

```bash
# From the project root (web-app-test/)
docker compose up --build
```

- Frontend: http://localhost:4200
- Backend API: http://localhost:3000

### Run in detached mode

```bash
docker compose up --build -d
docker compose logs -f        # follow logs
docker compose down           # stop and remove containers
```

---

## Building Individual Images

```bash
# Backend
docker build -t salon-backend ./salon-samochodowy-backend

# Frontend
docker build -t salon-frontend ./salon-samochodowy-frontend
```

---

## Environment Variables

Set these in a `.env` file at the project root or pass with `-e` / `environment:` in compose.

### Backend

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Node environment |
| `PORT` | `3000` | Server port |
| `DB_DIALECT` | `sqlite` | `sqlite` or `mysql` |
| `DB_STORAGE` | `/app/data/salon.db` | SQLite file path (sqlite only) |
| `DB_HOST` | — | MySQL host |
| `DB_PORT` | `3306` | MySQL port |
| `DB_NAME` | — | MySQL database name |
| `DB_USER` | — | MySQL user |
| `DB_PASSWORD` | — | MySQL password |
| `JWT_SECRET` | *(change me)* | JWT signing secret — **must be changed in production** |
| `CORS_ORIGIN` | `http://localhost:4200` | Allowed CORS origin |

### Using MySQL instead of SQLite

1. Uncomment the MySQL variables in `docker-compose.yml`.
2. Add a `db` service (MySQL / MariaDB) to the compose file.
3. Set `DB_DIALECT: mysql` and fill the connection variables.

---

## Named Volumes

| Volume | Mount path | Purpose |
|--------|-----------|---------|
| `uploads_data` | `/app/uploads` | User-uploaded files (persisted across container restarts) |
| `sqlite_data` | `/app/data` | SQLite database file |

List volumes:

```bash
docker volume ls | grep salon
```

---

## Health Check

The backend container exposes a health check (HTTP GET `/`).
The frontend container waits for the backend to be `healthy` before starting.

```bash
docker compose ps          # shows health status
docker inspect salon-backend --format='{{.State.Health.Status}}'
```

---

## CI/CD — GitHub Actions

The workflow file is at `.github/workflows/ci.yml`.

### Triggers

| Event | Jobs run |
|-------|----------|
| Push to `main` | lint-backend, lint-frontend, test-backend, **test-playwright** |
| Push to `develop` | lint-backend, lint-frontend, test-backend |
| PR to `main` | lint-backend, lint-frontend, test-backend |

### Jobs

1. **lint-backend** — installs backend deps, runs `npm run lint` if configured
2. **lint-frontend** — installs frontend deps, runs `ng lint` if configured
3. **test-backend** — runs Jest unit tests (`npm test`)
4. **test-playwright** — starts backend + frontend, runs Playwright on Chromium; only runs on push to `main` to keep PR feedback fast

### Node.js Caching

Each job uses `actions/setup-node` with `cache: npm` scoped to its own `package-lock.json` to avoid cross-workspace cache collisions.

---

## Folder Structure

```
web-app-test/
├── .dockerignore                        # shared ignore rules for all builds
├── docker-compose.yml                   # orchestrates backend + frontend
├── salon-samochodowy-backend/
│   └── Dockerfile                       # Node 20 Alpine, production deps only
└── salon-samochodowy-frontend/
    ├── Dockerfile                        # multi-stage: Node build → nginx serve
    └── nginx.conf                        # SPA routing + gzip + asset caching
```

---

## Useful Commands

```bash
# Rebuild only one service
docker compose build backend

# Open a shell in a running container
docker compose exec backend sh
docker compose exec frontend sh

# View real-time logs for one service
docker compose logs -f backend

# Remove containers, networks, and volumes
docker compose down -v
```
