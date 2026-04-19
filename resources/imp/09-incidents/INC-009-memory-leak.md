# INC-009 — Wyciek Pamięci (Memory Leak) w CarListComponent

| Pole | Wartość |
|------|---------|
| **ID** | INC-009 |
| **Severity** | 🟡 MEDIUM |
| **Status** | OPEN |
| **Odkryto** | 2026-03-29 |
| **Komponent** | `salon-samochodowy-frontend/src/app/components/car-list/car-list.component.ts` |
| **Linia** | 52 |
| **Sprint naprawy** | Sprint 3 |

## Opis

`combineLatest` z RxJS subskrybuje dwa strumienie (`currentUser$` i `getCars()`). Subskrypcja **nigdy nie jest anulowana** — brak `takeUntilDestroyed()`, `takeUntil()` lub `unsubscribe()` przy niszczeniu komponentu.

Przy nawigacji między widokami komponent jest niszczony i tworzony od nowa, ale stare subskrypcje pozostają aktywne — każda nawigacja dodaje kolejną subskrypcję.

## Dowód

```typescript
// car-list.component.ts:52-79 — OBECNY KOD (wyciek!)
ngOnInit(): void {
    combineLatest([
        this.authService.currentUser$,
        this.carService.getCars()
    ]).subscribe(([user, cars]) => {  // ← brak anulowania subskrypcji!
        // ...
    });
}
// Brak ngOnDestroy(), brak takeUntilDestroyed()
```

## Naprawa (Angular 16+ — takeUntilDestroyed)

```typescript
import { Component, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest } from 'rxjs';

export class CarListComponent implements OnInit {
    // Inject DestroyRef automatycznie przez takeUntilDestroyed()
    private destroyRef = inject(DestroyRef);

    ngOnInit(): void {
        combineLatest([
            this.authService.currentUser$,
            this.carService.getCars()
        ])
        .pipe(takeUntilDestroyed(this.destroyRef))  // ← automatyczne czyszczenie
        .subscribe(([user, cars]) => {
            // ... reszta logiki bez zmian
        });
    }
}
```

## Weryfikacja

- [ ] Brak `subscribe(` bez odpowiadającego cleanup w komponentach
- [ ] Narzędzia deweloperskie Angular (profiler) nie pokazują rosnącej liczby subskrypcji
- [ ] Nawigacja tam-i-z-powrotem 10x nie zwiększa użycia pamięci
