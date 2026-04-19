# INC-007 — Literówka `brandserch` w CarListComponent

| Pole | Wartość |
|------|---------|
| **ID** | INC-007 |
| **Severity** | 🔵 LOW |
| **Status** | OPEN |
| **Odkryto** | 2026-03-29 |
| **Komponent** | `salon-samochodowy-frontend/src/app/components/car-list/car-list.component.ts` |
| **Linia** | 33 |
| **Sprint naprawy** | Sprint 3 |

## Opis

Właściwość klasy, binding w szablonie i wywołania metod zawierają literówkę `brandserch` zamiast poprawnego `brandSearch`.

## Lokalizacje do Zmiany

| Plik | Lokalizacja | Obecna wartość | Poprawna wartość |
|------|-------------|----------------|------------------|
| `car-list.component.ts` | linia 33 | `brandserch = ""` | `brandSearch = ""` |
| `car-list.component.ts` | linia 133 | parametr `onBrandSearchChange()` | bez zmian (dobra nazwa) |
| `car-list.component.ts` | linia 138 | `this.brandserch.toLowerCase()` | `this.brandSearch.toLowerCase()` |
| `car-list.component.html` | binding | `[(ngModel)]="brandserch"` | `[(ngModel)]="brandSearch"` |

## Naprawa

```typescript
// car-list.component.ts:33
// PRZED:
brandserch = "";
// PO:
brandSearch = "";

// car-list.component.ts:138
// PRZED:
car.brand.toLowerCase().includes(this.brandserch.toLowerCase())
// PO:
car.brand.toLowerCase().includes(this.brandSearch.toLowerCase())
```

```html
<!-- car-list.component.html -->
<!-- PRZED: -->
<input [(ngModel)]="brandserch" ...>
<!-- PO: -->
<input [(ngModel)]="brandSearch" ...>
```
