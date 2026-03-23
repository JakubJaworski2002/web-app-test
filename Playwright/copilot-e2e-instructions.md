# Instrukcje rozwiązywania/pisania testów E2E w Playwright dla Copilot (`/e2e-test`)

Ten plik zawiera wytyczne dotyczące pisania i refaktoryzacji testów End-to-End (E2E) w Playwright dla tego projektu. Używaj go jako kontekstu dla agenta AI (dodaj ten plik lub przeklej reguły do ustawień `.github/copilot-instructions.md`, aby agent mógł automatycznie się do tego stosować przy każdej prośbie o nowy test).

## 1. Architektura i Separacja (POM - Page Object Model / Utils)
- **Katalogi**: Koncepcje i ścieżki użytkownika umieszczaj w testach (`tests/`). Definicje elementów lub powtarzalne logiki formularzy wyciągnij jako tzw. helpery do folderu `utils/`.
- **Modularyzacja**: Każdą biznesową akcję wynoś do zewnętrznego pliku np.: `auth.utils.ts` (hasła, loginy), `transaction.utils.ts` (wynajem, kupno), `customer.utils.ts` (dodawanie bazy klientów).
- **Importy**: Testy z `tests/` zawsze powinny polegać na importowaniu złożonych metod z abstrakcji i testować sam przepływ (Business Flow).

## 2. Izolacja i Sterylne Dane
- **Generacja danych**: Tworząc dane klientów dla testu używaj wartości dynamicznych np. datownika `Date.now()`, co eliminuje problem duplikatów w bazie po kilkukrotnym uruchomieniu testu.
  ```typescript
  const rentClient = { username: 'Renter_' + Date.now(), email: `test${Date.now()}@test.com` };
  ```
- **Niezależne konteksty (Browser Context)**: Role (Administrator vs Klient) mają różny dostęp do UI. Kiedy łączysz pracę dwóch ról, wylogowanie się ze starej i przelogowanie na nową to za mało – należy postawić nowy kontekst przeglądarki!
  ```typescript
  const customerContext = await browser.newContext();
  const customerPage = await customerContext.newPage();
  await customerPage.goto('http://localhost:4200/cars');
  await login(customerPage, rentClient);
  ```

## 3. Pułapka Locators "Stale Elements" – Najważniejsza zasada szukania!
Najczęstszym błędem jest tracenie referencji do wyłapanych wcześniej "Kart Pojazdów" z bazy Playwright po wykonaniu operacji, która mutuje ich przyciski / dostępność.
**ZŁY WZORZEC:**
```typescript
const carCard = page.locator('.card').filter({ hasText: 'Dostępny do wynajmu: Tak' }).first();
await rentCar(page, carCard); // Wynajęto z sukcesem! Teraz "Tak" znika ze strony!
// BŁĄD! Poniższy expect padnie na timeout, bo Playwright bezustannie ewaluuje oryginalny Locator! Znajdzie on następne auto z napisem "Tak", ale odznaka tam nie głosi "Nie".
await expect(carCard.locator('.badge')).toHaveText(/Nie/); 
```
**DOBRY WZORZEC:**
Zawsze pobierz statyczny tekst lub unikalne ID karty *przed* wykonaniem psującej akcji pobocznej. Potem zidentyfikuj ją po elemencie, który się **nie zmienił** (jak tytuł/marka samochodu).
```typescript
const carCard = page.locator('.card').filter({ hasText: 'Tak' }).first();
// Zapisanie tytułu (nie mutuje po zakupie/wypożyczeniu)
const carTitle = await carCard.locator('h5.card-title').textContent();

await rentCar(page, carCard);

// Utworzenie zaktualizowanej definicji na twardym tytule
const rentedCarCard = page.locator('.card').filter({ hasText: carTitle as string });
await expect(rentedCarCard.locator('.badge')).toHaveText(/Nie/);
```

## 4. Odporna (Robust) Weryfikacja Wewnątrz Kontenerów DOM
Szukaj bardzo konkretnie z `locator()`, a nie rzucaj luźnym szukaniem tekstów (które Playwright lubi psuć przy nagromadzeniu przerw znakowych).
- Kiedy w HTML tagi są wymieszane (np. `<p><strong>Dostępny:</strong> <span class="badge">Nie</span></p>`), asercje wskaż "chirurgicznie":
  ```typescript
  await expect(card.locator('p.card-text .badge')).toHaveText(/Nie/, { timeout: 5000 });
  await expect(card.locator('p.card-text .badge')).toHaveClass(/badge bg-danger/);
  ```
- Nie polegaj na klikaniu jakichkolwiek widocznych guzików "Zamknij". Zamykając okienko w modal'u wyceluj prosto w jego nadrzędny div (klasę Angulara):
  ```typescript
  await page.locator('.calculate-form').filter({ hasText: 'Tytuł modalu' }).getByRole('button', { name: 'Zamknij' }).click();
  ```

## 5. Czytelność Kodów
- Oznaczaj komentarzami krokowe działania biznesowe E2E: np. `// 1. Zaloguj i dodaj klienta`, `// 2. Kalkulacja kredytu`, by były natychmiastowo czytelne w razie padnięcia asercji.
- Pisz rozbudowane asercje w celu jasności tego, czego Playwright ma strzec.
