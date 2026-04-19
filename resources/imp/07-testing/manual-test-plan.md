# Plan Testów Manualnych

## TC-001: Przeglądanie Listy Samochodów

**Priorytet:** Wysoki | **Typ:** Funkcjonalny

| Krok | Akcja | Oczekiwany Wynik |
|------|-------|-----------------|
| 1 | Otwórz http://localhost:4200/cars | Lista samochodów widoczna |
| 2 | Sprawdź czy karty zawierają markę, model, rok, cenę | Wszystkie pola wyświetlane |
| 3 | Sprawdź placeholder dla samochodów bez zdjęcia | Placeholder widoczny |

---

## TC-002: Filtrowanie po Marce

| Krok | Akcja | Oczekiwany Wynik |
|------|-------|-----------------|
| 1 | Wpisz "Toyota" w pole wyszukiwania | Lista zawiera tylko Toyoty |
| 2 | Wyczyść pole | Wszystkie samochody powracają |
| 3 | Wpisz nieistniejącą markę "XYZ" | Komunikat "Brak wyników" |

---

## TC-003: Rejestracja Nowego Użytkownika

| Krok | Akcja | Oczekiwany Wynik |
|------|-------|-----------------|
| 1 | Kliknij "Zarejestruj się" | Modal rejestracji otwarty |
| 2 | Wypełnij wszystkie pola poprawnymi danymi | Formularz przyjmuje dane |
| 3 | Kliknij "Zarejestruj" | Sukces, auto-login |
| 4 | Spróbuj zarejestrować istniejącą nazwę | Błąd: "Nazwa zajęta" |

---

## TC-004: Logowanie Admina

| Krok | Akcja | Oczekiwany Wynik |
|------|-------|-----------------|
| 1 | Kliknij "Zaloguj się" | Modal logowania |
| 2 | Wpisz admin / Admin1! | Logowanie sukces |
| 3 | Sprawdź navbar | Widoczne opcje dealera |
| 4 | Odśwież stronę | Sesja zachowana |

---

## TC-005: Logowanie z Błędnymi Danymi

| Krok | Akcja | Oczekiwany Wynik |
|------|-------|-----------------|
| 1 | Wpisz admin / wrongpassword | Komunikat błędu |
| 2 | Wpisz nieistniejący user | Komunikat błędu |
| 3 | Sprawdź czy aplikacja nie crashuje | Aplikacja działa dalej |

---

## TC-006: Wylogowanie

| Krok | Akcja | Oczekiwany Wynik |
|------|-------|-----------------|
| 1 | Zaloguj jako admin | Zalogowany |
| 2 | Kliknij "Wyloguj się" | Sesja zakończona |
| 3 | Opcje dealera znikają z navbar | ✅ |

---

## TC-007: Wynajem Samochodu (jako zalogowany)

| Krok | Akcja | Oczekiwany Wynik |
|------|-------|-----------------|
| 1 | Zaloguj jako niedealer | Zalogowany |
| 2 | Kliknij "Wynajmij" na dostępnym samochodzie | Modal wynajmu |
| 3 | Zatwierdź wynajem | Samochód oznaczony jako wynajęty |
| 4 | Spróbuj wynająć już wynajęty | Przycisk nieaktywny lub błąd |

---

## TC-008: Wynajem bez Logowania

| Krok | Akcja | Oczekiwany Wynik |
|------|-------|-----------------|
| 1 | Niezalogowany użytkownik | Brak "Wynajmij" lub przekierowanie do logowania |

---

## TC-009: Dodawanie Samochodu (Dealer)

| Krok | Akcja | Oczekiwany Wynik |
|------|-------|-----------------|
| 1 | Zaloguj jako admin | Zalogowany |
| 2 | Kliknij "+ Dodaj Samochód" | Formularz |
| 3 | Wypełnij markę, model, rok, cenę | Dane przyjęte |
| 4 | Zapisz | Samochód pojawia się na liście |

---

## TC-010: Walidacja Formularza Dodawania

| Krok | Akcja | Oczekiwany Wynik |
|------|-------|-----------------|
| 1 | Otwórz formularz dodawania | Formularz pusty |
| 2 | Wyślij pusty formularz | Błędy walidacji na wymaganych polach |
| 3 | Wpisz ujemną cenę | Błąd walidacji |

---

## TC-011: Edycja Samochodu (Dealer)

| Krok | Akcja | Oczekiwany Wynik |
|------|-------|-----------------|
| 1 | Zaloguj jako dealer | Zalogowany |
| 2 | Kliknij "Edytuj" na własnym samochodzie | Formularz z danymi |
| 3 | Zmień cenę | Nowa cena na liście |

---

## TC-012: Usuwanie Samochodu (Dealer)

| Krok | Akcja | Oczekiwany Wynik |
|------|-------|-----------------|
| 1 | Zaloguj jako dealer | Zalogowany |
| 2 | Kliknij "Usuń" na własnym samochodzie | Potwierdzenie |
| 3 | Zatwierdź | Samochód usunięty z listy |

---

## TC-013: Kalkulacja Leasingu

| Krok | Akcja | Oczekiwany Wynik |
|------|-------|-----------------|
| 1 | Otwórz szczegóły samochodu | Formularz leasingu widoczny |
| 2 | Wpisz wkład własny 20 000 PLN | Rata miesięczna przeliczona |
| 3 | Zmień liczbę rat | Rata aktualizuje się |

---

## TC-014: Polityka Prywatności

| Krok | Akcja | Oczekiwany Wynik |
|------|-------|-----------------|
| 1 | Kliknij link polityki prywatności | Strona /privacy-policy |
| 2 | Sprawdź zawartość | Tekst polityki widoczny |
| 3 | Kliknij "Powrót" | Powrót do listy |

---

## TC-015: Responsywność (Mobile)

| Krok | Akcja | Oczekiwany Wynik |
|------|-------|-----------------|
| 1 | Otwórz na 375px (iPhone SE) | Aplikacja nie łamie layoutu |
| 2 | Sprawdź navbar | Hamburger menu lub kolaps |
| 3 | Sprawdź siatka kart | 1 karta na wiersz |

---

## Defekty Znalezione

| ID | TC | Opis | Priorytet | Status |
|----|-----|------|-----------|--------|
| BUG-001 | TC-007 | alert() zamiast Material dialog przy błędach | Niski | Open |
| BUG-002 | TC-003 | Brak walidacji siły hasła na froncie | Średni | Open |
| BUG-003 | TC-008 | Wynajmij widoczny bez logowania (500 error) | Wysoki | Open |
