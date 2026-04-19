# Specyfikacja API — Salon Samochodowy

## Obecne Endpointy (v0 — bez prefixu)

**Base URL:** `http://localhost:3000`  
**Auth:** Session cookie `connect.sid`

---

### POST /register

```json
// Request
{
  "username": "janek123",
  "email": "janek@example.com",
  "password": "Haslo123!",
  "firstName": "Jan",
  "lastName": "Kowalski"
}

// Response 201
{
  "message": "Rejestracja udana",
  "user": { "id": 2, "username": "janek123", "isDealer": false }
}

// Response 400 (duplikat)
{ "error": "Nazwa użytkownika jest już zajęta" }
```

### POST /login

```json
// Request
{ "username": "admin", "password": "Admin1!" }

// Response 200
{ "message": "Logowanie udane", "user": { "id": 1, "username": "admin", "isDealer": true } }

// Response 400
{ "error": "Nieprawidłowa nazwa użytkownika lub hasło" }
```

### POST /logout
```json
// Response 200
{ "message": "Wylogowano pomyślnie" }
```

### GET /current-user (🔒 Auth)
```json
// Response 200
{ "id": 1, "username": "admin", "firstName": "Admin", "isDealer": true }

// Response 401 (brak sesji)
{ "error": "Nieautoryzowany" }
```

---

### GET /cars
```json
// Response 200
[
  {
    "id": 1, "brand": "Toyota", "model": "Camry", "year": 2023,
    "vin": "TOY12345678901234", "price": 120000, "horsePower": 150,
    "isAvailableForRent": true, "image": null, "ownerId": null, "renterId": null
  }
]
```

### GET /cars/:id
```json
// Response 200 — pojedynczy samochód (jak wyżej)
// Response 404
{ "error": "Samochód nie znaleziony" }
```

### POST /cars (🔒 Auth)
```json
// Request
{
  "brand": "Toyota", "model": "Camry", "year": 2023,
  "vin": "TOY12345678901234", "price": 120000,
  "horsePower": 150, "isAvailableForRent": true
}
// Response 201 — stworzony samochód
// Response 400 — błędy walidacji
// Response 401 — brak sesji
```

### PUT /cars/:id (🔒 Auth) — wszystkie pola opcjonalne
### DELETE /cars/:id (🔒 Auth + isDealer=true)

---

### POST /cars/:id/rent (🔒 Auth)
```json
// Response 200
{ "message": "Samochód wynajęty pomyślnie", "car": { ... } }
// Response 400 — już wynajęty
```

### POST /cars/:id/return (🔒 Auth)
### POST /cars/:id/buy (🔒 Auth)

### POST /cars/:id/leasing (🔒 Auth)
```json
// Request
{ "downPayment": 20000, "months": 36 }
// Response 200
{ "monthlyRate": 2777.78, "totalAmount": 100000, "months": 36 }
// Response 400
{ "error": "Wpłata własna nie może być wyższa niż cena samochodu" }
```

---

## Planowane Endpointy v1 (Sprint 2)

### GET /api/v1/cars
Query params: `page, limit, brand, minPrice, maxPrice, sort, order`
```json
{
  "success": true,
  "data": [...],
  "pagination": { "page": 1, "limit": 10, "total": 45, "totalPages": 5 }
}
```

### GET /health
```json
{ "status": "ok", "timestamp": "2026-03-29T15:00:00Z", "version": "1.0.0" }
```

### GET /api/v1/transactions (🔒 Auth)
```json
{
  "data": [
    { "id": 1, "carId": 3, "type": "rent", "createdAt": "2026-03-29T10:00:00Z", "monthlyRate": null }
  ]
}
```

---

## Kody Błędów

| HTTP | Znaczenie | Kiedy |
|------|-----------|-------|
| 200 | OK | Sukces GET/PUT/DELETE |
| 201 | Created | Sukces POST |
| 400 | Bad Request | Błędy walidacji, złe dane |
| 401 | Unauthorized | Brak lub wygasła sesja |
| 403 | Forbidden | Brak uprawnień (np. nie-dealer) |
| 404 | Not Found | Zasób nie istnieje |
| 429 | Too Many Requests | Rate limit przekroczony |
| 500 | Internal Server Error | Błąd serwera |

---

## Szczegółowa Dokumentacja Endpointów

### POST /users (opis wszystkich endpointów users)

### GET /users (🔒 Auth + isDealer=true)

**Opis:** Pobiera listę wszystkich użytkowników. Dostępny wyłącznie dla dealerów.

**Parametry Query:**
- `page` (number, opcjonalny, domyślnie 1) — numer strony
- `limit` (number, opcjonalny, domyślnie 20) — liczba wyników na stronę

**Przykład żądania:**
```bash
curl -X GET http://localhost:3000/users \
  -H "Cookie: connect.sid=s%3Axxx"
```

**Odpowiedź 200 OK:**
```json
[
  {
    "id": 1,
    "username": "admin",
    "email": "admin@salon.pl",
    "firstName": "Admin",
    "lastName": "Dealer",
    "isDealer": true
  },
  {
    "id": 2,
    "username": "janek123",
    "email": "janek@example.com",
    "firstName": "Jan",
    "lastName": "Kowalski",
    "isDealer": false
  }
]
```

**Odpowiedź 401 Unauthorized:**
```json
{ "error": "Nieautoryzowany" }
```

**Odpowiedź 403 Forbidden:**
```json
{ "error": "Brak uprawnień dealera" }
```

---

### GET /users/:id (🔒 Auth)

**Opis:** Pobiera dane konkretnego użytkownika.

**Parametry ścieżki:**
- `id` (integer, wymagany) — identyfikator użytkownika

**Przykład żądania:**
```bash
curl -X GET http://localhost:3000/users/2 \
  -H "Cookie: connect.sid=s%3Axxx"
```

**Odpowiedź 200 OK:**
```json
{
  "id": 2,
  "username": "janek123",
  "email": "janek@example.com",
  "firstName": "Jan",
  "lastName": "Kowalski",
  "isDealer": false
}
```

**Odpowiedź 404 Not Found:**
```json
{ "error": "Użytkownik nie znaleziony" }
```

---

### PUT /users/:id (🔒 Auth)

**Opis:** Aktualizuje dane użytkownika. Użytkownik może edytować tylko swoje dane; dealer może edytować każdego.

**Parametry ścieżki:**
- `id` (integer, wymagany)

**Ciało żądania (wszystkie pola opcjonalne):**
```json
{
  "email": "nowy@email.com",
  "firstName": "Nowe Imię",
  "lastName": "Nowe Nazwisko",
  "password": "NoweHaslo123!"
}
```

**Walidacja:**
- `email` — format email, unikalny w systemie
- `password` — min. 8 znaków, jeśli podane (hashowane bcrypt)

**Przykład żądania:**
```bash
curl -X PUT http://localhost:3000/users/2 \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=s%3Axxx" \
  -d '{"firstName": "Janek", "email": "janek.nowy@example.com"}'
```

**Odpowiedź 200 OK:**
```json
{
  "message": "Dane użytkownika zaktualizowane",
  "user": {
    "id": 2,
    "username": "janek123",
    "email": "janek.nowy@example.com",
    "firstName": "Janek",
    "lastName": "Kowalski",
    "isDealer": false
  }
}
```

---

### DELETE /users/:id (🔒 Auth + isDealer=true)

**Opis:** Usuwa użytkownika z systemu. Dostępny wyłącznie dla dealerów.

**Parametry ścieżki:**
- `id` (integer, wymagany)

**Przykład żądania:**
```bash
curl -X DELETE http://localhost:3000/users/3 \
  -H "Cookie: connect.sid=s%3Axxx"
```

**Odpowiedź 200 OK:**
```json
{ "message": "Użytkownik usunięty pomyślnie" }
```

**Odpowiedź 404 Not Found:**
```json
{ "error": "Użytkownik nie znaleziony" }
```

---

### POST /cars/:id/upload (🔒 Auth)

**Opis:** Przesyła zdjęcie samochodu (multer). Obsługuje pliki JPEG, PNG, WebP do 5 MB.

**Parametry ścieżki:**
- `id` (integer, wymagany) — identyfikator samochodu

**Ciało żądania:** `multipart/form-data`
- `image` (file, wymagany) — plik obrazu (JPEG/PNG/WebP, maks. 5 MB)

**Przykład żądania:**
```bash
curl -X POST http://localhost:3000/cars/1/upload \
  -H "Cookie: connect.sid=s%3Axxx" \
  -F "image=@/path/to/car-photo.jpg"
```

**Odpowiedź 200 OK:**
```json
{
  "message": "Zdjęcie zostało przesłane",
  "imagePath": "/uploads/cars/car-1-1704067200000.jpg"
}
```

**Odpowiedź 400 Bad Request (zły format):**
```json
{ "error": "Dozwolone formaty: JPEG, PNG, WebP" }
```

**Odpowiedź 413 Payload Too Large:**
```json
{ "error": "Plik zbyt duży. Maksymalny rozmiar: 5 MB" }
```

---

### POST /cars/:id/return (🔒 Auth)

**Opis:** Zwraca wynajęty samochód. Ustawia `isAvailableForRent=true` i `renterId=null`.

**Parametry ścieżki:**
- `id` (integer, wymagany) — identyfikator samochodu

**Przykład żądania:**
```bash
curl -X POST http://localhost:3000/cars/3/return \
  -H "Cookie: connect.sid=s%3Axxx"
```

**Odpowiedź 200 OK:**
```json
{
  "message": "Samochód zwrócony pomyślnie",
  "car": {
    "id": 3,
    "brand": "Honda",
    "model": "Civic",
    "isAvailableForRent": true,
    "renterId": null
  }
}
```

**Odpowiedź 400 Bad Request:**
```json
{ "error": "Ten samochód nie jest przez Ciebie wynajęty" }
```

---

### POST /cars/:id/buy (🔒 Auth)

**Opis:** Zakup samochodu. **UWAGA — błąd INC-003:** Obecna implementacja sprawdza `isAvailableForRent` zamiast `isSold`. Po naprawie endpoint powinien sprawdzać `car.isSold === true`.

**Parametry ścieżki:**
- `id` (integer, wymagany) — identyfikator samochodu

**Przykład żądania:**
```bash
curl -X POST http://localhost:3000/cars/5/buy \
  -H "Cookie: connect.sid=s%3Axxx"
```

**Odpowiedź 200 OK:**
```json
{
  "message": "Samochód zakupiony pomyślnie",
  "car": {
    "id": 5,
    "brand": "BMW",
    "model": "3 Series",
    "price": 180000,
    "isSold": true,
    "soldAt": "2025-01-15T10:30:00.000Z",
    "isAvailableForRent": false
  }
}
```

**Odpowiedź 400 Bad Request (auto już sprzedane):**
```json
{ "error": "Ten samochód jest już sprzedany" }
```

---

### POST /cars/:id/leasing (🔒 Auth)

**Opis:** Oblicza ratę leasingu dla samochodu. Wzór: `rata = (cena - wkładWłasny) / liczbaMiesięcy`.

**Parametry ścieżki:**
- `id` (integer, wymagany) — identyfikator samochodu

**Ciało żądania:**
```json
{
  "downPayment": 20000,
  "months": 36
}
```

**Walidacja:**
- `downPayment` — (number, wymagany) — wkład własny w PLN, min. 0
- `months` — (integer, wymagany) — liczba miesięcy leasingu (min. 12, maks. 84)
- `downPayment` nie może przekraczać ceny samochodu

**Przykład żądania:**
```bash
curl -X POST http://localhost:3000/cars/5/leasing \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=s%3Axxx" \
  -d '{"downPayment": 20000, "months": 36}'
```

**Odpowiedź 200 OK:**
```json
{
  "carId": 5,
  "brand": "BMW",
  "model": "3 Series",
  "price": 180000,
  "downPayment": 20000,
  "months": 36,
  "monthlyRate": 4444.44,
  "totalAmount": 160000,
  "totalWithInterest": 160000
}
```

**Odpowiedź 400 Bad Request:**
```json
{ "error": "Wpłata własna nie może być wyższa niż cena samochodu" }
```

---

## Diagram Przepływu Autentykacji

```
Klient (Przeglądarka)          Serwer Express.js               Baza Danych
        │                              │                              │
        │  POST /login                 │                              │
        │  { username, password }      │                              │
        ├─────────────────────────────►│                              │
        │                              │  SELECT * FROM Users         │
        │                              │  WHERE username = ?          │
        │                              ├─────────────────────────────►│
        │                              │                              │
        │                              │  Rekord użytkownika          │
        │                              │◄─────────────────────────────┤
        │                              │                              │
        │                              │  bcrypt.compare(input, hash) │
        │                              │  → true/false                │
        │                              │                              │
        │  200 OK                      │                              │
        │  Set-Cookie: connect.sid=... │                              │
        │◄─────────────────────────────┤                              │
        │                              │                              │
        │  GET /current-user           │                              │
        │  Cookie: connect.sid=...     │                              │
        ├─────────────────────────────►│                              │
        │                              │  req.session.userId = X      │
        │                              │  SELECT * FROM Users WHERE id=X
        │                              ├─────────────────────────────►│
        │                              │                              │
        │  200 OK { user data }        │                              │
        │◄─────────────────────────────┤                              │
        │                              │                              │
        │  POST /logout                │                              │
        ├─────────────────────────────►│                              │
        │                              │  req.session.destroy()       │
        │  200 OK                      │                              │
        │  Set-Cookie: connect.sid=;   │                              │
        │  Expires=Thu, 01 Jan 1970    │                              │
        │◄─────────────────────────────┤                              │
```

---

## Zasady Rate Limiting

| Endpoint | Okno Czasowe | Maks. Żądań | Kod Błędu | Wiadomość |
|----------|-------------|------------|----------|-----------|
| POST /login | 1 minuta | 5 prób | 429 | "Zbyt wiele prób logowania. Spróbuj za minutę." |
| POST /register | 1 minuta | 3 próby | 429 | "Zbyt wiele prób rejestracji." |
| Wszystkie GET /api/* | 15 minut | 100 żądań | 429 | "Zbyt wiele żądań. Spróbuj za 15 minut." |
| POST /cars/:id/upload | 1 minuta | 10 żądań | 429 | "Zbyt wiele przesłań pliku." |
| Wszystkie DELETE | 15 minut | 20 żądań | 429 | "Limit usunięć przekroczony." |

**Nagłówki odpowiedzi przy rate limit:**
```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1704067260
Retry-After: 45
```

---

## Strategia Wersjonowania API

### Obecny Stan (v0 — bez prefixu)

```
http://localhost:3000/cars
http://localhost:3000/users
http://localhost:3000/login
```

### Docelowy Stan (v1 — Faza 2)

```
http://localhost:3000/api/v1/cars
http://localhost:3000/api/v1/users
http://localhost:3000/api/v1/auth/login
```

### Plan Migracji (bez przerwy działania)

```
Sprint 2 (Faza 2):
  1. Dodaj /api/v1/ routing obok istniejącego
  2. Stare endpointy /cars nadal działają (deprecated)
  3. Stare endpointy zwracają nagłówek:
     Deprecation: true
     Sunset: 2025-06-01
     Link: </api/v1/cars>; rel="successor-version"

Sprint 3 (Faza 3):
  4. Frontend migruje na /api/v1/
  5. Testy Playwright zaktualizowane na nowe URL

Sprint 5 (Faza 5):
  6. Stare endpointy zwracają 301 Redirect → /api/v1/
  7. Po 3 miesiącach: usunięcie starych endpointów (v0 sunset)
```

---

## Nowe Endpointy Planowane dla v1 (Faza 2)

| Metoda | Ścieżka | Opis |
|--------|---------|------|
| GET | `/api/v1/cars` | Lista z paginacją, filtrowaniem, sortowaniem |
| GET | `/api/v1/cars?page=2&limit=10&brand=BMW&minPrice=50000` | Filtrowanie |
| GET | `/api/v1/cars?sort=price&order=asc` | Sortowanie |
| GET | `/api/v1/transactions` | Historia transakcji (Auth) |
| GET | `/api/v1/transactions?type=RENT&userId=5` | Filtrowanie transakcji |
| GET | `/health` | Health check (bez auth) |
| GET | `/api/docs` | Swagger/OpenAPI UI |

**Format odpowiedzi paginowanej (v1):**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 2,
    "limit": 10,
    "total": 45,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": true
  },
  "filters": {
    "brand": "BMW",
    "minPrice": 50000
  }
}
```

**Format odpowiedzi błędu (v1):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Nieprawidłowe dane wejściowe",
    "details": [
      { "field": "email", "message": "Nieprawidłowy format email" },
      { "field": "password", "message": "Hasło musi mieć min. 8 znaków" }
    ]
  },
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

*Specyfikacja API — wersja 1.0 — styczeń 2025*  
*Autor: Technical Writer + Backend Developer*  
*Zatwierdził: IT Architect*
