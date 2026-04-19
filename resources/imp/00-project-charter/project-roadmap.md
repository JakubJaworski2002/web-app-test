# Roadmapa Projektu — Salon Samochodowy

## Przegląd Faz

```
Faza 0      Faza 1           Faza 2              Faza 3           Faza 4        Faza 5
Audyt   →  Bezpieczeństwo →  Backend Refactor →  Frontend  →    Testing   →   Production
Sprint 0    Sprint 1          Sprint 2            Sprint 3       Sprint 4      Sprint 5
```

---

## Faza 0 — Audyt i Planowanie (Sprint 0)

### Cel
Zidentyfikowanie wszystkich problemów, stworzenie dokumentacji, naprawienie incydentów CRITICAL.

### Deliverables
- [x] Audyt kodu — 10 incydentów zidentyfikowanych
- [x] Dokumentacja zespołu agentów (`resources/imp/02-agents/`)
- [x] Architektura obecna i docelowa
- [x] Backlog i plan sprintów
- [ ] Naprawa INC-001 (bcrypt)
- [ ] Naprawa INC-002 (isDealer default)
- [ ] Naprawa INC-005 (rate limiting)

### Kryteria Zakończenia
- Zero otwartych incydentów CRITICAL
- Cała dokumentacja w `resources/imp/` kompletna
- Testy Playwright przechodzą baseline

---

## Faza 1 — Bezpieczeństwo i Infrastruktura (Sprint 1)

### Cel
Wdrożenie poprawek bezpieczeństwa, konteneryzacja, CI/CD.

### Deliverables
- [ ] bcrypt wdrożony + migracja haseł (INC-001)
- [ ] Rate limiting na /login, /register (INC-005)
- [ ] CORS z env (INC-006)
- [ ] Angular AuthGuard + DealerGuard (INC-010)
- [ ] Dockerfile frontend + backend
- [ ] docker-compose.yml (frontend, backend, mysql)
- [ ] GitHub Actions: PR checks workflow
- [ ] SESSION_SECRET tylko z env (już done)

### Kryteria Zakończenia
- `npm audit` — zero HIGH/CRITICAL
- OWASP Top 10 — A01-A07 status poprawa
- `docker-compose up` działa

---

## Faza 2 — Refaktoryzacja Backendu (Sprint 2)

### Cel
Modernizacja API, nowe funkcjonalności, poprawna architektura.

### Deliverables
- [ ] API versioning: `/api/v1/` prefix
- [ ] Paginacja dla `GET /api/v1/cars` (`?page=1&limit=10`)
- [ ] Filtrowanie i sortowanie po stronie backendu
- [ ] Model `Transaction` (rent/buy/leasing history)
- [ ] `GET /api/v1/transactions` — historia transakcji
- [ ] Pole `isSold` w modelu `Car`
- [ ] Pełne RBAC (sprawdzanie roli na każdym endpointcie)
- [ ] Standaryzacja odpowiedzi błędów `{ success, error: { code, message } }`
- [ ] Health check endpoint `GET /health`
- [ ] Request ID middleware (tracing)
- [ ] Winston logger

### Kryteria Zakończenia
- Wszystkie endpointy pod `/api/v1/`
- Stara wersja `/cars` nadal działa (backward compat.)
- Testy Playwright zaktualizowane dla nowych URLi

---

## Faza 3 — Redesign Frontendu (Sprint 3)

### Cel
Nowoczesny Angular, nowy design system, poprawiona architektura.

### Deliverables
- [ ] Angular Signals — migracja AuthenticationService
- [ ] Angular Signals — migracja CarService
- [ ] Route guards wdrożone (z Fazy 1 — przeniesione)
- [ ] Reactive Forms dla wszystkich formularzy
- [ ] Loading spinner component
- [ ] Error toast (MatSnackBar) — zastąpienie alert()
- [ ] Nowy design system (CSS variables, nowe kolory)
- [ ] Redesign car card (image, overlay, badges)
- [ ] Redesign navbar
- [ ] Responsywność mobile (Bootstrap grid)
- [ ] Poprawka literówki brandserch (INC-007)
- [ ] Naprawienie memory leak (INC-009)
- [ ] OnPush change detection we wszystkich komponentach
- [ ] TrackBy w ngFor loops

### Kryteria Zakończenia
- Lighthouse Accessibility ≥90
- Zero `alert()` w kodzie
- Zero `any` TypeScript typów w serwisach

---

## Faza 4 — Testy i Jakość (Sprint 4)

### Cel
Pełne pokrycie testami, rozbudowa suity E2E, CI integration.

### Deliverables
- [ ] Jest coverage backend ≥80%
- [ ] Angular test coverage ≥80%
- [ ] 30 nowych testów Playwright (+POM pattern)
- [ ] Playwright Visual Regression tests
- [ ] Accessibility tests (axe-playwright)
- [ ] Performance tests (k6 lub Artillery)
- [ ] Allure reporting setup
- [ ] GitHub Actions: pełna suita E2E w CI
- [ ] Flaky test raport i naprawa

### Kryteria Zakończenia
- 90 testów Playwright — wszystkie zielone w CI
- Backend coverage ≥80%
- Frontend coverage ≥80%
- Zero flaky testów

---

## Faza 5 — Gotowość Produkcyjna (Sprint 5)

### Cel
Wdrożenie produkcyjne, monitoring, finalna dokumentacja.

### Deliverables
- [ ] HTTPS konfiguracja (nginx + certbot)
- [ ] Production Docker compose z MySQL
- [ ] GitHub Actions: CD workflow (deploy)
- [ ] Environment separation (dev/staging/prod)
- [ ] Health monitoring (uptime checks)
- [ ] Log aggregation
- [ ] Database backup automation
- [ ] OpenAPI/Swagger dokumentacja
- [ ] User manual (admin + customer)
- [ ] Developer onboarding guide
- [ ] CHANGELOG.md

### Kryteria Zakończenia
- Aplikacja dostępna na produkcyjnym URL
- Monitoring alertuje przy downtime
- Nowy deweloper może onboardować w <2h

---

## Szczegółowy Plan Każdej Fazy

### Faza 0 — Audyt i Planowanie (2 tygodnie)

**Cele szczegółowe:**  
Zebranie wiedzy o bieżącym stanie aplikacji, identyfikacja wszystkich problemów technicznych i bezpieczeństwa, przygotowanie kompletnej dokumentacji projektowej oraz onboarding całego zespołu. Faza ma charakter przygotowawczy — żaden kod produkcyjny nie jest zmieniany, z wyjątkiem krytycznych hotfixów (INC-001, INC-002).

**Zależności:** Brak (faza startowa)

**Metryki Sukcesu:**
- Wszystkie dokumenty w `resources/imp/` ukończone i zweryfikowane
- Backlog projektu zawiera ≥ 50 user stories z estymacjami
- Onboarding checklist zaliczony przez każdego członka zespołu
- INC-001 i INC-002 naprawione jako hotfix

**Zespół:** Project Owner, IT Architect, Tech Lead, DB Engineer, Technical Writer, QA Lead

**Kluczowe Zadania:**
1. Przeprowadzenie audytu kodu backendu (server.js, models.js) — identyfikacja 15 problemów
2. Przeprowadzenie audytu kodu frontendu (komponenty Angular, serwisy)
3. Stworzenie karty projektu (project-charter.md)
4. Stworzenie roadmapy projektu (project-roadmap.md)
5. Stworzenie dokumentacji struktury zespołu (team-structure.md)
6. Analiza obecnej architektury (current-state-analysis.md)
7. Projekt architektury docelowej (target-architecture.md)
8. Dokumentacja schematu bazy danych (database-schema.md)
9. Specyfikacja API (api-specification.md)
10. Architecture Decision Records (technology-decisions.md)
11. Przegląd pakietów npm (`npm audit`) i zależności
12. Stworzenie backlogu w GitHub Issues z etykietami
13. Konfiguracja branch strategy i konwencji commitów
14. Hotfix INC-001 (bcrypt) — implementacja i testy
15. Hotfix INC-002 (isDealer default=false) — implementacja i testy

---

### Faza 1 — Bezpieczeństwo i Infrastruktura (4 tygodnie)

**Cele szczegółowe:**  
Wyeliminowanie wszystkich krytycznych i wysokich luk bezpieczeństwa, konteneryzacja aplikacji w Docker oraz budowa podstawowego pipeline'u CI/CD w GitHub Actions. Faza ta jest warunkiem koniecznym dla bezpiecznego działania aplikacji w środowisku produkcyjnym.

**Zależności:** Faza 0 (dokumentacja, audyt, hotfixy)

**Metryki Sukcesu:**
- 0 otwartych incydentów CRITICAL i HIGH w trackerze
- `npm audit` wykazuje 0 vulnerabilities HIGH/CRITICAL
- `docker-compose up` uruchamia cały stack (FE + BE + DB)
- GitHub Actions pipeline: wszystkie PR przechodzą lint + test + build
- Raport OWASP ZAP: 0 HIGH/CRITICAL findings

**Zespół:** Tech Lead, Backend Developer x2, DevOps Engineer, QA Lead

**Kluczowe Zadania:**
1. Implementacja bcrypt dla nowych rejestracji (INC-001) — jeśli nie w Fazie 0
2. Skrypt migracji haseł istniejących użytkowników
3. Poprawka isDealer default=false (INC-002) — jeśli nie w Fazie 0
4. Implementacja express-rate-limit (100 req/15min globalny, 5 req/min dla /login)
5. Instalacja i konfiguracja Helmet.js (CSP, HSTS, nosniff)
6. Konfiguracja CORS z zmienną środowiskową ALLOWED_ORIGINS
7. Implementacja Angular AuthGuard i DealerGuard
8. Naprawa logiki zakupu — sprawdzanie `isSold` zamiast `isAvailableForRent` (INC-003)
9. Stworzenie Dockerfile dla frontendu (build + serve nginx)
10. Stworzenie Dockerfile dla backendu (Node.js Alpine)
11. Stworzenie docker-compose.yml (frontend + backend + mysql)
12. Konfiguracja zmiennych środowiskowych (.env.example)
13. GitHub Actions workflow: `ci.yml` (lint + test + build na każdy PR)
14. Testy jednostkowe dla nowych mechanizmów bezpieczeństwa
15. Aktualizacja testów Playwright po zmianach (guards, rate limiting)

---

### Faza 2 — Refaktoryzacja Backendu (4 tygodnie)

**Cele szczegółowe:**  
Modernizacja architektury backendu poprzez wprowadzenie wersjonowania API, separacji odpowiedzialności (controllers/services/repositories), walidacji danych wejściowych, paginacji i nowego modelu Transaction. Faza przygotowuje backend do skalowania i długoterminowego utrzymania.

**Zależności:** Faza 1 (bezpieczeństwo, Docker, CI/CD)

**Metryki Sukcesu:**
- 100% endpointów dostępnych pod `/api/v1/` prefixem
- Stare endpointy zwracają nagłówek `Deprecation: true` i nadal działają
- GET /api/v1/cars obsługuje paginację (`?page=1&limit=10&brand=Toyota`)
- Wszystkie endpointy POST/PUT przechodzą walidację Joi
- Code coverage backend ≥ 60% (wstępny cel przed Fazą 4)

**Zespół:** Tech Lead, Backend Developer x2, DB Engineer, Code Reviewer

**Kluczowe Zadania:**
1. Refaktoryzacja server.js → struktura routes/controllers/services/middleware
2. Stworzenie `routes/auth.routes.js`, `routes/cars.routes.js`, `routes/users.routes.js`
3. Stworzenie kontrolerów: `auth.controller.js`, `cars.controller.js`, `users.controller.js`
4. Stworzenie serwisów: `auth.service.js`, `car.service.js`, `transaction.service.js`
5. Implementacja `middleware/auth.middleware.js` i `middleware/dealer.middleware.js`
6. Implementacja `middleware/errorHandler.middleware.js` (standardowe odpowiedzi błędów)
7. Dodanie wersjonowania API: `v1Router` → `/api/v1/`
8. Implementacja paginacji dla GET /api/v1/cars i GET /api/v1/users
9. Implementacja filtrowania i sortowania dla GET /api/v1/cars
10. Walidacja Joi dla POST /register, POST /login, POST /cars, PUT /cars/:id
11. Sekwelowe migracje: dodaj `isSold`, `soldAt`, `createdAt`, `updatedAt` do Cars
12. Stworzenie modelu `Transaction` z migracjami Sequelize
13. Endpoint `GET /api/v1/transactions` (historia transakcji)
14. Endpoint `GET /health` (health check dla monitoringu)
15. Implementacja Winston loggera z poziomami: error, warn, info, debug

---

### Faza 3 — Redesign Frontendu (4 tygodnie)

**Cele szczegółowe:**  
Modernizacja frontendu Angular poprzez migrację do Signals, implementację systemu projektowania (design system), lazy loading tras, auth guards oraz poprawę dostępności i responsywności. Faza koncentruje się na doświadczeniu użytkownika i jakości kodu Angular.

**Zależności:** Faza 2 (nowe URL `/api/v1/`, nowe endpointy paginacji), Faza 1 (auth guards)

**Metryki Sukcesu:**
- Lighthouse Performance ≥ 90, Accessibility ≥ 90
- 0 chronionych tras bez AuthGuard lub DealerGuard
- 0 wywołań `alert()` lub `confirm()` — zastąpione MatSnackBar/MatDialog
- Wszystkie komponenty używają `OnPush` change detection
- `trackBy` w każdym `*ngFor`
- 0 `BehaviorSubject` w nowych serwisach (zastąpione Signals)

**Zespół:** Frontend Developer x2, UX Designer, UI Designer, Tech Lead

**Kluczowe Zadania:**
1. Migracja `AuthenticationService` z `BehaviorSubject` na Angular Signals
2. Migracja `CarService` na Angular Signals + resource API dla HTTP calls
3. Stworzenie `core/guards/auth.guard.ts` i `core/guards/dealer.guard.ts`
4. Konfiguracja lazy loading dla tras: `cars/`, `auth/`, `admin/`
5. Stworzenie shared komponentów: `LoadingSpinnerComponent`, `ToastNotificationComponent`
6. Redesign `car-list`: paginacja, filtry, nowy car card z overlay i badge'ami
7. Redesign `navbar`: responsywny, hamburger menu na mobile
8. Implementacja CSS Custom Properties (design tokens: kolory, spacing, typography)
9. Reactive Forms dla wszystkich formularzy (login, rejestracja, dodawanie auta)
10. Naprawienie memory leak — `takeUntilDestroyed()` w subskrypcjach
11. Naprawienie literówki `brandserch` → `brandSearch` (INC-008)
12. Implementacja `OnPush` change detection we wszystkich komponentach
13. Dodanie `trackBy` do wszystkich `*ngFor` pętli
14. Aktualizacja wywołań API → `/api/v1/` prefix
15. Aktualizacja testów Playwright po zmianach UI (nowe selektory data-testid)

---

### Faza 4 — Testowanie i Jakość (3 tygodnie)

**Cele szczegółowe:**  
Osiągnięcie wymaganego pokrycia testami (≥ 80% backend, ≥ 75% frontend), rozbudowa suity Playwright E2E, przeprowadzenie testów wydajnościowych i bezpieczeństwa. Faza koncentruje się na jakości i stabilności kodu.

**Zależności:** Faza 2 i 3 (stabilny kod do pokrycia testami)

**Metryki Sukcesu:**
- Backend Jest coverage ≥ 80% (statements, branches, functions, lines)
- Frontend Angular coverage ≥ 75%
- ≥ 90 testów Playwright — wszystkie zielone w CI
- k6 load test: p95 < 200ms przy 100 concurrent users
- OWASP ZAP: 0 HIGH/CRITICAL
- 0 flaky testów (max 1% niestabilność)

**Zespół:** QA Lead, Manual Tester, Automation Tester, Backend Developer, Frontend Developer

**Kluczowe Zadania:**
1. Unit testy dla `auth.service.js` — mockowanie bcrypt, sesji
2. Unit testy dla `car.service.js` — logika rent/buy/leasing
3. Unit testy dla `transaction.service.js`
4. Integration testy dla wszystkich endpointów API (Supertest)
5. Unit testy Angular — `AuthenticationService`, `CarService`
6. Unit testy Angular — `CarListComponent`, `CarDetailComponent`
7. Stworzenie Page Object Model (POM) dla Playwright
8. Rozbudowa Playwright: testy paginacji, filtrowania, auth guard redirect
9. Testy Playwright dla nowych endpointów `/api/v1/`
10. Load testing z k6 (skrypt: 100 VU, 5 minut, ramp-up)
11. OWASP ZAP automated scan — integracja z CI
12. Accessibility testing (axe-playwright plugin)
13. Konfiguracja Allure Report dla Playwright
14. Analiza i naprawa flaky testów (quarantine + fix)
15. Code coverage report w GitHub Actions PR comments

---

### Faza 5 — Gotowość Produkcyjna (3 tygodnie)

**Cele szczegółowe:**  
Przygotowanie kompletnej infrastruktury produkcyjnej z HTTPS, monitoringiem, logowaniem i automatyzacją deploymentu. Stworzenie runbooks operacyjnych i dokumentacji końcowej. Faza finalizuje projekt i umożliwia bezpieczne uruchomienie produkcyjne.

**Zależności:** Wszystkie poprzednie fazy (kompletny, przetestowany kod)

**Metryki Sukcesu:**
- Aplikacja dostępna pod domeną produkcyjną z ważnym certyfikatem SSL
- Prometheus zbiera metryki, Grafana wyświetla dashboardy
- Alert email/Slack przy response time > 500ms lub error rate > 1%
- CD workflow deployuje automatycznie po merge do `main`
- Runbook pozwala nowemu adminowi odtworzyć środowisko w < 2h

**Zespół:** DevOps Engineer, Tech Lead, Technical Writer, QA Lead

**Kluczowe Zadania:**
1. Konfiguracja nginx jako reverse proxy (SSL termination)
2. Certbot + Let's Encrypt — automatyczne odnawianie certyfikatów
3. Production `docker-compose.prod.yml` z MySQL, nginx
4. GitHub Actions CD workflow: `deploy.yml` (deploy po merge do main)
5. Environment separation: `.env.development`, `.env.staging`, `.env.production`
6. Instalacja i konfiguracja Prometheus (metryki Node.js, HTTP)
7. Konfiguracja Grafana dashboardów (API latency, error rate, DB connections)
8. Alerty Grafana: email/Slack przy threshold przekroczeniu
9. Winston logger → centralne logowanie (JSON format, log rotation)
10. Database backup automation (cron: co 6h, retencja 7 dni)
11. Health check endpoint monitoring (uptime robot lub wbudowany)
12. Dokumentacja runbook: „Jak wdrożyć nową wersję"
13. Dokumentacja runbook: „Jak przywrócić po awarii"
14. OpenAPI/Swagger UI pod `/api/docs`
15. Developer onboarding guide i CHANGELOG.md

---

## Podsumowanie Zależności Między Fazami

```
Faza 0 (Audyt)
    │
    ├──► Faza 1 (Bezpieczeństwo) — wymaga: dokumentacja z F0, hotfixy
    │         │
    │         ├──► Faza 2 (Backend) — wymaga: CI/CD z F1, Docker z F1
    │         │         │
    │         │         ├──► Faza 3 (Frontend) — wymaga: API v1 z F2
    │         │         │         │
    │         │         └──► Faza 4 (Testowanie) — wymaga: stabilny kod F2+F3
    │         │                   │
    │         └──────────────────►└──► Faza 5 (Produkcja) — wymaga: wszystkie F0-F4
```

---

*Roadmapa Projektu — wersja 1.0 — styczeń 2025*  
*Właściciel: Project Owner | Autor: Technical Writer | Zatwierdził: IT Architect*
