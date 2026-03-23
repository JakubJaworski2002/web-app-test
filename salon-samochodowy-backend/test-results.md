# Test Results Report

Generated from: test-results.json

## Summary

- Total suites: 5
- Total tests: 54
- Passed tests: 54
- Failed tests: 0
- Pending tests: 0
- Success: True

## Test Cases

| # | File | Suite | Test Case | Status | Time (ms) |
|---:|---|---|---|---|---:|
| 1 | leasing.test.js | Leasing Calculator - TC 01: Parametry leasingu | TC 01 - should calculate monthly rate correctly with 10% down payment and 36 month period | passed | 9 |
| 2 | leasing.test.js | Leasing Calculator - TC 01: Parametry leasingu | TC 02 - should normalize down payment to maximum 50% when input exceeds limit | passed | 1 |
| 3 | leasing.test.js | Leasing Calculator - TC 01: Parametry leasingu | TC 03 - should reject lease period below 12 months | passed | 0 |
| 4 | leasing.test.js | Leasing Calculator - TC 04-05: Identyfikacja Klienta | TC 04 - should reject NIP shorter than 10 digits | passed | 0 |
| 5 | leasing.test.js | Leasing Calculator - TC 04-05: Identyfikacja Klienta | TC 05 - should validate PESEL with correct 11 digits | passed | 1 |
| 6 | leasing.test.js | Leasing Calculator - TC 06: Wiek samochodu | TC 06 - should reject car older than 10 years for leasing | passed | 1 |
| 7 | leasing.test.js | Leasing Calculator - TC 07: Ubezpieczenie GAP | TC 07 - should add GAP insurance cost to monthly rate | passed | 0 |
| 8 | leasing.test.js | Leasing Calculator - TC 08: Zmiana walut | TC 08 - should convert monthly rate to different currency | passed | 1 |
| 9 | leasing.test.js | Leasing Calculator - TC 09: Validacja API | TC 09 - should throw error for negative price | passed | 17 |
| 10 | leasing.test.js | Leasing Calculator - TC 19: Wpłata bez wkładu własnego | TC 19 - should calculate rate with 0% down payment (full financing) | passed | 1 |
| 11 | leasing.test.js | Leasing Calculator - Integration tests | should validate complete leasing workflow | passed | 0 |
| 12 | leasing.test.js | Leasing Calculator - Integration tests | should normalize down payment values correctly | passed | 0 |
| 13 | leasing.test.js | Leasing Calculator - Integration tests | should handle maximum leasing period (84 months) | passed | 0 |
| 14 | cars.test.js | GET /cars – Wyświetlanie listy samochodów | powinien zwrócić pustą listę samochodów | passed | 39 |
| 15 | cars.test.js | GET /cars – Wyświetlanie listy samochodów | powinien zwrócić listę samochodów | passed | 19 |
| 16 | cars.test.js | GET /cars – Wyświetlanie listy samochodów | powinien obsłużyć błąd bazy danych (500) | passed | 10 |
| 17 | cars.test.js | DELETE /cars/:id – Usuwanie samochodu | powinien pomyślnie usunąć samochód gdy user jest dealerem (200) | passed | 12 |
| 18 | cars.test.js | DELETE /cars/:id – Usuwanie samochodu | powinien zwrócić 403 gdy user nie jest dealerem | passed | 6 |
| 19 | cars.test.js | DELETE /cars/:id – Usuwanie samochodu | powinien zwrócić 404 gdy samochód nie istnieje | passed | 6 |
| 20 | cars.test.js | DELETE /cars/:id – Usuwanie samochodu | powinien zwrócić 401 gdy użytkownik nie jest zalogowany | passed | 5 |
| 21 | rental.test.js | R4 – Wynajem samochodu [POST /cars/:id/rent] | TC1 – powinien wynająć dostępny samochód zalogowanemu użytkownikowi (200) | passed | 41 |
| 22 | rental.test.js | R4 – Wynajem samochodu [POST /cars/:id/rent] | TC5 – powinien zwrócić 401 gdy użytkownik nie jest zalogowany | passed | 20 |
| 23 | rental.test.js | R4 – Wynajem samochodu [POST /cars/:id/rent] | TC6 – powinien odmówić wynajmu gdy samochód jest już wynajęty (RENTED) | passed | 9 |
| 24 | rental.test.js | R4 – Wynajem samochodu [POST /cars/:id/rent] | TC8 – powinien odmówić wynajmu gdy user już wynajmuje ten samochód | passed | 8 |
| 25 | rental.test.js | R4 – Wynajem samochodu [POST /cars/:id/rent] | TC9 – powinien wynająć auto gdy przekazano poprawne daty przyszłe (200) | passed | 21 |
| 26 | rental.test.js | R4 – Wynajem samochodu [POST /cars/:id/rent] | TC10 – powinien zwrócić 400 gdy carId nie jest poprawną liczbą całkowitą | passed | 5 |
| 27 | rental.test.js | R5 – Zwrot samochodu [POST /cars/:id/return] | TC11 – powinien zwrócić samochód i oznaczyć go jako dostępny (200) | passed | 4 |
| 28 | rental.test.js | R5 – Zwrot samochodu [POST /cars/:id/return] | TC13 – powinien odmówić zwrotu cudzego samochodu (403) | passed | 5 |
| 29 | rental.test.js | R5 – Zwrot samochodu [POST /cars/:id/return] | TC14 – powinien zwrócić 401 gdy użytkownik nie jest zalogowany | passed | 4 |
| 30 | rental.test.js | R5 – Zwrot samochodu [POST /cars/:id/return] | TC17 – powinien zwrócić 404 gdy samochód o podanym ID nie istnieje | passed | 4 |
| 31 | validation.test.js | R1 – Walidacja nazwy użytkownika przy rejestracji [POST /register] | TC1 – poprawna rejestracja z unikalną nazwą użytkownika | passed | 84 |
| 32 | validation.test.js | R1 – Walidacja nazwy użytkownika przy rejestracji [POST /register] | TC2 – nazwa użytkownika krótsza niż 3 znaki powinna być odrzucona | passed | 7 |
| 33 | validation.test.js | R1 – Walidacja nazwy użytkownika przy rejestracji [POST /register] | TC3 – brak nazwy użytkownika (puste pole) powinien być odrzucony | passed | 6 |
| 34 | validation.test.js | R2 – Walidacja hasła przy rejestracji [POST /register] | TC11 – poprawne hasło "Passw0rd!" spełniające wszystkie wymagania (201) | passed | 5 |
| 35 | validation.test.js | R2 – Walidacja hasła przy rejestracji [POST /register] | TC12 – hasło "Pass!" krótsze niż 6 znaków powinno być odrzucone (400) | passed | 5 |
| 36 | validation.test.js | R2 – Walidacja hasła przy rejestracji [POST /register] | TC17 – puste hasło powinno być odrzucone (400) | passed | 5 |
| 37 | validation.test.js | R3 – Tworzenie klienta przez administratora [POST /admin/create-customer] | TC21 – admin powinien pomyślnie utworzyć klienta (201) | passed | 5 |
| 38 | validation.test.js | R3 – Tworzenie klienta przez administratora [POST /admin/create-customer] | TC22 – użytkownik z rolą USER (isDealer=false) powinien otrzymać 403 | passed | 6 |
| 39 | validation.test.js | R3 – Tworzenie klienta przez administratora [POST /admin/create-customer] | TC26 – niezalogowany użytkownik powinien otrzymać 401 | passed | 4 |
| 40 | cars_ag.test.js | AG – Dodawanie samochodu [POST /cars] | TC1 – powinien dodać samochód z poprawnymi danymi i sesją (201) | passed | 79 |
| 41 | cars_ag.test.js | AG – Dodawanie samochodu [POST /cars] | TC2 – brak sesji przy POST /cars powinien zwrócić 401 | passed | 6 |
| 42 | cars_ag.test.js | AG – Dodawanie samochodu [POST /cars] | TC3 – brak pola brand powinien zwrócić 400 (walidacja) | passed | 5 |
| 43 | cars_ag.test.js | AG – Dodawanie samochodu [POST /cars] | TC4 – pusty brand="" powinien zwrócić 400 (walidacja) | passed | 5 |
| 44 | cars_ag.test.js | AG – Dodawanie samochodu [POST /cars] | TC5 – brak pola isAvailableForRent powinien zwrócić 400 | passed | 6 |
| 45 | cars_ag.test.js | AG – Dodawanie samochodu [POST /cars] | TC6 – year=1885 (przed 1886) powinien zwrócić 400 | passed | 6 |
| 46 | cars_ag.test.js | AG – Dodawanie samochodu [POST /cars] | TC7 – price=-1 (ujemna cena) powinien zwrócić 400 | passed | 5 |
| 47 | cars_ag.test.js | AG – Dodawanie samochodu [POST /cars] | TC8 – horsePower=0 powinien zwrócić 400 (min 1) | passed | 5 |
| 48 | cars_ag.test.js | AG – Dodawanie samochodu [POST /cars] | TC9 – VIN o 16 znakach powinien zwrócić 400 (wymagane 17) | passed | 5 |
| 49 | cars_ag.test.js | AG – Dodawanie samochodu [POST /cars] | TC10 – VIN o 18 znakach powinien zwrócić 400 (wymagane 17) | passed | 5 |
| 50 | cars_ag.test.js | AG – Dodawanie samochodu [POST /cars] | TC11 – duplikat VIN powinien zwrócić błąd serwera (unique constraint) | passed | 6 |
| 51 | cars_ag.test.js | AG – Edycja samochodu [PUT /cars/:id] | TC17 – częściowa edycja (tylko price) powinna zwrócić 200 | passed | 5 |
| 52 | cars_ag.test.js | AG – Edycja samochodu [PUT /cars/:id] | TC24 – brak sesji przy PUT /cars/:id powinien zwrócić 401 | passed | 5 |
| 53 | cars_ag.test.js | AG – Edycja samochodu [PUT /cars/:id] | TC25 – nieistniejące ID powinno zwrócić 404 | passed | 5 |
| 54 | cars_ag.test.js | AG – Edycja samochodu [PUT /cars/:id] | TC26 – nieparametryczne ID (abc) powinno zwrócić 400 | passed | 4 |
