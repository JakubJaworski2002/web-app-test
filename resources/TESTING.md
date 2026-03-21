# Instrukcja uruchamiania testów jednostkowych – Salon Samochodowy Backend

## Wymagania

- Node.js >= 18
- npm

## Instalacja

```bash
cd salon-samochodowy-backend
npm install
```

## Uruchomienie

Wszystkie testy jednym poleceniem:

```bash
npm test
```

## Pliki testowe

| Plik | Obszar | Testów | Źródło TC |
|------|--------|--------|-----------|
| `tests/rental.test.js` | Wynajem / Zwrot | 10 | JJ (R4, R5) |
| `tests/validation.test.js` | Rejestracja / Klient | 9 | JZ (R1–R3) |
| `tests/cars.test.js` | GET + DELETE /cars | 7 | TJ |
| `tests/cars_ag.test.js` | POST + PUT /cars | 15 | AG (R1–R5) |
| `tests/leasing.test.js` | Kalkulator leasingowy | 13 | NJ (R1–R3) |
| **Łącznie** | | **54** | |

## Technologia

- **Jest** — framework testowy, tryb ESM (`--experimental-vm-modules`)
- **Supertest** — testy HTTP na realnych endpointach z `server.js`
- **`jest.unstable_mockModule`** — mockowanie modeli Sequelize i `express-session`

## Mechanizm mockowania

### Baza danych
Modele Sequelize (`Car`, `User`) zastępowane są przez obiekty z `jest.fn()`. Każdy test ustawia zachowanie przez `mockResolvedValue(...)`.

### Sesja użytkownika
`express-session` jest zamockowane — middleware czyta nagłówek `x-test-user-id`:

| Nagłówek | Stan |
|----------|------|
| `x-test-user-id: 1` | Zalogowany użytkownik (userId = 1) |
| *(brak nagłówka)* | Niezalogowany → 401 |

## Konfiguracja

| Plik | Rola |
|------|------|
| `jest.config.cjs` | Konfiguracja Jest (ESM, pattern `*.test.js`) |
| `leasing.utils.js` | Logika kalkulatora leasingowego (testowana bezpośrednio, bez HTTP) |
| `server.js` | Eksportuje `app`; `listen` nie jest wywoływany gdy `NODE_ENV=test` |

## Pokryte wymagania

| Wymaganie | Opis | Plik testów |
|-----------|------|-------------|
| R4 JJ | Wynajem — autoryzacja, dostępność, walidacja | `rental.test.js` |
| R5 JJ | Zwrot — uprawnienia, stany, 404 | `rental.test.js` |
| R1 JZ | Walidacja loginu przy rejestracji | `validation.test.js` |
| R2 JZ | Walidacja hasła przy rejestracji | `validation.test.js` |
| R3 JZ | Tworzenie klienta przez admina | `validation.test.js` |
| R1 AG | Sesja przy POST/PUT /cars | `cars_ag.test.js` |
| R2 AG | Wymagane pola przy dodawaniu auta | `cars_ag.test.js` |
| R3 AG | Zakresy liczbowe (year, price, horsePower) | `cars_ag.test.js` |
| R4 AG | Walidacja VIN (długość, unikalność) | `cars_ag.test.js` |
| R5 AG | Edycja częściowa, 404, typ ID | `cars_ag.test.js` |
| R1–R3 NJ | Parametry i kalkulacja leasingu | `leasing.test.js` |
