# Dostępność (Accessibility) — WCAG 2.1 AA

## Checklist Obecnego Stanu

| Kryterium | Status | Problem |
|-----------|--------|---------|
| Tekst alternatywny (1.1.1) | ❌ | Brak alt na zdjęciach samochodów |
| Kontrast (1.4.3) | ⚠️ | Bootstrap defaults nie zawsze AA |
| Focus indicator (2.4.7) | ❌ | Brak widocznego focus ring |
| Etykiety formularzy (1.3.1) | ⚠️ | Niektóre inputy bez label |
| ARIA dla modali (4.1.2) | ❌ | Brak aria-modal, aria-labelledby |
| Skip navigation (2.4.1) | ❌ | Brak linku skip to content |
| Keyboard trap (2.1.2) | ❌ | Modale nie zarządzają focus |
| Live regions (4.1.3) | ❌ | Brak aria-live dla dynamicznych aktualizacji |

## Naprawy

### Tekst alternatywny
```html
<!-- PRZED: -->
<img [src]="car.image">

<!-- PO: -->
<img [src]="car.image || 'assets/car-placeholder.svg'"
     [alt]="car.brand + ' ' + car.model + ' ' + car.year">
```

### Skip Navigation Link
```html
<!-- index.html — pierwsze w body -->
<a href="#main-content" class="skip-link">Przejdź do treści</a>
<main id="main-content">...</main>
```

```css
.skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: var(--color-primary);
    color: white;
    padding: 8px;
    z-index: 100;
}
.skip-link:focus { top: 0; }
```

### ARIA dla Modali Bootstrap
```html
<!-- PRZED: -->
<div class="modal fade" id="addCarModal">

<!-- PO: -->
<div class="modal fade" id="addCarModal"
     role="dialog"
     aria-modal="true"
     aria-labelledby="addCarModalLabel">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="addCarModalLabel">Dodaj Samochód</h5>
```

### Live Regions dla Dynamicznej Treści
```html
<!-- Dodaj do app.component.html -->
<div aria-live="polite" aria-atomic="true" class="sr-only" id="announcements">
    {{ announcement }}
</div>
```

```typescript
// W serwisie announcements.service.ts
announcement = signal('');
announce(message: string) { this.announcement.set(message); }
```

### Focus Management po Akcjach
```typescript
// Po zamknięciu modalu — przywróć focus do przycisku który go otworzył
@ViewChild('openModalBtn') openModalBtn!: ElementRef;

closeModal() {
    // ...zamknij modal...
    this.openModalBtn.nativeElement.focus();
}
```

## Testing Narzędzia

```bash
# axe-playwright — dodaj do testów Playwright
npm install --save-dev @axe-core/playwright

# W teście:
import { checkA11y } from 'axe-playwright';
await checkA11y(page, '#main-content', {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] }
});
```
