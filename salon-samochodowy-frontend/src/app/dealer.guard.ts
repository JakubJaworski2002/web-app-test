import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from './services/authentication.service';
import { map, take } from 'rxjs';

/**
 * Guard chroniący trasy dostępne tylko dla dealerów (isDealer === true).
 * Przekierowuje na /cars jeśli użytkownik nie jest dealerem.
 */
export const dealerGuard: CanActivateFn = (route, state) => {
    const auth = inject(AuthenticationService);
    const router = inject(Router);

    return auth.currentUser$.pipe(
        take(1),
        map(user => {
            if (user?.isDealer === true) {
                return true;
            }
            return router.createUrlTree(['/cars']);
        })
    );
};
