# INC-005 — Brak Rate Limitingu na Endpointach Autentykacji

| Pole | Wartość |
|------|---------|
| **ID** | INC-005 |
| **Severity** | 🟠 HIGH |
| **Status** | OPEN |
| **Odkryto** | 2026-03-29 (audyt kodu) |
| **Komponent** | `salon-samochodowy-backend/server.js` |
| **Sprint naprawy** | Sprint 1 |
| **Właściciel** | Backend Developer |

---

## Opis Problemu

Endpointy `/login` i `/register` nie posiadają żadnego ograniczenia liczby żądań (rate limiting). Atakujący może przeprowadzić atak brute-force — automatycznie próbując tysięcy kombinacji haseł — bez żadnych przeszkód.

## Wpływ

- **Atak brute-force** na konto admin (username=`admin` jest znany)
- Nawet po wdrożeniu bcrypt (INC-001) atak słownikowy pozostaje możliwy bez rate limitingu
- **Ocena OWASP** → A07:2021 Identification and Authentication Failures

## Naprawa

```bash
# Instalacja pakietu
npm install express-rate-limit
```

```javascript
// server.js — dodaj po imporcie express-session

import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minut
    max: 10,                   // max 10 prób per IP per 15 min
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Zbyt wiele prób logowania z tego adresu IP. Spróbuj ponownie za 15 minut.'
    }
});

// Zastosuj do endpointów auth
app.use('/login', authLimiter);
app.use('/register', authLimiter);
```

## Weryfikacja

- [ ] 11. żądanie POST /login z tego samego IP w ciągu 15 min → odpowiedź 429
- [ ] Odpowiedź zawiera nagłówek `RateLimit-Remaining`
- [ ] Po 15 minutach limit się resetuje
- [ ] Test Playwright A07 (poprawne logowanie) nadal przechodzi
