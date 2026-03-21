# Leasing Calculator - Testy Jednostkowe

## Zakres Testów
- **Temat**: Zakup samochodu / Obliczanie leasingu
- **Framework**: Jest
- **Język**: JavaScript (ES Modules)
- **Środowisko**: Node.js

## Lokalizacja Testów
```
salon-samochodowy-backend/
├── tests/
│   └── leasing.test.js          # 13 testów (10 obowiązkowych + 3 integracyjne)
├── leasing.utils.js              # Implementacja logiki leasingu
├── jest.config.js                # Konfiguracja Jest
└── babel.config.js               # Konfiguracja Babel
```

## Uruchamianie Testów

### Uruchomić wszystkie testy
```bash
npm test
```

### Uruchomić testy w tryb watch (obserwacja zmian)
```bash
npm run test:watch
```

## Obowiązkowe Testy (10)

### 1. TC 01 - Kalkulacja raty leasingu (10% wpłata, 36 miesięcy)
- **Zakres**: R1, R3
- **Input**: Cena 100k PLN, wpłata 10%, okres 36 miesięcy
- **Oczekiwanie**: Rata obliczona prawidłowo, kwoty sumaryczne poprawne
- **Status**: ✅ PASSING

### 2. TC 02 - Normalizacja wpłaty własnej (powyżej limitu)
- **Zakres**: R1
- **Input**: Wpłata 60% (powyżej limitu 50%)
- **Oczekiwanie**: Autokorekta do 50%
- **Status**: ✅ PASSING

### 3. TC 03 - Walidacja minimalnego okresu leasingu
- **Zakres**: R1
- **Input**: Okres 5 miesięcy (poniżej minimum 12 m-cy)
- **Oczekiwanie**: Odrzucenie z komunikatem błędu
- **Status**: ✅ PASSING

### 4. TC 04 - Walidacja NIP (zbyt krótki)
- **Zakres**: R2
- **Input**: NIP "12345" (tylko 5 cyfr)
- **Oczekiwanie**: Błąd "NIP musi mieć 10 cyfr"
- **Status**: ✅ PASSING

### 5. TC 05 - Walidacja PESEL
- **Zakres**: R2
- **Input**: PESEL "90010112345" (11 cyfr)
- **Oczekiwanie**: Walidacja pozytywna
- **Status**: ✅ PASSING

### 6. TC 06 - Samochód zbyt stary na leasing
- **Zakres**: R1
- **Input**: Samochód z roku 2010 (ponad 10 lat)
- **Oczekiwanie**: Odrzucenie, brak opcji leasingu
- **Status**: ✅ PASSING

### 7. TC 07 - Ubezpieczenie GAP
- **Zakres**: R3
- **Input**: Opcja "Ubezpieczenie GAP" zaznaczona
- **Oczekiwanie**: Rata powiększona o koszt ubezpieczenia (~1% raty)
- **Status**: ✅ PASSING

### 8. TC 08 - Zmiana waluty (EUR)
- **Zakres**: R3
- **Input**: Konwersja kwoty PLN → EUR
- **Oczekiwanie**: Kwoty przeliczone prawidłowo po kursie
- **Status**: ✅ PASSING

### 9. TC 09 - API: Cena ujemna
- **Zakres**: R3
- **Input**: POST /lease/calc z ceną = -500
- **Oczekiwanie**: Błąd 400 Bad Request
- **Status**: ✅ PASSING

### 10. TC 19 - Leasing bez wpłaty własnej (0%)
- **Zakres**: R1
- **Input**: Wpłata własna 0%, okres 36 miesięcy
- **Oczekiwanie**: Poprawna kalkulacja raty za pełne finansowanie
- **Status**: ✅ PASSING

## Dodatkowe Testy Integracyjne (3)

### 11. Pełny przepływ weryfikacji leasingu
- Sprawdzenie eligibility samochodu
- Walidacja parametrów leasingu
- Walidacja ID klienta
- Kalkulacja raty wraz z ubezpieczeniem GAP
- **Status**: ✅ PASSING

### 12. Normalizacja wpłat własnych
- Testuje wszystkie edge case'i (wartości negatywne, powyżej limitu, graniczne)
- **Status**: ✅ PASSING

### 13. Maksymalny okres leasingu (84 miesiące)
- Porównanie rat dla różnych okresów
- Sprawdzenie że dłuższy okres = niższa rata
- **Status**: ✅ PASSING

## Definicje Wymagań

### R1 - Parametry Leasingu
- Wpłata własna: 0-50%
- Okres: 12-84 miesięcy
- Wiek auta: < 10 lat

### R2 - Dane Klienta
- NIP (10 cyfr) dla firm
- PESEL (11 cyfr) dla osób prywatnych

### R3 - Kalkulacja
- Rata recalculowana przy każdej zmianie parametrów
- Obsługa ubezpieczenia GAP
- Obsługa konwersji walut
- Walidacja wartości (> 0)

### R4 - Sesja Zakupu
- Wymagana aktywna sesja użytkownika
- Status 401 bez sesji

### R5 - Status Samochodu
- Musi być "Dostępny" do zakupu
- Po zakupie: zmiana na "Sprzedany"

### R6 - Dane Zakupu
- Kod pocztowy (format: XX-XXX)
- Email (poprawny format)
- Akceptacja regulaminu

## Metryka Testów

**Wynik**: 13/13 testów PASSING ✅

```
Test Suites: 1 passed, 1 total
Tests:       13 passed, 13 total
Time:        ~1.5s
```

## Struktura Kodu

### leasing.utils.js
Zawiera funkcje pomocnicze:
- `validateLeasingParameters()` - Walidacja parametrów
- `normalizeDownPayment()` - Normalizacja wpłaty
- `calculateMonthlyRate()` - Kalkulacja raty
- `validateNIP()` - Walidacja NIP
- `validatePESEL()` - Walidacja PESEL
- `convertCurrency()` - Konwersja walut
- `checkCarLeasingEligibility()` - Weryfikacja eligibility auta

### leasing.test.js
Organizacja testów po zakresach:
1. Parametry leasingu (TC 01-03)
2. Identyfikacja klienta (TC 04-05)
3. Wiek samochodu (TC 06)
4. Ubezpieczenie (TC 07)
5. Waluty (TC 08)
6. Validacja API (TC 09)
7. Przypadki graniczne (TC 19 + integracyjne)

## Uruchomianie Testów w Projektcie
```bash
# Instalacja zależności
npm install

# Uruchomienie testów
npm test

# Uruchomienie z raportowaniem pokrycia kodu
npm test -- --coverage

# Uruchomienie w trybie obserwacji zmian
npm run test:watch
```

## Wymagania
- Node.js >= 14
- npm >= 6

Zainstalowane zależności:
- `jest@^29.7.0` - Framework testowy
- `@babel/preset-env@^7.23.0` - Transpilacja ES modules
- `babel-jest@^29.7.0` - Integracja Babel z Jest

## Notatki Implementacyjne

### Formuła Kalkulacji Raty
```
Kwota do sfinansowania = Cena - (Cena × 0-50%)
Roczna stopa %:
  - 12-24 m-cy: 6.5%
  - 25-48 m-cy: 5.5%
  - 49-84 m-cy: 4.5%

Rata = P × [r(1+r)^n] / [(1+r)^n - 1]
gdzie: P = kwota finansowania, r = miesięczna stopa, n = liczba rat
```

### Ubezpieczenie GAP
- Koszt: ~1% raty bazowej
- Opcjonalne do wybrania
- Dodawane do raty miesięcznej

### Walidacja Identyfikatorów
- **NIP**: 10 cyfr, wzór: XXXXXXXXXX
- **PESEL**: 11 cyfr, wzór: XXXXXXXXXXX
- Funkcje usuwają znaki niebędące cyframi przed walidacją
