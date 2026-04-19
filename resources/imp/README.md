# 🏢 Salon Samochodowy — Centrum Dokumentacji Projektu

> **Wersja:** 2.0.0 | **Status:** 🟡 Faza 0 – Audyt i Planowanie | **Ostatnia aktualizacja:** 2026-03-29

---

## 📋 Opis Projektu

**Salon Samochodowy** to aplikacja webowa do zarządzania salonem samochodowym, umożliwiająca przeglądanie oferty pojazdów, wynajem, leasing oraz zakup samochodów. Aplikacja składa się z frontendu opartego na Angular 19 (z SSR) oraz backendu Express.js z bazą danych SQLite.

### Cele projektu

| # | Cel | Priorytet | Termin |
|---|-----|-----------|--------|
| 1 | Wzmocnienie bezpieczeństwa (hashowanie haseł, JWT, CORS) | 🔴 Krytyczny | Faza 1 |
| 2 | Refaktoryzacja backendu (wersjonowanie API, paginacja, RBAC) | 🟠 Wysoki | Faza 2 |
| 3 | Redesign frontendu (Angular Signals, guards, nowy UI) | 🟠 Wysoki | Faza 3 |
| 4 | Pokrycie testami >80% + rozbudowa E2E | 🟡 Średni | Faza 4 |
| 5 | Gotowość produkcyjna (HTTPS, monitoring, CI/CD, Docker) | 🟡 Średni | Faza 5 |

---

## 📁 Struktura Dokumentacji (`resources/imp/`)

```
resources/imp/
│
├── README.md                          ← Ten plik – centrum nawigacyjne projektu
│
├── 00-project-charter/                ← Dokumenty inicjacyjne projektu
│   ├── project-charter.md             ← Karta projektu (cele, zakres, interesariusze)
│   ├── project-roadmap.md             ← Mapa drogowa – 6 faz rozwoju
│   └── team-structure.md              ← Struktura zespołu, role, RACI
│
├── 01-architecture/                   ← Dokumentacja architektoniczna
│   ├── current-state-analysis.md      ← Analiza stanu obecnego (audyt, luki, błędy)
│   ├── target-architecture.md         ← Docelowa architektura systemu
│   ├── database-schema.md             ← Schemat bazy danych i plan migracji
│   ├── api-specification.md           ← Specyfikacja REST API (wszystkie endpointy)
│   └── technology-decisions.md        ← Rekordy Decyzji Architektonicznych (ADR)
│
├── 02-security/                       ← [Planowane – Faza 1]
│   ├── security-audit.md              ← Pełny raport bezpieczeństwa
│   ├── threat-model.md                ← Model zagrożeń (STRIDE)
│   └── security-checklist.md         ← Lista kontrolna bezpieczeństwa OWASP
│
├── 03-development/                    ← [Planowane – Faza 2]
│   ├── coding-standards.md            ← Standardy kodowania (TypeScript, ESLint)
│   ├── git-workflow.md                ← Workflow Git (Gitflow, konwencje commitów)
│   ├── backend-guide.md               ← Przewodnik dewelopera backendu
│   └── frontend-guide.md              ← Przewodnik dewelopera frontendu
│
├── 04-testing/                        ← [Planowane – Faza 4]
│   ├── test-strategy.md               ← Strategia testowania
│   ├── test-cases/                    ← Przypadki testowe (manualne)
│   └── automation-guide.md            ← Przewodnik automatyzacji (Playwright)
│
├── 05-devops/                         ← [Planowane – Faza 1/5]
│   ├── docker-setup.md                ← Konfiguracja Docker i docker-compose
│   ├── ci-cd-pipeline.md              ← Opis pipeline CI/CD (GitHub Actions)
│   └── deployment-guide.md            ← Przewodnik wdrożeniowy
│
└── 06-operations/                     ← [Planowane – Faza 5]
    ├── runbook.md                     ← Procedury operacyjne
    ├── monitoring.md                  ← Konfiguracja monitorowania
    └── incident-response.md           ← Procedury obsługi incydentów
```

---

## 🚀 Szybki Start – Jak Korzystać z Dokumentacji

### Dla nowych członków zespołu:
1. Przeczytaj **[Kartę Projektu](00-project-charter/project-charter.md)** – zrozumiesz cele i zakres
2. Zapoznaj się ze **[Strukturą Zespołu](00-project-charter/team-structure.md)** – poznasz role i odpowiedzialności
3. Przejrzyj **[Analizę Stanu Obecnego](01-architecture/current-state-analysis.md)** – zobaczysz co wymaga poprawy
4. Sprawdź **[Mapę Drogową](00-project-charter/project-roadmap.md)** – poznasz plan prac

### Dla deweloperów:
1. **[Specyfikacja API](01-architecture/api-specification.md)** – wszystkie endpointy, requestu i odpowiedzi
2. **[Schemat Bazy Danych](01-architecture/database-schema.md)** – modele, relacje, migracje
3. **[Decyzje Architektoniczne](01-architecture/technology-decisions.md)** – dlaczego wybraliśmy dane technologie
4. **[Docelowa Architektura](01-architecture/target-architecture.md)** – gdzie zmierzamy

### Dla testerów:
- Strategia testowania: `04-testing/test-strategy.md` *(planowane)*
- Istniejące testy Playwright: `Playwright/tests/`

### Dla DevOps:
- Pipeline CI/CD: `05-devops/ci-cd-pipeline.md` *(planowane)*
- Docker: `05-devops/docker-setup.md` *(planowane)*

---

## 👥 Przegląd Struktury Zespołu

| Rola | Osoba | Zakres odpowiedzialności |
|------|-------|--------------------------|
| **Project Owner** | TBD | Wizja produktu, priorytety backlogu, akceptacja deliverables |
| **IT Architect** | TBD | Decyzje architektoniczne, ADR, przeglądy techniczne |
| **Tech Lead** | TBD | Kierowanie zespołem technicznym, code review, standardy |
| **Backend Dev (x2)** | TBD | Express.js, API, Sequelize, bezpieczeństwo |
| **Frontend Dev (x2)** | TBD | Angular 19, komponenty, routing, SSR |
| **DB Engineer** | TBD | Schemat bazy, migracje, optymalizacja |
| **DevOps Engineer** | TBD | CI/CD, Docker, monitoring, deployment |
| **UX Designer** | TBD | Badania użytkowników, wireframes, user flows |
| **UI Designer** | TBD | Design system, komponenty wizualne, Figma |
| **QA Lead** | TBD | Strategia testowania, zarządzanie jakością |
| **Manual Tester** | TBD | Testy manualne, przypadki testowe |
| **Automation Tester** | TBD | Playwright E2E, testy API, testy wydajności |
| **Code Reviewer** | TBD | Przeglądy kodu, standardy, best practices |
| **Technical Writer** | TBD | Dokumentacja techniczna i użytkownika |

> 📄 Pełny opis ról i macierz RACI: [team-structure.md](00-project-charter/team-structure.md)

---

## 📊 Dashboard Statusu Projektu

### Aktualna Faza: **Faza 0 – Audyt i Planowanie**

```
POSTĘP FAZY:  ████████░░░░░░░░░░░░  40%

Faza 0 [▓▓▓▓░░]  Audyt i Planowanie      → W TOKU
Faza 1 [░░░░░░]  Bezpieczeństwo          → OCZEKUJE
Faza 2 [░░░░░░]  Refaktoryzacja BE       → OCZEKUJE
Faza 3 [░░░░░░]  Redesign FE             → OCZEKUJE
Faza 4 [░░░░░░]  Testowanie i Jakość     → OCZEKUJE
Faza 5 [░░░░░░]  Gotowość Produkcyjna    → OCZEKUJE
```

### Wskaźniki Zdrowia Projektu

| Wskaźnik | Aktualny Stan | Cel | Status |
|----------|--------------|-----|--------|
| Pokrycie testami | ~30% (E2E only) | >80% | 🔴 Poniżej celu |
| Krytyczne luki bezpieczeństwa | 6 znanych | 0 | 🔴 Wymaga działania |
| Dokumentacja API | Częściowa | 100% | 🟡 W toku |
| CI/CD Pipeline | Brak | Aktywny | 🔴 Nie wdrożony |
| Docker | Brak | Wdrożony | 🔴 Nie wdrożony |
| Hashowanie haseł | NIE (plaintext) | bcrypt | 🔴 KRYTYCZNE |
| Rate Limiting | Brak | Wdrożony | 🟠 Wysokie ryzyko |
| Auth Guards (FE) | Brak | Wszystkie trasy | 🟠 Wysokie ryzyko |
| Paginacja API | Brak | Wdrożona | 🟡 Średni priorytet |
| Wersjonowanie API | Brak (/api/v1/) | Wdrożone | 🟡 Średni priorytet |

---

## 🔗 Kluczowe Dokumenty

### Dokumenty Dostępne Teraz

| Dokument | Ścieżka | Opis |
|----------|---------|------|
| Karta Projektu | [00-project-charter/project-charter.md](00-project-charter/project-charter.md) | Cele, zakres, interesariusze, ryzyka |
| Mapa Drogowa | [00-project-charter/project-roadmap.md](00-project-charter/project-roadmap.md) | 6 faz, deliverables, metryki sukcesu |
| Struktura Zespołu | [00-project-charter/team-structure.md](00-project-charter/team-structure.md) | Role, RACI, komunikacja |
| Analiza Stanu Obecnego | [01-architecture/current-state-analysis.md](01-architecture/current-state-analysis.md) | Audyt, błędy, luki bezpieczeństwa |
| Docelowa Architektura | [01-architecture/target-architecture.md](01-architecture/target-architecture.md) | Nowa architektura systemu |
| Schemat Bazy Danych | [01-architecture/database-schema.md](01-architecture/database-schema.md) | Modele, ER diagram, migracje |
| Specyfikacja API | [01-architecture/api-specification.md](01-architecture/api-specification.md) | Wszystkie endpointy REST |
| Decyzje Architektoniczne | [01-architecture/technology-decisions.md](01-architecture/technology-decisions.md) | 7 ADR z uzasadnieniami |

### Kod Źródłowy

| Komponent | Ścieżka |
|-----------|---------|
| Frontend (Angular) | `salon-samochodowy-frontend/` |
| Backend (Express) | `salon-samochodowy-backend/` |
| Testy E2E (Playwright) | `Playwright/` |

---

## ⚠️ Znane Krytyczne Problemy

> Te problemy wymagają natychmiastowej uwagi w Fazie 1:

1. **[INC-001] KRYTYCZNE** – Hasła przechowywane jako plaintext w bazie danych
2. **[INC-002] KRYTYCZNE** – Nowi użytkownicy domyślnie otrzymują `isDealer=true`
3. **[INC-003] WYSOKI** – Logika zakupu sprawdza `isAvailableForRent` zamiast `isSold`
4. **[INC-004] WYSOKI** – Brak rate limitingu na wszystkich endpointach
5. **[INC-005] WYSOKI** – Brak auth guards w routingu Angular
6. **[INC-006] ŚREDNI** – CORS hardcoded tylko dla `localhost:4200`

> 📄 Pełna analiza: [current-state-analysis.md](01-architecture/current-state-analysis.md)

---

## 📝 Konwencje Dokumentacyjne

- Język dokumentacji: **Polski** (kod, zmienne, API – angielski)
- Format plików: **Markdown (.md)**
- Wersjonowanie: **Git** (w repozytorium projektu)
- Numeracja wersji: **SemVer** (MAJOR.MINOR.PATCH)
- Daty: format **YYYY-MM-DD**
- Statusy: 🔴 Krytyczny | 🟠 Wysoki | 🟡 Średni | 🟢 Niski | ✅ Ukończony

---

*Dokumentacja projektu Salon Samochodowy – przygotowana przez zespół projektowy AiTSI*
