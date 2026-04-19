# Agent Mockowania – Instrukcje i Procedury 🎭

## Cel agenta

Agent Mockowania generuje testy Playwright używające `page.route()` do przechwytywania i zastępowania zapytań HTTP. Pozwala testować UI z **kontrolowanymi, deterministycznymi danymi** bez zależności od stanu backendu.

## Kiedy używać

✅ Backend jest niestabilny lub niedostępny
✅ Testowanie obsługi błędów (500, 404, abort)
✅ Testowanie z deterministycznymi danymi (bez zmiennych ID)
✅ Izolacja testów UI od logiki backendowej
✅ Testowanie edge-case'ów trudnych do wywołania w prawdziwym backendzie

❌ Nie używaj gdy chcesz testować backend (użyj fixture `request`)
❌ Nie używaj gdy zależy Ci na testowaniu integracji frontend-backend

## Techniki mockowania

### 1. Podstawowe: route.fulfill()
```typescript
await page.route('http://localhost:3000/cars', async (route) => {
  if (route.request().method() === 'GET') {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{ id: 1, brand: 'Mock', ... }]),
    });
  } else {
    await route.continue(); // przepuść inne metody
  }
});
```

### 2. Symulacja błędów
```typescript
// Błąd serwera
await page.route(URL, route => route.fulfill({ status: 500, body: '{"error":"Server Error"}' }));

// Zerwanie połączenia
await page.route(URL, route => route.abort('failed'));

// Timeout
await page.route(URL, route => route.abort('connectiontimedout'));
```

### 3. Modyfikacja prawdziwej odpowiedzi
```typescript
await page.route(URL, async (route) => {
  const response = await route.fetch();  // pobierz prawdziwą odpowiedź
  const data = await response.json();
  data[0].price = 99999;  // zmodyfikuj
  await route.fulfill({ response, body: JSON.stringify(data) });
});
```

### 4. Zliczanie wywołań
```typescript
let count = 0;
await page.route(URL, async (route) => {
  count++;
  await route.fulfill({ status: 200, body: JSON.stringify([]) });
});
// ... test ...
expect(count).toBe(1);
```

### 5. Wildcard URL
```typescript
// Wszystkie zapytania do backendu
await page.route('http://localhost:3000/**', handler);

// Konkretny pattern
await page.route(/\/cars\/\d+\/leasing$/, handler);
```

## Dane mockowe – wzorzec

```typescript
// Definiuj poza testami jako stałe
const MOCK_CAR_AVAILABLE = {
  id: 9001,
  brand: 'MockBrand',
  model: 'MockModel',
  year: 2023,
  vin: 'MOCK00000000009A1', // dokładnie 17 znaków!
  price: 100000,
  horsePower: 200,
  isAvailableForRent: true,
  ownerId: null,
  renterId: null,
  image: null,
};

const MOCK_LOGIN_DEALER = {
  message: 'Logowanie udane',
  user: { id: 9999, username: 'mockdealer', firstName: 'Mock', lastName: 'Dealer', isDealer: true }
};
```

## Procedura tworzenia testów mockowania

### Krok 1: Zidentyfikuj endpointy
Które zapytania HTTP wywołuje UI dla danego scenariusza?
- Otwarcie strony → `GET /cars`
- Logowanie → `POST /login` + `GET /current-user`
- Leasing → `POST /cars/:id/leasing`

### Krok 2: Przygotuj dane mockowe
Stwórz deterministyczne dane (stałe ID, stałe ceny), żeby test był powtarzalny.

### Krok 3: Zarejestruj route PRZED goto
```typescript
// NAJPIERW route, POTEM goto - kolejność ma znaczenie!
await page.route(URL, handler);  // ← najpierw
await page.goto('/cars');        // ← potem
```

### Krok 4: Sprawdź UI
```typescript
await expect(page.locator('.card').filter({ hasText: 'MockBrand' })).toBeVisible();
```

## Checklist testów mockowania ✅

- [ ] Test ma ID [MXX] i komentarz z Scenariusz UI: RX
- [ ] `page.route()` wywoływane PRZED `page.goto()`
- [ ] Dane mockowe zdefiniowane jako stałe (nie inline)
- [ ] VIN w danych mockowych ma 17 znaków
- [ ] Obsłużono wszystkie metody HTTP (lub przepuszczono nieoczekiwane przez `route.continue()`)
- [ ] Test nie zależy od stanu backendu (pełna izolacja)
- [ ] Sprawdzane są elementy UI (nie API)

## Prompt agenta (do ponownego użycia)

```
Jesteś agentem mockowania dla projektu "Salon Samochodowy" (Playwright).
Stwórz test mockowania w pliku Playwright/tests/mock/[nazwa].spec.ts.

Kontekst:
- Frontend: Angular na http://localhost:4200
- Backend: Express na http://localhost:3000
- Technika: page.route() z route.fulfill()
- Konwencja ID: [MXX]

Scenariusz do przetestowania: [OPISZ SCENARIUSZ]

Wymagania:
1. Zdefiniuj dane mockowe jako stałe przed testami
2. Zarejestruj page.route() PRZED page.goto()
3. Sprawdzaj elementy UI (selektory, teksty, visibility)
4. Obsłuż GET i inne metody osobno
5. Komentarz z Scenariusz UI: RX
6. Język komentarzy: polski
```

## Znane pułapki

1. **Kolejność**: `page.route()` musi być PRZED `page.goto()`.
2. **Metody HTTP**: Angular może wysyłać OPTIONS (CORS preflight) – obsłuż przez `route.continue()` dla nieoczekiwanych metod.
3. **VIN 17 znaków**: danych mockowych muszą mieć VIN dokładnie 17 znaków, inaczej backend odrzuci.
4. **`route.fetch()` vs brak backendu**: jeśli backend jest niedostępny, `route.fetch()` rzuca błąd – użyj try/catch z fallbackiem.
5. **Wildcard vs exact**: `'**/cars'` pasuje do `/cars` ale też `/cars/123` – bądź precyzyjny.
