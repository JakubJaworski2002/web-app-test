# Refaktoryzacja API — Plan Implementacji

## API Versioning Strategy

```
Obecne URL:   GET /cars
Nowe URL:     GET /api/v1/cars
Backward compat: /cars nadal działa przez 1 sprint (deprecated)
```

### Implementacja Express Router

```javascript
// server.js — dodaj nowy router
import { Router } from 'express';

const v1Router = Router();

// Przenieś wszystkie route handlers tutaj
v1Router.get('/cars', async (req, res) => { /* ... */ });
v1Router.post('/cars', authenticateSession, async (req, res) => { /* ... */ });
// ... reszta endpointów

app.use('/api/v1', v1Router);

// Backward compat — deprecated
app.use('/cars', (req, res, next) => {
    console.warn(`Deprecated: use /api/v1${req.path}`);
    next();
}, v1Router); // ← przekaż do tego samego handlera
```

---

## Paginacja

```javascript
// GET /api/v1/cars?page=1&limit=10&brand=Toyota&minPrice=50000&sort=price&order=asc

v1Router.get('/cars', async (req, res) => {
    const {
        page = 1, limit = 10,
        brand, minPrice, maxPrice,
        sort = 'id', order = 'ASC'
    } = req.query;

    const where = {};
    if (brand) where.brand = { [Op.like]: `%${brand}%` };
    if (minPrice) where.price = { ...where.price, [Op.gte]: parseFloat(minPrice) };
    if (maxPrice) where.price = { ...where.price, [Op.lte]: parseFloat(maxPrice) };

    const allowedSort = ['id', 'price', 'year', 'horsePower', 'brand'];
    const safeSort = allowedSort.includes(sort) ? sort : 'id';

    const { rows, count } = await Car.findAndCountAll({
        where,
        limit: Math.min(parseInt(limit), 100), // max 100
        offset: (parseInt(page) - 1) * parseInt(limit),
        order: [[safeSort, order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']]
    });

    res.json({
        success: true,
        data: rows,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: count,
            totalPages: Math.ceil(count / parseInt(limit))
        }
    });
});
```

---

## Standaryzacja Odpowiedzi Błędów

```javascript
// middleware/errorHandler.middleware.js
export const errorHandler = (err, req, res, next) => {
    console.error(err); // lub Winston logger
    const status = err.status || 500;
    res.status(status).json({
        success: false,
        error: {
            code: err.code || 'INTERNAL_ERROR',
            message: err.message || 'Wystąpił błąd serwera'
        }
    });
};

// server.js — na końcu, po wszystkich routes
app.use(errorHandler);
```

---

## Health Check Endpoint

```javascript
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        database: 'connected' // lub sprawdź sequelize.authenticate()
    });
});
```
