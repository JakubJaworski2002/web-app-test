# INC-002 — Domyślna Wartość `isDealer` Ustawiona na `true`

| Pole | Wartość |
|------|---------|
| **ID** | INC-002 |
| **Severity** | 🟠 HIGH |
| **Status** | OPEN |
| **Odkryto** | 2026-03-29 (audyt kodu) |
| **Komponent** | `salon-samochodowy-backend/models.js` |
| **Linia** | 178 |
| **Sprint naprawy** | Sprint 0 |
| **Właściciel** | Backend Developer / Database Engineer |

---

## Opis Problemu

W definicji modelu `User` pole `isDealer` ma ustawioną wartość domyślną `true`. Każdy nowo tworzony użytkownik, o ile nie zostanie jawnie przekazane `isDealer: false`, automatycznie otrzymuje uprawnienia dealera.

## Dowód

```javascript
// models.js:177-180
isDealer: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,   // ← BŁĄd BEZPIECZEŃSTWA! powinno być: false
},
```

## Wpływ

- Błąd dewelopera przy `User.create({})` bez jawnego `isDealer: false` → konto dealera
- Skrypty seed / testy mogą tworzyć użytkowników z niewłaściwymi uprawnieniami
- Naruszenie zasady **least privilege**
- Potencjalnie: klient rejestruje się i zdobywa uprawnienia do dodawania/usuwania samochodów

## Aktualne Zabezpieczenie (Częściowe)

`POST /register` jawnie ustawia `isDealer: false` (server.js:113):
```javascript
isDealer: false  // explicite ustawione — chwilowe zabezpieczenie
```
Jednak nie chroni to przed bezpośrednimi wywołaniami `User.create()` w innych miejscach kodu, testach lub migracjach.

---

## Naprawa (1 linia kodu)

```javascript
// models.js:177-180
// PRZED:
isDealer: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
},

// PO:
isDealer: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,   // ← bezpieczna wartość domyślna
},
```

## Weryfikacja

- [ ] `User.create({ username, email, password, firstName, lastName })` → `isDealer: false`
- [ ] `POST /register` z nowym kontem → odpowiedź zawiera `isDealer: false`
- [ ] Admin `admin` nadal ma `isDealer: true` (ta zmiana nie wpływa na istniejące rekordy)
- [ ] Testy Playwright S01-S06 (admin-storagestate) nadal przechodzą
