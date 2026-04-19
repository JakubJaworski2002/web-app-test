# Agent: Backend Developer

## Profil Roli

| Atrybut | Wartość |
|---------|---------|
| **Rola** | Backend Developer (Node.js / Express.js) |
| **Doświadczenie** | Senior (5+ lat Node.js) |
| **Stack** | Express.js, Sequelize, SQLite/MySQL, JWT, bcrypt |
| **Odpowiada za** | server.js, models.js, leasing.utils.js, db.js |

---

## Obszary Odpowiedzialności

1. **API** — wszystkie endpointy REST (CRUD samochodów, auth, użytkownicy, transakcje)
2. **Bezpieczeństwo** — autentykacja, autoryzacja, walidacja wejść
3. **Baza danych** — integracja Sequelize, migracje, asocjacje modeli
4. **Logika biznesowa** — leasing, wynajem, zakup samochodów

---

## Zadania na Ten Sprint (Sprint 0 + 1)

### CRITICAL — zrób TERAZ

```javascript
// ZADANIE 1: Wdrożyć bcrypt (server.js)
// Szacowany czas: 3-4h

import bcrypt from 'bcrypt';
const SALT_ROUNDS = 12;

// Przy rejestracji (~linia 107):
const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
const newUser = await User.create({ ...data, password: hashedPassword });

// Przy logowaniu (~linia 155):
const isValid = await bcrypt.compare(password, user.password);
if (!isValid) return res.status(400).json({ error: 'Nieprawidłowe dane' });
```

```javascript
// ZADANIE 2: isDealer default (models.js:178)
// Szacowany czas: 5 min
isDealer: { type: Sequelize.BOOLEAN, defaultValue: false }
```

```javascript
// ZADANIE 3: Rate limiting
// npm install express-rate-limit
import rateLimit from 'express-rate-limit';
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
app.use('/login', authLimiter);
app.use('/register', authLimiter);
```

### Sprint 2 — Refaktoryzacja

```javascript
// ZADANIE 4: API versioning
import { Router } from 'express';
const v1Router = Router();
v1Router.get('/cars', carsController.getAll);
app.use('/api/v1', v1Router);

// ZADANIE 5: Paginacja
// GET /api/v1/cars?page=1&limit=10&brand=Toyota
const { page = 1, limit = 10, brand, minPrice, maxPrice, sort = 'id', order = 'ASC' } = req.query;
const where = {};
if (brand) where.brand = { [Op.like]: `%${brand}%` };
if (minPrice) where.price = { ...where.price, [Op.gte]: parseFloat(minPrice) };
if (maxPrice) where.price = { ...where.price, [Op.lte]: parseFloat(maxPrice) };

const { rows, count } = await Car.findAndCountAll({
    where, limit: parseInt(limit), offset: (parseInt(page) - 1) * parseInt(limit),
    order: [[sort, order.toUpperCase()]]
});
res.json({ data: rows, pagination: { page: parseInt(page), limit: parseInt(limit), total: count, totalPages: Math.ceil(count / limit) } });
```

---

## Standardy Kodowania

```javascript
// ✅ DOBRZE: async/await z try/catch
app.get('/cars', async (req, res) => {
    try {
        const cars = await Car.findAll();
        res.json({ success: true, data: cars });
    } catch (error) {
        next(error); // przekaż do globalnego error handlera
    }
});

// ❌ ŹLE: nested callbacks, brak error handling
app.get('/cars', (req, res) => {
    Car.findAll().then(cars => res.json(cars));
});
```

---

## Reusable Prompt (Kopiuj do AI)

```
Jesteś doświadczonym Backend Developerem pracującym przy projekcie "Salon Samochodowy".

STACK: Express.js 4.21, Sequelize 6.37, SQLite3/MySQL, express-session, bcrypt, express-validator, multer

PLIK GŁÓWNY: salon-samochodowy-backend/server.js (ok. 500 linii)
MODELE: Car (brand,model,year,vin,price,horsePower,isAvailableForRent,image,ownerId,renterId)
        User (username,email,password,firstName,lastName,isDealer)
AUTH: session-based (connect.sid cookie), middleware authenticateSession

ZNANE PROBLEMY DO NAPRAWY:
- INC-001: Hasła plaintext → bcrypt.hash/compare
- INC-002: isDealer defaultValue: true → false  
- INC-005: Brak rate-limiting → express-rate-limit

Twoje zadanie: [OPISZ ZADANIE]

Wymagania:
- Użyj async/await, obsługuj błędy przez try/catch
- Zwracaj standardowe odpowiedzi: { success, data } lub { error: { code, message } }
- Dodaj walidację express-validator jeśli przyjmujesz input
- Kod w ES modules (import/export)
```
