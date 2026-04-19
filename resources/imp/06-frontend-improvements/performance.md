# Optymalizacja Wydajności — Frontend

## Analiza Bundle Size

```bash
# Zbuduj z analizą
cd salon-samochodowy-frontend
npm run build -- --stats-json

# Zainstaluj analyzer
npm install --save-dev webpack-bundle-analyzer
npx webpack-bundle-analyzer dist/salon-samochodowy-frontend/stats.json
```

## Kluczowe Optymalizacje

### 1. OnPush Change Detection (wszędzie)
```typescript
@Component({ changeDetection: ChangeDetectionStrategy.OnPush })
// Redukuje liczbę sprawdzeń change detection o ~70%
```

### 2. TrackBy w ngFor
```typescript
trackByCar = (i: number, car: Car) => car.id;
// Zapobiega re-renderowaniu niezmiennych elementów listy
```

### 3. Lazy Loading Obrazów
```html
<img [src]="car.image" loading="lazy" alt="...">
```

### 4. Pure Pipes zamiast metod w template
```typescript
// ❌ ŹLE — wywołuje się przy każdym change detection
{{ formatPrice(car.price) }}

// ✅ DOBRZE — pure pipe, cachuje wyniki
{{ car.price | currency:'PLN' }}
```

### 5. Lazy Loading Routes (już częściowo)
```typescript
// ✅ Już używane — loadComponent
{
    path: 'cars',
    loadComponent: () => import('./components/car-list/...').then(m => m.CarListComponent)
}
```

## Angular SSR Weryfikacja

```bash
# Sprawdź czy SSR działa
cd salon-samochodowy-frontend
npm run build
node dist/salon-samochodowy-frontend/server/server.mjs

# Sprawdź Time To First Byte (TTFB) z SSR vs bez
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:4000/cars
```

## HTTP Caching

```javascript
// server.js — dodaj cache headers dla statycznych danych
app.get('/api/v1/cars', async (req, res) => {
    // Cache na 30 sekund w przeglądarce, 60s w CDN
    res.set('Cache-Control', 'public, max-age=30, s-maxage=60');
    // ...
});
```
