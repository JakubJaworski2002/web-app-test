# Struktura Zespołu — Salon Samochodowy

## Schemat Organizacyjny

```
                    ┌─────────────────────┐
                    │   Product Owner      │
                    │  (project-owner)     │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
    ┌─────────▼──────┐ ┌───────▼──────┐ ┌──────▼──────────┐
    │  IT Architect  │ │   Tech Lead   │ │   QA Lead        │
    │  (architect)   │ │ (tech-lead)   │ │  (qa-lead)       │
    └─────────┬──────┘ └───────┬───────┘ └──────┬──────────┘
              │                │                │
         ADRy/Standards    ┌───┴────┐      ┌────┴────────┐
                           │        │      │             │
                     ┌─────▼──┐ ┌───▼───┐ ┌▼──────────┐ ┌▼──────────┐
                     │Backend │ │Front  │ │  Manual   │ │Automation │
                     │  Dev   │ │  Dev  │ │  Tester   │ │  Tester   │
                     └────────┘ └───┬───┘ └───────────┘ └───────────┘
                                    │
                              ┌─────┴──────┐
                              │            │
                         ┌────▼───┐ ┌──────▼────┐
                         │   UX   │ │    UI     │
                         │Designer│ │ Designer  │
                         └────────┘ └───────────┘

    Dodatkowe role (cross-functional):
    ┌────────────────┐  ┌─────────────────┐  ┌────────────────────┐
    │  DB Engineer   │  │ DevOps Engineer │  │  Code Reviewer     │
    │  (database)    │  │   (devops)      │  │  (code-reviewer)   │
    └────────────────┘  └─────────────────┘  └────────────────────┘
    ┌────────────────┐
    │  Tech Writer   │
    │ (tech-writer)  │
    └────────────────┘
```

---

## Opisy Ról

### Product Owner
- Zarządza backlogiem i priorytetami
- Akceptuje deliverables każdego sprintu
- Komunikuje się ze stakeholderami
- Plik agenta: [project-owner-agent.md](../02-agents/project-owner-agent.md)

### IT Architect
- Podejmuje decyzje technologiczne (ADRy)
- Definiuje standardy kodu i architektury
- Przegląda propozycje techniczne
- Plik agenta: [architect-agent.md](../02-agents/architect-agent.md)

### Tech Lead
- Koordynuje pracę zespołu deweloperskiego
- Prowadzi code review (ostateczna akceptacja PR)
- Rozwiązuje techniczne blokery
- Plik agenta: [tech-lead-agent.md](../02-agents/tech-lead-agent.md)

### Backend Developer
- Implementuje endpointy API i logikę biznesową
- Odpowiada za bezpieczeństwo backendu
- Plik agenta: [backend-developer-agent.md](../02-agents/backend-developer-agent.md)

### Frontend Developer
- Implementuje komponenty Angular i serwisy
- Współpracuje z UX/UI Designerami
- Plik agenta: [frontend-developer-agent.md](../02-agents/frontend-developer-agent.md)

### Database Engineer
- Projektuje i utrzymuje schemat bazy danych
- Tworzy i wykonuje migracje
- Plik agenta: [database-engineer-agent.md](../02-agents/database-engineer-agent.md)

### DevOps Engineer
- Konfiguruje Docker, CI/CD, środowiska
- Zarządza sekretami i konfiguracją
- Plik agenta: [devops-engineer-agent.md](../02-agents/devops-engineer-agent.md)

### UX Designer
- Tworzy user journeys i wireframes
- Przeprowadza audyty użyteczności
- Plik agenta: [ux-designer-agent.md](../02-agents/ux-designer-agent.md)

### UI Designer
- Definiuje design system (kolory, typografia)
- Projektuje komponenty wizualne
- Plik agenta: [ui-designer-agent.md](../02-agents/ui-designer-agent.md)

### QA Lead
- Definiuje strategię testowania
- Zarządza quality gates
- Plik agenta: [qa-lead-agent.md](../02-agents/qa-lead-agent.md)

### Manual Tester
- Wykonuje testy eksploracyjne i regresyjne
- Zgłasza bugi w standardowym formacie
- Plik agenta: [manual-tester-agent.md](../02-agents/manual-tester-agent.md)

### Automation QA
- Tworzy i utrzymuje testy Playwright
- Integruje testy z CI/CD
- Plik agenta: [automation-tester-agent.md](../02-agents/automation-tester-agent.md)

### Code Reviewer
- Przegląda każdy PR według checklisty 25 punktów
- Identyfikuje problemy bezpieczeństwa i wydajności
- Plik agenta: [code-reviewer-agent.md](../02-agents/code-reviewer-agent.md)

### Technical Writer
- Tworzy i utrzymuje dokumentację techniczną
- Pisze onboarding guide i user manual
- Plik agenta: [technical-writer-agent.md](../02-agents/technical-writer-agent.md)

---

## Macierz RACI

| Aktywność | PO | Arch | TL | BED | FED | DB | DO | QAL | MT | AT | CR | TW |
|-----------|----|----|----|----|----|----|----|----|----|----|----|----|
| Decyzja architektury | C | **R** | C | I | I | C | C | I | - | - | - | - |
| Implementacja backendu | I | C | C | **R** | - | C | - | - | - | - | A | - |
| Implementacja frontendu | I | C | C | - | **R** | - | - | - | - | - | A | - |
| Migracja DB | I | C | C | C | - | **R** | - | - | - | - | A | - |
| Docker/CI setup | I | C | C | - | - | - | **R** | - | - | - | A | - |
| Design system | C | - | - | - | C | - | - | - | - | - | - | - |
| PR Review | - | - | A | - | - | - | - | - | - | - | **R** | - |
| Sprint planning | **R** | C | C | C | C | C | C | C | - | - | - | - |
| Testy manualne | - | - | - | - | - | - | - | A | **R** | - | - | - |
| Testy automatyczne | - | - | C | - | - | - | - | A | - | **R** | - | - |
| Dokumentacja API | - | C | - | C | - | - | - | - | - | - | - | **R** |

*R=Responsible, A=Accountable, C=Consulted, I=Informed*

---

## Rytm Ceremonii Agile

| Ceremonia | Częstotliwość | Czas | Uczestnicy |
|-----------|--------------|------|------------|
| Daily Standup | Każdy dzień | 15 min | Cały zespół |
| Sprint Planning | Co 2 tygodnie | 2h | PO, TL, Dev, QA |
| Sprint Review | Co 2 tygodnie | 1h | Cały zespół + stakeholderzy |
| Retrospektywna | Co 2 tygodnie | 1h | Cały zespół |
| Architecture Review | Co sprint | 1h | Arch, TL, Senior Devs |
| Code Review | Każdy PR | async | CR + autor |

---

## Szczegółowe Opisy Ról

### 1. Project Owner (Właściciel Projektu)

**Tytuł:** Product Owner / Sponsor Projektu  
**Raportuje do:** Zarząd / Dyrekcja  
**Współpracuje z:** IT Architect, Tech Lead, QA Lead  

**Odpowiedzialności:**
- Definiowanie i priorytetyzacja wymagań biznesowych w backlogu
- Zatwierdzanie kamieni milowych i deliverables każdej fazy
- Podejmowanie decyzji o zmianach zakresu projektu
- Komunikacja z zewnętrznymi interesariuszami
- Finalne zatwierdzenie przed deploymentem produkcyjnym

**Wymagane Umiejętności:**
- Znajomość domeny biznesowej (dealerstwo samochodowe)
- Podstawowa wiedza techniczna (agile, backlog management)
- Umiejętności komunikacyjne i zarządcze
- Narzędzia: Jira / GitHub Issues, Slack

---

### 2. IT Architect (Architekt IT)

**Tytuł:** Solution Architect / Chief Technical Architect  
**Raportuje do:** Project Owner  
**Współpracuje z:** Tech Lead, DB Engineer, DevOps  

**Odpowiedzialności:**
- Tworzenie i zatwierdzanie Architecture Decision Records (ADR)
- Definiowanie standardów technologicznych i wzorców projektowych
- Przegląd propozycji technicznych z Tech Leadem
- Projektowanie architektury docelowej systemu
- Nadzór nad migracją od architektury monolitycznej do warstwowej

**Wymagane Umiejętności:**
- Zaawansowana znajomość Node.js/Express.js, Angular
- Wzorce architektoniczne: clean architecture, SOLID, DDD
- Bezpieczeństwo webowe (OWASP Top 10)
- Projektowanie baz danych relacyjnych (Sequelize, MySQL/PostgreSQL)
- Docker, CI/CD, cloud deployments

---

### 3. Tech Lead (Lider Techniczny)

**Tytuł:** Senior Technical Lead  
**Raportuje do:** IT Architect  
**Współpracuje z:** Wszyscy developerzy, Code Reviewer, QA Lead  

**Odpowiedzialności:**
- Koordynowanie codziennej pracy zespołu deweloperskiego
- Prowadzenie code review i mentoring junior developerów
- Rozwiązywanie technicznych blokerów i sporów
- Utrzymanie standardów kodu (linting, formatowanie, konwencje)
- Zarządzanie długiem technicznym (tech debt backlog)

**Wymagane Umiejętności:**
- Full-stack: Angular 19, Node.js/Express, TypeScript
- Zaawansowany Git (branching strategies, rebasing)
- Refaktoryzacja kodu, wzorce projektowe (SOLID, GRASP)
- Umiejętności komunikacyjne i przywódcze

---

### 4. Backend Developer (Programista Backend) ×2

**Tytuł:** Backend Software Engineer  
**Raportuje do:** Tech Lead  
**Współpracuje z:** DB Engineer, Frontend Developer, QA  

**Odpowiedzialności (Backend Dev 1 — Senior):**
- Projektowanie i implementacja warstwy serwisów i kontrolerów
- Implementacja mechanizmów bezpieczeństwa (bcrypt, rate limiting, Helmet.js)
- Migracje bazy danych (Sequelize migrations)
- Code review dla Backend Dev 2

**Odpowiedzialności (Backend Dev 2 — Junior/Mid):**
- Implementacja endpointów API pod nadzorem Backend Dev 1
- Pisanie testów jednostkowych i integracyjnych (Jest, Supertest)
- Implementacja walidacji Joi

**Wymagane Umiejętności:**
- Node.js 20, Express.js 4.x, TypeScript (opcjonalnie)
- Sequelize ORM, MySQL, SQLite
- REST API design, HTTP protokół
- JWT, sesje, bcrypt, OAuth (podstawy)
- Jest, Supertest, TDD

---

### 5. Frontend Developer (Programista Frontend) ×2

**Tytuł:** Frontend Software Engineer  
**Raportuje do:** Tech Lead  
**Współpracuje z:** UX/UI Designer, Backend Developer  

**Odpowiedzialności (Frontend Dev 1 — Senior):**
- Architektura Angular: lazy loading, Signals, interceptors, guards
- Design system: CSS Custom Properties, Angular Material customization
- Performance optimization: OnPush, trackBy, lazy loading
- Code review dla Frontend Dev 2

**Odpowiedzialności (Frontend Dev 2 — Junior/Mid):**
- Implementacja komponentów Angular pod nadzorem
- Pisanie unit testów dla komponentów (Jasmine/Jest)
- Implementacja Reactive Forms

**Wymagane Umiejętności:**
- Angular 19: Standalone Components, Signals, Reactive Forms
- TypeScript, RxJS (podstawy, migracja do Signals)
- HTML5, CSS3, Bootstrap 5, Angular Material
- Angular CLI, SSR (Angular Universal)

---

### 6. DB Engineer (Inżynier Baz Danych)

**Tytuł:** Database Engineer / Data Engineer  
**Raportuje do:** IT Architect  
**Współpracuje z:** Backend Developer, DevOps  

**Odpowiedzialności:**
- Projektowanie i utrzymanie schematu bazy danych
- Tworzenie i wykonywanie migracji Sequelize
- Optymalizacja zapytań SQL i indeksów
- Planowanie strategii backup i recovery
- Migracja ze SQLite (dev) do MySQL (prod)

**Wymagane Umiejętności:**
- SQL zaawansowany (MySQL, SQLite)
- Sequelize ORM — migracje, modele, asocjacje
- Optymalizacja zapytań (EXPLAIN, indeksy)
- Backup i recovery MySQL
- Normalizacja baz danych (3NF)

---

### 7. DevOps Engineer (Inżynier DevOps)

**Tytuł:** DevOps / Infrastructure Engineer  
**Raportuje do:** IT Architect  
**Współpracuje z:** Backend Developer, Frontend Developer  

**Odpowiedzialności:**
- Konfiguracja i utrzymanie Docker i docker-compose
- Budowa i utrzymanie pipeline'ów GitHub Actions (CI/CD)
- Konfiguracja środowisk (dev, staging, production)
- Setup monitoringu (Prometheus, Grafana)
- Zarządzanie sekretami i zmiennymi środowiskowymi

**Wymagane Umiejętności:**
- Docker, docker-compose, Docker networking
- GitHub Actions — workflows, secrets, environments
- nginx — reverse proxy, SSL/TLS
- Linux (Ubuntu Server), bash scripting
- Prometheus, Grafana, alerting

---

### 8. UX Designer (Projektant UX)

**Tytuł:** UX Designer / User Experience Researcher  
**Raportuje do:** Tech Lead  
**Współpracuje z:** UI Designer, Frontend Developer  

**Odpowiedzialności:**
- Analiza user journeys i pain points
- Tworzenie wireframes i prototypów (Figma)
- Przeprowadzanie audytów użyteczności (usability audit)
- Definiowanie user flows dla kluczowych ścieżek (login, zakup, wynajem)

**Wymagane Umiejętności:**
- Figma, Adobe XD lub podobne narzędzia prototypowania
- Badania użytkowników (user testing, heuristic evaluation)
- Podstawy dostępności (WCAG 2.1 AA)

---

### 9. UI Designer (Projektant UI)

**Tytuł:** UI Designer / Visual Designer  
**Raportuje do:** Tech Lead  
**Współpracuje z:** UX Designer, Frontend Developer  

**Odpowiedzialności:**
- Tworzenie i utrzymanie design systemu (design tokens, komponenty)
- Projektowanie wizualne komponentów Angular Material
- Definiowanie palety kolorów, typografii, ikonografii
- Przekazywanie specyfikacji deweloperom (hand-off)

**Wymagane Umiejętności:**
- Figma (zaawansowany — komponenty, auto-layout, variables)
- CSS/SCSS, CSS Custom Properties
- Podstawy Angular Material customization
- Responsywny design (mobile-first)

---

### 10. QA Lead (Lider QA)

**Tytuł:** QA Lead / Test Manager  
**Raportuje do:** Project Owner  
**Współpracuje z:** Tech Lead, Manual Tester, Automation Tester  

**Odpowiedzialności:**
- Definiowanie strategii testowania dla całego projektu
- Zarządzanie quality gates (definicja DoD — Definition of Done)
- Nadzór nad pokryciem testami i raportowaniem
- Koordynacja pracy Manual Testera i Automation Testera
- Akceptacja każdego sprintu (sprint review QA checkpoint)

**Wymagane Umiejętności:**
- Strategia testowania (piramida testów, TDD, BDD)
- Playwright, Jest, Supertest — wiedza koncepcyjna
- Zarządzanie defektami (bug tracking, severity/priority)
- Znajomość OWASP Top 10, testy bezpieczeństwa

---

### 11. Manual Tester (Tester Manualny)

**Tytuł:** QA Engineer — Manual Testing  
**Raportuje do:** QA Lead  
**Współpracuje z:** Automation Tester, developerzy  

**Odpowiedzialności:**
- Wykonywanie testów eksploracyjnych dla każdej nowej funkcjonalności
- Regresja manualna po każdym deploymencie
- Dokumentowanie bug reportów (format: reprodukcja, expected, actual, environment)
- Testowanie dostępności (WCAG 2.1) i kompatybilności przeglądarek

**Wymagane Umiejętności:**
- Techniki testowania eksploracyjnego
- DevTools Chrome/Firefox (debugowanie, network tab)
- Pisanie przypadków testowych (test cases)
- Podstawy HTML/CSS (inspekcja elementów)

---

### 12. Automation Tester (Tester Automatyczny)

**Tytuł:** QA Automation Engineer  
**Raportuje do:** QA Lead  
**Współpracuje z:** DevOps (CI integration), Frontend Developer  

**Odpowiedzialności:**
- Tworzenie i utrzymanie testów Playwright E2E
- Implementacja Page Object Model (POM) pattern
- Integracja testów E2E z GitHub Actions CI
- Tworzenie testów API (Playwright API testing)
- Konfiguracja i analiza Allure Report

**Wymagane Umiejętności:**
- Playwright zaawansowany (fixtures, POM, parallel execution)
- JavaScript/TypeScript
- GitHub Actions (uruchamianie testów w CI)
- k6 / Artillery (testy wydajnościowe)

---

### 13. Code Reviewer (Recenzent Kodu)

**Tytuł:** Senior Code Reviewer / Security Champion  
**Raportuje do:** IT Architect  
**Współpracuje z:** Tech Lead, wszyscy developerzy  

**Odpowiedzialności:**
- Przegląd każdego Pull Request według 25-punktowej checklisty
- Weryfikacja zgodności z ADR i standardami projektu
- Identyfikacja problemów bezpieczeństwa (security champion)
- Mentoring i feedback dla junior developerów

**Wymagane Umiejętności:**
- Pełna znajomość stosu technologicznego (Angular + Express + Sequelize)
- Bezpieczeństwo webowe (OWASP Top 10, CWE)
- SOLID, Clean Code, design patterns
- Git — analiza diffów, wykrywanie regresji

---

### 14. Technical Writer (Pisarz Techniczny)

**Tytuł:** Technical Writer / Documentation Specialist  
**Raportuje do:** Project Owner  
**Współpracuje z:** IT Architect, Tech Lead, QA Lead  

**Odpowiedzialności:**
- Tworzenie i utrzymanie kompletnej dokumentacji technicznej
- Pisanie onboarding guide dla nowych deweloperów
- Dokumentacja API (OpenAPI/Swagger 3.0)
- Tworzenie runbooks operacyjnych
- Pisanie CHANGELOG.md i release notes

**Wymagane Umiejętności:**
- Markdown, MDX, Confluence
- OpenAPI 3.0 (Swagger) specyfikacja
- Podstawy programowania (rozumienie kodu do dokumentacji)
- Diagramy architektoniczne (draw.io, Mermaid, ASCII art)

---

## Protokoły Komunikacji

### Narzędzia Komunikacyjne

| Narzędzie | Przeznaczenie | Kanały/Grupy | Czas Odpowiedzi |
|-----------|--------------|-------------|----------------|
| **Slack** | Komunikacja bieżąca, szybkie pytania | `#dev`, `#qa`, `#deploys`, `#incidents`, `#general` | < 2h w godzinach pracy |
| **GitHub Issues** | Śledzenie zadań, bug reports, user stories | Labels: `bug`, `feature`, `security`, `tech-debt` | N/A |
| **GitHub Pull Requests** | Code review, dyskusje techniczne | Branch per feature/fix | Review < 24h robocze |
| **GitHub Projects** | Kanban board, sprint tracking | Board: Backlog → In Progress → In Review → Done | N/A |
| **Confluence / Wiki** | Dokumentacja długoterminowa | Strony: Architecture, Runbooks, Onboarding | N/A |
| **Email** | Komunikacja formalna, raporty | Adresy służbowe | < 1 dzień roboczy |

### Standardy Komunikacji

1. **Codzienne update'y:** Każdy developer komentuje swój ticket statusem pod koniec dnia
2. **Blokery:** Natychmiastowe zgłoszenie na Slack `#dev` + ping Tech Lead
3. **Incydenty produkcyjne:** Alert na `#incidents`, PagerDuty (opcjonalnie), eskalacja < 15 minut
4. **Decyzje architektoniczne:** Zawsze przez ADR (Architecture Decision Record) z pull requestem
5. **Bug report:** Template: Tytuł | Środowisko | Kroki reprodukcji | Expected | Actual | Screenshot

---

## Rytm Spotkań

| Ceremonia | Częstotliwość | Czas Trwania | Prowadzący | Uczestnicy | Format |
|-----------|--------------|-------------|-----------|------------|--------|
| Daily Standup | Każdy dzień roboczy | 15 min | Tech Lead (rotacyjnie) | Cały zespół | Remote/Slack standup |
| Sprint Planning | Co 2 tygodnie (poniedziałek) | 2h | Tech Lead + Project Owner | PO, Arch, TL, Dev, QA | Wideokonferencja |
| Sprint Review | Co 2 tygodnie (piątek) | 1h | Tech Lead | Cały zespół + stakeholderzy | Demo aplikacji |
| Retrospektywna | Co 2 tygodnie (piątek, po Review) | 1h | Tech Lead (rotacyjnie) | Cały zespół | Retro board (Start/Stop/Continue) |
| Architecture Review | Co sprint (środa tygodnia 1) | 1h | IT Architect | Arch, TL, Senior Devs | Prezentacja ADR + Q&A |
| Security Review | Co miesiąc | 30 min | Code Reviewer | Arch, TL, CR | Raport OWASP ZAP + findings |

---

## Proces Podejmowania Decyzji

### Poziomy Decyzyjne

| Poziom | Zakres Decyzji | Odpowiedzialny | Czas na Decyzję |
|--------|---------------|----------------|----------------|
| **L1 — Indywidualny** | Implementacja, naming, minor refactoring | Developer | Natychmiastowy |
| **L2 — Konsensus Zespołu** | Wybór biblioteki, API contract, test strategy | Tech Lead + Developerzy | < 1 dzień |
| **L3 — Tech Lead** | Struktury kodu, breaking changes, debt management | Tech Lead | < 1 dzień roboczy |
| **L4 — Architekt** | Decyzje architektoniczne (ADR), nowe technologie, security | IT Architect | < 3 dni robocze |
| **L5 — Project Owner** | Zmiany zakresu, zmiana terminów, budżet | Project Owner | < 1 tydzień |

### Ścieżka Eskalacji

```
Deweloper
    │ (bloker > 2h)
    ▼
Tech Lead
    │ (bloker > 1 dzień lub decyzja arch.)
    ▼
IT Architect
    │ (zmiana zakresu lub budżetu)
    ▼
Project Owner
    │ (incydent produkcyjny P1)
    ▼
Zarząd / Dyrekcja
```

**Incydenty Produkcyjne:**
- **P1 (Critical):** Aplikacja niedostępna lub utrata danych → Tech Lead + DevOps w < 15 min
- **P2 (High):** Kluczowa funkcja niesprawna → Tech Lead w < 1h
- **P3 (Medium):** Błąd wpływający na UX → Normalny sprint planning
- **P4 (Low):** Kosmetyczny błąd → Backlog

---

*Dokumentacja Zespołu — wersja 1.0 — styczeń 2025*  
*Właściciel: Project Owner | Autor: Technical Writer*
