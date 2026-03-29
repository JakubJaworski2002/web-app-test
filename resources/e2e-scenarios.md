# Scenariusze Testów Automatycznych E2E (Playwright)

Poniżej znajduje się 15 scenariuszy testowych E2E dla aplikacji Salonu Samochodowego. Każdy ze scenariuszy obejmuje przepływ przechodzący przez min. 2-3 kluczowe funkcjonalności biznesowe.

## Mapowanie wymagań (R)
- R1: Scenariusz 1 - Rejestracja, logowanie i dodanie nowego pojazdu.
- R2: Scenariusz 2 - Kalkulator leasingowy i proces zakupu.
- R3: Scenariusz 3 - Dodanie klienta i wynajem pojazdu.
- R4: Scenariusz 4 - Edycja istniejącego auta.
- R5: Scenariusz 5 - Auth guard i walidacja logowania.
- R6: Scenariusz 6 - Walidacja formularza dodawania/edycji auta.
- R7: Scenariusz 7 - Privacy Policy i rejestracja.
- R8: Scenariusz 8 - Walidacja wynajmu w scenariuszu negatywnym.
- R9: Scenariusz 9 - Porównanie leasingu dla dwóch aut i zakup.
- R10: Scenariusz 10 - Przepływ wieloaktorowy Admin + Klient.
- R11: Scenariusz 11 - Blokada nakładających się wynajmów.
- R12: Scenariusz 12 - Przerwanie formularza i brak autozapisu.
- R13: Scenariusz 13 - Filtrowanie listy aut i zakup.
- R14: Scenariusz 14 - Modyfikacja ceny widoczna po stronie klienta.
- R15: Scenariusz 15 - Blokada zakupu dla niekompletnego profilu.

---

## Scenariusz 1: Rejestracja, logowanie i weryfikacja dodania nowego pojazdu
**Cel:** Sprawdzenie poprawnego przejścia przez proces tworzenia konta pracownika, zalogowania się i skutecznego opublikowania nowego samochodu w systemie.

**Kroki (ang. Steps):**
1. Przejście na stronę główną i otwarcie formularza rejestracji (`login-register`).
2. Wypełnienie formularza rejestracyjnego prawidłowymi danymi pracownika i wysłanie.
3. Automatyczne przekierowanie lub ręczne przejście do logowania i zalogowanie się na nowo utworzone konto.
4. Przejście widoku do sekcji "Dodaj auto" (`add-car`).
5. Uzupełnienie wszystkich wymaganych parametrów technicznych pojazdu (marka, model, VIN, cena, rok, itp.) i zatwierdzenie operacji.
6. **Weryfikacja:** Nawigacja do "Listy aut" (`car-list`) i sprawdzenie, czy nowo dodany pojazd figuruje w systemie (widoczność karty z odpowiednimi danymi z formularza).

---

## Scenariusz 2: Analiza auta, wymodelowanie rat na kalkulatorze leasingowym i operacja zakupu
**Cel:** Sprawdzenie procesu decyzyjnego po stronie klienta: od wyszukania samochodu aż do finalizacji poprzez kalkulator i zakup.

**Kroki (ang. Steps):**
1. Zalogowanie się do systemu jako użytkownik/klient.
2. Przejrzenie dostępnych pojazdów (`car-list`) i przejście do szczegółów `car-detail` pojedynczego, wybranego modelu.
3. Przewinięcie na widoku do sekcji leasingowej i otwarcie "Kalkulatora leasingowego" (`calculate-leasing`).
4. Ustawienie wybranych parametrów (np. 15% wkładu własnego, okres finansowania na 36 miesięcy) i upewnienie się co do przeliczonej raty (sprawdzenie czy kalkulator renderuje wartość końcową).
5. Kliknięcie opcji transakcji "Kup auto" (`buy-car`).
6. Wypełnienie danych do potwierdzenia zakupu i sfinalizowanie.
7. **Weryfikacja:** Pojawienie się powiadomienia o poprawnym zakupie. Ponowne wejście na `car-list` i asercja potwierdzająca, że zakupione auto jest teraz oznaczone jako niedostępne lub niedające się kupić ponownie.

---

## Scenariusz 3: Zarządzanie bazą klientów oraz przypisanie pojazdu do wynajmu
**Cel:** Przetestowanie modułu CRM pod kątem stworzenia klienta i operacji wynajmu samochodu salonowego zamiast jego stałej sprzedaży.

**Kroki (ang. Steps):**
1. Zalogowanie się z uprawnieniami zarządzającymi (admin/sprzedawca).
2. Przejście do formularza dodawania klienta (`add-customer`), wprowadzenie jego imienia, nazwiska oraz danych kontaktowych i zatwierdzenie.
3. Zaznaczenie dodanej osoby na "Liście klientów" (`customer-list`) – potwierdzenie, że encja została poprawnie wygenerowana.
4. Wybranie dostępnego, luksusowego pojazdu z bazy (`car-list`) i uruchomienie formularza "Wynajmij auto" (`rent-car`).
5. Mapowanie wynajmu na nowo utworzonego klienta, zaznaczenie ram czasowych w kalendarzu.
6. **Weryfikacja:** Pomyślne zrealizowanie umowy najmu. Weryfikacja widoczności zmiany statusu powiązanego auta na "Zajęte/Wynajęte" w panelu administracyjnym.

---

## Scenariusz 4: Modyfikacja detali oraz obniżenie ceny istniejącego auta (Edycja)
**Cel:** Sprawdzenie mechanizmu edycji rekordu (Update), co jest kluczowe w cyklu życia ogłoszenia np. w kwestii obniżek na skutek wieku pojazdu.

**Kroki (ang. Steps):**
1. Zalogowanie jako administrator panelu.
2. Na widoku ze wszystkimi autami (`car-list`), wyszukanie konkretnego ogłoszenia o zdefiniowanych wcześniej wartościach (np. bazującej na starych danych cenie).
3. Przejście do formularza "Edytuj auto" (`edit-car`).
4. Bezpośrednia zmiana podanej pierwotnie ceny (symulacja promocji np. wpisanie kwoty o 15% niższej) oraz aktualizacja przebiegu kilometrów.
5. Zapisanie formularza i powrót na podgląd zasobu (`car-detail`).
6. **Weryfikacja:** Weryfikacja w asercji domowej, czy na front-endzie dla zdezaworyzowanego auta nowa kwota i przebieg renderują się tak, jak zaktualizowano w formularzu, bez gubienia pierwotnego brandu/modelu.

---

## Scenariusz 5: Strażnik uwierzytelniania (Auth Guards) w próbie niedozwolonej interakcji
**Cel:** Ochrona paneli dostępnych tylko dla zalogowanych pracowników, powiązanie bezpieczeństwa z powrotem do logowania.

**Kroki (ang. Steps):**
1. Otwarcie przeglądarki bez jakiegokolwiek stanu zalogowanego użytkownika (wyczyszczony token sesji).
2. Jawne wpisanie w pasku adresu (URL) ścieżek zabezpieczonych, np. `/add-car` lub `/customer-list`.
3. **Weryfikacja 1:** Konfrontacja z natychmiastowym przekierowaniem na ruting `/login-register` bez przyznania dostępu do widoków poufnych.
4. Próba zalogowania się w panelu autoryzacji posługując się nieważnym lub celowo literówkowym hasłem.
5. **Weryfikacja 2:** Oczekiwanie renderu poprawnego komunikatu pod formularzem - "Nieprawidłowe dane logowania".
6. Zakończenie testu pomyślnym logowaniem autoryzowanym upewniając się, że mechanizm następnie wpuszcza użytkownika do wewnątrz aplikacji.

---

## Scenariusz 6: Odrzucenie niepoprawnych danych na formularzu dodawania auta i edycja (Walidacja)
**Cel:** Sprawdzenie zabezpieczeń formularzy pod kątem braku wymaganych danych oraz mechanizmu wymuszającego ich korektę, a następnie edycję nowo dodanego zasobu.

**Kroki (ang. Steps):**
1. Zalogowanie pracownika przez `login-register`.
2. Przejście do `add-car` i kliknięcie "Zapisz" na pustym formularzu.
3. Weryfikacja wyświetlenia powiadomień błędów walidacji (np. "Wprowadź markę", "Cena wymagana").
4. Uzupełnienie danych poprawnymi wartościami z pominięciem jednego kluczowego przycisku typu checkbox, upewnienie się co do blokady dodawania.
5. Poprawne przesłanie wniosku. Przejście do utworzonego pojazdu, otwarcie `edit-car` i weryfikacja aktualizacji stanu po nadpisaniu roku produkcji.

---

## Scenariusz 7: Rejestrujący się klient wczytuje regulamin i weryfikuje zakładkę Privacy Policy bezpośrednio
**Cel:** Sprawdzenie przepływu związanego z nawigacją statycznych stron ochronnych w korelacji z formularzem rejestracji.

**Kroki (ang. Steps):**
1. Otwarcie podstrony logowania/rejestracji.
2. Kliknięcie linku przekierowującego do `privacy-policy` w stopce lub przy checkboxie rejestracyjnym.
3. Przewinięcie całego widoku polityki i asercja obecności kluczowych sekcji o bezpieczeństwie RODO.
4. Powrót za pomocą paska nawigacyjnego (`navbar`) na `login-register`.
5. Rejestracja użytkownika akceptującego tenże regulamin, a następnie poprawne przejście autoryzacji do głównego widoku po udanym stworzeniu konta.

---

## Scenariusz 8: Próba wypożyczenia auta na błędny okres czasu
**Cel:** Weryfikacja złożonej reguły czasowej w mechanizmie wynajmu z perspektywy pracownika.

**Kroki (ang. Steps):**
1. Zalogowanie jako pracownik i nawigacja na pozycję `customer-list`. 
2. Utworzenie tymczasowego klienta przez `add-customer` w celach testu wypożyczenia.
3. Przejście na `car-list` i wejście w dostępne auto, wybranie opcji wynajmu (`rent-car`).
4. Ustawienie daty startowej późniejszej niż data końcowa wynajmu i zatwierdzenie.
5. **Weryfikacja:** Stwierdzenie pojawienia się w interfejsie błędu front-endowego (np. "Data zakończenia nie może być wcześniejsza niż data rozpoczęcia"). Skorygowanie dat na poprawne przedziały i upewnienie się o sukcesie operacji wynajmu.

---

## Scenariusz 9: Obliczanie i porównywanie leasingu na dwóch różnych obiektach i zakup
**Cel:** Zbadanie zachowania komponentów modularnych (jak kalkulator) podczas przesiadania się między dwiema ofertami auta.

**Kroki (ang. Steps):**
1. Zalogowanie standardowego klienta.
2. Otwarcie szczegółów (`car-detail`) pierwszego, stosunkowo niedrogiego auta.
3. Przeliczenie leasingu w module `calculate-leasing` i eksfiltracja spodziewanej raty z elementu DOM.
4. Nawigacja do droższej sekcji/modelu za pomocą Menu (navbar/car-list) - ponowne użycie `calculate-leasing`.
5. Sprawdzenie, czy kwoty rat w asercji Test Runnera odpowiednio uległy podwyższeniu bez współdzielenia lokalnego stanu poprzedniego pojazdu. 
6. Potwierdzenie kalkulacji opcją "Kup auto" na wyższym modelu i zakończenie transakcji na `buy-car`.

---

## Scenariusz 10: Pełna ścieżka wieloaktorowa (Admin + Klient – flow sprzedażowe 360°)
**Cel:** Przepływ e2e obrazujący pełen etap dystrybucji, gdzie obie role współdzielą tę samą operacyjną bazę.

**Kroki (ang. Steps):**
1. **[Admin]:** Loguje się na swoje stanowisko, wykorzystuje `add-car` do wrzucenia nowego modelu w rzadkim kolorze.
2. **[Admin]:** Potwierdza, że wehikuł pojawił się na listach. Wylogowuje się.
3. **[Klient]:** Zakłada konto, loguje się i znajduje wskazany, nowy samochód przez `car-list`.
4. **[Klient]:** Nawiązuje operację zakupu za pomocą `buy-car`, akceptuje warunki. Wylogowuje się.
5. **[Admin]:** Loguje się z powrotem, wchodzi z menu bocznego na podgląd klientów (`customer-list`).
6. **Weryfikacja:** Reakcja testu potwierdzająca widoczność pojazdu przypisanego nowemu nabywcy.

---

## Scenariusz 11: Nadpisywanie stanu nałożenia najmu w niedostępne dni
**Cel:** Sprawdzenie walidacji stanów pojazdu w kalendarzu przy wielokrotnym nakładaniu się terminów na `rent-car`.

**Kroki (ang. Steps):**
1. Logowanie przez pracownika zarządzającego, dodanie klienta A.
2. Przejście z klientem A do wynajęcia (`rent-car`) pojazdu na cały przyszły tydzień. Zatwierdzenie akcji.
3. Dodanie klienta B na formularzu `add-customer`. 
4. Odnalezienie tego samego samochodu u klienta B, podjęcie próby wynajęcia go dla klienta B w tych samych dniach z kalendarza wynajmu.
5. **Weryfikacja:** Odparcie rezerwacji z błędem kalendarza autoryzującym "Auto jest w tym czasie niedostępne", potwierdzające synchronizację mechanizmów nakładających status pojazdu.

---

## Scenariusz 12: Wylogowanie z aktywnej modyfikacji (Przerywanie operacji) i bezpieczeństwo routingu
**Cel:** Upewnienie się, że przerwanie w połowie formularza nie generuje błędnych obiektów bazy i chroni ścieżkę autentykacji.

**Kroki (ang. Steps):**
1. Zalogowanie jako sprzedawca i przejście do formularza "Dodaj klienta" (`add-customer`).
2. Wpisanie połowy danych tekstowych (imię, ulica) i przerwanie operacji poprzez wylogowanie z bocznego navigations/`navbar`.
3. Próba nawrotu do otwartego formularza za pomocą przycisku logowania 'wstecz' lub nawigacji routera przeglądarkowego.
4. **Weryfikacja:** Bezpośrednie blokowanie routy w oparciu o Auth Guard, sprowadzenie pod widok ogólny. Utwierdzenie, czy klient nie widnieje po ponownym, udanym logowaniu na otwartej `customer-list` (uniknięcie autozapisu śmieciowego powiązanego z formularzem).

---

## Scenariusz 13: Responsywność listy aut na zmianę parametrów i filtrowanie przed zakupem
**Cel:** Przetestowanie nawigacji filtracji na zbiorach pojazdów udostępnionych do zakupu z weryfikacją szczegółów po akcji filtrowania.

**Kroki (ang. Steps):**
1. Autoryzacja standardowa (login na istniejące konto).
2. Otwarcie globalnego katalogu ofertowego (`car-list`).
3. Wybranie w mechanice szukania / filtrowania konkretnego parametru (np. Rok od 2020) by zmniejszyć zwroty.
4. Wyłapanie pierwszego zwrotu na zmienionej liście, wejście w widok szczegółu tego rekordu `car-detail`.
5. Upewnienie się w detalu, że samochód ma rocznik 2020+. Próba zakupu pojazdu przez moduł `buy-car`.
6. Po finalizacji odświeżenie prefiltrowanej listy przez aplikację widoku i weryfikacja zmalejącej ilości ofert tego specyficznego rocznika na interfejsie.

---

## Scenariusz 14: Przepływ modyfikacji ceny auta przez admina ukazanego po stronie użytkownika 
**Cel:** Rozpatrzenie e2e procesu zmian centralnych (aktualizacji parametrów) przez rolę wyższą, na widok użytkownika detalicznego.

**Kroki (ang. Steps):**
1. Odpalenie instancji autoryzacyjnej w Playwright dla administratora. Administrator wywołuje `edit-car` zmieniając cennik modelu na $15,000 taniej. Zapis zmian.
2. Otwarcie całkowicie nowego kontekstu testowego (Incognito BrowserContext) symulującego zwykłego klienta detalicznego.
3. Nowy klient odwiedza witrynę bez logowania z możliwością wywołania `car-list`.
4. Klient przechodzi w rejon szczegółów zmodyfikowanego modelu.
5. **Weryfikacja:** Potwierdzenie wyświetlenia na zewnątrz poprawnie niższej wylicytowanej stawki (15k taniej). Zalogowanie pracownicze z powrotem do zrewersowania zmiany cennika (powrót kwoty startowej z wykorzystaniem `edit-car`) i zakończenie scenariusza na status "Clean".

---

## Scenariusz 15: Odrzucenie i zablokowanie kupna dla niekompletnego profilu klienta
**Cel:** Weryfikacja formularza `buy-car` sprawdzająca, czy mechanizmy pod spodem nie uwierzytelnianiają zakupu np. bez użycia poprawnego formatu profilowania kont.

**Kroki (ang. Steps):**
1. Przejście do utworzenia profilu przez zewnętrzną procedurę pracowniczą (moduł `add-customer`), gdzie dodaje celowo skąpe dane klienta bez numerów telefonów i ważnego dowodu tożsamości.
2. Zalogowanie się z danymi tego zubożałego z punktu widzenia kompletności testowego klienta (przyjmując, że ma swoje hasła).
3. Nawigowanie przez nawigację do szczegółów `car-detail` i zainicjowanie operacji kupna z poziomu komponentu `buy-car`.
4. Weryfikacja odrzucenia przez weryfikator systemowy formularza tranzakcji z podaniem komunikatu (np. "Wymagane jest pełne uzupełnienie profilu teleadresowego" bądź "Brak numeru telefonu w profilu").
5. Korekta profilu klienta, wyjście, ponowne wejście i poprawne dokonanie finalizacji na aucie zastępczym.
