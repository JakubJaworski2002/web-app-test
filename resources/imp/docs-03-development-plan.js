'use strict';
const fs = require('fs');
const path = require('path');
const BASE = path.join(__dirname, '03-development-plan');
fs.mkdirSync(BASE, { recursive: true });

// ─────────────────────────────────────────────────────────────────────────────
// FILE 1: sprint-plan.md
// ─────────────────────────────────────────────────────────────────────────────
fs.writeFileSync(path.join(BASE, 'sprint-plan.md'), `# Plan Sprintów – Salon Samochodowy

> **Metodologia:** Agile Scrum | **Czas trwania sprintu:** 2 tygodnie | **Zespół:** 2–4 osoby

---

## Przegląd projektu

**Cel:** Przebudowa aplikacji Salon Samochodowy do standardów produkcyjnych: bezpieczeństwo, jakość kodu, pokrycie testami i CI/CD.

| Sprint | Nazwa | Cel główny | SP |
|--------|-------|------------|----|
| Sprint 0 | Setup & Audit | Środowisko, audyt, baseline | 31 |
| Sprint 1 | Security & Auth | Bezpieczeństwo i uwierzytelnianie | 27 |
| Sprint 2 | Backend Refactoring | Refaktoryzacja API | 31 |
| Sprint 3 | Frontend Redesign | Nowy design i stan aplikacji | 29 |
| Sprint 4 | Testing & Polish | Testy i gotowość produkcyjna | 50 |

---

## Sprint 0 – Setup & Audit (T+0..T+2 tyg.)

### Cel sprintu
Przygotowanie środowiska deweloperskiego, przeprowadzenie pełnego audytu bezpieczeństwa i architektury, ustalenie baseline testowego oraz naprawa krytycznych błędów bezpieczeństwa.

---

### US-S0-01: Konfiguracja środowiska Docker

**Jako** deweloper,  
**chcę** mieć skonteneryzowane środowisko lokalnego developmentu,  
**aby** każdy członek zespołu mógł uruchomić projekt jedną komendą.

**Kryteria akceptacji (Given / When / Then):**
- **GIVEN** repozytorium zostało sklonowane, **WHEN** wykonam \`docker-compose up\`, **THEN** wszystkie serwisy (frontend, backend, DB) uruchamiają się bez błędów.
- **GIVEN** środowisko jest uruchomione, **WHEN** otworzę \`http://localhost:4200\`, **THEN** widzę aplikację Angular.
- **GIVEN** środowisko jest uruchomione, **WHEN** wyślę \`GET /api/health\`, **THEN** otrzymuję \`{ "status": "ok" }\` z kodem 200.

**Zadania:**
- [ ] Napisać Dockerfile dla frontendu (multi-stage: build + nginx)
- [ ] Napisać Dockerfile dla backendu (Node 20 Alpine)
- [ ] Napisać docker-compose.yml (frontend, backend, mysql, adminer)
- [ ] Stworzyć \`.env.example\` ze wszystkimi wymaganymi zmiennymi
- [ ] Przetestować pełny flow \`docker-compose up --build\`

**Story Points:** 8 | **Priorytet:** Must Have

---

### US-S0-02: Audyt architektury i bezpieczeństwa

**Jako** tech lead,  
**chcę** mieć kompletny raport audytu,  
**aby** zidentyfikować wszystkie problemy przed refaktoryzacją.

**Kryteria akceptacji:**
- **GIVEN** kod źródłowy backendu, **WHEN** przeprowadzę analizę OWASP Top 10, **THEN** zidentyfikuję ≥10 problemów bezpieczeństwa.
- **GIVEN** kod źródłowy frontendu, **WHEN** przeprowadzę analizę, **THEN** zidentyfikuję ≥5 problemów jakości.
- Dokument \`technical-debt.md\` zawiera ≥15 pozycji z priorytetami.
- Uruchomiony \`npm audit\` na obu projektach, raporty zapisane.

**Story Points:** 5 | **Priorytet:** Must Have

---

### US-S0-03: Baseline testów

**Jako** QA engineer,  
**chcę** znać aktualny stan pokrycia testami,  
**aby** mierzyć postęp w kolejnych sprintach.

**Kryteria akceptacji:**
- **GIVEN** istniejące testy Jest, **WHEN** uruchomię \`npm run test -- --coverage\`, **THEN** otrzymuję raport pokrycia.
- **GIVEN** istniejące testy Playwright, **WHEN** uruchomię \`npx playwright test\`, **THEN** wszystkie 60 testów przechodzi lub wyjątki są udokumentowane.
- Baseline zapisany w \`resources/imp/test-baseline.json\`.

**Story Points:** 5 | **Priorytet:** Should Have

---

### US-S0-04: Szkielet CI/CD

**Jako** DevOps engineer,  
**chcę** mieć podstawowy pipeline GitHub Actions,  
**aby** każdy PR był automatycznie weryfikowany.

**Kryteria akceptacji:**
- **GIVEN** PR do \`develop\`, **WHEN** pipeline uruchomi się, **THEN** lint + build Angular + testy Jest zakończone sukcesem.
- **GIVEN** commit na \`main\`, **WHEN** pipeline uruchomi się, **THEN** pełne testy E2E Playwright wykonują się.
- Czas pipeline'u PR < 10 minut.

**Story Points:** 8 | **Priorytet:** Should Have

---

### US-S0-05: Naprawa krytycznych błędów bezpieczeństwa

**Jako** administrator systemu,  
**chcę** aby hasła były hashowane,  
**aby** w razie wycieku danych użytkownicy byli chronieni.

**Kryteria akceptacji:**
- **GIVEN** nowy użytkownik rejestruje się, **WHEN** sprawdzę bazę danych, **THEN** hasło jest hashowane bcrypt (zaczyna się od \`$2b$\`).
- **GIVEN** nowy użytkownik bez parametru \`isDealer\`, **WHEN** sprawdzę rekord, **THEN** \`isDealer = false\` (nie \`true\`).
- Skrypt migracyjny \`scripts/migrate-passwords.js\` napisany i przetestowany.

**Story Points:** 5 | **Priorytet:** Must Have

**Ryzyka Sprint 0:**
- Brak pwsh/Docker na maszynie dewelopera → użyj WSL2
- Istniejące dane z plaintextowymi hasłami wymagają ostrożnej migracji

---

## Sprint 1 – Security & Auth (T+2..T+4 tyg.)

### Cel sprintu
Wdrożenie kompletnego systemu bezpieczeństwa: hashowanie haseł, tokeny JWT, ochrona tras w Angular, rate limiting i konfiguracja CORS.

---

### US-S1-01: Hashowanie haseł bcrypt + migracja

**Kryteria akceptacji:**
- **GIVEN** rejestracja z hasłem \`Test1234!\`, **WHEN** sprawdzę bazę, **THEN** hash bcrypt (\`$2b$10$...\`).
- **GIVEN** poprawne hasło przy logowaniu, **WHEN** weryfikacja, **THEN** logowanie udane.
- **GIVEN** błędne hasło, **WHEN** weryfikacja, **THEN** błąd 401.
- Czas hashowania < 200ms (bcrypt rounds = 10).

\`\`\`javascript
// salon-samochodowy-backend/src/middleware/auth.js
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

async function hashPassword(plaintext) {
  return bcrypt.hash(plaintext, SALT_ROUNDS);
}

async function verifyPassword(plaintext, hash) {
  return bcrypt.compare(plaintext, hash);
}

module.exports = { hashPassword, verifyPassword };
\`\`\`

**Story Points:** 8 | **Priorytet:** Must Have

---

### US-S1-02: Wsparcie tokenów JWT

**Kryteria akceptacji:**
- **GIVEN** poprawne logowanie, **WHEN** sprawdzę odpowiedź, **THEN** \`{ token, refreshToken, user }\`.
- **GIVEN** żądanie z ważnym JWT w \`Authorization: Bearer <token>\`, **WHEN** trafię na chroniony endpoint, **THEN** 200 OK.
- **GIVEN** wygasły token, **WHEN** żądanie, **THEN** 401 z \`{ error: "Token wygasł" }\`.
- Access token wygasa po 24h, refresh token po 7 dniach.

\`\`\`javascript
// salon-samochodowy-backend/src/middleware/jwt.js
const jwt = require('jsonwebtoken');

function generateTokens(userId) {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
}

module.exports = { generateTokens };
\`\`\`

**Story Points:** 8 | **Priorytet:** Must Have

---

### US-S1-03: Angular Auth Guards

**Kryteria akceptacji:**
- **GIVEN** niezalogowany użytkownik, **WHEN** wejdzie na \`/buy\`, **THEN** przekierowany do \`/login\`.
- **GIVEN** zalogowany user bez roli dealer, **WHEN** wejdzie na \`/dealer/panel\`, **THEN** przekierowany do \`/unauthorized\`.
- Guard zaimplementowany jako funkcja (nie klasa – Angular 15+).

\`\`\`typescript
// salon-samochodowy-frontend/src/app/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};

export const dealerGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn() && auth.isDealer()) return true;
  return router.createUrlTree(['/unauthorized']);
};
\`\`\`

**Story Points:** 5 | **Priorytet:** Must Have

---

### US-S1-04: Rate Limiting backendu

**Kryteria akceptacji:**
- **GIVEN** >100 żądań/minutę z jednego IP do \`/api/\`, **WHEN** limit przekroczony, **THEN** 429 Too Many Requests.
- **GIVEN** >5 błędnych logowań/minutę, **WHEN** limit przekroczony, **THEN** blokada na 15 minut.
- Nagłówki \`X-RateLimit-Limit\`, \`X-RateLimit-Remaining\`, \`Retry-After\` w odpowiedzi.

\`\`\`javascript
// salon-samochodowy-backend/src/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_GENERAL || '100'),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Zbyt wiele żądań, spróbuj ponownie za chwilę' }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_LOGIN || '5'),
  skipSuccessfulRequests: true,
  message: { error: 'Zbyt wiele prób logowania, konto tymczasowo zablokowane' }
});

module.exports = { generalLimiter, loginLimiter };
\`\`\`

**Story Points:** 3 | **Priorytet:** Must Have

---

### US-S1-05: Konfiguracja CORS

**Kryteria akceptacji:**
- **GIVEN** \`ALLOWED_ORIGINS=http://localhost:4200\`, **WHEN** frontend wyśle żądanie, **THEN** CORS przepuszcza.
- **GIVEN** żądanie z nieznanego origin, **WHEN** trafi do serwera, **THEN** błąd 403.
- Brak hardkodowanych URL w kodzie produkcyjnym.

\`\`\`javascript
// salon-samochodowy-backend/src/config/cors.js
const corsOptions = {
  origin: (origin, callback) => {
    const allowed = (process.env.ALLOWED_ORIGINS || '')
      .split(',').map(o => o.trim());
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(\`Origin \${origin} nie jest dozwolony przez CORS\`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
module.exports = corsOptions;
\`\`\`

**Story Points:** 3 | **Priorytet:** Must Have

---

## Sprint 2 – Backend Refactoring (T+4..T+6 tyg.)

### Cel sprintu
Refaktoryzacja backendu: wersjonowanie API, model transakcji, paginacja, wyszukiwanie, RBAC i naprawa błędu \`isSold\`.

---

### US-S2-01: Wersjonowanie API \`/api/v1/\`

**Kryteria akceptacji:**
- **GIVEN** stary endpoint \`GET /api/cars\`, **WHEN** żądanie, **THEN** 301 redirect do \`/api/v1/cars\`.
- Wszystkie endpointy przeniesione do \`/api/v1/\`.
- OpenAPI spec dostępny pod \`/api/v1/docs\`.

**Story Points:** 5 | **Priorytet:** Should Have

---

### US-S2-02: Model Transaction + historia zakupów

**Kryteria akceptacji:**
- **GIVEN** zakup samochodu, **WHEN** transakcja się powiedzie, **THEN** rekord w tabeli \`transactions\`.
- **GIVEN** \`GET /api/v1/users/:id/transactions\`, **WHEN** zalogowany właściciel konta, **THEN** lista z paginacją.
- Transakcja jest atomowa (samochód + rekord w jednej operacji DB).

\`\`\`sql
CREATE TABLE IF NOT EXISTS transactions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL,
  car_id     INTEGER NOT NULL,
  amount     DECIMAL(10,2) NOT NULL,
  type       TEXT CHECK(type IN ('buy','rent')) NOT NULL,
  status     TEXT CHECK(status IN ('pending','completed','cancelled')) DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (car_id)  REFERENCES cars(id)
);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_car  ON transactions(car_id);
\`\`\`

**Story Points:** 8 | **Priorytet:** Should Have

---

### US-S2-03: Paginacja \`/api/v1/cars\`

**Kryteria akceptacji:**
- **GIVEN** \`GET /api/v1/cars?page=1&limit=10\`, **WHEN** żądanie, **THEN** max 10 rekordów.
- Body zawiera \`{ data, pagination: { page, limit, total, totalPages } }\`.
- Domyślnie: \`page=1\`, \`limit=20\`, maks. \`limit=100\`.

\`\`\`javascript
router.get('/', async (req, res) => {
  const page   = Math.max(1, parseInt(req.query.page)  || 1);
  const limit  = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  const offset = (page - 1) * limit;

  const { count, rows } = await Car.findAndCountAll({
    where: buildWhereClause(req.query),
    limit, offset,
    order: [['createdAt', 'DESC']]
  });

  res.json({
    data: rows,
    pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) }
  });
});
\`\`\`

**Story Points:** 5 | **Priorytet:** Should Have

---

### US-S2-04: Wyszukiwanie i filtrowanie samochodów

**Kryteria akceptacji:**
- **GIVEN** \`?brand=Toyota\`, **THEN** tylko Toyoty.
- **GIVEN** \`?minPrice=50000&maxPrice=100000\`, **THEN** przedział cenowy.
- **GIVEN** \`?search=camry\`, **THEN** case-insensitive po brand, model, description.

**Story Points:** 5 | **Priorytet:** Should Have

---

### US-S2-05: RBAC middleware

**Kryteria akceptacji:**
- **GIVEN** \`POST /api/v1/cars\` bez roli dealer, **THEN** 403 Forbidden.
- Middleware \`requireRole('dealer')\` działa dla sesji i JWT.

\`\`\`javascript
// salon-samochodowy-backend/src/middleware/rbac.js
function requireRole(...roles) {
  return (req, res, next) => {
    const user = req.user || req.session?.user;
    if (!user) return res.status(401).json({ error: 'Wymagane uwierzytelnienie' });
    const userRole = user.isDealer ? 'dealer' : 'user';
    if (!roles.includes(userRole)) return res.status(403).json({ error: 'Brak uprawnień' });
    next();
  };
}
module.exports = { requireRole };
\`\`\`

**Story Points:** 5 | **Priorytet:** Must Have

---

### US-S2-06: Naprawa błędu \`isSold\`

**Kryteria akceptacji:**
- **GIVEN** zakup samochodu, **WHEN** \`POST /api/v1/buy\`, **THEN** \`car.isSold = true\` (NIE \`isAvailableForRent = false\`).
- **GIVEN** samochód z \`isSold=true\`, **WHEN** ponowny zakup, **THEN** 409 Conflict.

**Story Points:** 3 | **Priorytet:** Must Have

---

## Sprint 3 – Frontend Redesign (T+6..T+8 tyg.)

### Cel sprintu
Modernizacja frontendu: Angular Signals, nowy design system, stany ładowania, obsługa błędów i naprawa problemów jakości.

---

### US-S3-01: Migracja na Angular Signals

**Kryteria akceptacji:**
- Komponenty używają \`signal()\`, \`computed()\`, \`effect()\` zamiast BehaviorSubject.
- Brak niezamkniętych subskrypcji (zastąpione przez \`toSignal()\`).
- Memory leak z \`combineLatest\` wyeliminowany.

\`\`\`typescript
// salon-samochodowy-frontend/src/app/components/car-list/car-list.component.ts
import { Component, signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CarService } from '../../services/car.service';

@Component({
  selector: 'app-car-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './car-list.component.html'
})
export class CarListComponent {
  private carService = inject(CarService);
  searchBrand = signal<string>('');
  currentPage = signal<number>(1);

  private carsData = toSignal(
    this.carService.getCars(),
    { initialValue: { data: [], pagination: null } }
  );

  cars      = computed(() => this.carsData()?.data ?? []);
  totalPages = computed(() => this.carsData()?.pagination?.totalPages ?? 0);
  isEmpty   = computed(() => this.cars().length === 0);
}
\`\`\`

**Story Points:** 8 | **Priorytet:** Should Have

---

### US-S3-02: Nowy design system

**Kryteria akceptacji:**
- CSS custom properties dla kolorów, fontów i spacingu.
- Angular Material custom theme: primary \`#1E3A5F\`, accent \`#E63946\`.
- Responsywność mobile-first: 375px / 768px / 1024px / 1440px.

**Story Points:** 8 | **Priorytet:** Should Have

---

### US-S3-03: Komponenty stanów ładowania i błędów

**Kryteria akceptacji:**
- Skeleton loader podczas ładowania (nie spinner globalny).
- Toast notification zamiast \`alert()\`.
- Błąd 401 → przekierowanie do \`/login\`.
- **Brak** \`alert()\`, \`confirm()\`, \`prompt()\` w kodzie – naruszenie = blokujący bug.

\`\`\`typescript
// salon-samochodowy-frontend/src/app/services/notification.service.ts
import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  success(message: string): void {
    this.snackBar.open(message, 'Zamknij', {
      duration: 4000, panelClass: ['snack-success'],
      horizontalPosition: 'end', verticalPosition: 'top'
    });
  }

  error(message: string): void {
    this.snackBar.open(message, 'Zamknij', {
      duration: 6000, panelClass: ['snack-error'],
      horizontalPosition: 'end', verticalPosition: 'top'
    });
  }
}
\`\`\`

**Story Points:** 5 | **Priorytet:** Must Have

---

### US-S3-04: Reactive Forms z walidacją

**Kryteria akceptacji:**
- Walidacja inline pod polami (nie popup).
- Custom validator siły hasła (≥8 znaków, wielka litera, cyfra).
- Brak \`FormsModule\` – wyłącznie \`ReactiveFormsModule\`.

**Story Points:** 5 | **Priorytet:** Should Have

---

### US-S3-05: Naprawa literówek i jakości kodu

**Kryteria akceptacji:**
- Literówka \`brandserch\` → \`brandSearch\` naprawiona.
- Brak \`console.log\` w kodzie produkcyjnym.
- \`ChangeDetectionStrategy.OnPush\` tam gdzie możliwe.
- ESLint bez błędów poziomu error.

**Story Points:** 3 | **Priorytet:** Must Have

---

## Sprint 4 – Testing & Polish (T+8..T+10 tyg.)

### Cel sprintu
Pokrycie testami >80%, optymalizacja wydajności, dostępność WCAG 2.1 AA, dokumentacja i przegląd produkcyjny.

---

### US-S4-01: Rozszerzenie testów Playwright (+30 testów)

**Kryteria akceptacji:**
- ≥90 testów łącznie (60 istniejących + 30 nowych).
- Pokryte: paginacja UI, filtrowanie, reset hasła, panel dealera, historia transakcji.
- Wszystkie testy < 5 minut (parallel execution).
- Page Object Model wdrożony dla wszystkich stron.

**Story Points:** 13 | **Priorytet:** Should Have

---

### US-S4-02: Pokrycie testami >80%

**Kryteria akceptacji:**
- Backend: branch coverage ≥80% (Jest \`--coverage\`).
- Frontend: line coverage ≥80% (ng test \`--code-coverage\`).
- Moduły krytyczne 100%: \`auth.js\`, \`hashPassword\`, \`verifyToken\`, \`requireRole\`.
- CI blokuje merge poniżej progu.

**Story Points:** 13 | **Priorytet:** Should Have

---

### US-S4-03: Optymalizacja wydajności

**Kryteria akceptacji:**
- Lighthouse Performance ≥80.
- FCP < 1.5s.
- Bundle Angular lazy-loaded chunks < 200KB każdy.
- Indeksy DB na: \`brand\`, \`price\`, \`isSold\`, \`userId\`.

**Story Points:** 8 | **Priorytet:** Could Have

---

### US-S4-04: Dostępność WCAG 2.1 AA

**Kryteria akceptacji:**
- axe-core: brak naruszeń Critical i Serious.
- Kontrast kolorów ≥4.5:1 dla wszystkich tekstów.
- Nawigacja klawiaturą działa (Tab, Enter, Escape, strzałki).
- Focus visible dla wszystkich interaktywnych elementów.

**Story Points:** 8 | **Priorytet:** Should Have

---

### US-S4-05: Finalna dokumentacja i przegląd produkcyjny

**Kryteria akceptacji:**
- README.md: instalacja, uruchomienie, testy, deployment.
- OpenAPI docs kompletne dla v1.
- Security scan: \`npm audit\` bez high/critical.
- Load test: 100 concurrent users, p95 < 500ms.
- CHANGELOG.md zaktualizowany.

**Story Points:** 8 | **Priorytet:** Must Have

---

## Metryki sukcesu projektu

| Metryka | Przed | Cel |
|---------|-------|-----|
| Playwright tests | 60 | ≥90 |
| Pokrycie backend | ~45% | >80% |
| Pokrycie frontend | ~30% | >80% |
| Lighthouse Score | ~55 | >80 |
| Krytyczne błędy bezpieczeństwa | 7 | 0 |
| Pozycje tech debt | 15 | <5 otwartych |

---

*Dokument: plan sprintów – Salon Samochodowy AiTSI | Wersja 1.0 | 2025*
`, 'utf8');

// ─────────────────────────────────────────────────────────────────────────────
// FILE 2: backlog.md
// ─────────────────────────────────────────────────────────────────────────────
fs.writeFileSync(path.join(BASE, 'backlog.md'), `# Product Backlog – Salon Samochodowy

> **Metodologia:** MoSCoW | **Priorytetyzacja:** wg wartości biznesowej i ryzyka  
> **Legenda SP:** 1=trivial, 2=małe, 3=średnie, 5=duże, 8=bardzo duże, 13=epic

---

## EPIC 1: Security Hardening (Krytyczne)

### US-001 – Hashowanie haseł bcrypt
| Pole | Wartość |
|------|---------|
| **ID** | US-001 |
| **Epic** | Security Hardening |
| **Priorytet (MoSCoW)** | Must Have |
| **Story Points** | 8 |
| **Sprint** | 1 |
| **Zależności** | US-004 |

**Opis:** Jako użytkownik chcę, aby moje hasło było bezpiecznie hashowane bcrypt zamiast przechowywane jako plaintext, aby moje konto było bezpieczne nawet po naruszeniu bazy danych.

**Kryteria akceptacji:**
- GIVEN rejestracja z hasłem, WHEN zapiszę do DB, THEN hash bcrypt (\`$2b$10$...\`)
- GIVEN poprawne hasło, WHEN logowanie, THEN sukces 200
- GIVEN błędne hasło, WHEN logowanie, THEN 401 Unauthorized
- GIVEN skrypt migracyjny, WHEN uruchomię, THEN istniejące hasła są przetworzone

---

### US-002 – Tokeny JWT
| Pole | Wartość |
|------|---------|
| **ID** | US-002 |
| **Priorytet** | Must Have |
| **Story Points** | 8 |
| **Sprint** | 1 |
| **Zależności** | US-001 |

**Opis:** Jako deweloper frontendu chcę móc uwierzytelniać żądania tokenem JWT, aby aplikacja działała jako stateless SPA.

**Kryteria akceptacji:**
- GIVEN poprawne logowanie, WHEN sprawdzę odpowiedź, THEN \`{ token, refreshToken, expiresIn }\`
- GIVEN ważny JWT, WHEN chroniony endpoint, THEN 200 OK
- GIVEN wygasły token, WHEN żądanie, THEN 401 \`{ error: "Token wygasł" }\`
- GIVEN refresh token, WHEN \`POST /api/v1/auth/refresh\`, THEN nowy access token

---

### US-003 – Rate Limiting
| Pole | Wartość |
|------|---------|
| **ID** | US-003 |
| **Priorytet** | Must Have |
| **Story Points** | 3 |
| **Sprint** | 1 |

**Opis:** Jako administrator chcę ograniczyć liczbę żądań do API, aby chronić przed brute-force i DDoS.

**Kryteria akceptacji:**
- GIVEN >100 req/min z jednego IP, WHEN limit, THEN 429 + \`Retry-After\`
- GIVEN >5 błędnych logowań/15min, WHEN limit, THEN blokada IP

---

### US-004 – Naprawa isDealer default=false
| Pole | Wartość |
|------|---------|
| **ID** | US-004 |
| **Priorytet** | Must Have |
| **Story Points** | 1 |
| **Sprint** | 0 |

**Opis:** Jako administrator chcę, aby nowi użytkownicy domyślnie NIE mieli roli dealera.

**Kryteria akceptacji:**
- GIVEN nowy użytkownik bez podania isDealer, WHEN zapis do DB, THEN \`isDealer = false\`
- GIVEN model User w Sequelize, WHEN sprawdzę defaultValue, THEN \`defaultValue: false\`

\`\`\`javascript
// Naprawa w modelu User
isDealer: {
  type: DataTypes.BOOLEAN,
  defaultValue: false,  // BYŁ: true – krytyczny błąd bezpieczeństwa!
  allowNull: false
}
\`\`\`

---

### US-005 – Hardening sesji
| Pole | Wartość |
|------|---------|
| **ID** | US-005 |
| **Priorytet** | Must Have |
| **Story Points** | 3 |
| **Sprint** | 1 |

**Opis:** Jako użytkownik chcę, aby moja sesja była bezpieczna (httpOnly, secure, sameSite).

**Kryteria akceptacji:**
- Cookie sesji ma flagi: \`httpOnly: true\`, \`secure: true\` (prod), \`sameSite: 'strict'\`
- Sesja wygasa po 24h nieaktywności
- Regeneracja ID sesji po zalogowaniu (zapobieganie session fixation)

---

### US-006 – Sanityzacja wejścia (XSS)
| Pole | Wartość |
|------|---------|
| **ID** | US-006 |
| **Priorytet** | Must Have |
| **Story Points** | 5 |
| **Sprint** | 1 |

**Opis:** Jako administrator chcę, aby wszystkie dane wejściowe były sanityzowane, aby zapobiec atakom XSS.

**Kryteria akceptacji:**
- GIVEN payload \`<script>alert(1)</script>\` w nazwie samochodu, WHEN zapis, THEN tekst jest escapowany
- Biblioteka DOMPurify używana po stronie frontendu
- \`express-validator\` używany na backendzie
- Nagłówek \`Content-Security-Policy\` skonfigurowany

---

### US-007 – Ochrona przed SQL Injection
| Pole | Wartość |
|------|---------|
| **ID** | US-007 |
| **Priorytet** | Must Have |
| **Story Points** | 3 |
| **Sprint** | 1 |

**Opis:** Jako administrator chcę mieć pewność, że żadne zapytanie SQL nie jest budowane przez konkatenację stringów.

**Kryteria akceptacji:**
- Audyt kodu: 0 instancji surowych zapytań SQL z interpolacją użytkownika
- Sequelize ORM używany konsekwentnie (parameterized queries)
- \`npm audit\` dla pakietów SQL bez krytycznych luk

---

## EPIC 2: API Improvements (Wysoki priorytet)

### US-008 – Wersjonowanie API
| Pole | Wartość |
|------|---------|
| **ID** | US-008 |
| **Priorytet** | Should Have |
| **Story Points** | 5 |
| **Sprint** | 2 |

**Opis:** Jako deweloper API chcę mieć wersjonowane endpointy \`/api/v1/\`, aby bezpiecznie wprowadzać zmiany.

---

### US-009 – Paginacja /cars
| Pole | Wartość |
|------|---------|
| **ID** | US-009 |
| **Priorytet** | Should Have |
| **Story Points** | 5 |
| **Sprint** | 2 |

**Opis:** Jako użytkownik chcę aby lista samochodów była paginowana, aby strona ładowała się szybko.

---

### US-010 – Backend wyszukiwanie/filtrowanie
| Pole | Wartość |
|------|---------|
| **ID** | US-010 |
| **Priorytet** | Should Have |
| **Story Points** | 5 |
| **Sprint** | 2 |

**Opis:** Jako użytkownik chcę filtrować samochody po marce i cenie po stronie serwera.

---

### US-011 – Endpoint historii transakcji
| Pole | Wartość |
|------|---------|
| **ID** | US-011 |
| **Priorytet** | Should Have |
| **Story Points** | 8 |
| **Sprint** | 2 |
| **Zależności** | US-002, model Transaction |

**Opis:** Jako klient chcę widzieć historię moich transakcji (zakupów i wynajmów).

---

### US-012 – Endpoint dostępności samochodów
| Pole | Wartość |
|------|---------|
| **ID** | US-012 |
| **Priorytet** | Should Have |
| **Story Points** | 3 |
| **Sprint** | 2 |

**Opis:** Jako frontend chcę endpoint \`GET /api/v1/cars/:id/availability\` zwracający status dostępności.

---

### US-013 – Endpoint profilu użytkownika
| Pole | Wartość |
|------|---------|
| **ID** | US-013 |
| **Priorytet** | Should Have |
| **Story Points** | 3 |
| **Sprint** | 2 |

**Opis:** Jako użytkownik chcę móc pobrać i zaktualizować swój profil przez API.

---

### US-014 – RBAC middleware
| Pole | Wartość |
|------|---------|
| **ID** | US-014 |
| **Priorytet** | Must Have |
| **Story Points** | 5 |
| **Sprint** | 2 |
| **Zależności** | US-002 |

---

### US-015 – Endpoint health check
| Pole | Wartość |
|------|---------|
| **ID** | US-015 |
| **Priorytet** | Should Have |
| **Story Points** | 1 |
| **Sprint** | 0 |

**Opis:** \`GET /api/health\` zwraca \`{ status, uptime, db: "connected" }\`.

---

## EPIC 3: Frontend Improvements (Wysoki priorytet)

### US-016 – Angular Auth Guards
| Pole | Wartość |
|------|---------|
| **ID** | US-016 |
| **Priorytet** | Must Have |
| **Story Points** | 5 |
| **Sprint** | 1 |

---

### US-017 – Migracja Angular Signals
| Pole | Wartość |
|------|---------|
| **ID** | US-017 |
| **Priorytet** | Should Have |
| **Story Points** | 8 |
| **Sprint** | 3 |

---

### US-018 – Reactive Forms + walidacja
| Pole | Wartość |
|------|---------|
| **ID** | US-018 |
| **Priorytet** | Should Have |
| **Story Points** | 5 |
| **Sprint** | 3 |

---

### US-019 – Komponent loading spinner / skeleton
| Pole | Wartość |
|------|---------|
| **ID** | US-019 |
| **Priorytet** | Must Have |
| **Story Points** | 3 |
| **Sprint** | 3 |

---

### US-020 – Toast notifications (zamiast alert)
| Pole | Wartość |
|------|---------|
| **ID** | US-020 |
| **Priorytet** | Must Have |
| **Story Points** | 3 |
| **Sprint** | 3 |

---

### US-021 – UI paginacji samochodów
| Pole | Wartość |
|------|---------|
| **ID** | US-021 |
| **Priorytet** | Should Have |
| **Story Points** | 3 |
| **Sprint** | 3 |
| **Zależności** | US-009 |

---

### US-022 – UI filtrowania marka/cena
| Pole | Wartość |
|------|---------|
| **ID** | US-022 |
| **Priorytet** | Should Have |
| **Story Points** | 5 |
| **Sprint** | 3 |
| **Zależności** | US-010 |

---

### US-023 – Naprawa literówki brandserch
| Pole | Wartość |
|------|---------|
| **ID** | US-023 |
| **Priorytet** | Must Have |
| **Story Points** | 1 |
| **Sprint** | 3 |

**Opis:** Zmienna \`brandserch\` → \`brandSearch\` w całym projekcie frontendowym.

---

## EPIC 4: Design Redesign (Średni priorytet)

| ID | Tytuł | Priorytet | SP | Sprint |
|----|-------|-----------|-----|--------|
| US-024 | Nowy schemat kolorów | Should Have | 3 | 3 |
| US-025 | Redesign karty samochodu | Should Have | 5 | 3 |
| US-026 | Ulepszenie navbara | Should Have | 3 | 3 |
| US-027 | Ilustracje pustych stanów | Could Have | 3 | 4 |
| US-028 | Responsywność mobilna | Should Have | 5 | 3 |
| US-029 | Tryb ciemny | Could Have | 8 | 4 |
| US-030 | Dostępność WCAG 2.1 AA | Should Have | 8 | 4 |

---

## EPIC 5: Testing (Wysoki priorytet)

| ID | Tytuł | Priorytet | SP | Sprint |
|----|-------|-----------|-----|--------|
| US-031 | Unit tests backend >80% | Should Have | 13 | 4 |
| US-032 | Unit tests frontend >80% | Should Have | 13 | 4 |
| US-033 | +30 nowych testów Playwright | Should Have | 13 | 4 |
| US-034 | Testy wydajnościowe | Could Have | 5 | 4 |
| US-035 | Visual regression tests | Could Have | 5 | 4 |

---

## EPIC 6: DevOps (Średni priorytet)

| ID | Tytuł | Priorytet | SP | Sprint |
|----|-------|-----------|-----|--------|
| US-036 | Dockerfile frontend | Should Have | 5 | 0 |
| US-037 | Dockerfile backend | Should Have | 3 | 0 |
| US-038 | docker-compose.yml | Should Have | 5 | 0 |
| US-039 | GitHub Actions CI | Should Have | 8 | 0 |
| US-040 | GitHub Actions CD | Could Have | 8 | 4 |

---

## Backlog – Podsumowanie

| Epic | Liczba US | Łączne SP | Must Have SP |
|------|-----------|-----------|--------------|
| Security Hardening | 7 | 31 | 28 |
| API Improvements | 8 | 35 | 5 |
| Frontend Improvements | 8 | 33 | 12 |
| Design Redesign | 7 | 35 | 0 |
| Testing | 5 | 49 | 0 |
| DevOps | 5 | 29 | 0 |
| **ŁĄCZNIE** | **40** | **212** | **45** |

---

*Backlog – Salon Samochodowy AiTSI | Wersja 1.0 | 2025*
`, 'utf8');

// ─────────────────────────────────────────────────────────────────────────────
// FILE 3: technical-debt.md
// ─────────────────────────────────────────────────────────────────────────────
fs.writeFileSync(path.join(BASE, 'technical-debt.md'), `# Rejestr Długu Technicznego – Salon Samochodowy

> **Legenda nakładu:** S=Small(≤1h), M=Medium(2-4h), L=Large(1-2dni), XL=Extra Large(>2dni)  
> **Legenda priorytetu:** P1=Krytyczne, P2=Wysokie, P3=Średnie, P4=Niskie

---

## DEBT-001 – Plaintext hasła użytkowników

| Pole | Wartość |
|------|---------|
| **ID** | DEBT-001 |
| **Tytuł** | Hasła przechowywane w plaintext |
| **Lokalizacja** | \`salon-samochodowy-backend/routes/auth.js\` |
| **Priorytet** | P1 – Krytyczne |
| **Nakład naprawy** | M |
| **Sprint** | 0 (natychmiast) |

**Opis:**  
Hasła użytkowników są przechowywane i porównywane bez hashowania. Każdy, kto uzyska dostęp do bazy danych, ma pełen dostęp do kont wszystkich użytkowników.

**Wpływ:**
- Naruszenie OWASP A02: Cryptographic Failures
- Pełny dostęp do kont użytkowników po wycieku bazy
- Potencjalne naruszenie RODO

**Obecny kod (błąd):**
\`\`\`javascript
// Złe – porównanie plaintext
if (user.password === req.body.password) {
  req.session.user = user;
}
\`\`\`

**Sugerowana naprawa:**
\`\`\`javascript
const bcrypt = require('bcrypt');

// Rejestracja – hashowanie
const hashedPassword = await bcrypt.hash(req.body.password, 10);
await User.create({ ...userData, password: hashedPassword });

// Logowanie – weryfikacja
const isValid = await bcrypt.compare(req.body.password, user.password);
if (!isValid) return res.status(401).json({ error: 'Nieprawidłowe dane' });
\`\`\`

---

## DEBT-002 – isDealer domyślnie true

| Pole | Wartość |
|------|---------|
| **ID** | DEBT-002 |
| **Tytuł** | Nowi użytkownicy mają domyślnie rolę dealera |
| **Lokalizacja** | \`salon-samochodowy-backend/models/User.js:isDealer\` |
| **Priorytet** | P1 – Krytyczne |
| **Nakład naprawy** | S |
| **Sprint** | 0 (natychmiast) |

**Opis:**  
Model użytkownika ma \`defaultValue: true\` dla pola \`isDealer\`. Każdy nowo zarejestrowany użytkownik automatycznie otrzymuje uprawnienia dealerskie.

**Obecny kod (błąd):**
\`\`\`javascript
isDealer: {
  type: DataTypes.BOOLEAN,
  defaultValue: true  // BŁĄD – każdy user jest dealerem!
}
\`\`\`

**Naprawa:**
\`\`\`javascript
isDealer: {
  type: DataTypes.BOOLEAN,
  defaultValue: false,  // Poprawnie
  allowNull: false
}
\`\`\`

---

## DEBT-003 – Buy używa isAvailableForRent zamiast isSold

| Pole | Wartość |
|------|---------|
| **ID** | DEBT-003 |
| **Tytuł** | Zakup samochodu ustawia błędne pole |
| **Lokalizacja** | \`salon-samochodowy-backend/routes/cars.js:POST /buy\` |
| **Priorytet** | P1 – Krytyczne |
| **Nakład naprawy** | S |
| **Sprint** | 2 |

**Opis:**  
Endpoint zakupu ustawia \`isAvailableForRent = false\` zamiast \`isSold = true\`. Samochód pozostaje widoczny jako dostępny do zakupu mimo że już jest sprzedany.

**Obecny kod (błąd):**
\`\`\`javascript
// Złe – ustawia wynajm zamiast sprzedaży
await car.update({ isAvailableForRent: false });
\`\`\`

**Naprawa:**
\`\`\`javascript
await car.update({ isSold: true });
// Dodatkowo – sprawdzenie przed zakupem:
if (car.isSold) {
  return res.status(409).json({ error: 'Samochód nie jest dostępny do zakupu' });
}
\`\`\`

---

## DEBT-004 – Brak rate limiting

| Pole | Wartość |
|------|---------|
| **ID** | DEBT-004 |
| **Tytuł** | Brak ograniczenia liczby żądań do API |
| **Lokalizacja** | \`salon-samochodowy-backend/app.js\` |
| **Priorytet** | P2 – Wysokie |
| **Nakład naprawy** | S |
| **Sprint** | 1 |

**Opis:**  
Brak rate limitingu umożliwia ataki brute-force na endpoint logowania oraz potencjalny DDoS.

**Naprawa:**
\`\`\`javascript
const rateLimit = require('express-rate-limit');
app.use('/api/auth/login', rateLimit({ windowMs: 15*60*1000, max: 5 }));
app.use('/api/', rateLimit({ windowMs: 60*1000, max: 100 }));
\`\`\`

---

## DEBT-005 – Hardkodowany CORS

| Pole | Wartość |
|------|---------|
| **ID** | DEBT-005 |
| **Tytuł** | CORS z hardkodowanym adresem localhost |
| **Lokalizacja** | \`salon-samochodowy-backend/app.js\` |
| **Priorytet** | P2 – Wysokie |
| **Nakład naprawy** | S |
| **Sprint** | 1 |

**Opis:**  
Konfiguracja CORS zawiera hardkodowany adres \`http://localhost:4200\`, co uniemożliwia deployment na inne środowiska bez zmiany kodu.

**Naprawa:**
\`\`\`javascript
const allowed = process.env.ALLOWED_ORIGINS.split(',');
app.use(cors({ origin: (o, cb) => allowed.includes(o) ? cb(null, true) : cb(new Error('CORS')) }));
\`\`\`

---

## DEBT-006 – Brak paginacji listy samochodów

| Pole | Wartość |
|------|---------|
| **ID** | DEBT-006 |
| **Tytuł** | Endpoint /cars zwraca wszystkie rekordy naraz |
| **Lokalizacja** | \`salon-samochodowy-backend/routes/cars.js:GET /\` |
| **Priorytet** | P2 – Wysokie |
| **Nakład naprawy** | M |
| **Sprint** | 2 |

**Opis:**  
Brak paginacji powoduje wzrost czasu odpowiedzi liniowo z liczbą samochodów. Przy 1000+ rekordach czas odpowiedzi przekracza 2 sekundy.

**Naprawa:** dodać \`limit\`/\`offset\` z wartościami domyślnymi.

---

## DEBT-007 – Memory leak w combineLatest (frontend)

| Pole | Wartość |
|------|---------|
| **ID** | DEBT-007 |
| **Tytuł** | Niezamknięta subskrypcja combineLatest |
| **Lokalizacja** | \`salon-samochodowy-frontend/src/app/components/*.component.ts\` |
| **Priorytet** | P2 – Wysokie |
| **Nakład naprawy** | M |
| **Sprint** | 3 |

**Opis:**  
Użycie \`combineLatest\` bez \`takeUntil\` lub \`takeUntilDestroyed\` powoduje wyciek pamięci – subskrypcja żyje po zniszczeniu komponentu.

**Naprawa:**
\`\`\`typescript
// Przed (leak):
combineLatest([this.cars$, this.filters$]).subscribe(...)

// Po (bezpiecznie):
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
combineLatest([this.cars$, this.filters$])
  .pipe(takeUntilDestroyed(this.destroyRef))
  .subscribe(...)
\`\`\`

---

## DEBT-008 – alert() w kodzie produkcyjnym

| Pole | Wartość |
|------|---------|
| **ID** | DEBT-008 |
| **Tytuł** | Użycie alert() do komunikatów dla użytkownika |
| **Lokalizacja** | \`salon-samochodowy-frontend/src/app/\` (wiele plików) |
| **Priorytet** | P2 – Wysokie |
| **Nakład naprawy** | M |
| **Sprint** | 3 |

**Opis:**  
\`alert()\` blokuje wątek UI, nie daje się stylizować, nie działa w headless mode testów Playwright i daje złe wrażenia użytkownika.

**Naprawa:** Zastąpić MatSnackBar lub dedykowanym serwisem NotificationService.

---

## DEBT-009 – Brak typowania TypeScript

| Pole | Wartość |
|------|---------|
| **ID** | DEBT-009 |
| **Tytuł** | Typ \`any\` używany powszechnie we frontendzie |
| **Lokalizacja** | \`salon-samochodowy-frontend/src/app/services/\` |
| **Priorytet** | P3 – Średnie |
| **Nakład naprawy** | L |
| **Sprint** | 3 |

**Opis:**  
Liczne użycia \`any\` eliminują korzyści z TypeScript i utrudniają refaktoryzację.

**Naprawa:** Zdefiniować interfejsy dla Car, User, Transaction, ApiResponse<T>.

---

## DEBT-010 – Brak walidacji input backendowej

| Pole | Wartość |
|------|---------|
| **ID** | DEBT-010 |
| **Tytuł** | Brak walidacji i sanityzacji danych wejściowych |
| **Lokalizacja** | \`salon-samochodowy-backend/routes/\` (wszystkie trasy) |
| **Priorytet** | P1 – Krytyczne |
| **Nakład naprawy** | L |
| **Sprint** | 1 |

**Opis:**  
Dane od użytkownika nie są walidowane przed zapisem do bazy. Potencjalne XSS stored, SQL injection, invalid data.

**Naprawa:**
\`\`\`javascript
const { body, validationResult } = require('express-validator');

router.post('/cars', [
  body('brand').trim().notEmpty().isLength({ max: 100 }),
  body('price').isFloat({ min: 0 }),
  body('year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  // ...
});
\`\`\`

---

## DEBT-011 – Brak obsługi błędów w async/await

| Pole | Wartość |
|------|---------|
| **ID** | DEBT-011 |
| **Tytuł** | Handlery trasy bez try/catch |
| **Lokalizacja** | \`salon-samochodowy-backend/routes/\` |
| **Priorytet** | P2 – Wysokie |
| **Nakład naprawy** | M |
| **Sprint** | 2 |

**Opis:**  
Wiele tras używa \`async/await\` bez \`try/catch\`, co powoduje nieobsłużone odrzucenia Promise i crash serwera.

**Naprawa:**
\`\`\`javascript
// Wrapper do obsługi błędów async
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.get('/:id', asyncHandler(async (req, res) => {
  const car = await Car.findByPk(req.params.id);
  if (!car) return res.status(404).json({ error: 'Nie znaleziono samochodu' });
  res.json(car);
}));
\`\`\`

---

## DEBT-012 – Brak loggingu

| Pole | Wartość |
|------|---------|
| **ID** | DEBT-012 |
| **Tytuł** | Brak strukturalnego logowania zdarzeń |
| **Lokalizacja** | \`salon-samochodowy-backend/app.js\` |
| **Priorytet** | P3 – Średnie |
| **Nakład naprawy** | M |
| **Sprint** | 2 |

**Opis:**  
Jedyne logi to \`console.log\` bez poziomu, kontekstu ani struktury. Utrudnia monitoring i debugging produkcyjny.

**Naprawa:** Wdrożyć Winston z formatem JSON.

---

## DEBT-013 – Brak zmiennych środowiskowych

| Pole | Wartość |
|------|---------|
| **ID** | DEBT-013 |
| **Tytuł** | Hardkodowane wartości konfiguracyjne |
| **Lokalizacja** | \`salon-samochodowy-backend/\` |
| **Priorytet** | P2 – Wysokie |
| **Nakład naprawy** | M |
| **Sprint** | 0 |

**Opis:**  
Porty, klucze sekretne sesji, URL bazy danych są hardkodowane w kodzie zamiast pobierane ze zmiennych środowiskowych.

**Naprawa:** Stworzyć \`.env\` + \`.env.example\`, używać \`process.env\` z wartościami domyślnymi.

---

## DEBT-014 – Literówka brandserch

| Pole | Wartość |
|------|---------|
| **ID** | DEBT-014 |
| **Tytuł** | Literówka w nazwie zmiennej/właściwości |
| **Lokalizacja** | \`salon-samochodowy-frontend/src/app/\` |
| **Priorytet** | P3 – Średnie |
| **Nakład naprawy** | S |
| **Sprint** | 3 |

**Opis:**  
Zmienna \`brandserch\` (zamiast \`brandSearch\`) utrudnia czytanie kodu i może powodować błędy.

---

## DEBT-015 – Brak wersjonowania API

| Pole | Wartość |
|------|---------|
| **ID** | DEBT-015 |
| **Tytuł** | Endpointy bez prefiksu wersji |
| **Lokalizacja** | \`salon-samochodowy-backend/routes/\` |
| **Priorytet** | P3 – Średnie |
| **Nakład naprawy** | M |
| **Sprint** | 2 |

**Opis:**  
Brak wersjonowania \`/api/v1/\` uniemożliwia bezpieczne wprowadzanie zmian breaking w API bez zrywania istniejących integracji.

---

## Podsumowanie rejestru

| Priorytet | Liczba | Łączny nakład |
|-----------|--------|---------------|
| P1 – Krytyczne | 4 | ~3 dni |
| P2 – Wysokie | 7 | ~5 dni |
| P3 – Średnie | 4 | ~2 dni |
| **ŁĄCZNIE** | **15** | **~10 dni** |

**Reguła:** Wszystkie P1 muszą być naprawione przed pierwszym deploymentem produkcyjnym.

---

*Rejestr długu technicznego – Salon Samochodowy AiTSI | Wersja 1.0 | 2025*
`, 'utf8');

// ─────────────────────────────────────────────────────────────────────────────
// FILE 4: definition-of-done.md
// ─────────────────────────────────────────────────────────────────────────────
fs.writeFileSync(path.join(BASE, 'definition-of-done.md'), `# Definition of Done – Salon Samochodowy

> Każdy element backlogu musi spełniać WSZYSTKIE kryteria DoD na odpowiednim poziomie, zanim zostanie oznaczony jako "Done".

---

## 1. User Story DoD

### ✅ Kod

- [ ] Kod zaimplementowany zgodnie z wymaganiami US
- [ ] Brak ostrzeżeń ESLint/TSLint na poziomie error
- [ ] Brak komentarzy \`// TODO\`, \`// FIXME\`, \`// HACK\` w nowym kodzie
- [ ] Kod sformatowany (Prettier/ESLint --fix)
- [ ] Brak \`console.log\` w kodzie produkcyjnym
- [ ] Brak \`any\` w TypeScript (lub uzasadniony wyjątek)
- [ ] Brak \`alert()\`, \`confirm()\`, \`prompt()\`

### ✅ Testy

- [ ] Testy jednostkowe napisane dla nowej logiki (min. pokrycie 80%)
- [ ] Wszystkie istniejące testy przechodzą (brak regresji)
- [ ] Test E2E Playwright napisany dla nowej ścieżki użytkownika (jeśli dotyczy UI)
- [ ] Testy zreviewowane przez co najmniej 1 inną osobę

### ✅ Code Review

- [ ] Pull Request otwarte na branch \`develop\`
- [ ] Co najmniej 1 zatwierdzenie (approval) od reviewera
- [ ] Wszystkie komentarze review zaadresowane lub wyjaśnione
- [ ] Brak konfliktów merge

### ✅ Dokumentacja

- [ ] Docstring/komentarze dla publicznych API (serwisy, usługi)
- [ ] README zaktualizowany jeśli zmieniono konfigurację
- [ ] OpenAPI spec zaktualizowany dla nowych/zmienionych endpointów

---

## 2. Feature DoD

Funkcjonalność (feature) = grupa User Stories tworzących spójną całość.

### ✅ Jakość kodu

- [ ] Wszystkie US składowe mają status "Done" (User Story DoD spełnione)
- [ ] \`npm run lint\` bez błędów (frontend i backend)
- [ ] \`npm run build\` bez błędów
- [ ] \`npm audit\` bez critical/high vulnerabilities

### ✅ Testy funkcjonalności

- [ ] Testy jednostkowe: branch coverage ≥80% dla modułów funkcjonalności
- [ ] Testy integracyjne: kluczowe przepływy przetestowane z Supertest
- [ ] Testy E2E: happy path + 2-3 edge cases w Playwright
- [ ] Testy działają w CI pipeline

### ✅ Dokumentacja techniczna

- [ ] OpenAPI (Swagger) spec zaktualizowany dla wszystkich endpointów
- [ ] Przykłady żądań/odpowiedzi w Swagger UI
- [ ] Migracje DB napisane i przetestowane (jeśli zmiana modelu)
- [ ] CHANGELOG.md zaktualizowany

### ✅ Wydajność

- [ ] Endpoint odpowiada w < 500ms dla typowego obciążenia (walidacja Postmanem)
- [ ] Brak N+1 queries w Sequelize (sprawdzone \`logging: console.log\`)
- [ ] Frontend bundle size nie wzrósł > 10% bez uzasadnienia

---

## 3. Sprint DoD

### ✅ Wszystkie User Stories

- [ ] Wszystkie zaplanowane US w sprincie mają status "Done"
- [ ] US przeniesione do następnego sprintu są udokumentowane z powodem

### ✅ Regresja

- [ ] Pełen zestaw testów Playwright (wszystkie 60+) przechodzi
- [ ] Wszystkie testy Jest przechodzą
- [ ] Brak otwartych P1 (blokujących) bugów

### ✅ Demo

- [ ] Sprint review przeprowadzony z demonstracją działających funkcjonalności
- [ ] Feedback stakeholderów udokumentowany w backlogu

### ✅ Retrospektywa

- [ ] Retrospektywa przeprowadzona
- [ ] Action items z retrospektywy dodane do backlogu następnego sprintu

### ✅ Wydajność i monitorowanie

- [ ] Lighthouse score nie spadł poniżej poprzedniego sprintu
- [ ] Health endpoint \`/api/health\` zwraca 200

---

## 4. Release DoD

### ✅ Bezpieczeństwo

- [ ] \`npm audit\` bez critical/high vulnerabilities (frontend i backend)
- [ ] Skan SAST (np. Semgrep) bez krytycznych wyników
- [ ] Wszystkie secrety w zmiennych środowiskowych (nie w kodzie)
- [ ] Nagłówki bezpieczeństwa HTTP skonfigurowane (Helmet.js)
- [ ] HTTPS skonfigurowane w środowisku produkcyjnym
- [ ] Rate limiting aktywny

### ✅ Testy

- [ ] 100% testów Playwright zielonych
- [ ] 100% testów Jest zielonych
- [ ] Branch coverage backend ≥80%
- [ ] Line coverage frontend ≥80%
- [ ] Load test: 100 concurrent users, p95 < 500ms

### ✅ Dokumentacja

- [ ] README.md aktualny (instalacja, uruchomienie, testy, deployment)
- [ ] OpenAPI spec kompletna dla wszystkich endpointów v1
- [ ] Runbook operacyjny (deployment, rollback, monitoring)
- [ ] CHANGELOG.md zaktualizowany z wszystkimi zmianami

### ✅ Infrastruktura

- [ ] Docker images buildują się bez błędów
- [ ] docker-compose up działa end-to-end
- [ ] CI/CD pipeline zielony na \`main\`
- [ ] Backup bazy danych skonfigurowany

### ✅ Akceptacja

- [ ] Sign-off Dewelopera (kod ukończony)
- [ ] Sign-off QA (wszystkie testy zielone)
- [ ] Sign-off Product Ownera (wymagania spełnione)

---

## Checklista dewelopera (przed PR)

\`\`\`markdown
## Checklist dewelopera

### Kod
- [ ] Zaimplementowałem wszystkie kryteria akceptacji US
- [ ] Napisałem testy jednostkowe (pokrycie ≥80%)
- [ ] ESLint bez błędów (\`npm run lint\`)
- [ ] Build bez błędów (\`npm run build\`)
- [ ] Brak \`console.log\`, \`alert()\`, TODO w nowym kodzie
- [ ] Brak \`any\` w TypeScript

### Testy
- [ ] \`npm test\` przechodzi lokalnie
- [ ] Nowe testy są zrozumiałe i dokumentują intencję
- [ ] Edge cases pokryte (null, puste, błędne typy)

### Dokumentacja
- [ ] PR description wyjaśnia co i dlaczego
- [ ] OpenAPI zaktualizowany (jeśli nowy endpoint)
- [ ] README zaktualizowany (jeśli zmiana konfiguracji)
\`\`\`

---

## Checklista reviewera

\`\`\`markdown
## Checklist reviewera

### Poprawność
- [ ] Implementacja spełnia kryteria akceptacji US
- [ ] Logika biznesowa jest poprawna
- [ ] Edge cases obsłużone

### Bezpieczeństwo
- [ ] Brak nowych wrażliwych danych w kodzie
- [ ] Walidacja wejścia obecna
- [ ] Autoryzacja sprawdzona

### Jakość
- [ ] Kod czytelny i utrzymywalny
- [ ] Brak duplikacji (DRY)
- [ ] Nazwy zmiennych i funkcji znaczące
- [ ] Testy sensowne i testują właściwe rzeczy

### Wydajność
- [ ] Brak oczywistych problemów N+1
- [ ] Zapytania DB efektywne
\`\`\`

---

## Checklista QA

\`\`\`markdown
## Checklist QA

### Testy funkcjonalne
- [ ] Happy path przetestowany
- [ ] Scenariusze błędów przetestowane
- [ ] Testy regresji uruchomione i zielone

### Testy niefunkcjonalne
- [ ] Wydajność akceptowalna (< 500ms p95)
- [ ] Responsywność UI na mobile/tablet/desktop
- [ ] Dostępność: nawigacja klawiaturą działa

### Playwright
- [ ] Testy E2E uruchomione w trybie headless
- [ ] Brak flaky tests (uruchom 3x)
- [ ] Screenshots failures zapisane w artefaktach CI
\`\`\`

---

*Definition of Done – Salon Samochodowy AiTSI | Wersja 1.0 | 2025*
`, 'utf8');

console.log('✅ 03-development-plan: 4 pliki utworzone (sprint-plan.md, backlog.md, technical-debt.md, definition-of-done.md)');
