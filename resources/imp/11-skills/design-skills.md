# Design Skills — Przewodnik

## CSS Variables — Implementacja Motywu

```css
/* styles.css */
:root {
  --color-primary: #1a237e;
  --color-secondary: #e53935;
  --color-background: #f5f5f5;
  --color-surface: #ffffff;
}

/* Override Bootstrap z CSS Variables */
.btn-primary {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}
.btn-primary:hover {
  background-color: var(--color-primary-dark);
}
```

## Dark Mode

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #121212;
    --color-surface: #1e1e1e;
    --color-text-primary: #ffffff;
    --color-text-secondary: #b0b0b0;
    --color-border: #333333;
  }
}

/* Lub przez toggle */
[data-theme="dark"] {
  --color-background: #121212;
  --color-surface: #1e1e1e;
}
```

## Responsive Grid (Bootstrap 5)

```html
<!-- Car Grid — mobile first -->
<div class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
    <div class="col" *ngFor="let car of filteredCars; trackBy: trackByCar">
        <app-car-card [car]="car"></app-car-card>
    </div>
</div>
```

## Loading Skeleton

```css
.skeleton {
  background: linear-gradient(90deg, #e0e0e0 25%, #f5f5f5 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: var(--radius-md);
}

@keyframes skeleton-loading {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

```html
<!-- Skeleton card podczas ładowania -->
<div class="car-card skeleton" *ngIf="isLoading" style="height: 280px;"></div>
```

## Animacje Przejść (Angular)

```typescript
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
    animations: [
        trigger('fadeIn', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(8px)' }),
                animate('200ms ease', style({ opacity: 1, transform: 'translateY(0)' }))
            ])
        ])
    ]
})
```

```html
<div [@fadeIn]="cars.length" *ngFor="let car of filteredCars">
    <app-car-card [car]="car"></app-car-card>
</div>
```

## ARIA dla Komponentów Angular Material

```html
<!-- Formularz z właściwymi ARIA labels -->
<mat-form-field>
    <mat-label>Marka samochodu</mat-label>
    <input matInput formControlName="brand"
           aria-required="true"
           [attr.aria-invalid]="brand.invalid && brand.touched">
    <mat-error *ngIf="brand.hasError('required')">
        Marka jest wymagana
    </mat-error>
</mat-form-field>
```
