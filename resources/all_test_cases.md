# Połączone przypadki testowe – Salon Samochodowy

Dokument łączy wszystkie przypadki testowe z plików:
- `test_cases_JZ.md` – Email, Hasło, Tworzenie klienta (R1–R3 JZ)
- `test_cases_AG.md` – Dodawanie i edycja samochodów (R1–R7 AG)
- `test_cases_NJ` – Leasing i zakup (R1–R6 NJ)
- `test_cases_wynajem_zwrot.md` – Wynajem i zwrot (R4–R6 JJ)
- `test_cases.md` – Filtrowanie i usuwanie listy aut (TJ)

Format kolumny **Implementacja**: `[plik:linia](ścieżka#Llinia)` — klikalne odnośniki do kodu.

---

## 1. Walidacja Email / Hasło / Tworzenie klienta (JZ)

**R1** – Email musi zawierać @, część domenową; musi być unikalny  
**R2** – Hasło: min 8 znaków, 1 wielka litera, 1 cyfra, 1 znak specjalny  
**R3** – Tworzenie klienta tylko przez administratora; email unikalny; pola wymagane

| Test Case | Input | War. WE | War. WY | Rezultat | REQ | GIT | Implementacja |
|-----------|-------|---------|---------|----------|-----|-----|---------------|
| TC 1 JZ | `"test@wp.pl"` | | | + | R1 | | |
| TC 2 JZ | `"testwp.pl"` | | | - | R1 | | |
| TC 3 JZ | `"test@"` | | | - | R1 | | |
| TC 4 JZ | `"@wp.pl"` | | | - | R1 | | |
| TC 5 JZ | `" "` | | | - | R1 | | |
| TC 6 JZ | `"test @wp.pl"` | | | - | R1 | | |
| TC 7 JZ | `"test@@wp.pl"` | | | - | R1 | | |
| TC 8 JZ | `"test@sub.wp.pl"` | | | + | R1 | | |
| TC 9 JZ | `"test@wp.pl"` (duplikat) | email `test@wp.pl` istnieje już w bazie | błąd walidacji: email zajęty | - | R1 | | |
| TC 10 JZ | `"TEST@WP.PL"` | | | + | R1 | | |
| TC 11 JZ | `"Passw0rd!"` | | | + | R2 | | [validation.test.js:89](web-app-test/salon-samochodowy-backend/tests/validation.test.js#L89) |
| TC 12 JZ | `"Pass1!"` | | | - | R2 | | [validation.test.js:97](web-app-test/salon-samochodowy-backend/tests/validation.test.js#L97) |
| TC 13 JZ | `"Passw0r!"` | | | + | R2 | | |
| TC 14 JZ | `"passw0rd!"` | | | - | R2 | | |
| TC 15 JZ | `"Password!"` | | | - | R2 | | |
| TC 16 JZ | `"Passw0rd"` | | | - | R2 | | |
| TC 17 JZ | `""` | | błąd walidacji: hasło wymagane | - | R2 | | [validation.test.js:106](web-app-test/salon-samochodowy-backend/tests/validation.test.js#L106) |
| TC 18 JZ | `"12345678"` | | | - | R2 | | |
| TC 19 JZ | `"        "` (8 spacji) | | | - | R2 | | |
| TC 20 JZ | `"A1!aaaaa"` | | | + | R2 | | |
| TC 21 JZ | dane klienta — wszystkie pola | user.role = ADMIN | klient zapisany w bazie | + | R3 | | [validation.test.js:119](web-app-test/salon-samochodowy-backend/tests/validation.test.js#L119) |
| TC 22 JZ | dane klienta — wszystkie pola | user.role = USER | błąd uprawnień: brak dostępu (403 Forbidden) | - | R3 | | [validation.test.js:133](web-app-test/salon-samochodowy-backend/tests/validation.test.js#L133) |
| TC 23 JZ | dane klienta — email duplikat | user.role = ADMIN, email klienta w bazie | błąd: email już zajęty | - | R3 | | |
| TC 24 JZ | dane klienta — brak emaila | user.role = ADMIN | błąd walidacji: email wymagany | - | R3 | | |
| TC 25 JZ | dane klienta — niekompletne | user.role = ADMIN | błąd walidacji: brakujące pola | - | R3 | | |
| TC 26 JZ | dane klienta — wszystkie pola | brak sesji (niezalogowany) | błąd autoryzacji: użytkownik niezalogowany (401 Unauthorized) | - | R3 | | [validation.test.js:146](web-app-test/salon-samochodowy-backend/tests/validation.test.js#L146) |
| TC 27 JZ | dane klienta — tylko wymagane | user.role = ADMIN | klient zapisany w bazie | + | R3 | | |
| TC 28 JZ | dane klienta — wszystkie pola | user.role = ADMIN | dane klienta zgodne z wprowadzonymi | + | R3 | | |
| TC 29 JZ | dane klienta — wszystkie pola | user.role = MODERATOR | błąd uprawnień: rola niewystarczająca (403) | - | R3 | | |
| TC 30 JZ | email klienta = email admina | user.role = ADMIN, email admina w bazie | błąd: email admina jest już zajęty | - | R3 | | |

---

## 2. Dodawanie i edycja samochodów (AG)

**R1 AG** – Dostęp (sesja) wymagany do POST/PUT /cars  
**R2 AG** – Wymagane pola: brand, model, year, vin, price, horsePower, isAvailableForRent  
**R3 AG** – Zakresy: year ≥ 1886, price ≥ 0, horsePower ≥ 1  
**R4 AG** – VIN: dokładnie 17 znaków, unikalny  
**R5 AG** – Edycja częściowa; 404 dla nieznanego ID; ID musi być int ≥ 1  
**R6 AG** – Przycisk Edytuj widoczny tylko dla dealera; formularz blokuje złe dane  
**R7 AG** – Upload obrazu opcjonalny; endpoint bez auth; brak filtra typu

| Test Case | Input | War. WE | War. WY | Rezultat | REQ | GIT | Implementacja |
|-----------|-------|---------|---------|----------|-----|-----|---------------|
| TC 1 AG | POST /cars poprawny payload | aktywna sesja | HTTP 201, auto zapisane | + | R1,R2,R3,R4 | | [cars_ag.test.js:57](web-app-test/salon-samochodowy-backend/tests/cars_ag.test.js#L57) |
| TC 2 AG | POST /cars poprawny payload | brak sesji | HTTP 401 Nieautoryzowany | - | R1 | | [cars_ag.test.js:67](web-app-test/salon-samochodowy-backend/tests/cars_ag.test.js#L67) |
| TC 3 AG | POST /cars brak pola brand | aktywna sesja | HTTP 400 (błąd walidacji brand) | - | R2 | | [cars_ag.test.js:76](web-app-test/salon-samochodowy-backend/tests/cars_ag.test.js#L76) |
| TC 4 AG | POST /cars brand="" | aktywna sesja | HTTP 400 (brand wymagane) | - | R2 | | [cars_ag.test.js:87](web-app-test/salon-samochodowy-backend/tests/cars_ag.test.js#L87) |
| TC 5 AG | POST /cars brak isAvailableForRent | aktywna sesja | HTTP 400 (wymagany boolean) | - | R2 | | [cars_ag.test.js:97](web-app-test/salon-samochodowy-backend/tests/cars_ag.test.js#L97) |
| TC 6 AG | POST /cars year=1885 | aktywna sesja | HTTP 400 (year < 1886) | - | R3 | | [cars_ag.test.js:108](web-app-test/salon-samochodowy-backend/tests/cars_ag.test.js#L108) |
| TC 7 AG | POST /cars price=-1 | aktywna sesja | HTTP 400 (price < 0) | - | R3 | | [cars_ag.test.js:118](web-app-test/salon-samochodowy-backend/tests/cars_ag.test.js#L118) |
| TC 8 AG | POST /cars horsePower=0 | aktywna sesja | HTTP 400 (horsePower < 1) | - | R3 | | [cars_ag.test.js:128](web-app-test/salon-samochodowy-backend/tests/cars_ag.test.js#L128) |
| TC 9 AG | POST /cars vin 16 znaków | aktywna sesja | HTTP 400 (VIN != 17) | - | R4 | | [cars_ag.test.js:138](web-app-test/salon-samochodowy-backend/tests/cars_ag.test.js#L138) |
| TC 10 AG | POST /cars vin 18 znaków | aktywna sesja | HTTP 400 (VIN != 17) | - | R4 | | [cars_ag.test.js:148](web-app-test/salon-samochodowy-backend/tests/cars_ag.test.js#L148) |
| TC 11 AG | POST /cars duplikat vin | auto z takim VIN istnieje | HTTP 500 (unique constraint) | - | R4 | | [cars_ag.test.js:158](web-app-test/salon-samochodowy-backend/tests/cars_ag.test.js#L158) |
| TC 12 AG | Formularz: year = bieżący rok+1 | dialog ShowCarForm | formularz invalid, przycisk Zapisz zablokowany | - | R3,R6 | | |
| TC 13 AG | Formularz: vin z literą O | dialog ShowCarForm | formularz invalid, komunikat o błędnym VIN | - | R4,R6 | | |
| TC 14 AG | Formularz: vin małe litery | dialog ShowCarForm | formularz invalid, komunikat o błędnym VIN | - | R4,R6 | | |
| TC 15 AG | Formularz: wszystkie pola poprawne, bez pliku | aktywna sesja | auto dodane, bez uploadu | + | R2,R3,R4,R6,R7 | | |
| TC 16 AG | Formularz: wszystkie pola + plik JPG | aktywna sesja | auto dodane, upload zakończony sukcesem | + | R6,R7 | | |
| TC 17 AG | PUT /cars/{id}: `{"price":82000}` | aktywna sesja, auto istnieje | HTTP 200, zmienione tylko price | + | R1,R5 | | [cars_ag.test.js:179](web-app-test/salon-samochodowy-backend/tests/cars_ag.test.js#L179) |
| TC 18 AG | PUT /cars/{id}: pełny payload | aktywna sesja, auto istnieje | HTTP 200, wszystkie pola zaktualizowane | + | R1,R5 | | |
| TC 19 AG | PUT /cars/{id}: `{"year":1885}` | aktywna sesja, auto istnieje | HTTP 400 (year < 1886) | - | R3,R5 | | |
| TC 20 AG | PUT /cars/{id}: `{"price":-100}` | aktywna sesja, auto istnieje | HTTP 400 (price < 0) | - | R3,R5 | | |
| TC 21 AG | PUT /cars/{id}: `{"horsePower":0}` | aktywna sesja, auto istnieje | HTTP 400 (horsePower < 1) | - | R3,R5 | | |
| TC 22 AG | PUT /cars/{id}: `{"vin":"SHORTVIN123"}` | aktywna sesja, auto istnieje | HTTP 400 (VIN != 17) | - | R4,R5 | | |
| TC 23 AG | PUT /cars/{id}: `{"brand":""}` | aktywna sesja, auto istnieje | HTTP 400 (brand nie może być pusty) | - | R2,R5 | | |
| TC 24 AG | PUT /cars/{id}: poprawny payload | brak sesji | HTTP 401 Nieautoryzowany | - | R1,R5 | | [cars_ag.test.js:188](web-app-test/salon-samochodowy-backend/tests/cars_ag.test.js#L188) |
| TC 25 AG | PUT /cars/999999: `{"price":90000}` | aktywna sesja, brak auta | HTTP 404 Samochód nie znaleziony | - | R5 | | [cars_ag.test.js:197](web-app-test/salon-samochodowy-backend/tests/cars_ag.test.js#L197) |
| TC 26 AG | PUT /cars/abc: `{"price":90000}` | aktywna sesja | HTTP 400 (id musi być int ≥ 1) | - | R5 | | [cars_ag.test.js:209](web-app-test/salon-samochodowy-backend/tests/cars_ag.test.js#L209) |
| TC 27 AG | UI: widoczność przycisku Edytuj | dealer vs klient zalogowany | dealer: widoczny; klient: ukryty | + | R6 | | |
| TC 28 AG | UI edycji: zmiana modelu + upload PNG | dealer, auto istnieje | updateCar + uploadCarImage sukces | + | R6,R7 | | |
| TC 29 AG | POST /cars/{id}/upload plik TXT | auto istnieje, brak sesji | HTTP 200 (brak auth i filtra — aktualne zachowanie) | + | R7 | | |
| TC 30 AG | POST /cars/{id}/upload bez pliku | auto istnieje | HTTP 500 (req.file brak) | - | R7 | | |

---

## 3. Leasing i zakup (NJ)

**R1 NJ** – Parametry leasingu: wpłata 0–50%, okres 12–84 m-cy, wiek auta < 10 lat  
**R2 NJ** – Identyfikacja klienta: NIP (10 cyfr) dla firm; PESEL (11 cyfr) dla osób  
**R3 NJ** – Kalkulacja raty przy każdej zmianie parametrów  
**R4 NJ** – Finalizacja zakupu wymaga aktywnej sesji  
**R5 NJ** – Auto musi być dostępne; po zakupie status → Sprzedany  
**R6 NJ** – Kod pocztowy (XX-XXX), email poprawny, regulamin zaakceptowany

| Test Case | Input | War. WE | War. WY | Rezultat | REQ | GIT | Implementacja |
|-----------|-------|---------|---------|----------|-----|-----|---------------|
| TC 01 NJ | Wpłata 10%, Okres 36 m-cy | auto 100k PLN dostępne | rata obliczona poprawnie | + | R1,R3 | | [leasing.test.js:17](web-app-test/salon-samochodowy-backend/tests/leasing.test.js#L17) |
| TC 02 NJ | Wpłata 60% (ponad limit) | kalkulator aktywny | autokorekta wpłaty do 50% | - | R1 | | [leasing.test.js:32](web-app-test/salon-samochodowy-backend/tests/leasing.test.js#L32) |
| TC 03 NJ | Okres leasingu: 5 miesięcy | kalkulator aktywny | błąd: minimalny okres 12 miesięcy | - | R1 | | [leasing.test.js:43](web-app-test/salon-samochodowy-backend/tests/leasing.test.js#L43) |
| TC 04 NJ | NIP: "12345" (za krótki) | typ klienta: Firma | błąd: NIP musi mieć 10 cyfr | - | R2 | | [leasing.test.js:56](web-app-test/salon-samochodowy-backend/tests/leasing.test.js#L56) |
| TC 05 NJ | PESEL: "90010112345" | typ: osoba prywatna | walidacja pozytywna (11 cyfr) | + | R2 | | [leasing.test.js:67](web-app-test/salon-samochodowy-backend/tests/leasing.test.js#L67) |
| TC 06 NJ | Auto rocznik 2010 (>10 lat) | karta auta | brak opcji Leasing; auto za stare | - | R1 | | [leasing.test.js:79](web-app-test/salon-samochodowy-backend/tests/leasing.test.js#L79) |
| TC 07 NJ | Zaznaczenie: Ubezpieczenie GAP | kalkulacja w toku | rata powiększona o koszt GAP | + | R3 | | [leasing.test.js:92](web-app-test/salon-samochodowy-backend/tests/leasing.test.js#L92) |
| TC 08 NJ | Zmiana waluty na EUR | kalkulator aktywny | kwoty przeliczone po kursie | + | R3 | | [leasing.test.js:113](web-app-test/salon-samochodowy-backend/tests/leasing.test.js#L113) |
| TC 09 NJ | POST /lease/calc: `{"price":-500}` | API finansowe | HTTP 400 Bad Request | - | R3 | | [leasing.test.js:138](web-app-test/salon-samochodowy-backend/tests/leasing.test.js#L138) |
| TC 10 NJ | Kliknięcie Kup Teraz | brak sesji (niezalogowany) | przekierowanie do strony logowania | - | R4 | | |
| TC 11 NJ | POST /orders: poprawny payload | aktywna sesja, auto OK | HTTP 201, status auta → Sold | + | R4,R5 | | |
| TC 12 NJ | Kod pocztowy: "00000" | formularz zakupu | błąd: wymagany format XX-XXX | - | R6 | | |
| TC 13 NJ | Checkbox regulamin = false | podsumowanie | przycisk Kupuję nieaktywny | - | R6 | | |
| TC 14 NJ | Próba zakupu auta Reserved | status: Rezerwacja | błąd: pojazd chwilowo niedostępny | - | R5 | | |
| TC 15 NJ | Wybór akcesoriów: Dywaniki | koszyk | cena całkowita zaktualizowana w locie | + | R6 | | |
| TC 16 NJ | Email: "user.test.pl" (brak @) | formularz klienta | błąd: niepoprawny format email | - | R6 | | |
| TC 17 NJ | Telefon: "abc-def-ghi" | formularz klienta | błąd: pole akceptuje tylko cyfry | - | R6 | | |
| TC 18 NJ | GET /orders/my-orders | aktywna sesja | HTTP 200, lista zakupionych aut | + | R4 | | |
| TC 19 NJ | Wpłata własna: 0% | kalkulator aktywny | poprawna rata (leasing bez wpłaty) | + | R1 | | [leasing.test.js:151](web-app-test/salon-samochodowy-backend/tests/leasing.test.js#L151) |
| TC 20 NJ | Wybór raty malejącej | opcje leasingu | zmiana harmonogramu spłat w PDF | + | R3 | | |
| TC 21 NJ | Wybór salonu: Warszawa | formularz dostawy | przypisanie salonu do zamówienia | + | R6 | | |
| TC 22 NJ | Usunięcie auta z koszyka | auto w koszyku | koszyk pusty, auto Available | + | R5 | | |
| TC 23 NJ | Zmiana ceny przez Admina | użytkownik w kalkulatorze | rata przeliczona po odświeżeniu | + | R3 | | |
| TC 24 NJ | Timeout sesji (30 min) | formularz płatności | HTTP 401 przy próbie finalizacji | - | R4 | | |
| TC 25 NJ | NIP: "PL1234567890" | klient: Firma | obsługa prefiksu kraju (walidacja) | + | R2 | | |
| TC 26 NJ | Kwota wykupu: 1% wartości | okres 84 m-ce | poprawne wyliczenie raty końcowej | + | R3 | | |
| TC 27 NJ | Nazwisko: "Nowak-Kowalski" | formularz zakupu | akceptacja nazwisk dwuczłonowych | + | R6 | | |
| TC 28 NJ | Wybór finansowania: Wynajem | karta pojazdu | zmiana pól na limity przebiegu | + | R1 | | |
| TC 29 NJ | Przebieg roczny: 50 000 km | kalkulator Najmu | wzrost raty ze względu na przebieg | + | R1 | | |
| TC 30 NJ | Kliknięcie Wstecz w formularzu | drugi krok zakupu | powrót do kroku 1 z zachowaniem danych | + | — | | |

---

## 4. Wynajem i zwrot samochodu (JJ)

**R4 JJ** – Wynajem: zalogowany user, auto AVAILABLE, daty poprawne, brak aktywnego wynajmu  
**R5 JJ** – Zwrot: zalogowany user, wypożyczenie ACTIVE i należące do usera, naliczanie dopłat  
**R6 JJ** – Anulowanie: zalogowany user lub ADMIN, status ACTIVE/PENDING, opłata przy anulowaniu < 24h

| Test Case | Input | War. WE | War. WY | Rezultat | REQ | GIT | Implementacja |
|-----------|-------|---------|---------|----------|-----|-----|---------------|
| TC 1 JJ | dataRozpoczecia = dziś, dataZakończenia = +3 dni | user zalogowany, auto status = AVAILABLE | rezerwacja utworzona, auto status = RENTED | + | R4 | | [rental.test.js:55](web-app-test/salon-samochodowy-backend/tests/rental.test.js#L55) |
| TC 2 JJ | dataRozpoczecia = wczoraj, dataZakończenia = +3 dni | user zalogowany, auto status = AVAILABLE | błąd walidacji: data rozpoczęcia nie może być w przeszłości | - | R4 | | |
| TC 3 JJ | dataRozpoczecia = dziś, dataZakończenia = dziś | user zalogowany, auto status = AVAILABLE | błąd walidacji: data zakończenia musi być późniejsza niż data rozpoczęcia | - | R4 | | |
| TC 4 JJ | dataRozpoczecia = dziś, dataZakończenia = wczoraj | user zalogowany, auto status = AVAILABLE | błąd walidacji: data zakończenia wcześniejsza niż data rozpoczęcia | - | R4 | | |
| TC 5 JJ | dane rezerwacji poprawne | brak sesji (niezalogowany) | błąd autoryzacji: użytkownik niezalogowany (401 Unauthorized) | - | R4 | | [rental.test.js:70](web-app-test/salon-samochodowy-backend/tests/rental.test.js#L70) |
| TC 6 JJ | dane rezerwacji poprawne | user zalogowany, auto status = RENTED | błąd: samochód niedostępny — status = RENTED | - | R4 | | [rental.test.js:78](web-app-test/salon-samochodowy-backend/tests/rental.test.js#L78) |
| TC 7 JJ | dane rezerwacji poprawne | user zalogowany, auto status = UNAVAILABLE | błąd: samochód niedostępny — status = UNAVAILABLE | - | R4 | | |
| TC 8 JJ | dane rezerwacji poprawne | user zalogowany, auto status = AVAILABLE, aktywne wyp. tego auta | błąd: użytkownik posiada już aktywne wypożyczenie tego samochodu | - | R4 | | [rental.test.js:90](web-app-test/salon-samochodowy-backend/tests/rental.test.js#L90) |
| TC 9 JJ | dataRozpoczecia = +1 dzień, dataZakończenia = +5 dni | user zalogowany, auto status = AVAILABLE | rezerwacja utworzona z poprawnymi datami | + | R4 | | [rental.test.js:102](web-app-test/salon-samochodowy-backend/tests/rental.test.js#L102) |
| TC 10 JJ | dane rezerwacji — brak carId | user zalogowany | błąd walidacji: pole carId jest wymagane | - | R4 | | [rental.test.js:121](web-app-test/salon-samochodowy-backend/tests/rental.test.js#L121) |
| TC 11 JJ | zwrot w terminie (przed datą zakończenia) | user zalogowany, wypożyczenie status = ACTIVE, należy do usera | auto status = AVAILABLE, status wyp. = COMPLETED | + | R5 | | [rental.test.js:136](web-app-test/salon-samochodowy-backend/tests/rental.test.js#L136) |
| TC 12 JJ | zwrot po terminie o 2 dni | user zalogowany, wypożyczenie status = ACTIVE, należy do usera | naliczona dopłata za opóźnienie, auto status = AVAILABLE, wyp. = COMPLETED | + | R5 | | |
| TC 13 JJ | zwrot wypożyczenia innego użytkownika | user zalogowany, wypożyczenie należy do innego usera | błąd uprawnień: brak dostępu do cudzego wypożyczenia (403 Forbidden) | - | R5 | | [rental.test.js:151](web-app-test/salon-samochodowy-backend/tests/rental.test.js#L151) |
| TC 14 JJ | zwrot wypożyczenia | brak sesji (niezalogowany) | błąd autoryzacji: użytkownik niezalogowany (401 Unauthorized) | - | R5 | | [rental.test.js:163](web-app-test/salon-samochodowy-backend/tests/rental.test.js#L163) |
| TC 15 JJ | zwrot wypożyczenia o statusie COMPLETED | user zalogowany, wypożyczenie status = COMPLETED | błąd: wypożyczenie już zakończone — zmiana statusu niemożliwa | - | R5 | | |
| TC 16 JJ | zwrot wypożyczenia o statusie CANCELLED | user zalogowany, wypożyczenie status = CANCELLED | błąd: wypożyczenie anulowane — zwrot niemożliwy | - | R5 | | |
| TC 17 JJ | rentalId nieistniejący | user zalogowany | błąd: wypożyczenie o podanym ID nie istnieje (404 Not Found) | - | R5 | | [rental.test.js:171](web-app-test/salon-samochodowy-backend/tests/rental.test.js#L171) |
| TC 18 JJ | zwrot w terminie z uszkodzeniami | user zalogowany, wypożyczenie status = ACTIVE, hasSzkody = true | naliczona opłata za szkody, auto status = UNAVAILABLE, wyp. = COMPLETED | + | R5 | | |
| TC 19 JJ | zwrot z zerową opłatą za opóźnienie (1 godz. spóźnienia < próg) | user zalogowany, wypożyczenie status = ACTIVE, należy do usera | brak dopłaty, auto status = AVAILABLE, wyp. = COMPLETED | + | R5 | | |
| TC 20 JJ | zwrot dokładnie w dacie zakończenia (koniec dnia) | user zalogowany, wypożyczenie status = ACTIVE, należy do usera | brak dopłaty, status wyp. = COMPLETED, auto status = AVAILABLE | + | R5 | | |
| TC 21 JJ | anulowanie rezerwacji > 24h przed startem | user zalogowany, rezerwacja status = PENDING, należy do usera | rezerwacja status = CANCELLED, brak opłaty, auto status = AVAILABLE | + | R6 | | |
| TC 22 JJ | anulowanie rezerwacji < 24h przed startem | user zalogowany, rezerwacja status = ACTIVE, należy do usera | rezerwacja status = CANCELLED, naliczona opłata za późne anulowanie | + | R6 | | |
| TC 23 JJ | anulowanie rezerwacji innego użytkownika | user zalogowany (role = USER), rezerwacja należy do innego usera | błąd uprawnień: brak dostępu do cudzej rezerwacji (403 Forbidden) | - | R6 | | |
| TC 24 JJ | anulowanie rezerwacji innego użytkownika | user zalogowany (role = ADMIN) | rezerwacja status = CANCELLED, auto status = AVAILABLE | + | R6 | | |
| TC 25 JJ | anulowanie rezerwacji o statusie COMPLETED | user zalogowany, rezerwacja status = COMPLETED | błąd: rezerwacja zakończona — anulowanie niemożliwe | - | R6 | | |
| TC 26 JJ | anulowanie rezerwacji o statusie CANCELLED | user zalogowany, rezerwacja status = CANCELLED | błąd: rezerwacja już anulowana — ponowne anulowanie niemożliwe | - | R6 | | |
| TC 27 JJ | anulowanie rezerwacji | brak sesji (niezalogowany) | błąd autoryzacji: użytkownik niezalogowany (401 Unauthorized) | - | R6 | | |
| TC 28 JJ | rentalId nieistniejący (anulowanie) | user zalogowany | błąd: rezerwacja o podanym ID nie istnieje (404 Not Found) | - | R6 | | |
| TC 29 JJ | anulowanie rezerwacji w trakcie trwania (już aktywnej jazdy) | user zalogowany, rezerwacja status = ACTIVE, dataStart < dziś | błąd: nie można anulować trwającej jazdy — zwrot przez endpoint zwrotu | - | R6 | | |
| TC 30 JJ | anulowanie rezerwacji > 24h — weryfikacja zwrotu środków | user zalogowany, rezerwacja status = PENDING, płatność zrealizowana | środki zwrócone na konto użytkownika, rezerwacja status = CANCELLED | + | R6 | | |

---

## 5. Filtrowanie i usuwanie listy samochodów (TJ)

Endpointy: `GET /cars`, `DELETE /cars/:id`

| Test Case | Input | War. WE | War. WY | Rezultat | REQ | GIT | Implementacja |
|-----------|-------|---------|---------|----------|-----|-----|---------------|
| TC 01 TJ | GET /cars — pusta baza | brak samochodów w bazie | HTTP 200, pusta tablica [] | + | — | | [cars.test.js:42](web-app-test/salon-samochodowy-backend/tests/cars.test.js#L42) |
| TC 02 TJ | GET /cars — co najmniej 2 auta | 2 samochody w bazie | HTTP 200, tablica z samochodami | + | — | | [cars.test.js:49](web-app-test/salon-samochodowy-backend/tests/cars.test.js#L49) |
| TC 03 TJ | GET /cars — błąd bazy | symulacja błędu bazy | HTTP 500, komunikat błędu | - | — | | [cars.test.js:60](web-app-test/salon-samochodowy-backend/tests/cars.test.js#L60) |
| TC 04 TJ | GET /cars?brand=Toyota | samochody różnych marek | HTTP 200, tylko Toyota | + | — | | |
| TC 05 TJ | GET /cars?available=true | samochody z różną dostępnością | HTTP 200, tylko dostępne | + | — | | |
| TC 06 TJ | DELETE /cars/1 | user zalogowany jako dealer | HTTP 200, auto usunięte | + | — | | [cars.test.js:73](web-app-test/salon-samochodowy-backend/tests/cars.test.js#L73) |
| TC 07 TJ | DELETE /cars/1 | user zalogowany, nie jest dealerem | HTTP 403, brak uprawnień | - | — | | [cars.test.js:86](web-app-test/salon-samochodowy-backend/tests/cars.test.js#L86) |
| TC 08 TJ | DELETE /cars/999 | user zalogowany, auto nie istnieje | HTTP 404, auto nie znalezione | - | — | | [cars.test.js:98](web-app-test/salon-samochodowy-backend/tests/cars.test.js#L98) |
| TC 09 TJ | DELETE /cars/1 — błąd bazy | symulacja błędu podczas usuwania | HTTP 500, komunikat błędu | - | — | | |
| TC 10 TJ | DELETE /cars/1 | brak sesji (niezalogowany) | HTTP 401, nieautoryzowany | - | — | | [cars.test.js:111](web-app-test/salon-samochodowy-backend/tests/cars.test.js#L111) |
| TC 11 TJ | GET /cars?model=Corolla | samochody różnych modeli | HTTP 200, tylko Corolla | + | — | | |
| TC 12 TJ | GET /cars?year=2020 | samochody różnych roczników | HTTP 200, tylko z roku 2020 | + | — | | |
| TC 13 TJ | GET /cars?maxPrice=50000 | samochody różnych cen | HTTP 200, cena ≤ 50 000 | + | — | | |
| TC 14 TJ | GET /cars?minPrice=40000 | samochody różnych cen | HTTP 200, cena ≥ 40 000 | + | — | | |
| TC 15 TJ | GET /cars?forSale=true | samochody różnej dostępności sprzedaży | HTTP 200, tylko dostępne do sprzedaży | + | — | | |
| TC 16 TJ | GET /cars?brand=Toyota&model=Corolla | kombinacja filtrów | HTTP 200, tylko Toyota Corolla | + | — | | |
| TC 17 TJ | GET /cars?brand=Honda&maxPrice=45000 | kombinacja filtrów | HTTP 200, Hondy ≤ 45 000 | + | — | | |
| TC 18 TJ | GET /cars?brand=InvalidBrand | nieprawidłowa marka | HTTP 200, pusta lista lub pełna lista | + | — | | |
| TC 19 TJ | DELETE /cars/abc | user zalogowany, ID nie jest liczbą | HTTP 400, nieprawidłowe ID | - | — | | |
| TC 20 TJ | DELETE /cars/1 | user admin | HTTP 200, auto usunięte | + | — | | |
| TC 21 TJ | GET /cars?location=Warszawa | samochody różnych lokalizacji | HTTP 200, tylko Warszawa | + | — | | |
| TC 22 TJ | GET /cars?fuelType=Diesel | samochody różnych paliw | HTTP 200, tylko Diesel | + | — | | |
| TC 23 TJ | GET /cars?seats=5 | samochody różnej liczby miejsc | HTTP 200, tylko 5-miejscowe | + | — | | |
| TC 24 TJ | GET /cars?color=Czerwony | samochody różnych kolorów | HTTP 200, tylko czerwone | + | — | | |
| TC 25 TJ | DELETE /cars/1 — wielu właścicieli | user jest jednym z właścicieli | HTTP 403, brak uprawnień | - | — | | |
| TC 26 TJ | GET /cars?brand= | pusty parametr | HTTP 200, pełna lista | + | — | | |
| TC 27 TJ | Usunięcie z przefiltrowanej listy | lista przefiltrowana wcześniej | auto usunięte, lista odświeżona | + | — | | |
| TC 28 TJ | GET /cars?minPrice=30000&maxPrice=60000 | zakres cen | HTTP 200, auta w zakresie 30k–60k | + | — | | |
| TC 29 TJ | DELETE wszystkich aut usera | user ma wiele aut | HTTP 200 dla każdego | + | — | | |
| TC 30 TJ | GET /cars?status=available | różne statusy | HTTP 200, tylko dostępne | + | — | | |
