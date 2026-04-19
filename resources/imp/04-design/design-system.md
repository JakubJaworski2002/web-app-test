# System Designu — Salon Samochodowy

## Design Tokens (CSS Variables)

```css
/* salon-samochodowy-frontend/src/styles.css */
:root {
  /* === KOLORY === */
  --color-primary:          #1a237e;  /* Deep Navy */
  --color-primary-light:    #534bae;
  --color-primary-dark:     #000051;
  --color-secondary:        #e53935;  /* Red Accent */
  --color-secondary-light:  #ff6f60;
  --color-secondary-dark:   #ab000d;
  --color-success:          #2e7d32;
  --color-warning:          #f57f17;
  --color-error:            #c62828;
  --color-background:       #f5f5f5;
  --color-surface:          #ffffff;
  --color-text-primary:     #212121;
  --color-text-secondary:   #757575;
  --color-border:           #e0e0e0;

  /* === SPACING (base: 4px) === */
  --space-1: 4px;    --space-2: 8px;    --space-3: 12px;
  --space-4: 16px;   --space-6: 24px;   --space-8: 32px;
  --space-12: 48px;  --space-16: 64px;

  /* === BORDER RADIUS === */
  --radius-sm: 4px;   --radius-md: 8px;   --radius-lg: 16px;

  /* === SHADOWS === */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.12);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.16);
  --shadow-lg: 0 10px 20px rgba(0,0,0,0.19);

  /* === TRANSITIONS === */
  --transition-fast:     150ms ease;
  --transition-standard: 300ms ease;

  /* === TYPOGRAPHY === */
  --font-heading: 'Roboto Slab', serif;
  --font-body:    'Roboto', sans-serif;
  --font-size-xs: 0.75rem;   /* 12px */
  --font-size-sm: 0.875rem;  /* 14px */
  --font-size-md: 1rem;      /* 16px */
  --font-size-lg: 1.25rem;   /* 20px */
  --font-size-xl: 1.5rem;    /* 24px */
  --font-size-2xl: 2rem;     /* 32px */
}
```

## Komponenty

### Car Card (nowy design)
```css
.car-card {
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-fast);
  overflow: hidden;
  background: var(--color-surface);
}
.car-card:hover { box-shadow: var(--shadow-lg); }
.car-card__image { height: 200px; object-fit: cover; width: 100%; }
.car-card__badge {
  position: absolute; top: var(--space-2); right: var(--space-2);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
}
.badge-available   { background: var(--color-success); color: white; }
.badge-rented      { background: var(--color-warning); color: black; }
.badge-sold        { background: var(--color-text-secondary); color: white; }
```

### Przyciski
```css
.btn-primary   { background: var(--color-primary); color: white; }
.btn-secondary { background: var(--color-secondary); color: white; }
.btn-danger    { background: var(--color-error); color: white; }
.btn-ghost     { background: transparent; border: 1px solid var(--color-primary); color: var(--color-primary); }

/* Wszystkie przyciski */
.btn {
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  padding: var(--space-2) var(--space-4);
}
```

## Breakpoints (Bootstrap 5)

| Breakpoint | px | Kolumny kart |
|------------|-----|--------------|
| xs (mobile) | < 576 | 1 kolumna |
| sm (tablet portrait) | ≥ 576 | 2 kolumny |
| md (tablet) | ≥ 768 | 2 kolumny |
| lg (desktop) | ≥ 992 | 3 kolumny |
| xl (large desktop) | ≥ 1200 | 4 kolumny |

## Ikony (Material Icons)

| Akcja | Ikona |
|-------|-------|
| Dodaj samochód | `add_circle` |
| Edytuj | `edit` |
| Usuń | `delete` |
| Wynajmij | `car_rental` |
| Kup | `shopping_cart` |
| Leasing | `calculate` |
| Zwróć | `assignment_return` |
| Zaloguj się | `login` |
| Wyloguj się | `logout` |
| Klienci | `people` |
