# Refaktoryzacja Angular — Plan Implementacji

## Sprint 3 — Lista Zmian

### 1. Fix Memory Leak (INC-009) — car-list.component.ts:52

```typescript
// PRZED:
ngOnInit(): void {
    combineLatest([
        this.authService.currentUser$,
        this.carService.getCars()
    ]).subscribe(([user, cars]) => { ... });
}

// PO:
import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export class CarListComponent implements OnInit {
    private destroyRef = inject(DestroyRef);
    
    ngOnInit(): void {
        combineLatest([
            this.authService.currentUser$,
            this.carService.getCars()
        ])
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(([user, cars]) => { ... });
    }
}
```

### 2. Fix Literówka brandserch (INC-007)

```typescript
// car-list.component.ts:33
brandSearch = "";  // było: brandserch

// car-list.component.ts:138
car.brand.toLowerCase().includes(this.brandSearch.toLowerCase())  // było: brandserch
```

```html
<!-- car-list.component.html -->
<input [(ngModel)]="brandSearch" ...>  <!-- było: brandserch -->
```

### 3. Zastąpienie alert() (INC-008)

```typescript
// car-list.component.ts
import { MatSnackBar } from '@angular/material/snack-bar';

export class CarListComponent {
    private snackBar = inject(MatSnackBar);
    
    deleteCar(id: number): void {
        if (!this.isDealer) {
            // PRZED: alert('Nie masz uprawnień...')
            this.snackBar.open('Brak uprawnień do usuwania samochodów', 'OK', { duration: 3000 });
            return;
        }
        // PRZED: if (confirm('Czy na pewno...'))
        // Tymczasowo — dialog potwierdzenia (docelowo MatDialog)
        if (!window.confirm('Czy na pewno chcesz usunąć ten samochód?')) return;
        
        this.carService.deleteCar(id).subscribe({
            next: () => {
                this.cars = this.cars.filter(c => c.id !== id);
                this.sortedCars = this.sortedCars.filter(c => c.id !== id);
                this.filterCars();
                // PRZED: alert('Samochód usunięty')
                this.snackBar.open('✅ Samochód usunięty', 'OK', { duration: 3000 });
            },
            error: () => {
                // PRZED: alert('Błąd')
                this.snackBar.open('❌ Błąd podczas usuwania', 'Zamknij', { duration: 5000 });
            }
        });
    }
}
```

### 4. OnPush Change Detection (wszystkie komponenty)

```typescript
import { ChangeDetectionStrategy } from '@angular/core';

@Component({
    // ...
    changeDetection: ChangeDetectionStrategy.OnPush  // ← dodaj do każdego komponentu
})
```

### 5. TrackBy w ngFor

```typescript
// car-list.component.ts
trackByCar = (index: number, car: Car): number => car.id;
```

```html
<!-- car-list.component.html -->
<div *ngFor="let car of filteredCars; trackBy: trackByCar">
```

### 6. Reactive Forms (zamiast Template-driven)

```typescript
// add-car.component.ts
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

export class AddCarComponent {
    private fb = inject(FormBuilder);
    
    carForm = this.fb.group({
        brand:     ['', [Validators.required, Validators.minLength(2)]],
        model:     ['', Validators.required],
        year:      [new Date().getFullYear(), [Validators.required, Validators.min(1886)]],
        vin:       ['', [Validators.required, Validators.minLength(17), Validators.maxLength(17)]],
        price:     [0, [Validators.required, Validators.min(0)]],
        horsePower:[100, [Validators.required, Validators.min(1)]],
        isAvailableForRent: [true]
    });
    
    // Gettery dla wygodnego dostępu w template
    get vin() { return this.carForm.get('vin')!; }
    get price() { return this.carForm.get('price')!; }
}
```

## Kolejność Implementacji

```bash
# Krok 1: Fix INC-007 (literówka) — 15 min
grep -r "brandserch" salon-samochodowy-frontend/src/

# Krok 2: Fix INC-009 (memory leak) — 30 min
# Dodaj takeUntilDestroyed do car-list

# Krok 3: Fix INC-008 (alert) — 1h
# Zamień alert() na MatSnackBar we wszystkich komponentach

# Krok 4: OnPush + trackBy — 1h
# Dodaj do wszystkich komponentów

# Krok 5: Reactive Forms — 4h
# Zacznij od AddCarComponent

# Uruchom testy
cd Playwright && npx playwright test
```
