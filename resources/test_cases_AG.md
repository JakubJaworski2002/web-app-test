R1 - Dostep (sesja) do dodawania i edycji samochodu:
    - Dodanie samochodu (POST /cars) wymaga aktywnej sesji
    - Edycja samochodu (PUT /cars/:id) wymaga aktywnej sesji
    - Brak sesji powinien zwrocic 401

R2 - Walidacja pol wymaganych przy dodawaniu samochodu:
    - Wymagane pola: brand, model, year, vin, price, horsePower, isAvailableForRent
    - brand i model musza byc niepustym tekstem
    - isAvailableForRent musi byc boolean

R3 - Walidacja zakresow liczbowych:
    - year >= 1886 (API)
    - year <= biezacy rok (formularz UI)
    - price >= 0
    - horsePower >= 1

R4 - VIN:
    - API: VIN musi miec dokladnie 17 znakow
    - UI (formularz): VIN tylko duze litery i cyfry, bez I i O
    - VIN musi byc unikalny w bazie danych

R5 - Edycja samochodu:
    - Edycja moze byc czesciowa (pola optional)
    - Dla nieistniejacego ID zwracane jest 404
    - ID w sciezce musi byc liczba calkowita >= 1

R6 - Zachowanie UI dla dodawania/edycji:
    - Przycisk Edytuj widoczny tylko dla dealera
    - Formularz blokuje zapis, gdy dane sa niepoprawne
    - W edycji mozliwa zmiana danych i opcjonalny upload pliku

R7 - Upload obrazu samochodu:
    - Upload po dodaniu/edycji jest opcjonalny
    - Endpoint uploadu nie wymaga sesji (aktualne zachowanie kodu)
    - Brak filtra typu pliku (aktualne zachowanie kodu)

| Test Case | Input | War. WE | War. WY | Rezultat | REQ    | GIT |
|-----------|-------|---------|---------|----------|--------|-----|
| TC 1      | POST /cars: {"brand":"Toyota","model":"Corolla","year":2020,"vin":"WAUZZZ8V0JA000001","price":75000,"horsePower":132,"isAvailableForRent":true} | aktywna sesja, poprawny payload | HTTP 201, auto zapisane w DB | + | R1,R2,R3,R4 | |
| TC 2      | POST /cars: poprawny payload jak TC1 | brak sesji | HTTP 401 "Nieautoryzowany" | - | R1 | |
| TC 3      | POST /cars: brak pola brand | aktywna sesja | HTTP 400 (blad walidacji brand) | - | R2 | |
| TC 4      | POST /cars: brand="" (pusty string) | aktywna sesja | HTTP 400 (brand wymagane) | - | R2 | |
| TC 5      | POST /cars: brak pola isAvailableForRent | aktywna sesja | HTTP 400 (wymagany boolean) | - | R2 | |
| TC 6      | POST /cars: year=1885 | aktywna sesja | HTTP 400 (year < 1886) | - | R3 | |
| TC 7      | POST /cars: price=-1 | aktywna sesja | HTTP 400 (price < 0) | - | R3 | |
| TC 8      | POST /cars: horsePower=0 | aktywna sesja | HTTP 400 (horsePower < 1) | - | R3 | |
| TC 9      | POST /cars: vin="WAUZZZ8V0JA00001" (16 znakow) | aktywna sesja | HTTP 400 (VIN != 17) | - | R4 | |
| TC 10     | POST /cars: vin="WAUZZZ8V0JA000001X" (18 znakow) | aktywna sesja | HTTP 400 (VIN != 17) | - | R4 | |
| TC 11     | POST /cars: duplikat vin="WAUZZZ8V0JA000001" | auto z takim VIN juz istnieje | HTTP 500 (unikalnosc VIN na DB) | - | R4 | |
| TC 12     | Formularz dodawania: year = biezacy rok + 1 | otwarty dialog ShowCarForm | formularz invalid, przycisk "Zapisz" zablokowany | - | R3,R6 | |
| TC 13     | Formularz dodawania: vin="WAUZZZ8V0JA00000O" (litera O) | otwarty dialog ShowCarForm | formularz invalid, komunikat o blednym VIN | - | R4,R6 | |
| TC 14     | Formularz dodawania: vin="wauzzz8v0ja000001" (male litery) | otwarty dialog ShowCarForm | formularz invalid, komunikat o blednym VIN | - | R4,R6 | |
| TC 15     | Formularz dodawania: wszystkie pola poprawne, bez pliku | aktywna sesja, dialog otwarty | addCar wywolane, auto dodane, bez uploadu | + | R2,R3,R4,R6,R7 | |
| TC 16     | Formularz dodawania: wszystkie pola poprawne + plik JPG | aktywna sesja, dialog otwarty | auto dodane, potem upload pliku zakonczony sukcesem | + | R6,R7 | |
| TC 17     | PUT /cars/{id}: {"price":82000} | aktywna sesja, auto istnieje | HTTP 200, zmienione tylko price | + | R1,R5 | |
| TC 18     | PUT /cars/{id}: {"brand":"Skoda","model":"Octavia","year":2021,"vin":"TMBZZZNE0M0000001","price":93000,"horsePower":150,"isAvailableForRent":false} | aktywna sesja, auto istnieje | HTTP 200, wszystkie pola zaktualizowane | + | R1,R5 | |
| TC 19     | PUT /cars/{id}: {"year":1885} | aktywna sesja, auto istnieje | HTTP 400 (year < 1886) | - | R3,R5 | |
| TC 20     | PUT /cars/{id}: {"price":-100} | aktywna sesja, auto istnieje | HTTP 400 (price < 0) | - | R3,R5 | |
| TC 21     | PUT /cars/{id}: {"horsePower":0} | aktywna sesja, auto istnieje | HTTP 400 (horsePower < 1) | - | R3,R5 | |
| TC 22     | PUT /cars/{id}: {"vin":"SHORTVIN123"} | aktywna sesja, auto istnieje | HTTP 400 (VIN != 17) | - | R4,R5 | |
| TC 23     | PUT /cars/{id}: {"brand":""} | aktywna sesja, auto istnieje | HTTP 400 (brand nie moze byc pusty) | - | R2,R5 | |
| TC 24     | PUT /cars/{id}: poprawny payload | brak sesji | HTTP 401 "Nieautoryzowany" | - | R1,R5 | |
| TC 25     | PUT /cars/999999: {"price":90000} | aktywna sesja, brak auta o takim ID | HTTP 404 "Samochod nie znaleziony" | - | R5 | |
| TC 26     | PUT /cars/abc: {"price":90000} | aktywna sesja | HTTP 400 (id musi byc int >= 1) | - | R5 | |
| TC 27     | UI: widocznosc przycisku "Edytuj" | zalogowany dealer vs zalogowany klient | dealer: przycisk widoczny, klient: przycisk ukryty | + | R6 | |
| TC 28     | UI edycji: poprawna zmiana modelu + upload PNG | zalogowany dealer, auto istnieje | updateCar sukces + uploadCarImage sukces + komunikat powodzenia | + | R6,R7 | |
| TC 29     | POST /cars/{id}/upload z plikiem TXT | auto istnieje, brak sesji | HTTP 200 (brak auth i brak filtra typu pliku - aktualne zachowanie) | + | R7 | |
| TC 30     | POST /cars/{id}/upload bez pliku (multipart bez "image") | auto istnieje | HTTP 500 (proba odczytu req.file.path) | - | R7 | |