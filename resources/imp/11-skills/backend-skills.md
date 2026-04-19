# Przewodnik Umiejętności — Backend (Node.js / Express.js)

## Wzorce Async/Await

```javascript
// ✅ DOBRZE: Zawsze try/catch
app.get('/cars/:id', async (req, res, next) => {
    try {
        const car = await Car.findByPk(req.params.id);
        if (!car) return res.status(404).json({ error: 'Nie znaleziono' });
        res.json(car);
    } catch (err) {
        next(err); // globalny error handler
    }
});
```

## Walidacja z express-validator

```javascript
import { body, param, validationResult } from 'express-validator';

const validateCar = [
    body('brand').notEmpty().isString(),
    body('vin').isLength({ min: 17, max: 17 }),
    body('price').isFloat({ min: 0 }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        next();
    }
];
```

## Bezpieczna Autentykacja

```javascript
// ✅ bcrypt — ZAWSZE haszuj hasła
import bcrypt from 'bcrypt';
const SALT_ROUNDS = 12;

// Rejestracja
const hash = await bcrypt.hash(plainPassword, SALT_ROUNDS);

// Logowanie
const isValid = await bcrypt.compare(plainPassword, hashedFromDB);
```

## Sequelize Patterns

```javascript
// Eager loading (unikaj N+1)
const cars = await Car.findAll({
    include: [{ model: User, as: 'owner', attributes: ['username', 'firstName'] }]
});

// findAndCountAll — paginacja
const { rows, count } = await Car.findAndCountAll({
    where: { isAvailableForRent: true },
    limit: 10, offset: 0,
    order: [['price', 'ASC']]
});

// Transakcje DB
const t = await sequelize.transaction();
try {
    await Car.update({ isAvailableForRent: false }, { where: { id }, transaction: t });
    await t.commit();
} catch (err) {
    await t.rollback();
    throw err;
}
```

## OWASP Top 10 Checklist

- [x] A02: Hasła przez bcrypt (WYMAGA WDROŻENIA — INC-001)
- [x] A03: express-validator dla inputów
- [ ] A04: Rate limiting — express-rate-limit (INC-005)
- [x] A05: SESSION_SECRET z env
- [ ] A05: Helmet.js security headers
- [x] A06: Sequelize ORM (SQL injection protection)
