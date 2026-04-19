# INC-006 — Hardcoded CORS Origin

| Pole | Wartość |
|------|---------|
| **ID** | INC-006 |
| **Severity** | 🟡 MEDIUM |
| **Status** | OPEN |
| **Odkryto** | 2026-03-29 |
| **Komponent** | `salon-samochodowy-backend/server.js` |
| **Linia** | 37 |
| **Sprint naprawy** | Sprint 1 |

## Opis

CORS jest skonfigurowany z hardcoded wartością `'http://localhost:4200'`. W środowiskach staging i produkcyjnych frontend będzie na innym adresie, co spowoduje błędy CORS i niedziałającą aplikację.

```javascript
// server.js:36-40 — OBECNY KOD (zły)
app.use(cors({
    origin: 'http://localhost:4200',  // ← hardcoded!
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));
```

## Naprawa

```javascript
// server.js — poprawiona konfiguracja CORS
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:4200')
    .split(',')
    .map(o => o.trim());

app.use(cors({
    origin: (origin, callback) => {
        // Pozwól na brak origin (np. curl, Postman) lub dozwolone origins
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS: Origin ${origin} nie jest dozwolony`));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));
```

```bash
# .env.production
ALLOWED_ORIGINS=https://salon-samochodowy.pl,https://www.salon-samochodowy.pl
```

## Weryfikacja

- [ ] `ALLOWED_ORIGINS=http://localhost:4200` — działa lokalnie
- [ ] Niezdefiniowany origin → 403 CORS error
- [ ] Poprawny origin z env → 200
