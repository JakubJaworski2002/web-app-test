'use strict';
const fs = require('fs');
const path = require('path');
const BASE = path.join(__dirname, '11-skills');
fs.mkdirSync(BASE, { recursive: true });

// ─────────────────────────────────────────────────────────────────────────────
// FILE 8: backend-skills.md
// ─────────────────────────────────────────────────────────────────────────────
fs.writeFileSync(path.join(BASE, 'backend-skills.md'), `# Przewodnik Backendowy – Node.js/Express – Salon Samochodowy

> Praktyczny przewodnik dla deweloperów backendowych pracujących przy projekcie.

---

## 1. Architektura Express.js – najlepsze praktyki

### Struktura katalogów

\`\`\`
salon-samochodowy-backend/
├── src/
│   ├── app.js              ← konfiguracja Express
│   ├── server.js           ← start HTTP
│   ├── config/
│   │   ├── database.js     ← Sequelize connection
│   │   ├── cors.js         ← CORS options
│   │   └── validate.js     ← env validation
│   ├── middleware/
│   │   ├── auth.js         ← session/JWT weryfikacja
│   │   ├── rbac.js         ← role-based access
│   │   ├── rateLimiter.js  ← express-rate-limit
│   │   ├── errorHandler.js ← global error handler
│   │   └── asyncHandler.js ← wrapper async/await
│   ├── models/
│   │   ├── index.js        ← Sequelize setup
│   │   ├── User.js
│   │   ├── Car.js
│   │   └── Transaction.js
│   ├── routes/
│   │   ├── index.js        ← /api/v1 router
│   │   ├── auth.js
│   │   ├── cars.js
│   │   └── transactions.js
│   ├── services/
│   │   ├── authService.js  ← logika biznesowa auth
│   │   └── carService.js   ← logika samochodów
│   └── utils/
│       ├── logger.js       ← Winston
│       └── pagination.js   ← helper paginacji
├── tests/
│   ├── unit/
│   └── integration/
└── scripts/
    └── migrate-passwords.js
\`\`\`

### Wzorzec Middleware Chain

\`\`\`javascript
// src/app.js
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const session = require('express-session');

const validateConfig = require('./config/validate');
const corsOptions = require('./config/cors');
const { generalLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const apiV1Router = require('./routes');

validateConfig();  // waliduj zmienne środowiskowe przy starcie

const app = express();

// Bezpieczeństwo
app.use(helmet());
app.use(cors(corsOptions));

// Parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Sesja
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000  // 24h
  }
}));

// Rate limiting
app.use('/api/', generalLimiter);

// Trasy
app.use('/api/v1', apiV1Router);

// Health check (przed error handlerem)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Globalny handler błędów (MUSI być ostatni)
app.use(errorHandler);

module.exports = app;
\`\`\`

---

## 2. Sequelize ORM – wzorce

### Definiowanie modelu

\`\`\`javascript
// src/models/Car.js
const { DataTypes, Model } = require('sequelize');

class Car extends Model {
  // Metody instancji
  get isAvailable() {
    return !this.isSold && this.isAvailableForRent;
  }

  // Metody statyczne (scope)
  static available() {
    return this.scope('available');
  }
}

Car.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  brand: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Marka nie może być pusta' },
      len: { args: [1, 100], msg: 'Marka max 100 znaków' }
    }
  },
  model: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'Cena musi być dodatnia' }
    }
  },
  isSold: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  isAvailableForRent: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Car',
  tableName: 'cars',
  timestamps: true,
  scopes: {
    available: { where: { isSold: false } },
    forRent:   { where: { isAvailableForRent: true, isSold: false } }
  },
  indexes: [
    { fields: ['brand'] },
    { fields: ['price'] },
    { fields: ['isSold'] }
  ]
});
\`\`\`

### Asocjacje

\`\`\`javascript
// src/models/index.js
User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });
Car.hasMany(Transaction,  { foreignKey: 'carId',  as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Transaction.belongsTo(Car,  { foreignKey: 'carId',  as: 'car' });
\`\`\`

### Migracje Sequelize

\`\`\`javascript
// migrations/20250101000001-add-isSold-to-cars.js
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('cars', 'isSold', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });
    await queryInterface.addIndex('cars', ['isSold']);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('cars', 'isSold');
  }
};
\`\`\`

---

## 3. Uwierzytelnianie – wzorzec hybrydowy (sesja + JWT)

\`\`\`javascript
// src/middleware/auth.js
const jwt = require('jsonwebtoken');

async function authenticate(req, res, next) {
  // 1. Sprawdź JWT w nagłówku Authorization
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
      return next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token wygasł', code: 'TOKEN_EXPIRED' });
      }
      return res.status(401).json({ error: 'Nieprawidłowy token' });
    }
  }

  // 2. Fallback: sesja cookie
  if (req.session?.user) {
    req.user = req.session.user;
    return next();
  }

  res.status(401).json({ error: 'Wymagane uwierzytelnienie' });
}

module.exports = { authenticate };
\`\`\`

---

## 4. Bezpieczeństwo – OWASP Top 10 w tym projekcie

| OWASP | Zagrożenie | Mitygacja |
|-------|-----------|-----------|
| A01 | Broken Access Control | RBAC middleware, JWT claims |
| A02 | Cryptographic Failures | bcrypt dla haseł, HTTPS |
| A03 | Injection | Sequelize ORM (parameterized), express-validator |
| A04 | Insecure Design | Validation na wszystkich wejściach |
| A05 | Security Misconfiguration | helmet(), env vars, CORS whitelist |
| A06 | Vulnerable Components | \`npm audit\` w CI |
| A07 | Auth Failures | Rate limiting, session hardening |
| A09 | Logging Failures | Winston structured logging |

---

## 5. Obsługa błędów

\`\`\`javascript
// src/middleware/asyncHandler.js
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// src/middleware/errorHandler.js
const { logger } = require('../utils/logger');

module.exports = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Wewnętrzny błąd serwera';

  logger.error({
    message,
    status,
    url: req.url,
    method: req.method,
    userId: req.user?.userId,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  if (process.env.NODE_ENV === 'production' && status === 500) {
    return res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
  }

  res.status(status).json({ error: message, ...(err.errors && { errors: err.errors }) });
};
\`\`\`

---

## 6. Logowanie z Winston

\`\`\`javascript
// src/utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    process.env.NODE_ENV === 'development'
      ? winston.format.prettyPrint()
      : winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

module.exports = { logger };
\`\`\`

---

## 7. Testowanie z Jest + Supertest

\`\`\`javascript
// tests/integration/auth.test.js
const request = require('supertest');
const app = require('../../src/app');
const { User } = require('../../src/models');

describe('POST /api/v1/auth/login', () => {
  beforeAll(async () => {
    await User.create({
      username: 'testuser',
      email: 'test@test.com',
      password: await bcrypt.hash('Test1234!', 10),
      isDealer: false
    });
  });

  it('loguje użytkownika z poprawnymi danymi', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@test.com', password: 'Test1234!' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('zwraca 401 dla błędnego hasła', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@test.com', password: 'wrong' });

    expect(res.status).toBe(401);
  });

  it('zwraca 422 dla brakujących danych', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({});

    expect(res.status).toBe(422);
    expect(res.body.errors).toBeDefined();
  });
});
\`\`\`

---

*Przewodnik backendowy – Salon Samochodowy AiTSI | Wersja 1.0 | 2025*
`, 'utf8');

// ─────────────────────────────────────────────────────────────────────────────
// FILE 9: frontend-skills.md
// ─────────────────────────────────────────────────────────────────────────────
fs.writeFileSync(path.join(BASE, 'frontend-skills.md'), `# Przewodnik Frontendowy – Angular 19 – Salon Samochodowy

> Praktyczny przewodnik dla deweloperów Angular pracujących przy projekcie.

---

## 1. Standalone Components – wzorzec

Angular 19 używa wyłącznie standalone components (bez NgModules).

\`\`\`typescript
// Nowy komponent standalone
@Component({
  selector: 'app-car-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    CurrencyPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,  // zawsze!
  templateUrl: './car-card.component.html',
  styleUrl: './car-card.component.scss'
})
export class CarCardComponent {
  @Input({ required: true }) car!: Car;
  @Output() buyRequested = new EventEmitter<Car>();
}
\`\`\`

---

## 2. Angular Signals – kompletny przewodnik

Signals to nowy prymityw reaktywności Angular 16+. Zastępują BehaviorSubject i eliminują memory leaks.

### Podstawowe API

\`\`\`typescript
import { signal, computed, effect, inject } from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';

@Component({ standalone: true })
export class CarListComponent {
  // 1. signal() – zapisywalny stan
  searchBrand = signal<string>('');
  currentPage = signal<number>(1);
  isLoading   = signal<boolean>(false);

  // 2. computed() – wyliczany ze signals (lazy, memoized)
  pageTitle = computed(() =>
    this.searchBrand()
      ? \`Wyniki dla: \${this.searchBrand()}\`
      : 'Wszystkie samochody'
  );

  // 3. toSignal() – RxJS Observable → Signal (auto-unsubscribe!)
  private carService = inject(CarService);
  private carsData = toSignal(
    this.carService.getCars(),
    { initialValue: { data: [], pagination: null } }
  );

  cars       = computed(() => this.carsData()?.data ?? []);
  totalCars  = computed(() => this.carsData()?.pagination?.total ?? 0);
  isEmpty    = computed(() => this.cars().length === 0);

  // 4. effect() – reakcja na zmianę signal (analogia useEffect)
  constructor() {
    effect(() => {
      console.log('Zmieniono stronę na:', this.currentPage());
      // efekt uruchomi się za każdym razem gdy currentPage się zmieni
    });
  }

  // Aktualizacja signal
  onBrandSearch(brand: string): void {
    this.searchBrand.set(brand);
    this.currentPage.set(1);  // reset paginacji
  }
}
\`\`\`

### Szablon HTML ze Signals

\`\`\`html
<!-- car-list.component.html -->
<div class="car-list">
  <mat-form-field>
    <input matInput
           placeholder="Szukaj marki..."
           [value]="searchBrand()"
           (input)="onBrandSearch($event.target.value)">
  </mat-form-field>

  <p class="title">{{ pageTitle() }}</p>

  @if (isLoading()) {
    <app-skeleton-loader [count]="6" />
  } @else if (isEmpty()) {
    <app-empty-state message="Brak samochodów spełniających kryteria" />
  } @else {
    <div class="cars-grid">
      @for (car of cars(); track car.id) {
        <app-car-card [car]="car" (buyRequested)="onBuy($event)" />
      }
    </div>
    <mat-paginator
      [length]="totalCars()"
      [pageSize]="20"
      (page)="currentPage.set($event.pageIndex + 1)" />
  }
</div>
\`\`\`

---

## 3. Auth Guard – implementacja

\`\`\`typescript
// src/app/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};

export const dealerGuard: CanActivateFn = (route, state) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }
  if (!auth.isDealer()) {
    return router.createUrlTree(['/unauthorized']);
  }
  return true;
};

// Użycie w routerze:
// { path: 'buy', component: BuyComponent, canActivate: [authGuard] }
// { path: 'dealer', component: DealerComponent, canActivate: [dealerGuard] }
\`\`\`

### AuthService z Signals

\`\`\`typescript
// src/app/services/auth.service.ts
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);

  private _user = signal<User | null>(
    JSON.parse(localStorage.getItem('user') ?? 'null')
  );
  private _token = signal<string | null>(localStorage.getItem('token'));

  user      = this._user.asReadonly();
  isLoggedIn = computed(() => !!this._user() && !!this._token());
  isDealer   = computed(() => !!this._user()?.isDealer);

  login(credentials: LoginDto) {
    return this.http.post<AuthResponse>(
      \`\${environment.apiUrl}/auth/login\`, credentials
    ).pipe(
      tap(response => {
        this._user.set(response.user);
        this._token.set(response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('token', response.token);
      })
    );
  }

  logout() {
    this._user.set(null);
    this._token.set(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
\`\`\`

---

## 4. Reactive Forms + walidacja

\`\`\`typescript
// src/app/components/register/register.component.ts
import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { strongPasswordValidator } from '../../validators/password.validator';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);

  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, strongPasswordValidator]],
    confirm:  ['', Validators.required]
  }, {
    validators: passwordMatchValidator
  });

  // Helper do czytelnych błędów
  getError(field: string): string | null {
    const ctrl = this.form.get(field);
    if (!ctrl?.touched || !ctrl.errors) return null;

    if (ctrl.errors['required'])    return 'To pole jest wymagane';
    if (ctrl.errors['email'])       return 'Nieprawidłowy format email';
    if (ctrl.errors['minlength'])   return \`Min. \${ctrl.errors['minlength'].requiredLength} znaków\`;
    if (ctrl.errors['weakPassword']) {
      const e = ctrl.errors['weakPassword'];
      if (!e.hasMinLength)  return 'Min. 8 znaków';
      if (!e.hasUpperCase)  return 'Wymagana duża litera';
      if (!e.hasNumber)     return 'Wymagana cyfra';
    }
    return 'Nieprawidłowa wartość';
  }
}
\`\`\`

---

## 5. RxJS – unikanie memory leaks

### Problem (stary kod)

\`\`\`typescript
// ❌ ZŁE – subskrypcja nigdy nie jest zamykana
ngOnInit() {
  combineLatest([this.cars$, this.filters$]).subscribe(
    ([cars, filters]) => this.filteredCars = cars.filter(...)
  );
}
\`\`\`

### Rozwiązanie 1: takeUntilDestroyed (Angular 16+)

\`\`\`typescript
// ✅ DOBRE – Angular 16+
import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export class CarListComponent {
  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    combineLatest([this.cars$, this.filters$])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([cars, filters]) => { ... });
  }
}
\`\`\`

### Rozwiązanie 2: toSignal (Angular 17+, preferowane)

\`\`\`typescript
// ✅ NAJLEPSZE – toSignal auto-unsubscribes
filteredCars = toSignal(
  combineLatest([this.cars$, this.filters$]).pipe(
    map(([cars, filters]) => cars.filter(...))
  ),
  { initialValue: [] }
);
\`\`\`

---

## 6. HTTP Interceptor – auth token

\`\`\`typescript
// src/app/interceptors/auth.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth   = inject(AuthService);
  const notify = inject(NotificationService);
  const token  = auth['_token']();  // via signal

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: \`Bearer \${token}\` } })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        auth.logout();
        notify.error('Sesja wygasła. Zaloguj się ponownie.');
      }
      if (err.status === 403) {
        notify.error('Brak uprawnień do wykonania tej operacji.');
      }
      if (err.status >= 500) {
        notify.error('Błąd serwera. Spróbuj ponownie później.');
      }
      return throwError(() => err);
    })
  );
};

// Rejestracja w app.config.ts:
// provideHttpClient(withInterceptors([authInterceptor]))
\`\`\`

---

## 7. Wydajność – OnPush + trackBy

\`\`\`typescript
// OnPush – komponent re-renderuje TYLKO gdy zmieni się Input lub signal
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    @for (car of cars(); track car.id) {
      <app-car-card [car]="car" />
    }
  \`
})
export class CarListComponent {
  cars = input<Car[]>([]);  // input signal (Angular 17.1+)
}
\`\`\`

---

## 8. Unit testing z TestBed

\`\`\`typescript
// src/app/services/auth.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('ustawia użytkownika po logowaniu', () => {
    const mockResponse = {
      token: 'test.jwt.token',
      user: { id: 1, username: 'test', isDealer: false }
    };

    service.login({ email: 'test@test.com', password: 'Test1234!' }).subscribe();

    const req = httpMock.expectOne('/api/v1/auth/login');
    req.flush(mockResponse);

    expect(service.isLoggedIn()).toBe(true);
    expect(service.user()?.username).toBe('test');
  });
});
\`\`\`

---

*Przewodnik frontendowy – Salon Samochodowy AiTSI | Wersja 1.0 | 2025*
`, 'utf8');

// ─────────────────────────────────────────────────────────────────────────────
// FILE 10: playwright-skills.md
// ─────────────────────────────────────────────────────────────────────────────
fs.writeFileSync(path.join(BASE, 'playwright-skills.md'), `# Przewodnik Playwright – Salon Samochodowy

> Zaawansowany przewodnik testowania E2E w Playwright dla projektu Salon Samochodowy.  
> Język przewodnika: Polski | Kod: Angielski

---

## 1. Struktura testów w projekcie

\`\`\`
Playwright/
├── tests/
│   ├── ui/           ← 15 testów UI (nawigacja, formularze, wyświetlanie)
│   ├── api/          ← 15 testów API (REST endpoints, walidacja)
│   ├── mock/         ← 15 testów z Mock Service Worker
│   └── auth/         ← 15 testów uwierzytelniania
├── pages/            ← Page Object Models
│   ├── LoginPage.ts
│   ├── CarListPage.ts
│   └── DealerPage.ts
├── fixtures/         ← Custom fixtures i data factories
│   ├── test.fixtures.ts
│   └── car.factory.ts
├── helpers/
│   └── auth.helpers.ts
├── playwright.config.ts
└── package.json
\`\`\`

---

## 2. Page Object Model (POM)

POM separuje logikę selektorów od testów, zwiększając ich odporność na zmiany UI.

\`\`\`typescript
// Playwright/pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;

  // Selektory – nie używaj CSS klas! Preferuj: data-testid, ARIA roles
  readonly emailInput:    Locator;
  readonly passwordInput: Locator;
  readonly submitButton:  Locator;
  readonly errorMessage:  Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput    = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Hasło');
    this.submitButton  = page.getByRole('button', { name: 'Zaloguj się' });
    this.errorMessage  = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async loginAndWait(email: string, password: string) {
    await this.login(email, password);
    await this.page.waitForURL('/cars');  // czeka na redirect po zalogowaniu
  }
}
\`\`\`

\`\`\`typescript
// Playwright/pages/CarListPage.ts
import { Page, Locator, expect } from '@playwright/test';

export class CarListPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly carCards:    Locator;
  readonly pagination:  Locator;
  readonly loadingState: Locator;

  constructor(page: Page) {
    this.page         = page;
    this.searchInput  = page.getByPlaceholder('Szukaj marki...');
    this.carCards     = page.locator('[data-testid="car-card"]');
    this.pagination   = page.getByRole('navigation', { name: 'Paginacja' });
    this.loadingState = page.locator('[data-testid="skeleton-loader"]');
  }

  async goto() {
    await this.page.goto('/cars');
    await expect(this.loadingState).toBeHidden({ timeout: 5000 });
  }

  async searchBrand(brand: string) {
    await this.searchInput.fill(brand);
    await this.page.waitForResponse(resp =>
      resp.url().includes('/api/v1/cars') && resp.status() === 200
    );
  }

  async getCarCount() {
    return this.carCards.count();
  }

  async goToPage(pageNumber: number) {
    await this.pagination
      .getByRole('button', { name: String(pageNumber) })
      .click();
    await expect(this.loadingState).toBeHidden({ timeout: 5000 });
  }
}
\`\`\`

---

## 3. Custom Fixtures i Data Factories

\`\`\`typescript
// Playwright/fixtures/test.fixtures.ts
import { test as base, expect } from '@playwright/test';
import { LoginPage }   from '../pages/LoginPage';
import { CarListPage } from '../pages/CarListPage';
import { DealerPage }  from '../pages/DealerPage';

type MyFixtures = {
  loginPage:   LoginPage;
  carListPage: CarListPage;
  dealerPage:  DealerPage;
  authenticatedPage: Page;  // strona z zalogowanym użytkownikiem
};

export const test = base.extend<MyFixtures>({
  loginPage:   async ({ page }, use) => use(new LoginPage(page)),
  carListPage: async ({ page }, use) => use(new CarListPage(page)),
  dealerPage:  async ({ page }, use) => use(new DealerPage(page)),

  // Fixture: już zalogowana strona (pomija formularz logowania)
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/login');
    const loginPage = new LoginPage(page);
    await loginPage.loginAndWait(
      process.env.TEST_USER_EMAIL || 'user@test.com',
      process.env.TEST_USER_PASS  || 'Test1234!'
    );
    await use(page);
  }
});

export { expect };
\`\`\`

\`\`\`typescript
// Playwright/fixtures/car.factory.ts
export const CarFactory = {
  build(overrides: Partial<Car> = {}): Car {
    return {
      brand:  'Toyota',
      model:  'Camry',
      year:   2023,
      price:  120000,
      color:  'Czarny',
      isSold: false,
      isAvailableForRent: true,
      description: 'Samochód testowy',
      ...overrides
    };
  },

  buildSold: () => CarFactory.build({ isSold: true }),
  buildExpensive: () => CarFactory.build({ price: 500000 }),
  buildFleet: (n: number) => Array.from({ length: n }, (_, i) =>
    CarFactory.build({ brand: \`Brand\${i}\`, model: \`Model\${i}\` })
  )
};
\`\`\`

---

## 4. Wzorce zaawansowane

### Przechwytywanie i mockowanie API

\`\`\`typescript
test('pokazuje pustą listę gdy API zwraca puste dane', async ({ page, carListPage }) => {
  // Mock endpoint
  await page.route('**/api/v1/cars*', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } })
    });
  });

  await carListPage.goto();

  await expect(page.getByText('Brak samochodów')).toBeVisible();
  await expect(carListPage.carCards).toHaveCount(0);
});
\`\`\`

### Testowanie błędów sieci

\`\`\`typescript
test('pokazuje komunikat błędu gdy API niedostępne', async ({ page }) => {
  await page.route('**/api/v1/cars*', route => route.abort('connectionrefused'));

  await page.goto('/cars');

  await expect(page.getByRole('alert')).toContainText('Błąd serwera');
});
\`\`\`

### Test autentykacji z zapisanym stanem

\`\`\`typescript
// playwright.config.ts – zapisz stan auth jako plik
const config: PlaywrightTestConfig = {
  projects: [
    {
      name: 'setup',
      testMatch: '**/auth.setup.ts',
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json'
      },
      dependencies: ['setup']
    }
  ]
};

// auth.setup.ts
import { test as setup } from '@playwright/test';
setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@test.com');
  await page.getByLabel('Hasło').fill('Test1234!');
  await page.getByRole('button', { name: 'Zaloguj się' }).click();
  await page.waitForURL('/cars');
  await page.context().storageState({ path: 'playwright/.auth/user.json' });
});
\`\`\`

---

## 5. Testowanie wydajności z Playwright

\`\`\`typescript
// tests/performance/page-load.spec.ts
test('strona listy samochodów ładuje się w < 3 sekundy', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/cars');
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - startTime;

  console.log(\`Czas ładowania: \${loadTime}ms\`);
  expect(loadTime).toBeLessThan(3000);
});

test('mierzy Web Vitals', async ({ page }) => {
  await page.goto('/cars');

  const vitals = await page.evaluate(() => {
    return new Promise(resolve => {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        resolve({
          fcp: entries.find(e => e.name === 'first-contentful-paint')?.startTime,
          lcp: entries.find(e => e.entryType === 'largest-contentful-paint')?.startTime
        });
      });
      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
      setTimeout(() => resolve({}), 5000);
    });
  });

  if (vitals.fcp) expect(vitals.fcp).toBeLessThan(1500);
});
\`\`\`

---

## 6. Debugowanie testów

\`\`\`bash
# Tryb headed (z przeglądarką)
npx playwright test --headed

# Tryb debug (krok po kroku)
npx playwright test --debug

# Playwright Inspector
PWDEBUG=1 npx playwright test

# Trace Viewer – nagraj trace i otwórz
npx playwright test --trace on
npx playwright show-trace playwright-report/traces/test-name.zip

# Tylko jeden plik testowy
npx playwright test tests/auth/login.spec.ts

# Konkretny test (name matching)
npx playwright test -g "loguje użytkownika"

# Tryb UI (wbudowany inspektor)
npx playwright test --ui
\`\`\`

---

## 7. Konfiguracja CI – Playwright

\`\`\`typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
    ...(process.env.CI ? [['github'] as any] : [])
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:4200',
    trace:   process.env.CI ? 'on-first-retry' : 'off',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'mobile',   use: { ...devices['Pixel 5'] } }
  ],
  webServer: process.env.CI ? undefined : {
    command: 'npm start',
    url: 'http://localhost:4200',
    reuseExistingServer: true,
    timeout: 30_000
  }
});
\`\`\`

---

## 8. Anty-wzorce – czego unikać

| ❌ Anty-wzorzec | ✅ Poprawnie |
|-----------------|-------------|
| \`page.waitForTimeout(3000)\` (sleep) | \`page.waitForResponse()\`, \`waitForSelector()\` |
| \`page.locator('.btn-primary')\` (CSS klasa) | \`page.getByRole('button', { name: '...' })\` |
| \`page.locator('#car-1')\` (id z danymi) | \`page.getByTestId('car-card').first()\` |
| Hardkodowane URL API w testach | Używaj \`process.env.API_URL\` |
| \`test.only\` committed do repo | Zablokowane przez CI (\`forbidOnly: true\`) |
| Testowanie implementacji (CSS, struktura DOM) | Testuj zachowanie z perspektywy użytkownika |

---

*Przewodnik Playwright – Salon Samochodowy AiTSI | Wersja 1.0 | 2025*
`, 'utf8');

// ─────────────────────────────────────────────────────────────────────────────
// FILE 11: devops-skills.md
// ─────────────────────────────────────────────────────────────────────────────
fs.writeFileSync(path.join(BASE, 'devops-skills.md'), `# Przewodnik DevOps – Salon Samochodowy

> Praktyczny przewodnik DevOps dla projektu: Docker, GitHub Actions, monitoring.

---

## 1. Docker – od podstaw do produkcji

### Podstawy

\`\`\`bash
# Build obrazu
docker build -t salon-backend:1.0 ./salon-samochodowy-backend

# Uruchomienie kontenera
docker run -d \\
  --name salon-backend \\
  -p 3000:3000 \\
  -e NODE_ENV=production \\
  -e JWT_SECRET=sekret \\
  salon-backend:1.0

# Logi
docker logs -f salon-backend

# Exec do kontenera
docker exec -it salon-backend sh

# Zatrzymanie
docker stop salon-backend && docker rm salon-backend
\`\`\`

### docker-compose – najczęstsze komendy

\`\`\`bash
# Uruchomienie wszystkich serwisów
docker-compose up -d

# Rebuild (po zmianie kodu)
docker-compose up -d --build

# Zatrzymanie
docker-compose down

# Zatrzymanie + usunięcie woluminów (UWAGA: kasuje dane!)
docker-compose down -v

# Logi konkretnego serwisu
docker-compose logs -f backend

# Restart konkretnego serwisu
docker-compose restart backend

# Status serwisów
docker-compose ps

# Exec do serwisu
docker-compose exec backend sh
\`\`\`

### Debugowanie Dockerfile

\`\`\`bash
# Sprawdź rozmiar warstw
docker history salon-frontend:latest

# Uruchom etap pośredni (do debugowania multi-stage)
docker build --target builder -t salon-frontend:debug ./salon-samochodowy-frontend
docker run -it salon-frontend:debug sh

# Inspect sieci
docker network ls
docker network inspect salon-samochodowy_salon-network
\`\`\`

---

## 2. GitHub Actions – przepis (cookbook)

### Wyzwalacze (triggers)

\`\`\`yaml
on:
  push:
    branches: [main, develop]
    paths:
      - 'salon-samochodowy-backend/**'  # tylko gdy zmienił się backend
  pull_request:
    branches: [main, develop]
  schedule:
    - cron: '0 2 * * *'  # codziennie o 2:00 – testy nocne
  workflow_dispatch:  # manualny trigger
    inputs:
      dry_run:
        type: boolean
        default: false
\`\`\`

### Caching – przyspieszenie pipeline'u

\`\`\`yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'
    cache-dependency-path: salon-samochodowy-backend/package-lock.json

# Cache dla Playwright browsers
- name: Cache Playwright
  uses: actions/cache@v4
  with:
    path: ~/.cache/ms-playwright
    key: playwright-\${{ hashFiles('Playwright/package-lock.json') }}

- name: Install Playwright browsers
  run: npx playwright install --with-deps
  if: steps.cache-playwright.outputs.cache-hit != 'true'
\`\`\`

### Artefakty

\`\`\`yaml
- name: Upload test reports
  uses: actions/upload-artifact@v4
  if: always()  # nawet jeśli testy padły
  with:
    name: test-reports-\${{ github.run_id }}
    path: |
      Playwright/playwright-report/
      salon-samochodowy-backend/coverage/
    retention-days: 14
\`\`\`

---

## 3. Monitorowanie

### Health endpoint

\`\`\`javascript
// salon-samochodowy-backend/src/routes/health.js
const { sequelize } = require('../models');

router.get('/health', async (req, res) => {
  const checks = {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    db: 'unknown'
  };

  try {
    await sequelize.authenticate();
    checks.db = 'connected';
  } catch (err) {
    checks.db = 'disconnected';
    checks.status = 'degraded';
  }

  const statusCode = checks.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(checks);
});
\`\`\`

### UptimeRobot – konfiguracja

1. Dodaj monitor HTTP: \`https://salon.example.com/api/health\`
2. Interval: 5 minut
3. Alert email gdy status != 200
4. Alert Slack webhook (opcjonalnie)

---

## 4. Backup bazy danych

### Skrypt backup MySQL

\`\`\`bash
#!/bin/bash
# scripts/backup-db.sh
TIMESTAMP=\$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups/salon"
mkdir -p "\$BACKUP_DIR"

docker exec salon-mysql mysqldump \\
  -u root -p"\${MYSQL_ROOT_PASS}" \\
  --single-transaction \\
  --quick \\
  salon_prod \\
  > "\$BACKUP_DIR/salon_\${TIMESTAMP}.sql"

# Kompresja
gzip "\$BACKUP_DIR/salon_\${TIMESTAMP}.sql"

# Usunięcie backupów starszych niż 30 dni
find "\$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete

echo "Backup zapisany: salon_\${TIMESTAMP}.sql.gz"
\`\`\`

### Cron backup (codziennie o 3:00)

\`\`\`
0 3 * * * /opt/scripts/backup-db.sh >> /var/log/backup.log 2>&1
\`\`\`

---

## 5. Security scanning

\`\`\`bash
# Audit npm dependencies
npm audit --audit-level=high
npm audit fix  # auto-naprawa

# Skan obrazu Docker (Trivy)
trivy image salon-backend:latest --severity HIGH,CRITICAL

# SAST – analiza statyczna (Semgrep)
semgrep --config=p/nodejs --config=p/typescript .

# Sprawdź sekrety w kodzie (Trufflehog)
trufflehog git file://. --only-verified
\`\`\`

---

## 6. Troubleshooting

| Problem | Diagnoza | Rozwiązanie |
|---------|----------|-------------|
| Backend nie startuje | \`docker-compose logs backend\` | Sprawdź zmienne .env |
| MySQL connection refused | \`docker-compose ps mysql\` | Czekaj na health check |
| Frontend 404 | \`docker-compose logs frontend\` | Sprawdź nginx.conf |
| JWT expired w testach | Sprawdź systemowy czas | Synchronizuj czas NTP |
| CI pipeline wolny | Analiza czasu kroków | Dodaj caching, parallelizuj |

---

*Przewodnik DevOps – Salon Samochodowy AiTSI | Wersja 1.0 | 2025*
`, 'utf8');

// ─────────────────────────────────────────────────────────────────────────────
// FILE 12: design-skills.md
// ─────────────────────────────────────────────────────────────────────────────
fs.writeFileSync(path.join(BASE, 'design-skills.md'), `# Przewodnik Design – Salon Samochodowy

> Przewodnik implementacji systemu designu dla projektu Salon Samochodowy (Bootstrap + Angular Material).

---

## 1. Design System – zmienne CSS

\`\`\`scss
// salon-samochodowy-frontend/src/styles/_variables.scss

// ── Kolory ──────────────────────────────────────
:root {
  // Paleta główna
  --color-primary-900: #0a1632;
  --color-primary-800: #122343;
  --color-primary-700: #162b4d;
  --color-primary-600: #1a3357;
  --color-primary-500: #1e3a5f;  // ← główny primary
  --color-primary-400: #3e78ab;
  --color-primary-300: #6190ba;

  // Akcent
  --color-accent-600:  #c1121f;
  --color-accent-500:  #e63946;  // ← główny akcent
  --color-accent-400:  #eb5a65;

  // Neutralne
  --color-surface:     #f8f9fa;
  --color-surface-2:   #e9ecef;
  --color-border:      #dee2e6;
  --color-text-primary:   #212529;
  --color-text-secondary: #6c757d;
  --color-text-muted:     #adb5bd;
  --color-white:       #ffffff;

  // Semantyczne
  --color-success:     #2d6a4f;
  --color-warning:     #e9c46a;
  --color-error:       --color-accent-500;
  --color-info:        #0077b6;

  // ── Typografia ──────────────────────────────────
  --font-heading: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-body:    'Roboto', Arial, sans-serif;
  --font-mono:    'JetBrains Mono', 'Courier New', monospace;

  --text-xs:   0.75rem;   // 12px
  --text-sm:   0.875rem;  // 14px
  --text-base: 1rem;      // 16px
  --text-lg:   1.125rem;  // 18px
  --text-xl:   1.25rem;   // 20px
  --text-2xl:  1.5rem;    // 24px
  --text-3xl:  1.875rem;  // 30px
  --text-4xl:  2.25rem;   // 36px

  --font-normal:   400;
  --font-medium:   500;
  --font-semibold: 600;
  --font-bold:     700;

  // ── Spacing ─────────────────────────────────────
  --space-1:  0.25rem;   // 4px
  --space-2:  0.5rem;    // 8px
  --space-3:  0.75rem;   // 12px
  --space-4:  1rem;      // 16px
  --space-5:  1.25rem;   // 20px
  --space-6:  1.5rem;    // 24px
  --space-8:  2rem;      // 32px
  --space-10: 2.5rem;    // 40px
  --space-12: 3rem;      // 48px
  --space-16: 4rem;      // 64px

  // ── Border radius ────────────────────────────────
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-xl:   16px;
  --radius-full: 9999px;

  // ── Shadows ──────────────────────────────────────
  --shadow-sm: 0 1px 2px rgba(0,0,0,.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,.07), 0 2px 4px rgba(0,0,0,.06);
  --shadow-lg: 0 10px 15px rgba(0,0,0,.1), 0 4px 6px rgba(0,0,0,.05);

  // ── Transitions ──────────────────────────────────
  --transition-fast:   150ms ease-in-out;
  --transition-normal: 250ms ease-in-out;
  --transition-slow:   400ms ease-in-out;
}
\`\`\`

---

## 2. Angular Material Custom Theme

\`\`\`scss
// salon-samochodowy-frontend/src/styles/_theme.scss
@use '@angular/material' as mat;
@include mat.core();

$salon-primary: mat.define-palette((
  50:   #e3eaf3,
  100:  #b9cce1,
  200:  #8daece,
  300:  #6190ba,
  400:  #3e78ab,
  500:  #1e3a5f,
  600:  #1a3357,
  700:  #162b4d,
  800:  #122343,
  900:  #0a1632,
  A100: #82b1ff,
  A200: #448aff,
  A400: #2979ff,
  A700: #2962ff,
  contrast: (
    400: white, 500: white, 600: white,
    700: white, 800: white, 900: white
  )
), 500);

$salon-accent: mat.define-palette(mat.$red-palette, 600, 400, 800);

$salon-theme: mat.define-light-theme((
  color: (
    primary: $salon-primary,
    accent:  $salon-accent,
    warn:    mat.define-palette(mat.$orange-palette)
  ),
  typography: mat.define-typography-config(
    $font-family: 'Roboto, sans-serif',
    $headline-1: mat.define-typography-level(36px, 44px, 700, 'Inter'),
    $headline-2: mat.define-typography-level(30px, 36px, 700, 'Inter'),
  ),
  density: 0
));

@include mat.all-component-themes($salon-theme);
\`\`\`

---

## 3. Karta samochodu – nowy design

\`\`\`html
<!-- car-card.component.html -->
<mat-card class="car-card" [class.car-card--sold]="car.isSold">
  <div class="car-card__image-wrapper">
    <img
      [src]="car.imageUrl || 'assets/car-placeholder.webp'"
      [alt]="car.brand + ' ' + car.model"
      loading="lazy"
      class="car-card__image">
    @if (car.isSold) {
      <div class="car-card__badge car-card__badge--sold" role="status">
        Sprzedany
      </div>
    } @else if (!car.isAvailableForRent) {
      <div class="car-card__badge car-card__badge--rented" role="status">
        Wynajęty
      </div>
    }
  </div>

  <mat-card-content class="car-card__content">
    <h3 class="car-card__title">{{ car.brand }} {{ car.model }}</h3>
    <p class="car-card__year">{{ car.year }} · {{ car.color }}</p>
    <p class="car-card__price">{{ car.price | currency:'PLN':'symbol':'1.0-0' }}</p>
  </mat-card-content>

  <mat-card-actions class="car-card__actions">
    <button mat-flat-button color="primary"
            [disabled]="car.isSold"
            (click)="buyRequested.emit(car)"
            [attr.aria-label]="'Kup ' + car.brand + ' ' + car.model">
      @if (car.isSold) { Sprzedany } @else { Kup teraz }
    </button>
    <button mat-stroked-button
            [routerLink]="['/cars', car.id]"
            [attr.aria-label]="'Szczegóły ' + car.brand + ' ' + car.model">
      Szczegóły
    </button>
  </mat-card-actions>
</mat-card>
\`\`\`

\`\`\`scss
// car-card.component.scss
.car-card {
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
  overflow: hidden;

  &:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }

  &--sold { opacity: 0.7; }

  &__image-wrapper { position: relative; }

  &__image {
    width: 100%;
    height: 200px;
    object-fit: cover;
    display: block;
  }

  &__badge {
    position: absolute; top: 12px; right: 12px;
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-full);
    font-size: var(--text-xs);
    font-weight: var(--font-semibold);

    &--sold   { background: var(--color-accent-500); color: white; }
    &--rented { background: var(--color-warning); color: var(--color-text-primary); }
  }

  &__title { font-family: var(--font-heading); font-size: var(--text-xl); font-weight: var(--font-bold); margin: 0; }
  &__year  { color: var(--color-text-secondary); font-size: var(--text-sm); margin: var(--space-1) 0; }
  &__price { font-size: var(--text-2xl); font-weight: var(--font-bold); color: var(--color-primary-500); }

  &__actions { display: flex; gap: var(--space-2); padding: 0 var(--space-4) var(--space-4); }
}
\`\`\`

---

## 4. Dostępność (WCAG 2.1 AA)

### Wymagania minimalne

| Kryterium | Wymaganie | Narzędzie weryfikacji |
|-----------|-----------|----------------------|
| Kontrast tekstu | ≥4.5:1 (AA) | axe, Colour Contrast Analyser |
| Kontrast dużego tekstu | ≥3:1 (AA) | axe |
| Focus visible | Widoczny focus ring | Ręczne testy klawiaturą |
| Alt text dla obrazów | Wymagany | axe, Lighthouse |
| Etykiety formularzy | \`aria-label\` lub \`<label>\` | axe |
| Błędy formularzy | \`aria-describedby\` | Ręczne testy |
| Nawigacja klawiaturą | Tab, Enter, Escape | Ręczne testy |

### Implementacja focus management

\`\`\`typescript
// Fokus po otworzeniu modalu
@Component({ template: \`
  <div role="dialog" aria-modal="true" [attr.aria-labelledby]="titleId">
    <h2 [id]="titleId" #modalTitle tabindex="-1">{{ title }}</h2>
    <!-- treść -->
    <button (click)="close()">Zamknij</button>
  </div>
\`})
export class ModalComponent implements AfterViewInit {
  @ViewChild('modalTitle') titleEl!: ElementRef;

  ngAfterViewInit() {
    this.titleEl.nativeElement.focus();  // przenieś fokus do modalu
  }
}
\`\`\`

---

## 5. Tryb ciemny (Dark Mode)

\`\`\`scss
// Tryb ciemny przez CSS media query + klasę
@media (prefers-color-scheme: dark), :root.dark-mode {
  --color-surface:       #121212;
  --color-surface-2:     #1e1e1e;
  --color-border:        #333;
  --color-text-primary:  #e0e0e0;
  --color-text-secondary:#9e9e9e;
  --color-white:         #1e1e1e;
  --shadow-md: 0 4px 6px rgba(0,0,0,.4);
}
\`\`\`

\`\`\`typescript
// src/app/services/theme.service.ts
@Injectable({ providedIn: 'root' })
export class ThemeService {
  isDarkMode = signal<boolean>(
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  toggleDarkMode() {
    this.isDarkMode.update(v => !v);
    document.documentElement.classList.toggle('dark-mode', this.isDarkMode());
    localStorage.setItem('theme', this.isDarkMode() ? 'dark' : 'light');
  }
}
\`\`\`

---

## 6. Responsive Design (mobile-first)

\`\`\`scss
// _breakpoints.scss
$breakpoints: (
  'sm':  375px,
  'md':  768px,
  'lg':  1024px,
  'xl':  1440px
);

@mixin up($bp) {
  @media (min-width: map-get($breakpoints, $bp)) { @content; }
}

// Siatka samochodów – mobile-first
.cars-grid {
  display: grid;
  grid-template-columns: 1fr;  // 1 kolumna na mobile
  gap: var(--space-4);

  @include up('sm') { grid-template-columns: repeat(2, 1fr); }  // 2 kolumny
  @include up('lg') { grid-template-columns: repeat(3, 1fr); }  // 3 kolumny
  @include up('xl') { grid-template-columns: repeat(4, 1fr); }  // 4 kolumny
}
\`\`\`

---

*Przewodnik Design – Salon Samochodowy AiTSI | Wersja 1.0 | 2025*
`, 'utf8');

console.log('✅ 11-skills: 5 plików utworzone (backend-skills.md, frontend-skills.md, playwright-skills.md, devops-skills.md, design-skills.md)');
