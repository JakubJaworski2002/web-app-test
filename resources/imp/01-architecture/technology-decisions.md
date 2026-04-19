# ADRy — Architecture Decision Records

## ADR-001: Express.js vs NestJS

| | |
|--|--|
| **Status** | Accepted |
| **Data** | 2026-03-29 |

**Kontekst:** Aplikacja wymaga refaktoryzacji backendu. Rozważamy migrację do NestJS.

**Decyzja:** Pozostajemy przy **Express.js 4.x** z warstwową architekturą (routes/controllers/services).

**Uzasadnienie:**
- Aplikacja ma ~500 linii — NestJS to overhead dla tej skali
- Czas migracji > wartość biznesowa
- Warstwowa architektura Express.js wystarczy

**Konsekwencje:** Brak DI frameworka, ręczna organizacja kodu.

---

## ADR-002: Session Auth vs JWT

| | |
|--|--|
| **Status** | Accepted |

**Decyzja:** Pozostajemy przy **express-session** jako primary auth. JWT opcjonalnie w Fazie 5.

**Uzasadnienie:**
- JWT wymaga refresh token logic i przechowywania tokenów
- Session + cookie jest prostszy dla tej skali
- Testy Playwright są już napisane pod session auth

---

## ADR-003: SQLite (dev) + MySQL (prod)

| | |
|--|--|
| **Status** | Accepted |

**Decyzja:** SQLite w development, MySQL w production (już zaimplementowany fallback w db.js).

**Uzasadnienie:**
- Łatwy onboarding (zero konfiguracji DB)
- Sequelize abstrakcja działa na obu
- MySQL w prod dla wydajności i reliability

---

## ADR-004: Angular Signals vs NgRx

| | |
|--|--|
| **Status** | Accepted |

**Decyzja:** Migracja `BehaviorSubject` → **Angular Signals** (Angular 16+). Bez NgRx.

**Uzasadnienie:**
- NgRx to overhead dla tej skali aplikacji
- Signals są wbudowane w Angular, zero dodatkowych zależności
- Prostszy mental model niż Redux

---

## ADR-005: Bootstrap + Angular Material vs Tailwind

| | |
|--|--|
| **Status** | Accepted |

**Decyzja:** Pozostajemy przy **Bootstrap 5 + Angular Material**, dodajemy CSS Custom Properties.

**Uzasadnienie:**
- Tailwind wymaga przepisania całego HTML (za duży refaktor)
- CSS variables dają nowy design bez przepisywania
- Angular Material już w projekcie (MatExpansionModule)

---

## ADR-006: Jest vs Vitest

| | |
|--|--|
| **Status** | Accepted |

**Decyzja:** Pozostajemy przy **Jest + Supertest** dla backendu (już skonfigurowany).

**Uzasadnienie:** Działa, skonfigurowany, nie zmieniamy bez wyraźnej potrzeby.

---

## ADR-007: Docker + GitHub Actions

| | |
|--|--|
| **Status** | Accepted |

**Decyzja:** **Docker Compose** dla lokalnego dev + staging, **GitHub Actions** dla CI/CD.

**Uzasadnienie:**
- Standard branżowy
- Bezpłatne dla repozytoriów na GitHub
- Portability między środowiskami

---

## Szczegółowe ADR — Pełne Zapisy

---

### ADR-001: Express.js vs NestJS — Pełne Uzasadnienie

**ID:** ADR-001  
**Tytuł:** Utrzymanie Express.js vs migracja do NestJS  
**Data:** 2025-01-01  
**Status:** Zaakceptowany  
**Autorzy:** IT Architect, Tech Lead  

#### Kontekst

Backend aplikacji Salon Samochodowy zbudowany jest na Express.js 4.21 w architekturze monolitycznej (jeden plik `server.js` ~500 linii). W związku z planowaną refaktoryzacją pojawiło się pytanie: czy warto migrować do NestJS — frameworka opartego na dekoratorach, DI i modularności?

#### Decyzja

**Pozostajemy przy Express.js 4.x** z wdrożeniem warstwowej architektury (routes/controllers/services/middleware).

#### Szczegółowe Uzasadnienie

**Za Express.js:**
- Aplikacja jest mała (~500 linii BE) — koszt migracji do NestJS > korzyść
- Cały zespół zna Express.js; NestJS wymagałby 2-4 tygodnie szkoleń
- Istniejące testy (Jest, Supertest) działają z Express.js natywnie
- Warstwowa architektura Express.js daje podobne benefity jak NestJS bez overhead
- Mniejsza liczba zależności = mniejsza powierzchnia ataku

**Przeciw NestJS:**
- Overhead startowy (boilerplate, dekoratory, moduły) nieuzasadniony dla tej skali
- Migracja ryzykuje regresje i wymaga aktualizacji wszystkich testów
- TypeScript wymagany dla NestJS — dodatkowa zmiana nie objęta zakresem
- Czas migracji szacowany: 3-4 tygodnie (Faza 2 ma tylko 4 tygodnie)

#### Konsekwencje

**Pozytywne:**
- Zachowanie wiedzy zespołu i istniejących testów
- Szybsza implementacja czystej architektury
- Mniejsze ryzyko regresji

**Negatywne:**
- Brak wbudowanego DI (dependency injection) — ręczna organizacja
- Brak wbudowanej dokumentacji Swagger (wymaga `swagger-jsdoc`)
- Przy wzroście projektu > 5000 linii BE — warto ponownie ocenić

#### Alternatywy Rozważone

| Alternatywa | Zalety | Wady | Decyzja |
|-------------|--------|------|---------|
| **NestJS** | DI, dekoratory, Swagger built-in | Overhead, migracja, TypeScript wymagany | Odrzucone |
| **Fastify** | Szybszy od Express, TypeScript first | Migracja wszystkich middleware | Odrzucone |
| **Hapi.js** | Enterprise-grade, wbudowana auth | Rzadziej używany, mały ekosystem | Odrzucone |
| **Express.js + Clean Arch** | Znany, minimalna migracja | Brak DI | **WYBRANE** |

#### Powiązane ADR: ADR-006 (Jest vs Vitest)

---

### ADR-002: Autoryzacja Session vs JWT — Pełne Uzasadnienie

**ID:** ADR-002  
**Tytuł:** Session-based Auth (connect.sid) vs JWT Tokens  
**Data:** 2025-01-01  
**Status:** Zaakceptowany (JWT jako opcja w Fazie 5)  

#### Kontekst

Aplikacja używa `express-session` z ciasteczkiem `connect.sid` do zarządzania sesją. JWT jest alternatywą oferującą stateless auth. Pytanie: czy migrować na JWT?

#### Decyzja

**Utrzymujemy express-session** jako podstawowy mechanizm autentykacji. JWT jest rozważany jako opcja w Fazie 5 dla API integracji zewnętrznych.

#### Szczegółowe Uzasadnienie

**Za Session:**
- Prosta implementacja — jedna zmiana (dodanie SESSION_SECRET do env) i działa
- Łatwa inwalidacja sesji po stronie serwera (logout faktycznie wylogowuje)
- Testy Playwright są już napisane pod session auth (cookies)
- SameSite=Strict cookie zapobiega CSRF

**Przeciw JWT:**
- Wymaga implementacji refresh token logic (dodatkowa złożoność)
- Wymaga bezpiecznego przechowywania tokenów (localStorage = XSS risk, httpOnly cookie = jak sesja)
- Logout nie inwaliduje tokenu (dopóki nie upłynie expiry) — problem bezpieczeństwa
- Wymaga weryfikacji tokenu przy każdym żądaniu (CPU overhead)

#### Konsekwencje

**Pozytywne:**
- Prosta implementacja, minimalne zmiany
- Natychmiastowy logout działa poprawnie

**Negatywne:**
- Sesje przechowywane serwerowo — przy skalowaniu wymaga session store (Redis)
- Brak wsparcia dla zewnętrznych klientów API

#### Alternatywy

| Alternatywa | Zalety | Wady | Decyzja |
|-------------|--------|------|---------|
| **Session Only** | Prostota, natychmiastowy logout | Server-side state, Redis przy scale | **WYBRANE (teraz)** |
| **JWT Only** | Stateless, microservices-ready | Logout problem, refresh complexity | Odrzucone |
| **Session + JWT** | Best of both worlds | Większa złożoność | Faza 5 opcjonalnie |
| **OAuth2 / OIDC** | Standard enterprise | Zbyt złożone dla tej skali | Odrzucone |

#### Powiązane ADR: ADR-001 (Express.js), ADR-007 (Docker)

---

### ADR-003: Baza Danych — SQLite vs MySQL vs PostgreSQL

**ID:** ADR-003  
**Tytuł:** Strategia bazy danych dla środowisk dev i prod  
**Data:** 2025-01-01  
**Status:** Zaakceptowany  

#### Kontekst

Aplikacja używa SQLite w trybie deweloperskim z fallback do MySQL w produkcji (skonfigurowane w `db.js`). Pytanie: jaka strategia DB dla produkcji? SQLite jako prod? MySQL? PostgreSQL?

#### Decyzja

**SQLite (dev/test) + MySQL 8.0 (prod)**. PostgreSQL 16 jako alternatywa jeśli wymagane zaawansowane funkcje.

#### Szczegółowe Uzasadnienie

**SQLite w dev — dlaczego tak:**
- Zero konfiguracji — plik `.sqlite` w projekcie
- Natychmiastowy onboarding nowych deweloperów
- Sequelize abstrakcja minimalizuje różnice z MySQL
- Testy CI używają SQLite in-memory (szybkie)

**MySQL 8.0 w prod — dlaczego tak:**
- Już skonfigurowany w `db.js` jako fallback
- Lepsza wydajność przy współbieżnych zapytaniach
- Full foreign key enforcement (SQLite FK wyłączone domyślnie)
- CHECK constraints (MySQL 8.0.16+)
- Lepsze narzędzia monitoringu (slow query log, performance_schema)

**Dlaczego nie PostgreSQL teraz:**
- MySQL już skonfigurowany — zmiana wymaga aktualizacji Sequelize dialektu
- PostgreSQL silniejszy przy JSON/arrays — niezastosowane w tym projekcie
- Zespół zna MySQL bardziej niż PostgreSQL

#### Konsekwencje

**Pozytywne:** Prosta ścieżka do produkcji (MySQL już skonfigurowany)  
**Negatywne:** Drobne różnice składni SQLite/MySQL mogą powodować niespodzianki (np. BOOLEAN jako TINYINT w MySQL)

#### Plan Migracji SQLite → MySQL

```bash
# 1. Eksport danych z SQLite
sqlite3 salon.db ".dump" > dump.sql

# 2. Konwersja składni (sed/awk)
sed -i 's/INTEGER PRIMARY KEY AUTOINCREMENT/INT PRIMARY KEY AUTO_INCREMENT/g' dump.sql
sed -i 's/TINYINT(1)/BOOLEAN/g' dump.sql

# 3. Import do MySQL
mysql -u salon_user -p salon_db < dump.sql
```

#### Powiązane ADR: ADR-007 (Docker — MySQL w docker-compose)

---

### ADR-004: Angular Signals vs NgRx — Pełne Uzasadnienie

**ID:** ADR-004  
**Tytuł:** Stan aplikacji Angular — Signals vs NgRx  
**Data:** 2025-01-01  
**Status:** Zaakceptowany  

#### Kontekst

Frontend używa `BehaviorSubject` z RxJS do zarządzania stanem (serwisy Angular). Dwie opcje modernizacji: Angular Signals (Angular 16+) lub NgRx Store (Redux pattern).

#### Decyzja

**Migracja BehaviorSubject → Angular Signals**. NgRx nie jest wprowadzany.

#### Szczegółowe Uzasadnienie

**Za Angular Signals:**
- Wbudowane w Angular 16+ — zero dodatkowych zależności
- Prostszy mental model niż Redux (get/set/computed)
- Lepsza wydajność: fine-grained reactivity, mniej re-renderów
- Pełna kompatybilność z `OnPush` change detection
- Angular team rekomenduje Signals jako przyszłość frameworka
- `resource()` API dla async HTTP calls (Angular 17+)

**Przeciw NgRx:**
- Duże boilerplate dla małej aplikacji (actions, reducers, effects, selectors)
- Stroma krzywa uczenia się (Redux DevTools, immer)
- NgRx sens przy > 5 developerów i złożonym stanie globalnym
- Dodatkowa zależność do utrzymania

#### Przykład Migracji

```typescript
// PRZED (BehaviorSubject)
@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  
  setUser(user: User | null) {
    this.currentUserSubject.next(user);
  }
}

// PO (Angular Signals)
@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private _currentUser = signal<User | null>(null);
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);
  readonly isDealer = computed(() => this._currentUser()?.isDealer ?? false);
  
  setUser(user: User | null) {
    this._currentUser.set(user);
  }
}
```

#### Konsekwencje

**Pozytywne:** Mniej kodu, lepsza wydajność, przyszłościowe rozwiązanie  
**Negatywne:** Zespół musi się nauczyć Signals (2-3 dni); brak Redux DevTools

#### Powiązane ADR: ADR-005 (Bootstrap/Tailwind), ADR-001 (Express.js)

---

### ADR-005: CSS Framework — Bootstrap vs Tailwind vs Angular Material

**ID:** ADR-005  
**Tytuł:** Utrzymanie Bootstrap + Angular Material vs migracja na Tailwind CSS  
**Data:** 2025-01-01  
**Status:** Zaakceptowany  

#### Kontekst

Frontend używa kombinacji Bootstrap 5 i Angular Material. Tailwind CSS jest popularną alternatywą. Pytanie: standaryzować na jednym frameworku, czy utrzymać obecny miks?

#### Decyzja

**Utrzymujemy Bootstrap 5 + Angular Material** z dodaniem CSS Custom Properties (design tokens) dla spójności wizualnej. Tailwind nie jest wprowadzany.

#### Szczegółowe Uzasadnienie

**Za utrzymaniem Bootstrap + AM:**
- Bootstrap 5 używany dla layoutu/gridu — sprawdzony, znany
- Angular Material dla komponentów interaktywnych (Expansion, SnackBar, Dialog)
- Tailwind wymagałby przepisania KAŻDEGO elementu HTML — za duży scope
- CSS Custom Properties dają "design system" bez migracji

**Za Tailwind (odrzucone):**
- Mniejszy bundle (tree shaking)
- Utility-first — szybkie prototypowanie
- Jednolity framework bez mieszania

**Dlaczego odrzucono Tailwind:**
- Migracja: ~2000 linii HTML do przepisania
- Zespół nie zna Tailwind — szkolenie 2-3 dni
- Bootstrap Grid i AM Komponenty pokrywają wszystkie potrzeby projektu

#### Implementacja Design System

```scss
/* styles/design-tokens.css */
:root {
  /* Kolory */
  --color-primary:    #1976d2;
  --color-secondary:  #424242;
  --color-success:    #388e3c;
  --color-warning:    #f57c00;
  --color-danger:     #d32f2f;
  --color-background: #f5f5f5;
  --color-surface:    #ffffff;
  
  /* Typografia */
  --font-family:      'Roboto', sans-serif;
  --font-size-base:   16px;
  --font-size-h1:     2rem;
  --font-size-h2:     1.5rem;
  
  /* Spacing */
  --spacing-xs:   4px;
  --spacing-sm:   8px;
  --spacing-md:   16px;
  --spacing-lg:   24px;
  --spacing-xl:   48px;
  
  /* Shadows */
  --shadow-card:  0 2px 8px rgba(0,0,0,0.1);
  --shadow-modal: 0 8px 32px rgba(0,0,0,0.2);
  
  /* Border radius */
  --radius-sm:    4px;
  --radius-md:    8px;
  --radius-lg:    16px;
}
```

#### Powiązane ADR: ADR-004 (Angular Signals)

---

### ADR-006: Jest vs Vitest — Testy Jednostkowe Backend

**ID:** ADR-006  
**Tytuł:** Utrzymanie Jest vs migracja na Vitest  
**Data:** 2025-01-01  
**Status:** Zaakceptowany  

#### Kontekst

Backend ma już skonfigurowany Jest + Supertest dla testów. Vitest jest nowszą alternatywą opartą na Vite, z lepszą wydajnością. Pytanie: migrować?

#### Decyzja

**Utrzymujemy Jest + Supertest** dla backendu. Vitest nie jest wprowadzany.

#### Szczegółowe Uzasadnienie

**Za Jest:**
- Już skonfigurowany (`jest.config.js`, `--coverage`, scripts w `package.json`)
- Całkowita ekosystem znany zespołowi (mockowanie, spies, snapshots)
- Supertest działa natywnie z Express.js + Jest
- Zmiana bez wyraźnej potrzeby wydajnościowej jest nieuzasadniona

**Za Vitest (odrzucone):**
- 2-10x szybszy niż Jest (dla dużych suitów)
- Kompatybilność z Jest API (łatwa migracja)
- Natywny TypeScript support

**Dlaczego odrzucono Vitest:**
- Prędkość nie jest problemem dla ~100 testów (Jest uruchamia się w < 30s)
- Migracja wymagałaby aktualizacji konfiguracji i weryfikacji wszystkich testów
- Zasada: nie zmieniaj działającego narzędzia bez wyraźnej korzyści

#### Zasada Testu dla Backendu

```javascript
// Przykład testu integracyjnego — auth.test.js
const request = require('supertest');
const app     = require('../server');

describe('POST /api/v1/login', () => {
  test('Logowanie prawidłowymi danymi zwraca 200 i cookie', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: 'admin', password: 'Admin1!' });
    
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Logowanie udane');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  test('Logowanie błędnym hasłem zwraca 400', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: 'admin', password: 'wrong' });
    
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});
```

#### Powiązane ADR: ADR-001 (Express.js)

---

### ADR-007: Docker — Single Dockerfile vs docker-compose

**ID:** ADR-007  
**Tytuł:** Strategia konteneryzacji — Docker Compose dla dev, multi-stage Dockerfile dla prod  
**Data:** 2025-01-01  
**Status:** Zaakceptowany  

#### Kontekst

Aplikacja nie ma żadnej konteneryzacji. Potrzebna decyzja: jak konteneryzować frontend (Angular SSR) i backend (Express.js) oraz bazę danych dla środowisk dev i prod?

#### Decyzja

**Docker Compose** dla lokalnego dev i staging. **Multi-stage Dockerfile** dla każdego serwisu w produkcji. GitHub Actions używa docker-compose do budowania i testowania.

#### Struktura Docker

**docker-compose.yml (dev):**
```yaml
version: '3.9'

services:
  frontend:
    build:
      context: ./salon-samochodowy-frontend
      target: development
    ports:
      - "4200:4200"
    volumes:
      - ./salon-samochodowy-frontend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development

  backend:
    build:
      context: ./salon-samochodowy-backend
      target: development
    ports:
      - "3000:3000"
    volumes:
      - ./salon-samochodowy-backend:/app
      - /app/node_modules
      - ./data:/app/data  # SQLite persistence
    environment:
      - NODE_ENV=development
      - SESSION_SECRET=${SESSION_SECRET}
      - ALLOWED_ORIGINS=http://localhost:4200
    depends_on:
      - db

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASS}
      MYSQL_DATABASE:      salon_db
      MYSQL_USER:          salon_user
      MYSQL_PASSWORD:      ${DB_PASS}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10

volumes:
  mysql_data:
```

**Dockerfile backend (multi-stage):**
```dockerfile
# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

# Stage 2: Production
FROM node:20-alpine AS production
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --chown=appuser:appgroup . .
USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "server.js"]
```

#### Konsekwencje

**Pozytywne:**
- Spójne środowiska (dev = staging = prod)
- `docker-compose up` uruchamia cały stack jedną komendą
- Multi-stage minimalizuje rozmiar obrazu produkcyjnego

**Negatywne:**
- Docker Desktop wymagany na maszynach deweloperskich (Windows WSL2)
- Pierwsze uruchomienie wolne (budowanie obrazów)
- Dodatkowa warstwa abstrakcji przy debugowaniu

#### GitHub Actions CI z Docker

```yaml
# .github/workflows/ci.yml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run tests in Docker
        run: |
          docker-compose -f docker-compose.test.yml up \
            --build --abort-on-container-exit --exit-code-from backend-test
```

#### Powiązane ADR: ADR-003 (MySQL), ADR-002 (Session Auth — Redis w przyszłości)

---

## Podsumowanie Wszystkich ADR

| ID | Tytuł | Status | Data | Kluczowa Decyzja |
|----|-------|--------|------|-----------------|
| ADR-001 | Express.js vs NestJS | ✅ Zaakceptowany | 2025-01-01 | Utrzymanie Express.js + Clean Architecture |
| ADR-002 | Session vs JWT | ✅ Zaakceptowany | 2025-01-01 | express-session (JWT w Fazie 5 opcjonalnie) |
| ADR-003 | SQLite vs MySQL vs PostgreSQL | ✅ Zaakceptowany | 2025-01-01 | SQLite (dev) + MySQL 8.0 (prod) |
| ADR-004 | Signals vs NgRx | ✅ Zaakceptowany | 2025-01-01 | Angular Signals (migracja z BehaviorSubject) |
| ADR-005 | Bootstrap vs Tailwind vs AM | ✅ Zaakceptowany | 2025-01-01 | Bootstrap + AM + CSS Custom Properties |
| ADR-006 | Jest vs Vitest | ✅ Zaakceptowany | 2025-01-01 | Utrzymanie Jest + Supertest |
| ADR-007 | Docker Strategy | ✅ Zaakceptowany | 2025-01-01 | docker-compose (dev) + multi-stage Dockerfile (prod) |

---

*Architecture Decision Records — wersja 1.0 — styczeń 2025*  
*Autor: IT Architect | Zatwierdził: Project Owner*  
*Procedura zmian: Nowe ADR przez Pull Request z dyskusją minimum 48h*
