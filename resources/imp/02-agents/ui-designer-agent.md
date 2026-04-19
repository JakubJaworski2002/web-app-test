# Agent: UI Designer

## Profil Roli

| Atrybut | Wartość |
|---------|---------|
| **Rola** | UI Designer / Visual Designer |
| **Stack** | CSS, Bootstrap 5 customization, Angular Material theming |
| **Odpowiada za** | Design system, komponenty wizualne, responsywność |

---

## Design System — Tokeny

```css
/* styles.css — globalne CSS variables */
:root {
  /* Kolory */
  --color-primary:          #1a237e;  /* Deep Navy — zaufanie, profesjonalizm */
  --color-primary-light:    #534bae;
  --color-primary-dark:     #000051;
  --color-secondary:        #e53935;  /* Czerwony akcent — energia, akcja */
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

  /* Spacing (4px base) */
  --space-1: 4px;   --space-2: 8px;   --space-3: 12px;
  --space-4: 16px;  --space-6: 24px;  --space-8: 32px;
  --space-12: 48px; --space-16: 64px;

  /* Border radius */
  --radius-sm: 4px;  --radius-md: 8px;  --radius-lg: 16px;

  /* Shadows */
  --shadow-sm:  0 1px 3px rgba(0,0,0,0.12);
  --shadow-md:  0 4px 6px rgba(0,0,0,0.16);
  --shadow-lg:  0 10px 20px rgba(0,0,0,0.19);

  /* Transitions */
  --transition-fast:     150ms ease;
  --transition-standard: 300ms ease;

  /* Typography */
  --font-heading: 'Roboto Slab', serif;
  --font-body:    'Roboto', sans-serif;
}
```

---

## Specyfikacja Komponentów

### Car Card (Redesign)
```html
<!-- Nowy wygląd karty samochodu -->
<div class="car-card">
  <div class="car-card__image">
    <img [src]="car.image || 'assets/car-placeholder.svg'" [alt]="car.brand + ' ' + car.model">
    <span class="car-card__badge" [class]="availabilityClass">
      {{ car.isAvailableForRent ? 'Dostępny' : 'Wynajęty' }}
    </span>
  </div>
  <div class="car-card__body">
    <h5 class="car-card__title">{{ car.brand }} {{ car.model }}</h5>
    <p class="car-card__year">{{ car.year }}</p>
    <div class="car-card__specs">
      <span>🐎 {{ car.horsePower }} KM</span>
      <span>💰 {{ car.price | currency:'PLN' }}</span>
    </div>
  </div>
  <div class="car-card__actions">
    <button class="btn btn-primary btn-sm">Wynajmij</button>
    <button class="btn btn-outline-secondary btn-sm">Szczegóły</button>
  </div>
</div>
```

### Przyciski (Button System)
```css
.btn-primary    { background: var(--color-primary); }
.btn-secondary  { background: var(--color-secondary); }
.btn-danger     { background: var(--color-error); }
.btn-ghost      { background: transparent; border: 1px solid var(--color-primary); }
```

### Badges (Status)
```html
<span class="badge bg-success">Dostępny</span>
<span class="badge bg-warning text-dark">Wynajęty</span>
<span class="badge bg-secondary">Sprzedany</span>
```

---

## Znane Problemy Wizualne

| Problem | Gdzie | Rozwiązanie |
|---------|-------|-------------|
| Brak obrazów samochodów | car-list, car-detail | Placeholder SVG + lazy loading |
| Szary domyślny Bootstrap | Cała aplikacja | CSS variables + custom theme |
| Brak spójnego systemu spacingów | Formularze, modalne | Klasy Bootstrapowe + custom |
| Nieczytelne etykiety błędów | Formularze | `invalid-feedback` Bootstrap |
| Brak dark mode | Cała aplikacja | CSS variables + @media prefers-color-scheme |

---

## Reusable Prompt

```
Jesteś doświadczonym UI Designerem projektu "Salon Samochodowy".

STACK: Angular 19, Bootstrap 5, Angular Material, CSS Variables
DESIGN TOKENS: (patrz sekcja "Design System — Tokeny" powyżej)
KOMPONENTY DO PRZEPROJEKTOWANIA: car card, navbar, login form, car detail

Twoje zadanie: [OPISZ KOMPONENT / ZMIANĘ WIZUALNĄ]

Podaj:
- HTML template (Angular)
- CSS (używaj CSS variables z design system)
- Before/after porównanie
- Responsywność (mobile-first)
```
