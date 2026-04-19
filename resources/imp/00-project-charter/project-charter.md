# Karta Projektu — Salon Samochodowy

| Pole | Wartość |
|------|---------|
| **Nazwa projektu** | Salon Samochodowy — Restrukturyzacja i Rozwój |
| **Wersja** | 1.0.0 |
| **Data** | 2026-03-29 |
| **Status** | Faza 0 — Audyt i Planowanie |
| **Właściciel** | Product Owner |

---

## Streszczenie Wykonawcze

Projekt **Salon Samochodowy** to aplikacja webowa umożliwiająca zarządzanie salonem samochodowym — przeglądanie oferty, wynajem, leasing i zakup pojazdów. Aplikacja istnieje jako prototyp edukacyjny wymagający kompleksowej restrukturyzacji przed wdrożeniem produkcyjnym.

Celem projektu jest przekształcenie prototypu w bezpieczną, skalowalną aplikację produkcyjną z pełnym pokryciem testowym, nowoczesnym designem i zautomatyzowanym pipeline'em CI/CD.

---

## Problem Statement

Obecna aplikacja posiada **krytyczne luki bezpieczeństwa**, **dług techniczny** i **brak standardów jakości**:

1. Hasła przechowywane w plaintext (INC-001 — CRITICAL)
2. Błędna domyślna rola użytkownika (INC-002 — HIGH)
3. Brak rate limitingu (INC-005 — HIGH)
4. Brak Angular route guards (INC-010 — HIGH)
5. Brak testów jednostkowych dla frontendu
6. Brak CI/CD pipeline
7. Brak konteneryzacji (Docker)
8. Niespójna architektura kodu

---

## Cele Projektu (SMART)

| # | Cel | Mierzalny wskaźnik | Sprint |
|---|-----|-------------------|--------|
| C1 | Wyeliminować wszystkie krytyczne luki bezpieczeństwa | 0 otwartych CRITICAL/HIGH incydentów | Sprint 0–1 |
| C2 | Osiągnąć pokrycie testami >80% | Jest/Coverage report ≥80% | Sprint 4 |
| C3 | Wdrożyć CI/CD pipeline | GitHub Actions: PR checks + deploy | Sprint 1 |
| C4 | Skonteneryzować aplikację | docker-compose up działa end-to-end | Sprint 1 |
| C5 | Przeprojektować UI według design system | Lighthouse UX score ≥90 | Sprint 3 |
| C6 | Wdrożyć Angular Signals i auth guards | Brak BehaviorSubject w serwisach | Sprint 3 |
| C7 | Rozbudować testy E2E do 90 testów | 90 testów Playwright przechodzi | Sprint 4 |

---

## Zakres Projektu

### W zakresie (In-Scope)
- Refaktoryzacja backendu (bezpieczeństwo, API v1, paginacja, RBAC)
- Redesign frontendu (Angular Signals, guards, nowy design system)
- Rozbudowa testów (Playwright, Jest, Angular)
- Konfiguracja Docker i GitHub Actions CI/CD
- Dokumentacja techniczna i onboarding guide

### Poza zakresem (Out-of-Scope)
- Migracja na inny framework backendowy (pozostaje Express.js)
- Integracja z zewnętrznymi systemami płatności
- Mobile native app
- Funkcje wielojęzyczności (i18n)

---

## Stakeholderzy

| Rola | Agent | Odpowiedzialność | Uprawnienia decyzyjne |
|------|-------|-----------------|----------------------|
| Product Owner | project-owner-agent | Priorytety, backlog, akceptacja | Wysoki — zakres i priorytety |
| IT Architect | architect-agent | Architektura, ADRy, standardy | Wysoki — decyzje techniczne |
| Tech Lead | tech-lead-agent | Jakość kodu, PR review, mentoring | Średni — implementacja |
| Backend Dev | backend-developer-agent | API, DB, auth, bezpieczeństwo | Niski — wykonanie |
| Frontend Dev | frontend-developer-agent | Angular, komponenty, serwisy | Niski — wykonanie |
| DB Engineer | database-engineer-agent | Schemat, migracje, optymalizacja | Niski — baza danych |
| DevOps | devops-engineer-agent | Docker, CI/CD, środowiska | Średni — infrastruktura |
| UX Designer | ux-designer-agent | User journeys, wireframes | Średni — UX decyzje |
| UI Designer | ui-designer-agent | Design system, komponenty | Niski — wizualizacja |
| QA Lead | qa-lead-agent | Strategia testów, quality gates | Średni — jakość |
| Manual Tester | manual-tester-agent | Testy eksploracyjne, regresja | Niski — testowanie |
| Automation QA | automation-tester-agent | Playwright, CI integration | Niski — automatyzacja |
| Code Reviewer | code-reviewer-agent | Review kodu, bezpieczeństwo | Średni — akceptacja PR |
| Tech Writer | technical-writer-agent | Dokumentacja, onboarding | Niski — dokumentacja |

---

## Ryzyka i Mitigacje

| ID | Ryzyko | Prawdopodobieństwo | Wpływ | Mitigacja |
|----|--------|-------------------|-------|-----------|
| R01 | Migracja haseł (bcrypt) powoduje utratę dostępu adminów | Średnie | Wysoki | Skrypt migracji + testy przed wdrożeniem |
| R02 | Zmiana API /cars → /api/v1/cars psuje testy | Wysokie | Średni | Wersjonowanie z backward compat. przez 1 sprint |
| R03 | Angular Signals migracja powoduje regresje | Średnie | Wysoki | Migracja inkrementalna, jeden komponent naraz |
| R04 | Docker setup nie działa na Windows dev machines | Średnie | Niski | Docker Desktop + WSL2 requirement |
| R05 | Testy Playwright niestabilne w CI | Wysokie | Średni | Retry: 2, flaky test quarantine |
| R06 | SQLite → MySQL migracja danych traci rekordy | Niskie | Wysoki | Backup przed migracją, testy na kopii |
| R07 | Brakuje czasu na redesign UI w Sprint 3 | Średnie | Niski | Design system jako MVP — kolory + spacing |
| R08 | express-rate-limit blokuje testy integracyjne | Niskie | Średni | Wyłącz limiter w środowisku test |

---

## Kryteria Sukcesu

- [ ] Wszystkie incydenty CRITICAL i HIGH zamknięte
- [ ] `npm audit` — zero HIGH/CRITICAL vulnerabilities
- [ ] Pokrycie testami ≥80% (backend + frontend)
- [ ] 90 testów Playwright przechodzi w CI
- [ ] `docker-compose up` uruchamia pełną aplikację
- [ ] Lighthouse Performance ≥85, Accessibility ≥90
- [ ] Zero `alert()` lub `confirm()` w kodzie Angular

---

## Harmonogram Faz

| Faza | Nazwa | Czas | Kluczowy deliverable |
|------|-------|------|---------------------|
| Faza 0 | Audyt i Planowanie | Sprint 0 | Dokumentacja, poprawki CRITICAL |
| Faza 1 | Bezpieczeństwo i Infrastruktura | Sprint 1 | bcrypt, JWT, Docker, CI/CD |
| Faza 2 | Refaktoryzacja Backendu | Sprint 2 | /api/v1/, paginacja, Transaction model |
| Faza 3 | Redesign Frontendu | Sprint 3 | Signals, guards, nowy design |
| Faza 4 | Testy i Jakość | Sprint 4 | ≥80% coverage, 90 E2E testów |
| Faza 5 | Gotowość Produkcyjna | Sprint 5 | HTTPS, monitoring, deployment |

---

## Szczegółowe Kryteria Sukcesu

| ID | Kryterium | Metoda Pomiaru | Wartość Docelowa | Odpowiedzialny | Faza |
|----|-----------|---------------|-----------------|----------------|------|
| KS-001 | Brak krytycznych luk bezpieczeństwa | Raport OWASP ZAP | 0 luk krytycznych i wysokich | QA Lead + Dev | Faza 1 |
| KS-002 | Hashowanie haseł bcrypt | Inspekcja kodu + testy jednostkowe | 100% haseł haszowanych (rounds=12) | Backend Dev | Faza 1 |
| KS-003 | Pokrycie testami — backend | Raport Istanbul/Jest | ≥ 80% statement coverage | QA Lead | Faza 4 |
| KS-004 | Pokrycie testami — frontend | Raport Angular/Jest | ≥ 75% statement coverage | QA Lead | Faza 4 |
| KS-005 | Wydajność frontendu (Lighthouse) | Audyt Lighthouse CI | Performance ≥ 90, Accessibility ≥ 90 | Frontend Dev | Faza 3 |
| KS-006 | Czas odpowiedzi API (p95) | k6 load test (100 VU, 5 min) | p95 < 200ms dla GET /api/v1/cars | DevOps + Backend | Faza 4 |
| KS-007 | Działający pipeline CI/CD | GitHub Actions — status PR checks | 100% PR przechodzi pipeline (lint+test+build) | DevOps | Faza 1 |
| KS-008 | Dokumentacja API kompletna | OpenAPI 3.0 — walidacja | 100% endpointów udokumentowanych ze schematami | Tech Writer | Faza 2 |

---

## Szczegółowa Tabela Ryzyk

| ID | Ryzyko | Prawdop. | Wpływ | Poziom Ryzyka | Plan Mitygacji | Plan Awaryjny |
|----|--------|---------|-------|--------------|---------------|---------------|
| R-001 | Migracja haseł do bcrypt wymaga resetowania wszystkich kont | Wysoka | Wysoki | **Krytyczny** | Skrypt migracji `migrate-passwords.js`; batch update po pierwszym logowaniu | Komunikat w UI: "Wymagany reset hasła" |
| R-002 | Zmiana schematu DB psuje istniejące testy Playwright | Wysoka | Wysoki | **Krytyczny** | Uruchomić pełną suitę przed migracją; testy na kopii bazy; backup przed każdą migracją | Przywróć backup DB; napraw testy inkrementalnie |
| R-003 | Migracja API do `/api/v1/` psuje integracje klientów FE | Średnia | Wysoki | **Wysoki** | Utrzymaj stare endpointy `/cars` jako deprecated przez 2 sprinty z nagłówkiem `Deprecation` | Proxy stare endpointy na nowe przez nginx |
| R-004 | Przeciążenie zespołu — równoległe prace w Fazie 2 i 3 | Średnia | Średni | **Wysoki** | Fazy z 20% buforem czasowym; tygodniowy sync BE↔FE; feature flags | Przesunięcie Fazy 3 o 1 sprint |
| R-005 | Docker Desktop problemy na Windows 10/11 (WSL2) | Wysoka | Średni | **Wysoki** | Dokumentacja setup Windows; obowiązkowy WSL2; fallback: `node + sqlite` bez Docker | Lokalne środowisko bez Dockera w dev |
| R-006 | Niska znajomość Angular Signals w zespole FE | Średnia | Średni | **Średni** | 2-dniowe szkolenie wewnętrzne przed Fazą 3; PoC na komponencie `navbar` | Stopniowa migracja tylko dla nowych komponentów |
| R-007 | Niezgodności SQLite vs MySQL przy migracji do produkcji | Średnia | Wysoki | **Wysoki** | Testy kompatybilności w CI z MySQL; Sequelize abstrakcja; testy na MySQL od Fazy 2 | Utrzymaj SQLite w produkcji jako fallback tymczasowy |
| R-008 | Odejście kluczowego dewelopera podczas projektu | Niska | Wysoki | **Średni** | Pair programming na kluczowych modułach; dokumentacja kodu (JSDoc); wiki Confluence | Cross-training; zewnętrzny konsultant |
| R-009 | Brak środowiska staging powoduje regresje w prod | Średnia | Wysoki | **Wysoki** | Alokacja VPS staging w Fazie 5; IaC (Docker Compose); środowisko test w CI | Manualny testing przed każdym deployem prod |
| R-010 | Playwright testy flaky po zmianie UI (selektory CSS) | Wysoka | Niski | **Średni** | `data-testid` atrybuty na wszystkich interaktywnych elementach; Page Object Pattern | Quarantine niestabilnych testów; retry: 2 |

---

## Budżet i Zasoby

### Zasoby Ludzkie

| Rola | Liczba | Zaangażowanie | Fazy | Szacowany Czas |
|------|--------|--------------|------|---------------|
| Project Owner | 1 | 10% | Wszystkie | ~4h/tydzień |
| IT Architect | 1 | 50% | 0–2 | ~20h/tydzień |
| Tech Lead | 1 | 100% | Wszystkie | ~40h/tydzień |
| Backend Developer | 2 | 100% | 1–4 | ~80h/tydzień łącznie |
| Frontend Developer | 2 | 100% | 3–4 | ~80h/tydzień łącznie |
| DB Engineer | 1 | 50% | 0–2 | ~20h/tydzień |
| DevOps Engineer | 1 | 50% | 1, 5 | ~20h/tydzień |
| UX/UI Designer | 2 | 50% | 3 | ~40h/tydzień łącznie |
| QA Lead | 1 | 50% | Wszystkie | ~20h/tydzień |
| Manual Tester | 1 | 100% | 4 | ~40h/tydzień |
| Automation Tester | 1 | 100% | 4 | ~40h/tydzień |
| Code Reviewer | 1 | 25% | 1–4 | ~10h/tydzień |
| Technical Writer | 1 | 50% | 0, 5 | ~20h/tydzień |

### Zasoby Infrastrukturalne

| Zasób | Środowisko | Specyfikacja | Szacowany Koszt/mies. |
|-------|-----------|-------------|----------------------|
| Serwer Staging | Cloud (VPS) | 2 vCPU, 4 GB RAM, 50 GB SSD | ~50 PLN |
| Serwer Produkcyjny | Cloud (VPS) | 4 vCPU, 8 GB RAM, 100 GB SSD | ~100 PLN |
| Backup Storage | Cloud (Object Storage) | 50 GB | ~10 PLN |
| CI/CD (GitHub Actions) | GitHub Free Tier | 2000 min/mies. | 0 PLN |
| SSL/TLS (Let's Encrypt) | — | Certyfikat wildcard | 0 PLN |
| Monitoring (self-hosted) | Serwer Staging | Prometheus + Grafana | 0 PLN |

### Narzędzia i Licencje

| Narzędzie | Koszt | Uwagi |
|-----------|-------|-------|
| GitHub | 0 | Open source / free tier |
| Docker Desktop | 0 | Free dla small teams |
| VS Code | 0 | Open source |
| Jira (opcjonalnie) | 0 | GitHub Issues jako alternatywa |
| Confluence (opcjonalnie) | 0 | Markdown w repo jako alternatywa |
| OWASP ZAP | 0 | Open source |
| k6 | 0 | Open source |

**Całkowity szacowany koszt infrastruktury:** ~160 PLN/miesiąc (przez ~5 miesięcy = ~800 PLN)  
**Bufor rezerwowy:** 20% całkowitego budżetu projektu

---

## Założenia Projektowe

1. Aplikacja jest projektem edukacyjnym transformowanym w produkcyjny — nie ma wymagań SLA klas enterprise
2. Zespół pracuje w metodologii Agile Scrum z 2-tygodniowymi sprintami
3. Komunikacja przez Slack (kanały: `#dev`, `#qa`, `#deploys`, `#incidents`)
4. Zarządzanie zadaniami przez GitHub Issues + Projects
5. Code review wymagany dla każdego Pull Request przed merge do `main`
6. Branch strategy: `main` (prod), `develop` (integration), `feature/*`, `fix/*`, `chore/*`
7. Konwencja commitów: Conventional Commits (feat, fix, docs, chore, refactor, test)
8. Środowisko lokalne: Node.js 20 LTS, npm 10+, SQLite3

---

## Podpisy i Zatwierdzenie

Niniejsza karta projektu została przygotowana i wymaga formalnego zatwierdzenia przez poniższe osoby:

| Rola | Imię i Nazwisko | Data Zatwierdzenia | Podpis |
|------|----------------|-------------------|--------|
| Project Owner | ________________________ | __________________ | ______________ |
| IT Architect | ________________________ | __________________ | ______________ |
| Tech Lead | ________________________ | __________________ | ______________ |
| QA Lead | ________________________ | __________________ | ______________ |

**Ważność dokumentu:** Karta projektu obowiązuje od daty zatwierdzenia do zakończenia projektu.  
**Procedura zmian:** Wszelkie zmiany zakresu wymagają aktualizacji karty i ponownego zatwierdzenia przez Project Ownera.

---

*Dokument przygotowany przez: Technical Writer*  
*Wersja: 1.0 — styczeń 2025*  
*Następny przegląd: Po zakończeniu Fazy 0 (Audyt i Planowanie)*
