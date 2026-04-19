# INC-008 — Użycie `alert()` Zamiast Komponentów Angular

| Pole | Wartość |
|------|---------|
| **ID** | INC-008 |
| **Severity** | 🟡 MEDIUM |
| **Status** | OPEN |
| **Odkryto** | 2026-03-29 |
| **Komponent** | `car-list`, `buy-car`, `rent-car` components |
| **Sprint naprawy** | Sprint 3 |

## Opis

Kilka komponentów Angular używa natywnych funkcji `alert()` i `confirm()` przeglądarki zamiast właściwych komponentów Angular Material. Jest to zła praktyka:
- Blokuje wątek JavaScript
- Nie można stylować
- Niedostępne (accessibility)
- Nie pasuje do reszty UI

## Lokalizacje

```typescript
// car-list.component.ts:113
alert('Nie masz uprawnień do usuwania samochodów.');

// car-list.component.ts:115
if (confirm('Czy na pewno chcesz usunąć ten samochód?')) {

// car-list.component.ts:123
alert('Samochód został usunięty.');

// car-list.component.ts:127
alert('Wystąpił błąd podczas usuwania samochodu.');
```

## Naprawa

```typescript
// 1. Dodaj MatSnackBarModule do importów komponentu
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

// 2. Wstrzyknij w konstruktorze
constructor(
    private carService: CarService,
    private authService: AuthenticationService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
) {}

// 3. Zastąp alert() przez snackBar
// PRZED:
alert('Samochód został usunięty.');
// PO:
this.snackBar.open('Samochód został usunięty.', 'OK', {
    duration: 3000,
    panelClass: ['snack-success']
});

// 4. Zastąp confirm() przez MatDialog lub window.confirm jako tymczasowe
// (docelowo: ConfirmDialogComponent)
```

## Weryfikacja

- [ ] Brak `alert(` w całym projekcie frontend (`grep -r "alert(" src/`)
- [ ] Brak `confirm(` w całym projekcie frontend
- [ ] Snackbar pojawia się po akcji usunięcia samochodu
- [ ] Snackbar nie blokuje UI
