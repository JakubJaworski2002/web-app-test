# Przewodnik Umiejętności — Angular 19 Frontend

## Standalone Components (Angular 17+)

```typescript
@Component({
    selector: 'app-car-card',
    standalone: true,                          // ← brak NgModule
    imports: [CommonModule, RouterModule],     // ← importy bezpośrednio
    template: `<div>{{ car().brand }}</div>`,
    changeDetection: ChangeDetectionStrategy.OnPush  // ← zawsze OnPush
})
export class CarCardComponent {
    car = input.required<Car>(); // ← Angular 17+ input signals
}
```

## Angular Signals

```typescript
import { signal, computed, effect, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    // Prywatny writable signal
    private _user = signal<User | null>(null);
    
    // Publiczne readonly computed signals
    readonly currentUser = this._user.asReadonly();
    readonly isLoggedIn = computed(() => this._user() !== null);
    readonly isDealer = computed(() => this._user()?.isDealer ?? false);
    
    setUser(user: User | null) { this._user.set(user); }
    clearUser() { this._user.set(null); }
}

// W komponencie — używaj jak funkcji
@Component({ template: `<div *ngIf="auth.isLoggedIn()">Zalogowany</div>` })
export class NavbarComponent {
    auth = inject(AuthenticationService);
}
```

## Unikanie Memory Leaks

```typescript
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef, inject } from '@angular/core';

export class CarListComponent {
    private destroyRef = inject(DestroyRef);
    
    ngOnInit() {
        // ✅ Automatyczne czyszczenie przy zniszczeniu komponentu
        this.carService.getCars()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(cars => this.cars = cars);
    }
}
```

## Auth Guard (Functional — Angular 15+)

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
        map(user => user ? true : router.createUrlTree(['/cars']))
    );
};
```

## Reactive Forms

```typescript
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

export class AddCarComponent {
    private fb = inject(FormBuilder);
    
    form = this.fb.group({
        brand: ['', [Validators.required, Validators.minLength(2)]],
        model: ['', Validators.required],
        year: [2023, [Validators.required, Validators.min(1886)]],
        vin: ['', [Validators.required, Validators.minLength(17), Validators.maxLength(17)]],
        price: [0, [Validators.required, Validators.min(0)]],
        horsePower: [100, [Validators.required, Validators.min(1)]],
        isAvailableForRent: [true]
    });
    
    get vinControl() { return this.form.get('vin')!; }
    
    onSubmit() {
        if (this.form.invalid) return;
        this.carService.addCar(this.form.value).subscribe(/* ... */);
    }
}
```

## TrackBy w ngFor

```typescript
// ✅ Zawsze trackBy dla dynamicznych list
@Component({
    template: `
        <div *ngFor="let car of cars; trackBy: trackByCar" class="car-card">
            {{ car.brand }}
        </div>
    `
})
export class CarListComponent {
    trackByCar = (index: number, car: Car): number => car.id;
}
```
