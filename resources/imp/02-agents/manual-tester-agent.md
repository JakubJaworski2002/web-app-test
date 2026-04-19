# Agent: Manual QA Tester

## Profil Roli

| Atrybut | Wartość |
|---------|---------|
| **Rola** | Manual QA Tester |
| **Odpowiada za** | Testy eksploracyjne, regresja, raporty błędów |

---

## Szablon Bug Report

```markdown
**ID:** BUG-XXX
**Tytuł:** Krótki opis problemu
**Severity:** CRITICAL / HIGH / MEDIUM / LOW
**Status:** New / In Progress / Fixed / Verified
**Środowisko:** localhost / staging / production
**Przeglądarka:** Chrome X / Firefox X / Safari X
**Data:** YYYY-MM-DD

**Kroki do reprodukcji:**
1. Otwórz http://localhost:4200
2. Kliknij ...
3. Wypełnij formularz ...
4. Kliknij przycisk ...

**Oczekiwany rezultat:**
[Co powinno się stać]

**Aktualny rezultat:**
[Co faktycznie się stało]

**Zrzut ekranu / nagranie:**
[Załącz plik]

**Logi konsoli / sieciowe:**
[Wklej błędy z DevTools]
```

---

## Smoke Test Checklist (przed każdym testem)

- [ ] Backend uruchomiony (`node server.js` na port 3000)
- [ ] Frontend uruchomiony (`ng serve` na port 4200)
- [ ] http://localhost:4200 otwiera aplikację
- [ ] http://localhost:3000 zwraca "Witamy w API"
- [ ] Login jako admin (`admin` / `Admin1!`) działa
- [ ] Lista samochodów wyświetla się po rozwinięciu
- [ ] Logout działa

---

## Plan Testów Manualnych (30 przypadków)

| TC | Tytuł | Priorytet |
|----|-------|-----------|
| TC-001 | Logowanie poprawne jako admin | CRITICAL |
| TC-002 | Logowanie błędne hasło → błąd 400 | HIGH |
| TC-003 | Rejestracja nowego konta | HIGH |
| TC-004 | Rejestracja zduplikowana nazwa → błąd | MEDIUM |
| TC-005 | Wylogowanie niszczy sesję | HIGH |
| TC-006 | Lista samochodów jako anonimowy | HIGH |
| TC-007 | Filtrowanie po marce | MEDIUM |
| TC-008 | Sortowanie po cenie rosnąco | MEDIUM |
| TC-009 | Sortowanie po mocy silnika | LOW |
| TC-010 | Widok szczegółów samochodu `/cars/:id` | HIGH |
| TC-011 | Dodaj samochód (dealer) — pola wymagane | HIGH |
| TC-012 | Dodaj samochód — błędny VIN (nie 17 znaków) | MEDIUM |
| TC-013 | Edytuj samochód (dealer) | MEDIUM |
| TC-014 | Usuń samochód (dealer) | HIGH |
| TC-015 | Usuń samochód (klient) → błąd 403 | HIGH |
| TC-016 | Wynajmij dostępny samochód | HIGH |
| TC-017 | Wynajmij wynajęty samochód → błąd | HIGH |
| TC-018 | Zwróć wynajęty samochód | HIGH |
| TC-019 | Kalkulator leasingu — prawidłowe dane | MEDIUM |
| TC-020 | Kalkulator leasingu — wpłata > cena → błąd | MEDIUM |
| TC-021 | Kup samochód | HIGH |
| TC-022 | Lista klientów (dealer) | MEDIUM |
| TC-023 | Dodaj klienta (dealer) | MEDIUM |
| TC-024 | Edytuj klienta | MEDIUM |
| TC-025 | Usuń klienta | MEDIUM |
| TC-026 | Upload zdjęcia samochodu | MEDIUM |
| TC-027 | Nawigacja do `/cars/:id` i powrót | LOW |
| TC-028 | Polityka prywatności `/privacy-policy` | LOW |
| TC-029 | Dostęp do API bez sesji → 401 | HIGH |
| TC-030 | Responsywność na mobile (iPhone viewport) | MEDIUM |

---

## Reusable Prompt

```
Jesteś doświadczonym Manual QA Testerem projektu "Salon Samochodowy".

APLIKACJA: http://localhost:4200 (Angular 19)
API: http://localhost:3000 (Express.js)
ADMIN: username=admin, password=Admin1!
FUNKCJONALNOŚCI: logowanie, lista samochodów, dodawanie/edycja/usuwanie, wynajem, leasing, zakup, zarządzanie klientami

Twoje zadanie: [OPISZ SCENARIUSZ DO PRZETESTOWANIA]

Podaj:
- Szczegółowe kroki testowe
- Oczekiwane rezultaty
- Edge cases do sprawdzenia
- Klasyfikację znalezionego problemu (jeśli dotyczy)
```
