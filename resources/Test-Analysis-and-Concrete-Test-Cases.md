# Analiza QA Projektu i Konkretne Przypadki Testowe

Data: 2026-03-12
Źródło zakresu: Załączony dokument "Test Plan.pdf" + weryfikacja repozytorium (frontend Angular, backend Node/Express/Sequelize)

## 1. Podsumowanie Systemu Podlegającego Testom

- Frontend: Angular (komponenty standalone), routing dla `/cars`, `/cars/:id`, modal logowania w navbarze.
- Backend: Express API z sesjami (`express-session`), CORS z poświadczeniami, modele Sequelize (`Car`, `User`).
- Główne operacje domenowe: CRUD samochodów, wynajem, zwrot, zakup, kalkulacja leasingu, tworzenie klientów, upload obrazów.

## 2. Co Dodano Ponad Załączony Plan

Załączony plan jest mocny pod kątem procesu QA i zakresu wysokiego poziomu. To rozszerzenie dodaje:

- Ryzyka potwierdzone w kodzie, a nie tylko hipotetyczne.
- Konkretne przypadki testowe z dokładnymi endpointami i oczekiwanymi rezultatami/statusami.
- Grupowanie priorytetów (P0/P1/P2) oraz rekomendację automatyzacji.
- Dodatkowe pokrycie dla spójności danych i zachowań wyścigowych/współbieżnych.

## 3. Dodatkowe Wnioski z Analizy Kodu

### 3.1 Ryzyka Krytyczne / Wysokie

1. Konflikt przypisania roli podczas rejestracji (ryzyko biznesowe i bezpieczeństwa)
- W `/register` nowy użytkownik jest zapisywany z `isDealer: true`.
- Może to nieintencjonalnie tworzyć konta dealera przez otwartą rejestrację.
- Wpływ: możliwy nieautoryzowany dostęp do funkcji tylko dla dealera.

2. Obsługa haseł w postaci jawnej (P0)
- Logowanie porównuje surowe wartości (`user.password !== password`).
- Hasła są przechowywane i walidowane jako plain-text zamiast hashy bcrypt.
- Wpływ: bardzo wysokie ryzyko kompromitacji danych uwierzytelniających.

3. Endpoint uploadu obrazów nie jest chroniony sesją
- `/cars/:id/upload` nie korzysta z middleware `authenticateSession`.
- Każdy nieuwierzytelniony klient może próbować wysyłać pliki.
- Wpływ: nieautoryzowany upload i wektor nadużyć.

4. Braki w walidacji uploadu
- Konfiguracja Multer nie ma `fileFilter` ani limitów rozmiaru.
- Możliwy upload plików niebędących obrazami oraz bardzo dużych plików.
- Wpływ: nadużycie storage, ryzyko payloadów złośliwych, ryzyko DoS.

5. Interceptor frontendu prawdopodobnie nie jest poprawnie podłączony
- `auth.interceptor.ts` istnieje, ale konfiguracja używa `provideHttpClient(withFetch())` bez jawnej rejestracji interceptora.
- Część requestów nadal ręcznie ustawia `withCredentials`, ale działanie interceptora powinno być zweryfikowane testowo.
- Wpływ: niespójne zachowanie sesji/ciasteczek między żądaniami.

6. Niespójny kontrakt błędów API vs parsowanie po stronie UI
- UI często oczekuje `error.error?.message`, podczas gdy backend często zwraca `error` albo `errors[]`.
- Wpływ: słabe komunikaty błędów dla użytkownika i gorsza jakość ścieżek negatywnych.

### 3.2 Ryzyka Średnie

1. Niejednoznaczny model statusu (`isAvailableForRent` używany jednocześnie dla wynajmu i sprzedaży)
- Zarówno zakup, jak i wynajem opierają się na tej samej fladze dostępności.
- Ryzyko niejasnej semantyki biznesowej w raportowaniu i filtrowaniu.

2. Ryzyko wycieku danych przy liście klientów
- `/users` jest endpointem uwierzytelnionym, ale nie wymusza jawnie roli dealera.
- Jeśli biznes wymaga widoczności tylko dla dealera, to jest luka.

3. Niespójność odpowiedzi uploadu
- Endpoint zapisuje do `car.image`, ale zwraca `imagePath: car.imagePath` (ryzyko wartości undefined).
- Frontend może nie otrzymać stabilnej ścieżki do przesłanego pliku.

4. Brak ochrony współbieżności i idempotencji
- Operacje rent/buy nie używają blokowania na poziomie transakcji.
- Szybkie równoległe requesty mogą powodować race conditions.

## 4. Model Projektowania Testów

- Testy API: kontrakty, statusy HTTP, walidacja, RBAC/sesja.
- Testy UI/E2E: przepływy użytkownika, zachowanie routingu, renderowanie błędów.
- Testy bezpieczeństwa: omijanie autoryzacji, nadużycia uploadu, bezpośrednie odpytywanie endpointów.
- Testy integralności danych: stan bazy po operacjach biznesowych.

Model priorytetów:
- P0: blokery release (bezpieczeństwo/uszkodzenie danych/krytyczne złamanie logiki biznesowej).
- P1: istotne regresje funkcjonalne.
- P2: średni/niższy wpływ lub problemy UX/reporting.

## 5. Konkretne Przypadki Testowe

Format:
- ID, Priorytet, Typ, Warunki wstępne, Kroki, Oczekiwany rezultat, Automatyzacja

### 5.1 Uwierzytelnianie i Sesja

TC-AUTH-001 | P0 | API
- Warunki wstępne: brak aktywnej sesji; unikalna nazwa użytkownika nieobecna w DB.
- Kroki:
1. POST `/register` z poprawnym username/password/firstName/lastName.
2. GET `/current-user` z użyciem zwróconego cookie.
- Oczekiwany rezultat:
1. Rejestracja zwraca `201` z obiektem użytkownika.
2. Current user zwraca `200`.
3. Wartość roli użytkownika jest zgodna z regułą biznesową (oczekiwany klient, chyba że celowo dealer).
- Automatyzacja: API (Playwright request/Newman)

TC-AUTH-002 | P0 | API
- Warunki wstępne: istniejący użytkownik.
- Kroki:
1. POST `/login` z poprawnymi danymi.
2. POST `/logout`.
3. GET `/current-user`.
- Oczekiwany rezultat:
1. Login `200`.
2. Logout `200`.
3. Current user po wylogowaniu -> `401`.
- Automatyzacja: API

TC-AUTH-003 | P1 | API
- Warunki wstępne: brak.
- Kroki:
1. POST `/login` z błędnym hasłem.
- Oczekiwany rezultat:
1. `400` i brak ustanowionej sesji.
- Automatyzacja: API

TC-AUTH-004 | P1 | UI/E2E
- Warunki wstępne: uruchomiony frontend + backend.
- Kroki:
1. Otwórz modal autoryzacji.
2. Wyślij niepoprawny formularz (za krótki username/password).
3. Wyślij poprawną rejestrację i przejdź ścieżkę auto-logowania.
- Oczekiwany rezultat:
1. Niepoprawny formularz jest blokowany po stronie klienta.
2. Poprawny przepływ przekierowuje na `/` i aktualizuje stan użytkownika w navbarze.
- Automatyzacja: UI

TC-AUTH-005 | P1 | API/Security
- Warunki wstępne: brak cookie.
- Kroki:
1. GET `/current-user` bez poświadczeń.
- Oczekiwany rezultat:
1. `401`.
- Automatyzacja: API

### 5.2 Katalog Samochodów CRUD + Walidacja

TC-CAR-001 | P0 | API
- Warunki wstępne: zalogowany dealer.
- Kroki:
1. POST `/cars` z w pełni poprawnym payloadem.
2. GET `/cars/:id` dla nowego ID.
- Oczekiwany rezultat:
1. `201`, a następnie `200`.
2. Zapisane pola odpowiadają żądaniu.
- Automatyzacja: API

TC-CAR-002 | P0 | API
- Warunki wstępne: użytkownik zalogowany.
- Kroki:
1. POST `/cars` z niepoprawną długością VIN (inna niż 17).
- Oczekiwany rezultat:
1. `400` z detalami walidacji.
- Automatyzacja: API

TC-CAR-003 | P1 | API
- Warunki wstępne: użytkownik zalogowany.
- Kroki:
1. POST `/cars` z rokiem < 1886.
- Oczekiwany rezultat:
1. `400`.
- Automatyzacja: API

TC-CAR-004 | P1 | API
- Warunki wstępne: użytkownik zalogowany.
- Kroki:
1. POST `/cars` z ceną ujemną.
- Oczekiwany rezultat:
1. `400`.
- Automatyzacja: API

TC-CAR-005 | P1 | API
- Warunki wstępne: użytkownik zalogowany.
- Kroki:
1. Utwórz samochód z VIN X.
2. Spróbuj utworzyć drugi samochód z tym samym VIN X.
- Oczekiwany rezultat:
1. Pierwsze utworzenie `201`.
2. Drugie utworzenie odrzucone (`500` aktualnie lub mapowany błąd biznesowy).
3. Defekt, jeśli kontrakt błędu jest niestrukturalny.
- Automatyzacja: API

TC-CAR-006 | P1 | API
- Warunki wstępne: samochód istnieje; sesja dealera.
- Kroki:
1. PUT `/cars/:id` częściowa aktualizacja.
2. GET `/cars/:id`.
- Oczekiwany rezultat:
1. `200`, zmienione tylko przesłane pola.
- Automatyzacja: API

TC-CAR-007 | P0 | API/RBAC
- Warunki wstępne: sesja klienta (nie-dealer), samochód istnieje.
- Kroki:
1. DELETE `/cars/:id`.
- Oczekiwany rezultat:
1. `403`.
- Automatyzacja: API

TC-CAR-008 | P1 | UI/E2E
- Warunki wstępne: lista seedowana co najmniej 5 samochodami.
- Kroki:
1. Otwórz `/cars`.
2. Sortuj po cenie, następnie po mocy silnika.
3. Użyj filtra marki z małymi i mieszanymi literami.
- Oczekiwany rezultat:
1. Sortowanie przełącza kierunki zgodnie z oczekiwaniem.
2. Filtrowanie jest case-insensitive.
- Automatyzacja: UI

### 5.3 Logika Biznesowa Wynajem / Zwrot / Zakup

TC-BIZ-001 | P0 | API
- Warunki wstępne: zalogowany klient A; samochód dostępny.
- Kroki:
1. POST `/cars/:id/rent` jako klient A.
2. GET `/cars/:id`.
- Oczekiwany rezultat:
1. Wynajem `200`.
2. `isAvailableForRent=false`, `renterId=customerA.id`.
- Automatyzacja: API

TC-BIZ-002 | P0 | API
- Warunki wstępne: ten sam samochód już wynajęty przez klienta A.
- Kroki:
1. POST `/cars/:id/rent` jako klient B.
- Oczekiwany rezultat:
1. `400` (już wynajęty).
- Automatyzacja: API

TC-BIZ-003 | P0 | API
- Warunki wstępne: samochód wynajęty przez klienta A.
- Kroki:
1. POST `/cars/:id/return` jako klient B.
- Oczekiwany rezultat:
1. `403`.
- Automatyzacja: API

TC-BIZ-004 | P0 | API
- Warunki wstępne: samochód wynajęty przez klienta A.
- Kroki:
1. POST `/cars/:id/return` jako klient A.
2. GET `/cars/:id`.
- Oczekiwany rezultat:
1. `200`.
2. `isAvailableForRent=true`, `renterId=null`.
- Automatyzacja: API

TC-BIZ-005 | P0 | API
- Warunki wstępne: dostępny samochód; zalogowany klient.
- Kroki:
1. POST `/cars/:id/buy`.
2. GET `/cars/:id`.
- Oczekiwany rezultat:
1. `200`.
2. `ownerId` ustawione na kupującego.
3. Samochód nie jest już dostępny do wynajmu (`isAvailableForRent=false`).
- Automatyzacja: API

TC-BIZ-006 | P1 | API
- Warunki wstępne: samochód kupiony (`ownerId` ustawione), niedostępny.
- Kroki:
1. POST `/cars/:id/rent`.
- Oczekiwany rezultat:
1. `400` (brak możliwości wynajmu niedostępnego/sprzedanego auta).
- Automatyzacja: API

TC-BIZ-007 | P0 | API/Concurrency
- Warunki wstępne: jeden dostępny samochód; dwóch uwierzytelnionych użytkowników.
- Kroki:
1. Wyślij dwa równoległe żądania POST `/cars/:id/rent`.
- Oczekiwany rezultat:
1. Dokładnie jedno żądanie kończy się sukcesem.
2. Końcowy stan DB zawiera tylko jednego najemcę.
- Automatyzacja: API (skrypt obciążeniowy/współbieżności)

### 5.4 Kalkulator Leasingowy

TC-LEASE-001 | P0 | API
- Warunki wstępne: istniejący samochód o znanej cenie.
- Kroki:
1. POST `/cars/:id/leasing` z downPayment=0, months=12.
- Oczekiwany rezultat:
1. `200`.
2. `remainingAmount=price`.
3. `monthlyRate=price/12` zaokrąglone do 2 miejsc.
- Automatyzacja: API

TC-LEASE-002 | P0 | API
- Warunki wstępne: istniejący samochód o cenie P.
- Kroki:
1. POST leasing z downPayment=P, months=12.
- Oczekiwany rezultat:
1. `200`.
2. `remainingAmount=0.00`, `monthlyRate=0.00`.
- Automatyzacja: API

TC-LEASE-003 | P1 | API
- Warunki wstępne: istniejący samochód o cenie P.
- Kroki:
1. POST leasing z downPayment>P.
- Oczekiwany rezultat:
1. `400`.
- Automatyzacja: API

TC-LEASE-004 | P1 | API
- Warunki wstępne: istniejący samochód.
- Kroki:
1. POST leasing z months=0.
- Oczekiwany rezultat:
1. `400` (walidator).
- Automatyzacja: API

TC-LEASE-005 | P2 | UI
- Warunki wstępne: otwarty formularz leasingu na frontendzie.
- Kroki:
1. Wprowadź dziesiętne downPayment i wartości brzegowe miesięcy.
2. Wyślij i zweryfikuj prezentowane wartości.
- Oczekiwany rezultat:
1. UI pokazuje dokładnie wartości wyliczone przez backend (ciągi z 2 miejscami po przecinku).
- Automatyzacja: UI

### 5.5 Zarządzanie Klientami / RBAC

TC-CUST-001 | P0 | API
- Warunki wstępne: sesja dealera.
- Kroki:
1. POST `/admin/create-customer` z poprawnym payloadem.
- Oczekiwany rezultat:
1. `201`, utworzony użytkownik ma `isDealer=false`.
- Automatyzacja: API

TC-CUST-002 | P0 | API/RBAC
- Warunki wstępne: sesja klienta.
- Kroki:
1. POST `/admin/create-customer`.
- Oczekiwany rezultat:
1. `403`.
- Automatyzacja: API

TC-CUST-003 | P1 | API
- Warunki wstępne: sesja klienta.
- Kroki:
1. GET `/users`.
- Oczekiwany rezultat:
1. Zweryfikować oczekiwanie biznesowe.
2. Jeśli lista ma być tylko dla dealera -> powinno być `403` (aktualnie prawdopodobnie `200`, zgłosić defekt).
- Automatyzacja: API

TC-CUST-004 | P1 | API
- Warunki wstępne: użytkownik A i użytkownik B to klienci.
- Kroki:
1. Użytkownik A wykonuje PUT `/users/:id` dla użytkownika B.
- Oczekiwany rezultat:
1. `403`.
- Automatyzacja: API

TC-CUST-005 | P1 | API
- Warunki wstępne: użytkownik A i użytkownik B to klienci.
- Kroki:
1. Użytkownik A wykonuje DELETE `/users/:id` dla użytkownika B.
- Oczekiwany rezultat:
1. `403`.
- Automatyzacja: API

### 5.6 Upload / Bezpieczeństwo Mediów

TC-UPL-001 | P0 | API/Security
- Warunki wstępne: brak sesji.
- Kroki:
1. POST `/cars/:id/upload` z plikiem obrazu.
- Oczekiwany rezultat:
1. Powinno być `401` (jeśli endpoint jest poprawnie chroniony).
2. Jeśli jest `200`, zgłosić defekt obejścia autoryzacji.
- Automatyzacja: API

TC-UPL-002 | P0 | API/Security
- Warunki wstępne: użytkownik uwierzytelniony, istniejący samochód.
- Kroki:
1. Wyślij plik wykonywalny lub skrypt (`.exe`, `.sh`, `.js`).
- Oczekiwany rezultat:
1. Żądanie powinno zostać odrzucone (`400/415`).
2. Jeśli zostanie zaakceptowane, zgłosić defekt nieograniczonego uploadu.
- Automatyzacja: API

TC-UPL-003 | P1 | API
- Warunki wstępne: użytkownik uwierzytelniony.
- Kroki:
1. Wyślij bardzo duży plik (>10MB).
- Oczekiwany rezultat:
1. Żądanie powinno zostać odrzucone przez limit rozmiaru.
2. Jeśli zostanie zaakceptowane, zgłosić defekt braku limitu uploadu.
- Automatyzacja: API

TC-UPL-004 | P2 | API/UI
- Warunki wstępne: poprawny upload obrazu.
- Kroki:
1. Wyślij JPG.
2. Zweryfikuj, że odpowiedź zawiera używalną ścieżkę obrazu.
3. Zweryfikuj render obrazu z `/uploads/...`.
- Oczekiwany rezultat:
1. Pole ścieżki jest spójne i niepuste.
2. Obraz jest osiągalny przez route statyczny.
- Automatyzacja: API + UI smoke

### 5.7 Routing Frontendu i Zarządzanie Stanem

TC-UI-001 | P1 | UI
- Warunki wstępne: użytkownik niezalogowany.
- Kroki:
1. Nawiguj do `/cars` i `/cars/:id`.
- Oczekiwany rezultat:
1. Strony publiczne ładują się bez błędu krytycznego.
2. Akcje dealerowe są ukryte/zablokowane.
- Automatyzacja: UI

TC-UI-002 | P1 | UI
- Warunki wstępne: zalogowany klient.
- Kroki:
1. Odśwież stronę przeglądarki.
2. Obserwuj stan użytkownika w navbarze i dostępne akcje.
- Oczekiwany rezultat:
1. Sesja utrzymuje się poprawnie przez cookie i sprawdzenie `/current-user`.
- Automatyzacja: UI

TC-UI-003 | P1 | UI
- Warunki wstępne: użytkownik wylogowany.
- Kroki:
1. Wywołaj akcję wymagającą autoryzacji (wynajem/zakup/dodanie klienta).
- Oczekiwany rezultat:
1. Pokazywany jest czytelny i spójny komunikat błędu.
2. Brak cichego niepowodzenia.
- Automatyzacja: UI

TC-UI-004 | P2 | UI
- Warunki wstępne: API zwraca błąd walidacji (`errors[]`).
- Kroki:
1. Spowoduj błąd walidacji backendu z poziomu formularza UI.
- Oczekiwany rezultat:
1. UI mapuje payload błędu backendu na czytelny komunikat.
2. Jeśli wyświetlany jest wyłącznie komunikat ogólny, zgłosić defekt UX.
- Automatyzacja: UI

## 6. Rekomendowana Kolejność Wykonania

1. Testy P0 z obszaru bezpieczeństwa i autoryzacji (`TC-AUTH-*`, `TC-UPL-*`, `TC-CUST-001/002`).
2. Testy P0 logiki stanów biznesowych dla wynajmu/zwrotu/zakupu/leasingu.
3. Testy P1 regresji dla CRUD oraz routingu/stanu UI.
4. Testy P2 UX oraz zachowania nieblokujące.

## 7. Rekomendowany Podział Automatyzacji

- Automatyzować najpierw (bramka CI): wszystkie testy API P0 + dwie krytyczne ścieżki E2E.
- Automatyzować następnie: walidacje API P1 i testy własności danych klienta.
- Pozostawić manualnie/eksploracyjnie: race conditions, jakość treści komunikatów UI, nietypowe nazwy plików uploadu.

Krytyczne ścieżki E2E do automatyzacji w pierwszej kolejności:
1. Rejestracja/Logowanie -> wynajem auta -> zwrot auta.
2. Logowanie dealera -> utworzenie klienta -> dodanie auta -> upload obrazu -> weryfikacja listy/szczegółów.

## 8. Rozszerzenia Szablonu Zgłoszenia Defektu

Do każdego błędu dodać pola przyspieszające triage:
- Endpoint/route oraz payload HTTP.
- Użyta rola sesji (dealer/klient/anonimowy).
- Dowody ze stanu DB (before/after dla ownerId/renterId/isAvailableForRent).
- Klasyfikacja bezpieczeństwa (P0/P1) dla defektów auth/upload.

---
Dokument jest gotowy do bezpośredniego użycia w Jira/TestRail jako baza przypadków testowych i może zostać szybko przekształcony do specyfikacji Playwright.
