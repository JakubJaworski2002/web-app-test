import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from './services/authentication.service';
import { map, take } from 'rxjs';

/**
 * Guard chroniący trasy wymagające zalogowania.
 * Przekierowuje na /cars?login=true jeśli użytkownik nie jest zalogowany.
 */
export const authGuard: CanActivateFn = (route, state) => {
    const auth = inject(AuthenticationService);
    const router = inject(Router);

    return auth.currentUser$.pipe(
        take(1),
        map(user => {
            if (user !== null) {
                return true;
            }
            return router.createUrlTree(['/cars'], {
                queryParams: {
                    login: 'true',
                    returnUrl: state.url
                }
            });
        })
    );
};
