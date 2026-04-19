# Angular Route Guards — Implementacja

## Krok 1: Utwórz Folder Guards

```
salon-samochodowy-frontend/src/app/guards/
├── auth.guard.ts
└── dealer.guard.ts
```

## Krok 2: auth.guard.ts

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
        map(user => {
            if (user !== null) {
                return true;
            }
            // Przekieruj do cars z parametrem login=true (otwórz modal)
            return router.createUrlTree(['/cars'], {
                queryParams: { 
                    login: 'true',
                    returnUrl: state.url 
                }
            });
        })
    );
};
```

## Krok 3: dealer.guard.ts

```typescript
// src/app/guards/dealer.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { map, take } from 'rxjs';

export const dealerGuard: CanActivateFn = (route, state) => {
    const auth = inject(AuthenticationService);
    const router = inject(Router);

    return auth.currentUser$.pipe(
        take(1),
        map(user => {
            if (user?.isDealer === true) {
                return true;
            }
            // Nie-dealer → przekieruj do listy samochodów
            return router.createUrlTree(['/cars']);
        })
    );
};
```

## Krok 4: Zaktualizuj app.routes.ts

```typescript
// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';
import { authGuard } from './guards/auth.guard';
import { dealerGuard } from './guards/dealer.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'cars', pathMatch: 'full' },
    {
        path: 'cars',
        loadComponent: () =>
            import('./components/car-list/car-list.component')
                .then(m => m.CarListComponent),
        // Publiczny — brak guard
    },
    {
        path: 'cars/:id',
        loadComponent: () =>
            import('./components/car-detail/car-detail.component')
                .then(m => m.CarDetailComponent),
        // Publiczny — brak guard
    },
    {
        path: 'privacy-policy',
        component: PrivacyPolicyComponent
    },
    // Przyszłe chronione trasy:
    // {
    //     path: 'dashboard',
    //     canActivate: [authGuard],
    //     loadComponent: () => import('./components/dashboard/dashboard.component')
    // },
    // {
    //     path: 'admin',
    //     canActivate: [authGuard, dealerGuard],
    //     loadComponent: () => import('./components/admin/admin.component')
    // },
];
```

## Krok 5: Obsługa queryParam login=true

```typescript
// car-list.component.ts — sprawdź queryParam po navigacji
import { ActivatedRoute } from '@angular/router';

export class CarListComponent implements OnInit {
    private route = inject(ActivatedRoute);
    
    ngOnInit() {
        // Otwórz modal logowania jeśli ?login=true
        this.route.queryParams.pipe(take(1)).subscribe(params => {
            if (params['login'] === 'true') {
                // Otwórz modal logowania
                this.openLoginModal();
            }
        });
    }
}
```

## Weryfikacja

```bash
# Test: niezalogowany użytkownik próbuje wejść na chronioną trasę
# Oczekiwane: przekierowanie do /cars?login=true

# Test Playwright (dodaj do auth workflow):
test('Niezalogowany → przekierowanie', async ({ browser }) => {
    const ctx = await browser.newContext(); // brak storageState
    const page = await ctx.newPage();
    await page.goto('/admin'); // lub inna chroniona trasa
    await expect(page).toHaveURL(/\/cars/);
});
```
