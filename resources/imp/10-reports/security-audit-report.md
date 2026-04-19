# Raport Bezpieczeństwa — OWASP Top 10

**Data:** 2026-03-29  
**Ogólna ocena: D — Wymaga natychmiastowych poprawek**

## OWASP Top 10 Assessment

| # | Kategoria | Ocena | Priorytet |
|---|-----------|-------|-----------|
| A01 | Broken Access Control | ❌ FAIL | HIGH |
| A02 | Cryptographic Failures | 🔴 CRITICAL FAIL | CRITICAL |
| A03 | Injection | ⚠️ PARTIAL PASS | MEDIUM |
| A04 | Insecure Design | ❌ FAIL | HIGH |
| A05 | Security Misconfiguration | ❌ FAIL | HIGH |
| A06 | Vulnerable Components | ⚠️ REVIEW NEEDED | MEDIUM |
| A07 | Identification and Auth Failures | ⚠️ PARTIAL | HIGH |
| A08 | Software and Data Integrity | ❌ FAIL | MEDIUM |
| A09 | Security Logging and Monitoring | ❌ FAIL | MEDIUM |
| A10 | SSRF | ✅ N/A | — |

---

## Szczegóły

### A01 — Broken Access Control ❌
- Brak Angular route guards (INC-010)
- isDealer default=true (INC-002)
- Brak sprawdzania czy użytkownik jest właścicielem zasobu
- **Fix:** AuthGuard, DealerGuard, własnościowe sprawdzenia

### A02 — Cryptographic Failures 🔴 CRITICAL
- Hasła w plaintext w bazie danych (INC-001)
- bcrypt zainstalowany ale nieużywany
- **Fix:** bcrypt.hash() + bcrypt.compare() + migracja haseł

### A03 — Injection ⚠️ PARTIAL
- ✅ express-validator używany do walidacji inputów
- ✅ Sequelize ORM chroni przed SQL injection
- ❌ Brak sanitizacji HTML/XSS dla pól tekstowych
- **Fix:** sanitize-html lub DOMPurify dla pól brand, model itp.

### A04 — Insecure Design ❌
- Brak rate limitingu (INC-005)
- SESSION_SECRET miał hardcoded wartość (naprawione)
- Brak CSRF protection
- **Fix:** express-rate-limit, csurf lub SameSite cookies

### A05 — Security Misconfiguration ❌
- CORS hardcoded (INC-006)
- Brak security headers (Helmet.js)
- Błędy z pełnym stack trace w odpowiedziach (dev mode)
- **Fix:** helmet.js, CORS z env, production error handler

### A07 — Auth Failures ⚠️
- ✅ Session-based auth działa
- ❌ Brak rate limitingu (brute force możliwy)
- ❌ Brak account lockout po N błędnych próbach
- **Fix:** express-rate-limit, opcjonalnie account lockout

### A09 — Security Logging ❌
- Brak logowania nieudanych prób logowania
- Brak alertów bezpieczeństwa
- **Fix:** Winston logger z security events

---

## Macierz Ryzyka

| Podatność | Prawdopodobieństwo | Wpływ | Ryzyko |
|-----------|-------------------|-------|--------|
| Plaintext passwords (INC-001) | Wysokie | Krytyczny | 🔴 CRITICAL |
| Brute force login (INC-005) | Wysokie | Wysoki | 🟠 HIGH |
| isDealer default bug (INC-002) | Niskie | Wysoki | 🟡 MEDIUM |
| Missing route guards (INC-010) | Średnie | Średni | 🟡 MEDIUM |
| Hardcoded CORS (INC-006) | Niskie | Niski | 🔵 LOW |

---

## Plan Naprawy

1. **Sprint 0**: bcrypt (INC-001), isDealer fix (INC-002), rate limiting (INC-005)
2. **Sprint 1**: Helmet.js, CORS fix (INC-006), auth guards (INC-010), CSRF protection
3. **Sprint 2**: Security logging, account lockout, vulnerability scanning
4. **Ongoing**: `npm audit` przy każdym PR, OWASP ZAP w staging
