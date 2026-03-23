# Salon Samochodowy – Dokumentacja testów

Repozytorium: `web-app-test`  
Backend: Node.js / Express / Sequelize (`salon-samochodowy-backend`)  
Frontend: Angular (`salon-samochodowy-frontend`)

---

## Pliki w tym katalogu

| Plik | Opis |
|------|------|
| [all_test_cases.md](all_test_cases.md) | **Główny rejestr** — 150 TC z wszystkich obszarów, spójny format tabeli, odnośniki do implementacji |
| [TESTING.md](TESTING.md) | Instrukcja uruchamiania testów jednostkowych (instalacja, konfiguracja, mechanizm mockowania) |
| [Test-Analysis-and-Concrete-Test-Cases.md](Test-Analysis-and-Concrete-Test-Cases.md) | Analiza QA projektu: ryzyka, priorytety P0/P1/P2, rekomendacje automatyzacji |
| [plan.md](plan.md) | Plan implementacji ujednolicenia wersji i skryptów (backend/frontend) |

---

## Obszary testowe

| Symbol | Obszar | Autor | Plik źródłowy w all_test_cases.md |
|--------|--------|-------|-----------------------------------|
| JZ | Walidacja email / hasło / tworzenie klienta | JZ | Sekcja 1 |
| AG | Dodawanie i edycja samochodów (POST/PUT /cars) | AG | Sekcja 2 |
| NJ | Leasing i zakup | NJ | Sekcja 3 |
| JJ | Wynajem i zwrot samochodu | JJ/JZ | Sekcja 4 |
| TJ | Filtrowanie i usuwanie listy samochodów | TJ | Sekcja 5 |

---

## Testy jednostkowe — skrót

Uruchomienie wszystkich 54 testów:

```bash
cd salon-samochodowy-backend
npm test
```

| Plik | Obszar | Testów |
|------|--------|--------|
| `tests/rental.test.js` | Wynajem / Zwrot (R4, R5 JJ) | 10 |
| `tests/validation.test.js` | Rejestracja / Klient (R1–R3 JZ) | 9 |
| `tests/cars.test.js` | GET + DELETE /cars | 7 |
| `tests/cars_ag.test.js` | POST + PUT /cars (R1–R5 AG) | 15 |
| `tests/leasing.test.js` | Kalkulator leasingowy (R1–R3 NJ) | 13 |
| **Łącznie** | | **54** |

Szczegóły → [TESTING.md](TESTING.md)
