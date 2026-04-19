# Optymalizacja Wydajności — Backend

## Kompresja Odpowiedzi

```bash
npm install compression
```

```javascript
// server.js — przed innymi middleware
import compression from 'compression';
app.use(compression()); // Gzip/Brotli — redukuje rozmiar JSON ~70%
```

## Cachowanie w Pamięci

```javascript
// Prosty in-memory cache dla listy samochodów
const cache = new Map();
const CACHE_TTL = 30 * 1000; // 30 sekund

app.get('/api/v1/cars', async (req, res) => {
    const cacheKey = JSON.stringify(req.query);
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return res.json(cached.data);
    }
    
    const result = await Car.findAndCountAll({ /* ... */ });
    cache.set(cacheKey, { data: result, timestamp: Date.now() });
    res.json(result);
});

// Invaliduj cache po zmianie danych
const invalidateCarCache = () => {
    for (const key of cache.keys()) {
        if (key.includes('"cars"') || key === '{}') cache.delete(key);
    }
};
```

## Optymalizacja Sequelize

```javascript
// ❌ ŹLE — N+1 queries
const cars = await Car.findAll();
for (const car of cars) {
    const owner = await User.findByPk(car.ownerId); // N queries!
}

// ✅ DOBRZE — eager loading (1 query z JOIN)
const cars = await Car.findAll({
    include: [{
        model: User, as: 'owner',
        attributes: ['id', 'username', 'firstName'] // tylko potrzebne pola
    }]
});

// ✅ DOBRZE — select tylko potrzebnych kolumn
const cars = await Car.findAll({
    attributes: ['id', 'brand', 'model', 'year', 'price', 'isAvailableForRent'],
    // Bez image (base64 binary) jeśli nie potrzebne
});
```

## Connection Pooling (MySQL)

```javascript
// db.js — dla MySQL w produkcji
const mysqlConfig = {
    // ...
    pool: {
        max: 10,        // max 10 jednoczesnych połączeń
        min: 0,
        acquire: 30000, // max czas oczekiwania na połączenie
        idle: 10000     // czas przed zwolnieniem nieużywanego
    }
};
```

## Monitoring Wydajności

```javascript
// Middleware mierzący czas odpowiedzi
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        if (duration > 500) { // Alert jeśli >500ms
            console.warn(`Slow request: ${req.method} ${req.path} - ${duration}ms`);
        }
    });
    next();
});
```
