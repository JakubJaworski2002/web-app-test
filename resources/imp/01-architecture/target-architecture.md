# Architektura Docelowa

## Docelowa Architektura (po refaktoryzacji)

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRZEGLĄDARKA                             │
│  Angular 19 SPA — feature modules, lazy loading, Signals        │
│                                                                 │
│  Core:  AuthService (Signals) | ErrorHandler | LoadingService   │
│  Shared: CarCard | LoadingSpinner | Toast | ConfirmDialog        │
│                                                                 │
│  Features:                                                       │
│    cars/ → CarListComponent (OnPush, POM) | CarDetailComponent  │
│    auth/ → LoginComponent (Reactive Forms) | AuthGuard           │
│    admin/ → DashboardComponent (DealerGuard)                    │
└───────────────────────────────┬─────────────────────────────────┘
                                │ HTTPS (port 443)
                                │ JWT Bearer Token (future) / Session
┌───────────────────────────────▼─────────────────────────────────┐
│              EXPRESS.JS — Layered Architecture                   │
│                                                                 │
│  routes/         → URL mapping (v1Router)                       │
│  controllers/    → HTTP req/res handling                        │
│  services/       → Business logic (auth, car, leasing)          │
│  middleware/     → auth, rateLimit, helmet, errorHandler         │
│  models/         → Car, User, Transaction (Sequelize)           │
│  migrations/     → Sequelize migrations                         │
└───────────────────────────────┬─────────────────────────────────┘
                                │
              ┌─────────────────▼─────────────────┐
              │         MySQL 8.0 (prod)           │
              │  Tables: Cars, Users, Transactions  │
              │  Indexes: brand, ownerId, username  │
              └─────────────────────────────────────┘
```

## Nowa Struktura Backend

```
salon-samochodowy-backend/
├── server.js                  ← Entry point (slim — tylko setup)
├── routes/
│   ├── auth.routes.js
│   ├── cars.routes.js
│   ├── users.routes.js
│   └── transactions.routes.js
├── controllers/
│   ├── auth.controller.js
│   ├── cars.controller.js
│   └── users.controller.js
├── services/
│   ├── auth.service.js        ← bcrypt, session logic
│   ├── car.service.js         ← business logic (rent, buy, leasing)
│   └── transaction.service.js
├── middleware/
│   ├── auth.middleware.js
│   ├── dealer.middleware.js
│   ├── rateLimiter.middleware.js
│   └── errorHandler.middleware.js
├── models/
│   ├── car.model.js
│   ├── user.model.js
│   └── transaction.model.js
└── migrations/
    ├── 001-add-isSold.js
    ├── 002-create-transactions.js
    └── 003-add-indexes.js
```

## Nowa Struktura Frontend

```
salon-samochodowy-frontend/src/app/
├── core/
│   ├── services/
│   │   ├── auth.service.ts      ← Signals, HTTP calls
│   │   └── error.service.ts
│   ├── guards/
│   │   ├── auth.guard.ts
│   │   └── dealer.guard.ts
│   └── interceptors/
│       └── auth.interceptor.ts  ← Session cookie handling
├── shared/
│   ├── components/
│   │   ├── loading-spinner/
│   │   ├── toast-notification/
│   │   └── confirm-dialog/
│   └── models/
│       ├── car.model.ts
│       ├── user.model.ts
│       └── transaction.model.ts
└── features/
    ├── cars/
    │   ├── car-list/
    │   ├── car-detail/
    │   ├── add-car/
    │   └── edit-car/
    ├── auth/
    │   └── login-register/
    └── add-customer/
```

---

## Decyzje Technologiczne — Tabela Uaktualnień

| Komponent | Obecna Technologia | Proponowana Zmiana | Powód | Faza |
|-----------|-------------------|-------------------|-------|------|
| Haszowanie haseł | Plaintext (bcrypt zainstalowany) | bcrypt (rounds=12) | INC-001 CRITICAL | Faza 1 |
| Autoryzacja | Session-only | Session + opcjonalnie JWT | Skalowalność | Faza 1/5 |
| Baza danych (dev) | SQLite | SQLite (bez zmian) | Prostota lokalnego dev | — |
| Baza danych (prod) | MySQL (fallback) | MySQL 8.0 / PostgreSQL 16 | Wydajność, FK integrity | Faza 2 |
| Architektura BE | Monolityczny server.js | Clean Architecture (routes/controllers/services) | Testowalność, utrzymanie | Faza 2 |
| Walidacja BE | express-validator | Joi 17 | Bardziej ekspresywna API | Faza 2 |
| State management FE | BehaviorSubject (RxJS) | Angular Signals | Angular 16+ standard | Faza 3 |
| Change Detection FE | Default | OnPush dla wszystkich | Wydajność | Faza 3 |
| CSS/Design System | Bootstrap + Angular Material | Bootstrap + AM + CSS Custom Properties | Design tokens bez migracji | Faza 3 |
| Logowanie | console.log | Winston (JSON format) | Strukturalne logi, rotacja | Faza 2 |
| Reverse Proxy | Brak | nginx | SSL termination, static files | Faza 5 |
| Konteneryzacja | Brak | Docker + docker-compose | Portability, CI/CD | Faza 1 |
| CI/CD | Brak | GitHub Actions | Standard, darmowe | Faza 1 |
| Monitoring | Brak | Prometheus + Grafana | Widoczność produkcyjna | Faza 5 |
| Testy jednostkowe BE | Brak | Jest + Supertest | TDD, coverage | Faza 4 |

---

## Konfiguracja API Gateway (Express Middleware Stack)

```javascript
// server.js — middleware stack (po refaktoryzacji)
const express = require('express');
const helmet  = require('helmet');
const cors    = require('cors');
const rateLimit = require('express-rate-limit');
const session   = require('express-session');
const morgan    = require('morgan');

const app = express();

// 1. Security headers (Helmet.js)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      imgSrc:     ["'self'", 'data:', 'blob:']
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true }
}));

// 2. CORS (z zmienną środowiskową)
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:4200'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

// 3. Rate Limiting
app.use('/api/', rateLimit({ windowMs: 15*60*1000, max: 100 }));
app.use('/api/v1/login',    rateLimit({ windowMs: 60*1000, max: 5 }));
app.use('/api/v1/register', rateLimit({ windowMs: 60*1000, max: 3 }));

// 4. Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Session
app.use(session({
  secret: process.env.SESSION_SECRET,  // Wymagany!
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure:   process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge:   7 * 24 * 60 * 60 * 1000  // 7 dni
  }
}));

// 6. Logging (HTTP access log)
app.use(morgan('combined', { stream: winstonStream }));

// 7. Routes
app.use('/api/v1', v1Router);
app.use('/api', legacyRouter);  // backward compat (deprecated)

// 8. Error Handler (zawsze ostatni)
app.use(errorHandler);
```

---

## Strategia Cache'owania (Redis)

### Warstwy Cache

| Warstwa | Co Cache'ować | TTL | Strategia Invalidacji |
|---------|--------------|-----|-----------------------|
| **Redis L1** | Lista samochodów (GET /api/v1/cars) | 5 minut | Invalidacja przy POST/PUT/DELETE /cars |
| **Redis L1** | Szczegóły samochodu (GET /api/v1/cars/:id) | 10 minut | Invalidacja przy PUT/DELETE /cars/:id |
| **Redis L1** | Dane current-user | 1 minuta | Invalidacja przy logout i PUT /users/:id |
| **HTTP Cache** | Zdjęcia samochodów (static files) | 7 dni (Cache-Control) | Nowa nazwa pliku przy upload |
| **SSR Cache** | Wstępnie renderowane strony Angular | 60 sekund | Inwalidacja przy zmianie danych |

### Implementacja Redis Cache (przykład)

```javascript
// middleware/cache.middleware.js
const redis = require('redis');
const client = redis.createClient({ url: process.env.REDIS_URL });

const cacheMiddleware = (ttlSeconds) => async (req, res, next) => {
  if (req.method !== 'GET') return next();
  
  const key = `cache:${req.originalUrl}`;
  
  try {
    const cached = await client.get(key);
    if (cached) {
      return res.json(JSON.parse(cached));
    }
  } catch (err) {
    // Cache miss — kontynuuj bez cache
  }
  
  const originalJson = res.json.bind(res);
  res.json = (data) => {
    client.setEx(key, ttlSeconds, JSON.stringify(data)).catch(console.error);
    return originalJson(data);
  };
  
  next();
};

module.exports = cacheMiddleware;

// Użycie w route:
router.get('/cars', cacheMiddleware(300), carsController.list);
```

---

## Strategia Przechowywania Plików

### Dev (lokalne)

```
salon-samochodowy-backend/
└── uploads/
    └── cars/
        ├── car-1-1704067200000.jpg
        ├── car-2-1704067201000.jpg
        └── ...
```

```javascript
// Multer config (dev)
const storage = multer.diskStorage({
  destination: 'uploads/cars/',
  filename: (req, file, cb) => {
    const uniqueName = `car-${req.params.id}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },  // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  }
});
```

### Produkcja (S3-compatible)

```javascript
// Multer config (prod) — AWS S3 / MinIO / DigitalOcean Spaces
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3');

const s3 = new S3Client({
  region:   process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT,  // Dla MinIO/DO Spaces
  credentials: {
    accessKeyId:     process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY
  }
});

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET,
    key:    (req, file, cb) => cb(null, `cars/${req.params.id}/${Date.now()}-${file.originalname}`)
  }),
  limits: { fileSize: 5 * 1024 * 1024 }
});
```

---

## Monitoring i Obserwowalność

### Metryki Prometheus

```javascript
// metrics.js — Node.js metrics dla Prometheus
const client = require('prom-client');
const register = new client.Registry();

// Domyślne metryki Node.js (memory, CPU, GC)
client.collectDefaultMetrics({ register });

// Custom metryki aplikacyjne
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Czas trwania żądań HTTP',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.2, 0.5, 1, 2, 5]
});

const activeUsers = new client.Gauge({
  name: 'salon_active_sessions',
  help: 'Liczba aktywnych sesji użytkowników'
});

const carsTotal = new client.Gauge({
  name: 'salon_cars_total',
  help: 'Łączna liczba samochodów w bazie',
  labelNames: ['status']  // available, rented, sold
});

register.registerMetric(httpRequestDuration);
register.registerMetric(activeUsers);
register.registerMetric(carsTotal);

// Endpoint metryczny
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

### Dashboardy Grafana

| Dashboard | Metryki | Alerty |
|-----------|---------|--------|
| **API Performance** | Request rate, latency p50/p95/p99, error rate | Error rate > 5% → Slack |
| **Node.js Health** | CPU %, Memory heap/RSS, GC duration | Memory > 80% → Email |
| **Database** | Query latency, connection pool, slow queries | Slow query > 1s → Slack |
| **Business Metrics** | Nowe rejestracje, transakcje/h, dostępne auta | — |

### Logowanie (Winston)

```javascript
// logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'salon-samochodowy-backend' },
  transports: [
    new winston.transports.Console({
      format: winston.format.colorize({ all: true })
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880,   // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 10485760,  // 10MB
      maxFiles: 10
    })
  ]
});

module.exports = logger;
```

---

## Plan Migracji (Obecna → Docelowa)

### Etap 1: Bezpieczeństwo (Faza 1)
- Dodaj bcrypt do register/login (nie zrywa istniejącego kodu)
- Dodaj rate limiting jako middleware (nie zrywa istniejącego kodu)
- Napraw isDealer default (może wymagać update istniejących userów)

### Etap 2: Restrukturyzacja Backend (Faza 2)
```
server.js (monolith)
    ↓ Extract Routes
routes/auth.routes.js, routes/cars.routes.js, routes/users.routes.js
    ↓ Extract Controllers
controllers/auth.controller.js, ...
    ↓ Extract Services
services/auth.service.js, ...
    ↓ Add API Versioning
/api/v1/ prefix (stare URL przez 2 sprinty → deprecated)
```

### Etap 3: Frontend (Faza 3)
```
BehaviorSubject → Angular Signals
Default CD → OnPush CD
HTTP /cars → HTTP /api/v1/cars
Brak guardy → AuthGuard + DealerGuard
alert() → MatSnackBar
```

### Etap 4: Infrastruktura (Fazy 1 + 5)
```
Brak Docker → docker-compose.yml (dev)
                → docker-compose.prod.yml (prod)
Brak CI/CD   → GitHub Actions ci.yml + deploy.yml
Brak nginx   → nginx + certbot (Let's Encrypt)
Brak monitoring → Prometheus + Grafana
```

---

*Dokument Architektury Docelowej — wersja 1.0 — styczeń 2025*  
*Autor: IT Architect | Zatwierdzono przez: Project Owner*
