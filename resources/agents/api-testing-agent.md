# Agent API Testing – Instrukcje i Procedury 🔌

## Cel agenta

Agent API Testing generuje testy Playwright używające fixture `request` (APIRequestContext) do bezpośredniego testowania backendu **bez przeglądarki**. Testy weryfikują poprawność logiki biznesowej, walidacji i bezpieczeństwa API.

## Kiedy używać

✅ Testowanie logiki backendowej (walidacja, autoryzacja, obliczenia)
✅ Weryfikacja struktury odpowiedzi JSON
✅ Testowanie kodów HTTP (200, 201, 400, 401, 403, 404, 500)
✅ Testy regresji API po zmianach w backendzie
✅ Szybkie smoke testy (brak przeglądarki = szybsze wykonanie)

❌ Nie używaj do testowania animacji, CSS ani interakcji UI
❌ Nie używaj gdy test wymaga nawigacji przeglądarki

## Backend API – Referencja

**Baza URL:** `http://localhost:3000`
**Autentykacja:** Express sessions (cookie `connect.sid`)
**Admin:** `{ username: 'admin', password: 'Admin1!' }` (isDealer: true)

### Endpointy

| Metoda | Endpoint | Auth | Opis |
|--------|----------|------|------|
| POST | `/login` | ❌ | Logowanie, tworzy sesję |
| POST | `/register` | ❌ | Rejestracja klienta |
| POST | `/logout` | ❌ | Wylogowanie |
| GET | `/current-user` | ✅ | Dane aktualnego użytkownika |
| GET | `/cars` | ❌ | Lista wszystkich aut |
| GET | `/cars/:id` | ❌ | Jedno auto |
| POST | `/cars` | ✅ dealer | Dodaj auto |
| PUT | `/cars/:id` | ✅ | Edytuj auto |
| DELETE | `/cars/:id` | ✅ dealer | Usuń auto |
| POST | `/cars/:id/leasing` | ❌ | Oblicz leasing |
| POST | `/cars/:id/rent` | ✅ | Wynajmij auto |
| POST | `/cars/:id/return` | ✅ | Zwróć auto |
| POST | `/cars/:id/buy` | ✅ | Kup auto |
| GET | `/users` | ✅ | Lista klientów |
| POST | `/admin/create-customer` | ✅ dealer | Utwórz klienta |

### Zasady walidacji

```
VIN:        dokładnie 17 znaków alfanumerycznych
username:   min 3 znaki
password:   min 6 znaków
year:       integer >= 1886
price:      float >= 0
horsePower: integer >= 1
email:      prawidłowy format RFC
```

## Struktura testów

```typescript
// Szablon pliku tests/api/*.spec.ts
import { test, expect, APIRequestContext } from '@playwright/test';

const API = 'http://localhost:3000';
const ADMIN = { username: 'admin', password: 'Admin1!' };

// Helper: logowanie (zwolnienie z pisania za każdym razem)
async function loginAs(request: APIRequestContext, creds = ADMIN): Promise<void> {
  const res = await request.post(`${API}/login`, { data: creds });
  expect(res.status()).toBe(200);
}

// Helper: unikalne dane (zapobiega konfliktom równoległych testów)
function uniqueSuffix(): string {
  return Date.now().toString().slice(-9) + Math.floor(Math.random() * 100);
}

// Helper: poprawny VIN 17-znakowy
function makeVin(suffix: string): string {
  return `API${suffix.replace(/\D/g, '').padStart(10, '0')}ABCD`.slice(0, 17).toUpperCase();
}

// Wzorzec testu
test.describe('API – Nazwa grupy', () => {
  /**
   * [AXX] Krótki opis
   * Scenariusz UI: RX – opis powiązanego scenariusza UI
   * Cel: co ten test weryfikuje
   */
  test('[AXX] Opis testu po polsku', async ({ request }) => {
    // 1. Opcjonalnie zaloguj się
    await loginAs(request);

    // 2. Wywołaj endpoint
    const res = await request.post(`${API}/endpoint`, { data: {...} });

    // 3. Sprawdź status
    expect(res.status()).toBe(201);

    // 4. Sprawdź body
    const body = await res.json();
    expect(body).toHaveProperty('id');
    expect(body.field).toBe('oczekiwana_wartość');

    // 5. Sprzątanie (jeśli tworzyłeś dane)
    await request.delete(`${API}/cars/${body.id}`);
  });
});
```

## Procedura tworzenia nowych testów API

### Krok 1: Identyfikuj scenariusz
Znajdź odpowiedni `Case_X.spec.ts` który chcesz przetestować przez API.

### Krok 2: Zaplanuj asercje
```
HTTP status → JSON schema → wartości pól → efekty uboczne (GET po POST)
```

### Krok 3: Napisz helper jeśli potrzebny
```typescript
async function createTestCar(request: APIRequestContext, overrides = {}) {
  const s = uniqueSuffix();
  const res = await request.post(`${API}/cars`, {
    data: { brand: `Test${s}`, model: `Model${s}`, year: 2022,
            vin: makeVin(s), price: 50000, horsePower: 150,
            isAvailableForRent: true, ...overrides }
  });
  expect(res.status()).toBe(201);
  return res.json();
}
```

### Krok 4: Obsłuż sprzątanie
```typescript
// Pattern: stwórz w teście, usuń na końcu
test('...', async ({ request }) => {
  await loginAs(request);
  const car = await createTestCar(request);
  try {
    // ... test logic ...
  } finally {
    await request.delete(`${API}/cars/${car.id}`);
  }
});
```

## Checklist testów API ✅

- [ ] Test ma ID [AXX] i komentarz z Scenariusz UI: RX
- [ ] Sprawdzany jest kod HTTP odpowiedzi (`expect(res.status()).toBe(...)`)
- [ ] Sprawdzana jest struktura JSON (`toHaveProperty`, `toMatchObject`)
- [ ] Dane testowe są unikalne (`uniqueSuffix()`)
- [ ] VIN ma dokładnie 17 znaków (`makeVin()`)
- [ ] Dane są sprzątane po teście (`DELETE /cars/:id`)
- [ ] Test jest niezależny (nie polega na kolejności wykonania)
- [ ] Komentarze po polsku

## Prompt agenta (do ponownego użycia)

Wklej poniższy prompt do GitHub Copilot aby wygenerować nowe testy API:

```
Jesteś agentem testów API dla projektu "Salon Samochodowy" (Playwright).
Stwórz test API w pliku Playwright/tests/api/[nazwa].spec.ts.

Kontekst:
- Backend: Express.js na http://localhost:3000, sesje cookie
- Admin: username='admin', password='Admin1!'
- Fixture: `request` z @playwright/test
- Helpery: loginAs(), uniqueSuffix(), makeVin()
- Konwencja ID: [AXX]

Scenariusz do przetestowania: [OPISZ SCENARIUSZ]

Wymagania:
1. Sprawdź HTTP status
2. Sprawdź strukturę JSON
3. Użyj uniqueSuffix() dla unikalnych danych
4. Sprzątaj dane po teście
5. Komentarz z Scenariusz UI: RX
6. Język komentarzy: polski
```

## Znane pułapki

1. **Sesja fixture `request`**: każdy test dostaje NOWĄ instancję, ale w ramach jednego testu sesja jest zachowywana między wywołaniami.
2. **Konflikt VIN**: zawsze generuj unikalny VIN przez `makeVin(uniqueSuffix())`.
3. **Sprzątanie**: jeśli test tworzy auto, musi je usunąć – inaczej inne testy mogą dostać fałszywe wyniki.
4. **Admin-only endpointy**: `DELETE /cars/:id` wymaga `isDealer: true`.
5. **Cookie domain**: `request` fixture obsługuje cookies automatycznie dla tego samego hosta.
