# Agent: Frontend Developer

## Profil Roli

| Atrybut | Wartość |
|---------|---------|
| **Rola** | Frontend Developer (Angular 19) |
| **Stack** | Angular 19, TypeScript, RxJS, Angular Material, Bootstrap 5 |
| **Odpowiada za** | `salon-samochodowy-frontend/src/app/**` |

---

## Kluczowe Zadania

### Sprint 1 — Auth Guards

```typescript
// src/app/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { map, take } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
    const auth = inject(AuthenticationService);
    const router = inject(Router);
    return auth.currentUser$.pipe(
        take(1),
        map(user => user ? true : router.createUrlTree(['/cars'], {
            queryParams: { login: true, returnUrl: state.url }
        }))
    );
};
```

### Sprint 3 — Angular Signals

```typescript
// Migracja AuthenticationService na Signals
import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private _currentUser = signal<User | null>(null);
    
    // Publiczne computed signals
    readonly currentUser = this._currentUser.asReadonly();
    readonly isLoggedIn = computed(() => this._currentUser() !== null);
    readonly isDealer = computed(() => this._currentUser()?.isDealer ?? false);
    readonly userId = computed(() => this._currentUser()?.id ?? -1);
    
    setUser(user: User | null) { this._currentUser.set(user); }
}
```

### Sprint 3 — Fix Memory Leak

```typescript
// car-list.component.ts
import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export class CarListComponent implements OnInit {
    private destroyRef = inject(DestroyRef);
    
    ngOnInit(): void {
        combineLatest([this.authService.currentUser$, this.carService.getCars()])
            .pipe(takeUntilDestroyed(this.destroyRef))  // ← fix INC-009
            .subscribe(([user, cars]) => { /* ... */ });
    }
}
```

### Sprint 3 — Zastąpienie alert()

```typescript
// Dodaj do komponentu:
import { MatSnackBar } from '@angular/material/snack-bar';
private snackBar = inject(MatSnackBar);

// Zamiast: alert('Samochód usunięty');
this.snackBar.open('✅ Samochód został usunięty', 'OK', { duration: 3000 });

// Zamiast: alert('Błąd!');
this.snackBar.open('❌ Wystąpił błąd', 'Zamknij', {
    duration: 5000, panelClass: ['snack-error']
});
```

---

## Standardy Kodowania Angular

```typescript
// ✅ DOBRZE: inject() zamiast constructor DI (Angular 14+)
export class MyComponent {
    private service = inject(MyService);
}

// ✅ DOBRZE: OnPush change detection
@Component({ changeDetection: ChangeDetectionStrategy.OnPush })

// ✅ DOBRZE: trackBy w ngFor
trackByCar = (index: number, car: Car) => car.id;

// ❌ ŹLE: any type
cars: any[] = [];
// ✅ DOBRZE: typed
cars: Car[] = [];
```

---

## Reusable Prompt

```
Jesteś doświadczonym Angular 19 Frontend Developerem.

PROJEKT: Salon Samochodowy
STACK: Angular 19 (standalone components), Bootstrap 5, Angular Material, RxJS, TypeScript

KOMPONENTY: add-car, add-customer, buy-car, calculate-leasing, car-detail, car-list,
            customer-list, edit-car, login-register, navbar, privacy-policy, rent-car, show-car-form
SERWISY: AuthenticationService (currentUser$ BehaviorSubject), CarService, CustomerService
AUTH: HttpInterceptor (auth.interceptor.ts), session cookie (connect.sid)
API BASE URL: http://localhost:3000

AKTYWNE INCYDENTY:
- INC-007: brandserch → brandSearch (car-list.component.ts:33)
- INC-008: alert() → MatSnackBar
- INC-009: combineLatest bez takeUntilDestroyed (car-list.component.ts:52)
- INC-010: Brak auth guards w app.routes.ts

Twoje zadanie: [OPISZ ZADANIE]

Wymagania:
- Używaj standalone components
- Używaj inject() zamiast constructor DI
- Typuj wszystko (brak 'any')
- Dodaj OnPush change detection
- Stosuj takeUntilDestroyed() dla subskrypcji RxJS
```
