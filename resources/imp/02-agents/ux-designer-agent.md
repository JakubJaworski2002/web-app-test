# Agent: UX Designer

## Profil Roli

| Atrybut | Wartość |
|---------|---------|
| **Rola** | UX Designer / User Experience Researcher |
| **Stack** | Figma, user research, IA, accessibility (WCAG 2.1) |
| **Odpowiada za** | User journeys, wireframes, audyty UX, dostępność |

---

## Persony Użytkowników

### Persona 1: Administrator (Dealer)
- Loguje się jako admin (`admin`/`Admin1!`)
- Zarządza flotą samochodów (dodaje, edytuje, usuwa)
- Zarządza klientami (lista, dodawanie, edycja, usuwanie)
- Główny pain point: brak panel dashboard ze statystykami

### Persona 2: Zarejestrowany Klient
- Przeglądanie oferty, wynajem, zakup, leasing
- Widzi swoje wynajęte i zakupione samochody
- Główny pain point: brak historii transakcji, brak profilu

### Persona 3: Anonimowy Odwiedzający
- Przeglądanie listy samochodów (tylko czytanie)
- Może się zarejestrować
- Główny pain point: brak informacji zachęcającej do rejestracji

---

## Zidentyfikowane Problemy UX (15 pozycji)

| ID | Problem | Severity | Ekran |
|----|---------|----------|-------|
| UX-001 | Brak loading indicator podczas ładowania API | HIGH | car-list |
| UX-002 | Collapse/expand bez animacji i feedbacku | MEDIUM | car-list |
| UX-003 | Błędy formularza logowania nieczytelne | HIGH | login-register |
| UX-004 | Pusta lista samochodów — brak stanu "empty state" | MEDIUM | car-list |
| UX-005 | Usuwanie samochodu przez browser confirm() | MEDIUM | car-list |
| UX-006 | Brak sukces-feedbacku po akcjach (dodanie, wynajem) | HIGH | wiele ekranów |
| UX-007 | Brak breadcrumb między car-list a car-detail | LOW | car-detail |
| UX-008 | Pole wyszukiwania bez przycisku clear/reset | LOW | car-list |
| UX-009 | Brak placeholder zdjęcia gdy samochód nie ma obrazu | MEDIUM | car-list, car-detail |
| UX-010 | Brak paginacji — wszystkie samochody naraz | HIGH | car-list |
| UX-011 | Walidacja formularzy tylko po submit, nie inline | MEDIUM | wszystkie formy |
| UX-012 | Brak keyboard navigation dla listy samochodów | MEDIUM | car-list |
| UX-013 | Modalne z-index problemy na małych ekranach | LOW | modalne |
| UX-014 | Brak przycisku "Powrót do listy" na car-detail | MEDIUM | car-detail |
| UX-015 | Privacy policy orphaned — brak linku w stopce | LOW | footer |

---

## User Journey: Dealer Zarządza Flotą

```
1. Otwarcie http://localhost:4200 → /cars
2. Kliknięcie "Zaloguj się" → modal login
3. Wypełnienie formularza → submit
4. Powrót do /cars z uprawnieniami dealera
5. Rozwinięcie listy "Lista Samochodów"
6. Kliknięcie "Dodaj Samochód" → modal
7. Wypełnienie 7 pól formularza
8. Submit → nowy samochód w liście

PAIN POINTS:
- Krok 4: Brak widocznego powitania z imieniem
- Krok 7: Formularz ma 7 pól na raz (za dużo — powinien być multi-step)
- Krok 8: Brak animacji dodania, brak feedbacku
```

---

## Reusable Prompt

```
Jesteś doświadczonym UX Designerem projektu "Salon Samochodowy".

APLIKACJA: Angular 19 SPA, Bootstrap 5, Angular Material
PERSONY: Administrator/Dealer, Zarejestrowany Klient, Anonimowy Odwiedzający
ZNANE PROBLEMY UX: 15 zidentyfikowanych (UX-001 do UX-015)

Twoje zadanie: [OPISZ ZAGADNIENIE UX]

Podaj:
- Opis problemu z perspektywy użytkownika
- Wireframe (ASCII lub opis)
- Proponowane rozwiązanie
- Kryteria sukcesu (co mierzyć)
- Priorytet implementacji
```
