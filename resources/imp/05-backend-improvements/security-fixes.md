# Poprawki Bezpieczeństwa — Plan Implementacji

## Priorytet Napraw

| ID | Poprawka | Sprint | Czas | Status |
|----|---------|--------|------|--------|
| FIX-001 | bcrypt dla haseł | 0 | 4h | OPEN |
| FIX-002 | isDealer default=false | 0 | 15min | OPEN |
| FIX-003 | Rate limiting | 0 | 1h | OPEN |
| FIX-004 | CORS z env | 1 | 30min | OPEN |
| FIX-005 | Security headers (helmet) | 1 | 1h | OPEN |
| FIX-006 | SESSION_SECRET z env | 0 | — | ✅ DONE |

---

## FIX-001: Bcrypt Password Hashing

```bash
# bcrypt już zainstalowany — nie trzeba instalować
# "bcrypt": "^5.1.1" w package.json
```

```javascript
// server.js — dodaj na górze
import bcrypt from 'bcrypt';
const SALT_ROUNDS = 12;

// server.js ~linia 107 (rejestracja) — ZMIEŃ:
// PRZED: password (plaintext)
// PO:
const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
const newUser = await User.create({
    username, email,
    password: hashedPassword,
    firstName, lastName, isDealer: false
});

// server.js ~linia 155 (logowanie) — ZMIEŃ:
// PRZED: if (user.password !== password)
// PO:
const isPasswordValid = await bcrypt.compare(password, user.password);
if (!isPasswordValid) {
    return res.status(400).json({ error: 'Nieprawidłowa nazwa użytkownika lub hasło' });
}
```

**Skrypt migracji** (uruchom raz przed deploy):
```javascript
// migrate-passwords.js
import { User } from './models.js';
import bcrypt from 'bcrypt';
const users = await User.findAll();
for (const user of users) {
    if (!user.password.startsWith('$2b$')) {
        await user.update({ password: await bcrypt.hash(user.password, 12) });
        console.log(`Migrated: ${user.username}`);
    }
}
process.exit(0);
```

---

## FIX-002: isDealer Default Value

```javascript
// models.js:178 — ZMIEŃ 1 słowo:
// defaultValue: true   →   defaultValue: false
isDealer: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,  // ← ZMIANA
},
```

---

## FIX-003: Rate Limiting

```bash
npm install express-rate-limit
```

```javascript
// server.js — po imporcie session
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minut
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === 'test', // wyłącz dla testów
    message: { error: 'Zbyt wiele prób. Spróbuj za 15 minut.' }
});

app.use('/login', authLimiter);
app.use('/register', authLimiter);
```

---

## FIX-004: CORS z Environment Variables

```javascript
// server.js:36-40 — ZMIEŃ:
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:4200')
    .split(',').map(o => o.trim());

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS blocked: ${origin}`));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));
```

```bash
# .env
ALLOWED_ORIGINS=http://localhost:4200

# .env.production
ALLOWED_ORIGINS=https://salon-samochodowy.pl,https://www.salon-samochodowy.pl
```

---

## FIX-005: Security Headers (Helmet.js)

```bash
npm install helmet
```

```javascript
// server.js — tuż po `const app = express();`
import helmet from 'helmet';
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // dla uploads
}));
```

---

## Kolejność Implementacji

```bash
# 1. Backup bazy przed zmianami
cp data/salon-samochodowy.sqlite data/salon-samochodowy.backup.sqlite

# 2. Zaimplementuj bcrypt (FIX-001)
# 3. Zmień isDealer default (FIX-002)
# 4. Uruchom migrację haseł
node migrate-passwords.js

# 5. Dodaj rate limiting (FIX-003)
npm install express-rate-limit

# 6. Napraw CORS (FIX-004)
# 7. Dodaj helmet (FIX-005)
npm install helmet

# 8. Uruchom wszystkie testy
cd ../Playwright && npx playwright test
```
