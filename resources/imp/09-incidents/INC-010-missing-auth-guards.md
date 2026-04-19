# INC-010 — Brak Angular Route Guards (AuthGuard / DealerGuard)

| Pole | Wartość |
|------|---------|
| **ID** | INC-010 |
| **Severity** | 🟠 HIGH |
| **Status** | OPEN |
| **Odkryto** | 2026-03-29 |
| **Komponent** | `salon-samochodowy-frontend/src/app/app.routes.ts` |
| **Sprint naprawy** | Sprint 1 |
| **Właściciel** | Frontend Developer |

---

## Opis Problemu

Routing Angular (`app.routes.ts`) nie posiada żadnych guard'ów. Użytkownik może bezpośrednio wejść na dowolny widok aplikacji bez autentykacji. Wprawdzie API odrzuci nieautoryzowane żądania (401), ale UX jest zepsuty — użytkownik widzi pusty/błędny widok zamiast przekierowania do logowania.

## Obecna Konfiguracja (Bez Guard)

```typescript
// app.routes.ts — OBECNA (brak ochrony)
export const routes: Routes = [
  { path: '', redirectTo: 'cars', pathMatch: 'full' },
  { path: 'cars', loadComponent: () => import('./components/car-list/...')  },
  { path: 'cars/:id', loadComponent: () => import('./components/car-detail/...') },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
];
```

---

## Naprawa

### Krok 1 — Utwórz plik `auth.guard.ts`

```typescript
// src/app/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthenticationService);
    const router = inject(Router);

    return authService.currentUser$.pipe(
        map(user => {
            if (user) return true;
            // Przekieruj do /cars z parametrem login=true (otwiera modal)
            return router.createUrlTree(['/cars'], {
                queryParams: { login: true, returnUrl: state.url }
            });
        })
    );
};
```

### Krok 2 — Utwórz plik `dealer.guard.ts`

```typescript
// src/app/guards/dealer.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { map } from 'rxjs';

export const dealerGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthenticationService);
    const router = inject(Router);

    return authService.currentUser$.pipe(
        map(user => {
            if (user?.isDealer) return true;
            return router.createUrlTree(['/cars']); // Klient → lista samochodów
        })
    );
};
```

### Krok 3 — Zaktualizuj `app.routes.ts`

```typescript
import { Routes } from '@angular/router';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'cars', pathMatch: 'full' },
    {
        path: 'cars',
        loadComponent: () => import('./components/car-list/car-list.component')
            .then(m => m.CarListComponent),
    },
    {
        path: 'cars/:id',
        loadComponent: () => import('./components/car-detail/car-detail.component')
            .then(m => m.CarDetailComponent),
    },
    {
        path: 'privacy-policy',
        component: PrivacyPolicyComponent
    },
    // Przykład: trasa tylko dla zalogowanych
    // { path: 'dashboard', canActivate: [authGuard], ... }
];
```

> **Uwaga**: Trasy `/cars` i `/cars/:id` są publiczne (tylko czytanie). Guard jest potrzebny dla przyszłych tras `/dashboard`, `/admin` itp.

## Weryfikacja

- [ ] Niezalogowany użytkownik próbujący wejść na trasę chronioną → przekierowanie do `/cars?login=true`
- [ ] Klient próbujący wejść na trasę dealera → przekierowanie do `/cars`
- [ ] Zalogowany użytkownik → dostęp do chronionej trasy
- [ ] Testy Playwright S11-S13 (public-vs-auth) przechodzą
