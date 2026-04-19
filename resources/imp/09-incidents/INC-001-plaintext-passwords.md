# INC-001 — Hasła Użytkowników Przechowywane w Postaci Jawnego Tekstu

| Pole | Wartość |
|------|---------|
| **ID** | INC-001 |
| **Severity** | 🔴 CRITICAL |
| **Status** | OPEN |
| **Odkryto** | 2026-03-29 (audyt kodu) |
| **Komponent** | `salon-samochodowy-backend/server.js` |
| **Linie** | 107 (register), 156 (login) |
| **Sprint naprawy** | Sprint 0 |
| **Właściciel** | Backend Developer |

---

## Opis Problemu

Hasła użytkowników są przechowywane w bazie danych i porównywane podczas logowania **w postaci jawnego tekstu (plaintext)** — bez żadnego haszowania. Pakiet `bcrypt` jest zainstalowany w `package.json` (`"bcrypt": "^5.1.1"`), ale **nigdy nie został użyty**.

## Dowód — Obecny Kod (Niebezpieczny)

```javascript
// server.js:106-113 — REJESTRACJA (hasło zapisywane jako plaintext!)
const newUser = await User.create({
    username,
    email,
    password,        // ← PLAINTEXT! Brak bcrypt.hash()
    firstName,
    lastName,
    isDealer: false
});

// server.js:155-157 — LOGOWANIE (porównanie plaintext!)
if (user.password !== password) {   // ← PLAINTEXT! Brak bcrypt.compare()
    return res.status(400).json({ error: 'Nieprawidłowa nazwa użytkownika lub hasło' });
}
```

## Wpływ

- **Wyciek bazy danych** → wszystkie hasła użytkowników natychmiast widoczne w plaintext
- **Naruszenie RODO** → dane osobowe (hasła) przechowywane bez odpowiedniego szyfrowania
- **Ocena OWASP Top 10** → A02:2021 Cryptographic Failures — **CRITICAL FAIL**
- Atakujący z dostępem do pliku `.sqlite` zna hasła wszystkich użytkowników od razu
- Admin password `Admin1!` widoczny w bazie bez żadnego zabezpieczenia

## Przyczyna Źródłowa

Pakiet `bcrypt` dodany do `package.json` ale deweloper nie zintegrował go z logiką autentykacji podczas tworzenia aplikacji. Komentarz w kodzie (`// Tworzenie nowego użytkownika (bez haszowania hasła)`) wskazuje, że był to świadomy tymczasowy skrót, który nigdy nie został usunięty.

---

## Plan Naprawy

### Krok 1 — Import bcrypt (server.js, góra pliku)

```javascript
import bcrypt from 'bcrypt';
const SALT_ROUNDS = 12; // 12 rounds = ~300ms na nowoczesnym CPU — dobry balans
```

### Krok 2 — Popraw rejestrację (server.js ~linia 107)

```javascript
// PRZED (niebezpieczne):
const newUser = await User.create({
    username, email, password, firstName, lastName, isDealer: false
});

// PO (bezpieczne):
const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
const newUser = await User.create({
    username,
    email,
    password: hashedPassword,   // ← zahaszowane hasło
    firstName,
    lastName,
    isDealer: false
});
```

### Krok 3 — Popraw logowanie (server.js ~linia 155)

```javascript
// PRZED (niebezpieczne):
if (user.password !== password) {
    return res.status(400).json({ error: 'Nieprawidłowa nazwa użytkownika lub hasło' });
}

// PO (bezpieczne):
const isPasswordValid = await bcrypt.compare(password, user.password);
if (!isPasswordValid) {
    return res.status(400).json({ error: 'Nieprawidłowa nazwa użytkownika lub hasło' });
}
```

### Krok 4 — Migracja istniejących haseł (skrypt jednorazowy)

```javascript
// migrate-passwords.js — uruchom JEDNORAZOWO: node migrate-passwords.js
import { User } from './models.js';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

try {
    const users = await User.findAll();
    let migrated = 0;

    for (const user of users) {
        // Hasło bcrypt ma zawsze 60 znaków i zaczyna się od '$2b$'
        if (!user.password.startsWith('$2b$')) {
            const hashed = await bcrypt.hash(user.password, SALT_ROUNDS);
            await user.update({ password: hashed });
            console.log(`✅ Migrated: ${user.username}`);
            migrated++;
        } else {
            console.log(`⏭️  Already hashed: ${user.username}`);
        }
    }

    console.log(`\nMigracja zakończona. Zmigrowano ${migrated} użytkowników.`);
} catch (err) {
    console.error('Błąd migracji:', err);
}
```

> ⚠️ **Ważne**: Uruchom skrypt migracji **przed** wdrożeniem nowego kodu auth, inaczej istniejący admin (`admin`/`Admin1!`) nie będzie mógł się zalogować.

---

## Weryfikacja Naprawy

- [ ] Po rejestracji: pole `password` w DB zaczyna się od `$2b$12$` (60 znaków)
- [ ] `POST /login` z poprawnymi danymi → odpowiedź `200 OK`
- [ ] `POST /login` z błędnym hasłem → odpowiedź `400`
- [ ] Admin `admin`/`Admin1!` loguje się poprawnie po migracji
- [ ] Test Playwright A07 (auth-api.spec.ts) przechodzi
- [ ] Test Playwright S01 (admin-storagestate.spec.ts) przechodzi

---

## Powiązane Dokumenty

- [INC-002](INC-002-isDealer-default-true.md) — kolejny problem bezpieczeństwa
- [05-backend-improvements/security-fixes.md](../05-backend-improvements/security-fixes.md)
- [10-reports/security-audit-report.md](../10-reports/security-audit-report.md)
