# Wireframes — Opisy Ekranów

## Ekran 1: Lista Samochodów (/cars)

```
┌─────────────────────────────────────────────────────────┐
│ 🚗 Salon Samochodowy        [Zaloguj się] [Zarejestruj] │  ← Navbar
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [🔍 Szukaj po marce...    ×]  [Cena ▼] [Sortuj ▼]     │  ← Filtry
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                │
│  │  [foto]  │ │  [foto]  │ │  [foto]  │                │  ← Siatka 3 kol.
│  │ Toyota   │ │  BMW     │ │  Audi    │                │
│  │ Camry    │ │  530d    │ │  A4      │                │
│  │ 2023     │ │  2022    │ │  2023    │                │
│  │ 💰 120k  │ │ 💰 180k  │ │ 💰 155k  │                │
│  │ 🐎 150KM │ │ 🐎 265KM │ │ 🐎 200KM │                │
│  │✅Dostępny│ │🟡Wynajęty│ │✅Dostępny│                │
│  │[Wynajmij]│ │[Szczeg.] │ │[Wynajmij]│                │
│  └──────────┘ └──────────┘ └──────────┘                │
│                                                          │
│              [1] [2] [3] ... [5]  ← Paginacja           │
├─────────────────────────────────────────────────────────┤
│ © 2026 Salon Samochodowy | Polityka prywatności         │  ← Footer
└─────────────────────────────────────────────────────────┘

DEALER widzi dodatkowo:
  [+ Dodaj Samochód]  [Zarządzaj Klientami]  w Navbar
  [✏️ Edytuj] [🗑️ Usuń]  na każdej karcie
```

---

## Ekran 2: Szczegóły Samochodu (/cars/:id)

```
┌─────────────────────────────────────────────────────────┐
│ Navbar                                                   │
├─────────────────────────────────────────────────────────┤
│ 🏠 > 🚗 Lista > Toyota Camry  ← Breadcrumb             │
│                                                          │
│ ┌──────────────────────┐  ┌─────────────────────────┐  │
│ │                      │  │  Toyota Camry 2023       │  │
│ │   DUŻE ZDJĘCIE       │  │  ─────────────────────  │  │
│ │   (lub placeholder)  │  │  🐎 Moc: 150 KM          │  │
│ │                      │  │  💰 Cena: 120 000 PLN    │  │
│ │                      │  │  📅 Rok: 2023             │  │
│ │                      │  │  VIN: TOY123...           │  │
│ └──────────────────────┘  │  ✅ Dostępny do wynajmu  │  │
│                            │  ─────────────────────  │  │
│                            │  [Wynajmij]              │  │
│                            │  [Kup za 120 000 PLN]    │  │
│                            │  [Oblicz Leasing ▼]      │  │
│                            └─────────────────────────┘  │
│                                                          │
│ [← Powrót do listy]                                     │
└─────────────────────────────────────────────────────────┘
```

---

## Ekran 3: Modal Logowania

```
┌──────────────────────────────────┐
│  Logowanie / Rejestracja       ✕ │
├──────────────────────────────────┤
│  [  Logowanie  ] [Rejestracja]   │  ← Tabs
├──────────────────────────────────┤
│                                  │
│  Nazwa użytkownika               │
│  ┌────────────────────────────┐  │
│  │ admin                      │  │
│  └────────────────────────────┘  │
│                                  │
│  Hasło                           │
│  ┌────────────────────────────┐  │
│  │ ••••••••             👁    │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │      Zaloguj się           │  │  ← Primary button
│  └────────────────────────────┘  │
│                                  │
│  ❌ Nieprawidłowe dane (if error) │
└──────────────────────────────────┘
```

---

## Ekran 4: Dashboard Dealera (do stworzenia)

```
┌─────────────────────────────────────────────────────────┐
│ Navbar (Witaj, Admin! | Wyloguj się)                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │    45    │  │    12    │  │     8    │  │   25   │ │
│  │ Samochodów│  │ Wynajętych│  │Sprzedanych│  │Klientów│ │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘ │
│                                                          │
│  [+ Dodaj Samochód]  [Zarządzaj Klientami]              │
│                                                          │
│  Ostatnie Transakcje                                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Jan K. — wynajem Toyota Camry   2026-03-29       │  │
│  │ Anna M. — zakup BMW 530d         2026-03-28       │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```
