# DevOps — Przewodnik Umiejętności

## Docker Basics

```bash
# Zbuduj obraz
docker build -t salon-backend ./salon-samochodowy-backend

# Uruchom kontener
docker run -p 3000:3000 --env-file .env salon-backend

# Docker Compose — pełny stack
docker-compose up --build -d

# Sprawdź logi
docker-compose logs -f backend

# Shell do kontenera
docker exec -it <container_name> sh

# Zatrzymaj i usuń
docker-compose down

# Usuń wszystko (dane też!)
docker-compose down -v --rmi all
```

## GitHub Actions — Kluczowe Wzorce

```yaml
# Cache node_modules (znacznie przyspiesza CI)
- uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}

# Wait for service to be ready
- run: npx wait-on http://localhost:3000/health --timeout 30000

# Upload artifacts przy błędach
- uses: actions/upload-artifact@v4
  if: failure()
  with:
    name: test-results
    path: Playwright/playwright-report/
```

## Zmienne Środowiskowe w CI

```yaml
# W workflow — używaj GitHub Secrets
env:
  SESSION_SECRET: ${{ secrets.SESSION_SECRET }}
  DB_PASSWORD: ${{ secrets.DB_PASSWORD }}

# NIE rób tak (expose sekretów):
# echo "SESSION_SECRET=abc123" >> .env
```

## Nginx Reverse Proxy

```nginx
# Production nginx.conf
server {
    listen 443 ssl;
    server_name salon-samochodowy.pl;
    
    ssl_certificate     /etc/letsencrypt/live/.../fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/.../privkey.pem;
    
    # Serwuj Angular
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy do Express.js API
    location /api/ {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Redirect HTTP → HTTPS
server {
    listen 80;
    return 301 https://$host$request_uri;
}
```

## Monitoring (Health Checks)

```javascript
// server.js — health endpoint
app.get('/health', async (req, res) => {
    try {
        await sequelize.authenticate();
        res.json({ status: 'ok', db: 'connected', uptime: process.uptime() });
    } catch {
        res.status(503).json({ status: 'error', db: 'disconnected' });
    }
});
```

```yaml
# docker-compose — health check
healthcheck:
  test: ["CMD", "wget", "-qO-", "http://localhost:3000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

## Database Backup (SQLite)

```bash
#!/bin/bash
# backup.sh — dodaj do cron: 0 2 * * * /app/backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/sqlite"
mkdir -p $BACKUP_DIR

# SQLite backup
sqlite3 /app/data/salon-samochodowy.sqlite ".backup '$BACKUP_DIR/backup_$DATE.sqlite'"

# Zachowaj ostatnie 7 backupów
ls -t $BACKUP_DIR/*.sqlite | tail -n +8 | xargs rm -f

echo "Backup created: backup_$DATE.sqlite"
```
