# Docker Setup — Plan i Pliki Konfiguracyjne

## Pliki do Stworzenia

```
web-app-test/
├── salon-samochodowy-backend/
│   ├── Dockerfile
│   └── .dockerignore
├── salon-samochodowy-frontend/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── nginx.conf
└── docker-compose.yml
```

---

## Dockerfile — Backend

```dockerfile
# salon-samochodowy-backend/Dockerfile
FROM node:20-alpine AS production
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY . .
RUN mkdir -p uploads data

EXPOSE 3000
ENV NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
    CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
```

```
# salon-samochodowy-backend/.dockerignore
node_modules
data/*.sqlite
uploads/*
.env
*.log
```

---

## Dockerfile — Frontend (Multi-stage)

```dockerfile
# salon-samochodowy-frontend/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration=production

FROM nginx:alpine AS production
COPY --from=builder /app/dist/salon-samochodowy-frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/health || exit 1
```

```nginx
# salon-samochodowy-frontend/nginx.conf
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /uploads/ {
        proxy_pass http://backend:3000;
    }
}
```

---

## docker-compose.yml

```yaml
version: '3.9'

services:
  backend:
    build:
      context: ./salon-samochodowy-backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      SESSION_SECRET: ${SESSION_SECRET:?SESSION_SECRET required}
      ALLOWED_ORIGINS: http://localhost,http://localhost:80
      DB_HOST: mysql
      DB_NAME: salon_samochodowy
      DB_USER: ${DB_USER:-salon_user}
      DB_PASSWORD: ${DB_PASSWORD:?DB_PASSWORD required}
      DB_PORT: 3306
    depends_on:
      mysql:
        condition: service_healthy
    volumes:
      - uploads_data:/app/uploads
    restart: unless-stopped

  frontend:
    build:
      context: ./salon-samochodowy-frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD:?required}
      MYSQL_DATABASE: salon_samochodowy
      MYSQL_USER: ${DB_USER:-salon_user}
      MYSQL_PASSWORD: ${DB_PASSWORD:?required}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p${DB_ROOT_PASSWORD}"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  adminer:
    image: adminer:latest
    ports:
      - "8080:8080"
    depends_on:
      - mysql
    profiles:
      - dev  # tylko z: docker-compose --profile dev up

volumes:
  mysql_data:
  uploads_data:
```

---

## .env Template dla Docker

```bash
# .env.docker (nie commituj!)
SESSION_SECRET=twoj-super-tajny-klucz-min-32-znakow
DB_USER=salon_user
DB_PASSWORD=bezpieczne-haslo-db
DB_ROOT_PASSWORD=root-haslo-mysql
```

---

## Uruchamianie

```bash
# Dev (z adminer)
docker-compose --profile dev up --build

# Production
cp .env.docker .env
docker-compose up --build -d

# Sprawdź logi
docker-compose logs -f backend

# Zatrzymaj
docker-compose down

# Usuń wszystkie dane (UWAGA!)
docker-compose down -v
```
