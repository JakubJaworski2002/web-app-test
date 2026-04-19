# Analiza Obecnego Stanu Architektury

## Obecna Architektura (Diagram)

```
┌─────────────────────────────────────────────────────────┐
│                    PRZEGLĄDARKA                          │
│  Angular 19 SPA (port 4200)                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │
│  │ CarList  │ │CarDetail │ │Login/Reg │ │  Navbar    │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘ │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Services: AuthService | CarService | CustomerService│ │
│  └────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │ HttpClient + AuthInterceptor                        │ │
│  └────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTP (port 3000)
                            │ CORS: only localhost:4200
                            │ Cookies: connect.sid
┌───────────────────────────▼─────────────────────────────┐
│                EXPRESS.JS BACKEND (port 3000)            │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Middleware: bodyParser | cors | session | validator  │ │
│  └─────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Routes: /register /login /logout /current-user   │    │
│  │         /cars  /cars/:id  /users  /users/:id     │    │
│  │         /cars/:id/rent  /return  /leasing  /buy  │    │
│  └──────────────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Sequelize ORM → Models: Car, User                │    │
│  └───────────────────────┬──────────────────────────┘    │
└──────────────────────────┬──────────────────────────────┘
                           │
            ┌──────────────▼──────────────┐
            │  SQLite (dev) / MySQL (prod) │
            │  Tables: Cars, Users         │
            └─────────────────────────────┘
```

---

## Stack Technologiczny

| Warstwa | Technologia | Wersja | Stan |
|---------|-------------|--------|------|
| Frontend framework | Angular | 19 | ✅ Aktualny |
| UI Components | Angular Material | 19 | ✅ Aktualny |
| CSS Framework | Bootstrap | 5 | ✅ Aktualny |
| Frontend SSR | Angular Universal | 19 | ⚠️ Skonfigurowany, niezweryfikowany |
| Backend framework | Express.js | 4.21 | ✅ Stabilny |
| ORM | Sequelize | 6.37 | ✅ Aktualny |
| Baza danych (dev) | SQLite3 | 5.1.7 | ✅ Działa |
| Baza danych (prod) | MySQL | - | ⚠️ Fallback, niezweryfikowany |
| Autentykacja | express-session | 1.18 | ⚠️ Brak JWT |
| Haszowanie haseł | bcrypt | 5.1.1 | 🔴 Zainstalowany, NIEUŻYWANY |
| Walidacja | express-validator | 7.2 | ✅ Używany |
| Upload plików | multer | 1.4.5 | ✅ Używany |
| Testy E2E | Playwright | latest | ✅ 60 testów |
| Testy jednostkowe BE | Jest + Supertest | 29 | ✅ Działają |
| Testy jednostkowe FE | Karma + Jasmine | Angular | ⚠️ Minimalne |
| Konteneryzacja | - | - | 🔴 Brak |
| CI/CD | - | - | 🔴 Brak |

---

## Zidentyfikowane Problemy

| ID | Problem | Severity | Lokalizacja |
|----|---------|----------|-------------|
| P01 | Hasła w plaintext | 🔴 CRITICAL | server.js:107,156 |
| P02 | isDealer default=true | 🟠 HIGH | models.js:178 |
| P03 | Brak rate limitingu | 🟠 HIGH | server.js |
| P04 | Brak Angular route guards | 🟠 HIGH | app.routes.ts |
| P05 | CORS hardcoded | 🟡 MEDIUM | server.js:37 |
| P06 | alert() zamiast MatSnackBar | 🟡 MEDIUM | komponenty Angular |
| P07 | Memory leak RxJS | 🟡 MEDIUM | car-list.component.ts:52 |
| P08 | Literówka brandserch | 🔵 LOW | car-list.component.ts:33 |
| P09 | console.log w produkcji | 🔵 LOW | server.js:253 |
| P10 | Brak paginacji | 🟡 MEDIUM | GET /cars |
| P11 | Brak Transaction model | 🟡 MEDIUM | Cały backend |
| P12 | Brak API versioning | 🟡 MEDIUM | Wszystkie endpoints |
| P13 | SSR niezweryfikowany | 🟡 MEDIUM | server.ts frontend |
| P14 | Brak Docker | 🟡 MEDIUM | Cały projekt |
| P15 | Brak CI/CD | 🟡 MEDIUM | .github/ |

---

## Obecne Endpointy API

| Metoda | Ścieżka | Auth | Opis |
|--------|---------|------|------|
| GET | / | ❌ | Powitanie API |
| POST | /register | ❌ | Rejestracja użytkownika |
| POST | /login | ❌ | Logowanie |
| POST | /logout | ❌ | Wylogowanie |
| GET | /current-user | ✅ | Aktualny użytkownik |
| GET | /cars | ❌ | Lista samochodów |
| GET | /cars/:id | ❌ | Jeden samochód |
| POST | /cars | ✅ | Dodaj samochód |
| PUT | /cars/:id | ✅ | Edytuj samochód |
| DELETE | /cars/:id | ✅ Dealer | Usuń samochód |
| POST | /cars/:id/upload | ✅ | Upload zdjęcia |
| POST | /cars/:id/rent | ✅ | Wynajmij samochód |
| POST | /cars/:id/return | ✅ | Zwróć samochód |
| POST | /cars/:id/leasing | ✅ | Kalkulator leasingu |
| POST | /cars/:id/buy | ✅ | Kup samochód |
| GET | /users | ✅ | Lista klientów |
| GET | /users/:id | ✅ | Jeden klient |
| PUT | /users/:id | ✅ | Edytuj klienta |
| DELETE | /users/:id | ✅ | Usuń klienta |

---

## Metryki Kodu (Szacunkowe)

| Metryka | Backend | Frontend |
|---------|---------|----------|
| Linie kodu | ~500 (server.js) | ~2000 (komponenty) |
| Pokrycie testów | ~40% | ~20% |
| Złożoność cyklomatyczna | Niska-Średnia | Niska |
| Długi techniczny | 15 pozycji | 10 pozycji |
| Zależności przestarzałe | 0 | 0 |

---

## Podatności Bezpieczeństwa — Analiza Szczegółowa

### INC-001 — Hasła w Plaintext (CRITICAL)

| Pole | Wartość |
|------|---------|
| **ID** | INC-001 |
| **Tytuł** | Hasła użytkowników przechowywane w plaintext |
| **Kategoria OWASP** | A02:2021 — Cryptographic Failures |
| **CWE** | CWE-256: Plaintext Storage of a Password |
| **CVSS Score** | 9.1 (Critical) |
| **Lokalizacja** | `server.js:107` (register), `server.js:156` (login comparison) |
| **Priorytet** | **NATYCHMIASTOWY** |

**Opis:** Funkcja rejestracji zapisuje hasło do bazy danych bez żadnego przetwarzania kryptograficznego. Biblioteka `bcrypt` jest zainstalowana w `package.json` (`"bcrypt": "^5.1.1"`), ale nie jest importowana ani używana w żadnym pliku backendu.

**Scenariusz Ataku:**
```
1. Atakujący uzyskuje dostęp do bazy danych (np. przez injection lub backup leak)
2. Pobiera tabelę Users: SELECT username, password FROM Users
3. Odczytuje hasła w plain text: admin:Admin1!, janek:mojehaslo123
4. Loguje się do aplikacji i wszystkich innych serwisów gdzie użytkownik używa tego samego hasła
5. Możliwy credential stuffing attack na inne platformy
```

**Rekomendowane Rozwiązanie:**
```javascript
// Poprawna implementacja (server.js - register)
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 12;

// Przy rejestracji
const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
await User.create({ username, email, password: hashedPassword, ... });

// Przy logowaniu
const isMatch = await bcrypt.compare(inputPassword, user.password);
if (!isMatch) return res.status(400).json({ error: 'Nieprawidłowe hasło' });
```

---

### INC-002 — Domyślna Rola isDealer=true (CRITICAL)

| Pole | Wartość |
|------|---------|
| **ID** | INC-002 |
| **Tytuł** | Każdy nowy użytkownik otrzymuje uprawnienia dealera |
| **Kategoria OWASP** | A01:2021 — Broken Access Control |
| **CWE** | CWE-276: Incorrect Default Permissions |
| **CVSS Score** | 8.5 (High) |
| **Lokalizacja** | `models.js:178` — `isDealer: { defaultValue: true }` |

**Opis:** Model Sequelize dla User definiuje `isDealer` z wartością domyślną `true`. Oznacza to, że każdy zarejestrowany użytkownik automatycznie ma uprawnienia dealera (może dodawać, edytować i usuwać samochody z bazy danych).

**Scenariusz Ataku:**
```
1. Osoba rejestruje nowe konto: POST /register { username: "hacker", ... }
2. Nowo stworzony user ma isDealer=true (domyślnie)
3. Hacker wykonuje: DELETE /cars/1 (usuwa auta) ✓
4. Hacker wykonuje: POST /cars (dodaje fałszywe oferty) ✓
5. Hacker wykonuje: PUT /cars/5 (zmienia ceny) ✓
```

**Rekomendowane Rozwiązanie:**
```javascript
// models.js — naprawiony model User
isDealer: {
  type: DataTypes.BOOLEAN,
  allowNull: false,
  defaultValue: false  // ZMIANA: true → false
}
```

---

### INC-003 — Błędna Logika Zakupu (HIGH)

| Pole | Wartość |
|------|---------|
| **ID** | INC-003 |
| **Tytuł** | Logika zakupu sprawdza isAvailableForRent zamiast isSold |
| **Kategoria OWASP** | A04:2021 — Insecure Design (Business Logic Flaw) |
| **CWE** | CWE-840: Business Logic Errors |
| **Lokalizacja** | `server.js` — endpoint `POST /cars/:id/buy` |

**Opis:** Endpoint zakupu samochodu sprawdza czy `isAvailableForRent === false` jako warunek "czy auto jest już sprzedane". To jest semantycznie niepoprawne — auto może być niedostępne do wynajmu ale wciąż niesprzedane. Pole `isSold` nie istnieje w schemacie bazy danych.

**Scenariusz Błędu:**
```
1. Auto jest wynajęte (isAvailableForRent=false, nie ma renterId=null)
2. Klient próbuje kupić to auto: POST /cars/5/buy
3. System zwraca błąd "samochód już sprzedany" — BŁĘDNIE
4. Klient nie może kupić dostępnego do sprzedaży auta
LUB:
1. Auto zostaje "zakupione" — system ustawia isAvailableForRent=false
2. Ale nie ma flagi isSold=true
3. Raport sprzedaży jest nieprawidłowy
```

**Rekomendowane Rozwiązanie:**
- Dodać pole `isSold BOOLEAN DEFAULT false` do tabeli Cars (migration 001)
- Zmienić logikę: sprawdzaj `car.isSold === true` przy zakupie
- Przy zakupie: ustawiaj `isSold=true, soldAt=NOW(), isAvailableForRent=false`

---

### INC-004 — Brak Rate Limiting (HIGH)

| Pole | Wartość |
|------|---------|
| **ID** | INC-004 |
| **Tytuł** | Brak ograniczeń liczby żądań — podatność na brute-force i DoS |
| **Kategoria OWASP** | A05:2021 — Security Misconfiguration |
| **CWE** | CWE-307: Improper Restriction of Excessive Authentication Attempts |
| **Lokalizacja** | `server.js` — brak middleware rate limiting |

**Opis:** API nie ma żadnych ograniczeń na liczbę żądań w jednostce czasu. Atakujący może wysyłać tysiące żądań logowania na sekundę, przeprowadzając atak brute-force na hasła, lub zalać serwer żądaniami powodując niedostępność usługi (DoS).

**Rekomendowane Rozwiązanie:**
```javascript
const rateLimit = require('express-rate-limit');

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 100,                  // maks. 100 żądań / 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Zbyt wiele żądań, spróbuj za 15 minut' }
});

const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuta
  max: 5,              // maks. 5 prób logowania / minutę
  message: { error: 'Zbyt wiele prób logowania' }
});

app.use(globalLimiter);
app.post('/login', authLimiter, loginHandler);
app.post('/register', authLimiter, registerHandler);
```

---

### INC-005 — Brak Angular Route Guards (MEDIUM)

| Pole | Wartość |
|------|---------|
| **ID** | INC-005 |
| **Tytuł** | Niezalogowani użytkownicy mogą nawigować do chronionych widoków |
| **Kategoria OWASP** | A01:2021 — Broken Access Control (client-side) |
| **CWE** | CWE-862: Missing Authorization |
| **Lokalizacja** | `app.routes.ts` — brak `canActivate` guards |

**Opis:** Routing Angular nie zawiera żadnych guard'ów autoryzacyjnych. Niezalogowany użytkownik może bezpośrednio wpisać URL `/cars/add` lub `/admin/customers` w przeglądarce i zobaczyć chronioną stronę (formularz).

**Rekomendowane Rozwiązanie:**
```typescript
// core/guards/auth.guard.ts
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthenticationService);
  const router = inject(Router);
  
  if (authService.isAuthenticated()) {
    return true;
  }
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

// app.routes.ts
{
  path: 'cars/add',
  component: AddCarComponent,
  canActivate: [authGuard, dealerGuard]  // Wymaga logowania + roli dealer
}
```

---

### INC-006 — CORS Hardcoded (MEDIUM)

| Pole | Wartość |
|------|---------|
| **ID** | INC-006 |
| **Tytuł** | CORS skonfigurowany wyłącznie dla localhost:4200 (hardcoded) |
| **Kategoria OWASP** | A05:2021 — Security Misconfiguration |
| **CWE** | CWE-942: Permissive Cross-domain Policy |
| **Lokalizacja** | `server.js:37` — `origin: 'http://localhost:4200'` |

**Opis:** Konfiguracja CORS zawiera hardcoded adres `http://localhost:4200`. Uniemożliwia to deployment aplikacji na jakiejkolwiek innej domenie bez modyfikacji kodu źródłowego. Jest to zła praktyka security przez obscurity.

**Rekomendowane Rozwiązanie:**
```javascript
// server.js — poprawiona konfiguracja CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:4200'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origen ${origin} nie jest dozwolony przez CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// .env.production
// ALLOWED_ORIGINS=https://salon-samochodowy.pl,https://www.salon-samochodowy.pl
```

---

## Problemy Wydajnościowe

| ID | Problem | Wpływ | Priorytet |
|----|---------|-------|---------|
| PERF-001 | Brak paginacji — GET /cars zwraca całą tabelę (full table scan) | Wysoki przy >1000 rekordów | **Wysoki** |
| PERF-002 | Brak cache'owania — każde żądanie trafia do bazy danych | Zbędne obciążenie DB | Średni |
| PERF-003 | Brak kompresji odpowiedzi HTTP (gzip/brotli) | Większe pakiety danych | Średni |
| PERF-004 | Brak indeksów na kluczach obcych (ownerId, renterId) | Wolne JOIN'y | Średni |
| PERF-005 | SQLite jako baza danych (brak connection pooling) | Ograniczona współbieżność | Wysoki (prod) |
| PERF-006 | SSR niezweryfikowany — może powodować hydration errors | Pierwszy render wolny | Niski |
| PERF-007 | Brak lazy loading Angular modules | Większy initial bundle | Średni |
| PERF-008 | Brak `trackBy` w ngFor — pełny re-render listy | Gorszy UX przy przewijaniu | Niski |

---

## Problemy Jakości Kodu

| ID | Problem | Obszar | Priorytet |
|----|---------|--------|---------|
| CODE-001 | Cała logika backendu w jednym pliku `server.js` (~500 linii) | Architektura | **Wysoki** |
| CODE-002 | Brak separacji logiki biznesowej od kontrolerów HTTP | Architektura | **Wysoki** |
| CODE-003 | Brak walidacji danych wejściowych — brak Joi/Zod | Bezpieczeństwo | **Wysoki** |
| CODE-004 | Inconsystentna obsługa błędów — brak globalnego error handler | Jakość | Wysoki |
| CODE-005 | `console.log()` w kodzie produkcyjnym | Logowanie | Średni |
| CODE-006 | Brak JSDoc / komentarzy dla publicznych funkcji | Dokumentacja | Niski |
| CODE-007 | Mieszanie async/await z callback-style w niektórych miejscach | Styl kodu | Niski |
| CODE-008 | Brak TypeScript na backendzie (pure JavaScript) | Typy | Niski |
| CODE-009 | Literówka `brandserch` zamiast `brandSearch` w komponencie Angular | UX | Niski |
| CODE-010 | Memory leak — brak `unsubscribe` w komponentach Angular | Frontend | Średni |

---

## Audyt Zależności npm

### Backend (salon-samochodowy-backend)

| Pakiet | Wersja | Status | Użycie | Uwagi |
|--------|--------|--------|--------|-------|
| express | 4.21.x | ✅ OK | Framework HTTP | Stabilna wersja |
| sequelize | 6.37.x | ✅ OK | ORM | Aktualna |
| sqlite3 | 5.1.7 | ✅ OK | Baza dev | Aktualna |
| mysql2 | 3.x | ✅ OK | Baza prod | Aktualna |
| express-session | 1.18 | ✅ OK | Sesje | Aktualna |
| **bcrypt** | **5.1.1** | **🔴 ZAINSTALOWANY ALE NIEUŻYWANY** | Haszowanie | INC-001 |
| express-validator | 7.2 | ✅ OK | Walidacja | Używany |
| multer | 1.4.5-lts.1 | ⚠️ LTS | Upload plików | Wersja LTS (nie latest) |
| cors | 2.8.5 | ✅ OK | CORS middleware | Stabilna |
| connect-session-sequelize | 7.1.7 | ✅ OK | Sesje DB | Aktualna |
| dotenv | 16.x | ✅ OK | Zmienne env | Aktualna |

### Frontend (salon-samochodowy-frontend)

| Pakiet | Wersja | Status | Uwagi |
|--------|--------|--------|-------|
| @angular/core | 19.x | ✅ OK | Framework główny |
| @angular/material | 19.x | ✅ OK | Komponenty UI |
| bootstrap | 5.x | ✅ OK | CSS framework |
| @angular/platform-server | 19.x | ⚠️ NIEZWERYFIKOWANY | SSR — wymaga testów |
| rxjs | 7.x | ✅ OK | Reaktywność — migracja do Signals planowana |

---

## Karta Oceny (Scorecard)

| Obszar | Obecny Stan | Ocena | Cel |
|--------|-------------|-------|-----|
| Bezpieczeństwo | 6 otwartych incydentów (2 CRITICAL) | 🔴 2/10 | 9/10 |
| Architektura | Monolityczny server.js, brak warstw | 🟠 4/10 | 8/10 |
| Pokrycie testami | ~40% BE, ~20% FE | 🟠 3/10 | 8/10 |
| Dokumentacja | Brak formalna dokumentacji | 🔴 2/10 | 9/10 |
| Infrastruktura | Brak Docker, CI/CD | 🔴 1/10 | 9/10 |
| Wydajność | Brak paginacji, cache, indeksów | 🟠 4/10 | 8/10 |
| Jakość kodu | Monolityczny, brak walidacji | 🟠 4/10 | 8/10 |
| **Łącznie** | | 🔴 **2.9/10** | **8.4/10** |

---

*Analiza przygotowana przez: IT Architect + Tech Lead*  
*Data audytu: styczeń 2025*  
*Następny przegląd: Po Fazie 1 (Bezpieczeństwo)*
