# Test Cases for Car List Filtering and Deletion

This document contains 30 test cases related to filtering and deleting car listings. The first 10 are based on existing tests in `tests/cars.test.ts`, and the remaining 20 are newly created.

## Existing Test Cases (from tests/cars.test.ts)

### TC_01_TJ
**Tytuł/opis:** Wyświetlanie pustej listy samochodów  
**Warunek wstępny/dane wejściowe:** Brak samochodów w bazie danych  
**Kroki wykonania/warunek:** Wysłać żądanie GET /cars  
**Warunek wyjściowy/Oczekiwany rezultat:** Status 200, pusta tablica []

### TC_02_TJ
**Tytuł/opis:** Wyświetlanie listy samochodów  
**Warunek wstępny/dane wejściowe:** Istnienie co najmniej dwóch samochodów w bazie danych  
**Kroki wykonania/warunek:** Wysłać żądanie GET /cars  
**Warunek wyjściowy/Oczekiwany rezultat:** Status 200, tablica z samochodami

### TC_03_TJ
**Tytuł/opis:** Obsługa błędu bazy danych przy wyświetlaniu listy  
**Warunek wstępny/dane wejściowe:** Symulacja błędu bazy danych  
**Kroki wykonania/warunek:** Wysłać żądanie GET /cars  
**Warunek wyjściowy/Oczekiwany rezultat:** Status 500, komunikat błędu 'Błąd bazy danych'

### TC_04_TJ
**Tytuł/opis:** Filtrowanie samochodów po marce  
**Warunek wstępny/dane wejściowe:** Istnienie samochodów różnych marek, parametr brand=Toyota  
**Kroki wykonania/warunek:** Wysłać żądanie GET /cars?brand=Toyota  
**Warunek wyjściowy/Oczekiwany rezultat:** Status 200, tylko samochody marki Toyota

### TC_05_TJ
**Tytuł/opis:** Filtrowanie samochodów po dostępności do wynajmu  
**Warunek wstępny/dane wejściowe:** Istnienie samochodów z różną dostępnością, parametr available=true  
**Kroki wykonania/warunek:** Wysłać żądanie GET /cars?available=true  
**Warunek wyjściowy/Oczekiwany rezultat:** Status 200, tylko samochody dostępne do wynajmu

### TC_06_TJ
**Tytuł/opis:** Pomyślne usunięcie samochodu przez właściciela  
**Warunek wstępny/dane wejściowe:** Użytkownik zalogowany jako właściciel samochodu o ID 1  
**Kroki wykonania/warunek:** Wysłać żądanie DELETE /cars/1 z sesją użytkownika  
**Warunek wyjściowy/Oczekiwany rezultat:** Status 200, komunikat 'Samochód został usunięty'

### TC_07_TJ
**Tytuł/opis:** Próba usunięcia samochodu przez nie-właściciela  
**Warunek wstępny/dane wejściowe:** Użytkownik zalogowany, ale nie właściciel samochodu  
**Kroki wykonania/warunek:** Wysłać żądanie DELETE /cars/1  
**Warunek wyjściowy/Oczekiwany rezultat:** Status 403, komunikat 'Brak uprawnień do usunięcia tego samochodu'

### TC_08_TJ
**Tytuł/opis:** Próba usunięcia nieistniejącego samochodu  
**Warunek wstępny/dane wejściowe:** Użytkownik zalogowany, samochód o ID 999 nie istnieje  
**Kroki wykonania/warunek:** Wysłać żądanie DELETE /cars/999  
**Warunek wyjściowy/Oczekiwany rezultat:** Status 404, komunikat 'Samochód nie znaleziony'

### TC_09_TJ
**Tytuł/opis:** Obsługa błędu bazy danych przy usuwaniu samochodu  
**Warunek wstępny/dane wejściowe:** Symulacja błędu bazy danych podczas usuwania  
**Kroki wykonania/warunek:** Wysłać żądanie DELETE /cars/1  
**Warunek wyjściowy/Oczekiwany rezultat:** Status 500, komunikat 'Błąd serwera'

### TC_10_TJ
**Tytuł/opis:** Próba usunięcia samochodu bez logowania  
**Warunek wstępny/dane wejściowe:** Brak sesji użytkownika  
**Kroki wykonania/warunek:** Wysłać żądanie DELETE /cars/1  
**Warunek wyjściowy/Oczekiwany rezultat:** Status 401, komunikat 'Użytkownik nie jest zalogowany'

## Newly Created Test Cases

### TC_11_TJ
**Tytuł/opis:** Filtrowanie samochodów po modelu  
**Warunek wstępny/dane wejściowe:** Istnienie samochodów różnych modeli, parametr model=Corolla  
**Kroki wykonania/warunek:** Wysłać żądanie GET /cars?model=Corolla  
**Warunek wyjściowy/Oczekiwany rezultat:** Status 200, tylko samochody modelu Corolla

### TC_12_TJ
**Tytuł/opis:** Filtrowanie samochodów po roku produkcji  
**Warunek wstępny/dane wejściowe:** Istnienie samochodów z różnymi latami, parametr year=2020  
**Kroki wykonania/warunek:** Wysłać żądanie GET /cars?year=2020  
**Warunek wyjściowy/Oczekiwany rezultat:** Status 200, tylko samochody z roku 2020

### TC_13_TJ
**Tytuł/opis:** Filtrowanie samochodów po cenie maksymalnej  
**Warunek wstępny/dane wejściowe:** Istnienie samochodów z różnymi cenami, parametr maxPrice=50000  
**Kroki wykonania/warunek:** Wysłać żądanie GET /cars?maxPrice=50000  
**Warunek wyjściowy/Oczekiwany rezultat:** Status 200, tylko samochody z ceną <= 50000

### TC_14_TJ
**Tytuł/opis:** Filtrowanie samochodów po cenie minimalnej  
**Warunek wstępny/dane wejściowe:** Istnienie samochodów z różnymi cenami, parametr minPrice=40000  
**Kroki wykonania/warunek:** Wysłać żądanie GET /cars?minPrice=40000  
**Warunek wyjściowy/Oczekiwany rezultat:** Status 200, tylko samochody z ceną >= 40000

### TC_15_TJ
**Tytuł/opis:** Filtrowanie samochodów po dostępności do sprzedaży  
**Warunek wstępny/dane wejściowe:** Istnienie samochodów z różną dostępnością sprzedaży, parametr forSale=true  
**Kroki wykonania/warunek:** Wysłać żądanie GET /cars?forSale=true  
**Warunek wyjściowy/Oczekiwany rezultat:** Status 200, tylko samochody dostępne do sprzedaży

### TC_16_TJ
**Tytuł/opis:** Kombinacja filtrów: marka i model  
**Warunek wstępny/dane wejściowe:** Istnienie samochodów różnych marek i modeli, parametry brand=Toyota&model=Corolla  
**Kroki wykonania/warunek:** Wysłać żądanie GET /cars?brand=Toyota&model=Corolla  
**Warunek wyjściowy/Oczekiwany rezultat:** Status 200, tylko samochody Toyota Corolla

### TC_17_TJ
**Tytuł/opis:** Kombinacja filtrów: marka i cena maksymalna  
**Warunek wstępny/dane wejściowe:** Istnienie samochodów różnych marek i cen, parametry brand=Honda&maxPrice=45000  
**Kroki wykonania/warunek:** Wysłać żądanie GET /cars?brand=Honda&maxPrice=45000  
**Warunek wyjściowy/Oczekiwany rezultat:** Status 200, tylko Hondy z ceną <= 45000

### TC_18_TJ
**Tytuł/opis:** Filtrowanie z nieprawidłowymi parametrami  
**Warunek wstępny/dane wejściowe:** Parametr nieprawidłowy, np. brand=InvalidBrand  
**Kroki wykonania/warunek:** Wysłać żądanie GET /cars?brand=InvalidBrand  
**Warunek wyjściowy/Oczekiwany rezultat:** Status 200, pusta lista lub lista bez filtracji

### TC_19_TJ
**Tytuł/opis:** Usunięcie samochodu z nieprawidłowym ID  
**Warunek wstępny/dane wejściowe:** Użytkownik zalogowany, ID nie jest liczbą, np. abc  
**Kroki wykonania/warunek:** Wysłać żądanie DELETE /cars/abc  
**Warunek wyjściowy/Oczekiwany rezultat:** Status 400, komunikat o nieprawidłowym ID

### TC_20_TJ
**Tytuł/opis:** Usunięcie samochodu przez administratora  
**Warunek wstępny/dane wejściowe:** Użytkownik z rolą admin, samochód istnieje  
**Kroki wykonania/warunek:** Wysłać żądanie DELETE /cars/1 z sesją admina  
**Warunek wyjściowy/Oczekiwany rezultat:** Status 200, komunikat 'Samochód został usunięty'

### TC_21_TJ
**Tytuł/opis:** Filtrowanie samochodów po lokalizacji  
**Warunek wstępny/dane wejściowe:** Istnienie samochodów w różnych lokalizacjach, parametr location=Warszawa  
**Kroki wykonania/warunek:** Wysłać żądanie GET /cars?location=Warszawa  
**Warunek wyjściowy/Oczekiwany rezultat:** Status 200, tylko samochody w Warszawie

### TC_22_TJ
**Tytuł/opis:** Filtrowanie samochodów po typie paliwa  
**Warunek wstępny/dane wejściowe:** Istnienie samochodów z różnymi typami paliwa, parametr fuelType=Diesel  
**Kroki wykonania/warunek:** Wysłać żądanie GET /cars?fuelType=Diesel  
**Warunek wyjściowy/Oczekiwany rezultat:** Status 200, tylko samochody na diesel

### TC_23_TJ
**Tytuł/opis:** Filtrowanie samochodów po liczbie miejsc  
**Warunek wstępny/dane wejściowe:** Istnienie samochodów z różną liczbą miejsc, parametr seats=5  
**Kroki wykonania/warunek:** Wysłać żądanie GET /cars?seats=5  
**Warunek wyjściowy/Oczekiwany rezultat:** Status 200, tylko samochody z 5 miejscami

### TC_24_TJ
**Tytuł/opis:** Filtrowanie samochodów po kolorze  
**Warunek wstępny/dane wejściowe:** Istnienie samochodów różnych kolorów, parametr color=Czerwony  
**Kroki wykonania/warunek:** Wysłać żądanie GET /cars?color=Czerwony  
**Warunek wyjściowy/Oczekiwany rezultat:** Status 200, tylko czerwone samochody

### TC_25_TJ
**Tytuł/opis:** Usunięcie samochodu z wieloma właścicielami (jeśli wspierane)  
**Warunek wstępny/dane wejściowe:** Samochód z wieloma właścicielami, użytkownik jest jednym z nich  
**Kroki wykonania/warunek:** Wysłać żądanie DELETE /cars/1  
**Warunek wyjściowy/Oczekiwany rezultat:** Status 403, komunikat o braku uprawnień

### TC_26_TJ
**Tytuł/opis:** Filtrowanie z pustymi parametrami  
**Warunek wstępny/dane wejściowe:** Parametry puste, np. brand=  
**Kroki wykonania/warunek:** Wysłać żądanie GET /cars?brand=  
**Warunek wyjściowy/Oczekiwany rezultat:** Status 200, pełna lista samochodów

### TC_27_TJ
**Tytuł/opis:** Usunięcie samochodu podczas filtrowania (symulacja)  
**Warunek wstępny/dane wejściowe:** Lista przefiltrowana, usunięcie jednego samochodu  
**Kroki wykonania/warunek:** Przefiltrować listę, usunąć samochód, sprawdzić listę ponownie  
**Warunek wyjściowy/Oczekiwany rezultat:** Samochód usunięty z listy

### TC_28_TJ
**Tytuł/opis:** Filtrowanie po zakresie cen  
**Warunek wstępny/dane wejściowe:** Parametry minPrice=30000&maxPrice=60000  
**Kroki wykonania/warunek:** Wysłać żądanie GET /cars?minPrice=30000&maxPrice=60000  
**Warunek wyjściowy/Oczekiwany rezultat:** Status 200, samochody w zakresie cen 30000-60000

### TC_29_TJ
**Tytuł/opis:** Usunięcie wszystkich samochodów użytkownika  
**Warunek wstępny/dane wejściowe:** Użytkownik ma wiele samochodów  
**Kroki wykonania/warunek:** Usunąć każdy samochód użytkownika  
**Warunek wyjściowy/Oczekiwany rezultat:** Wszystkie samochody użytkownika usunięte, status 200 dla każdego

### TC_30_TJ
**Tytuł/opis:** Filtrowanie po statusie (dostępny/niedostępny)  
**Warunek wstępny/dane wejściowe:** Samochody z różnym statusem, parametr status=available  
**Kroki wykonania/warunek:** Wysłać żądanie GET /cars?status=available  
**Warunek wyjściowy/Oczekiwany rezultat:** Status 200, tylko dostępne samochody