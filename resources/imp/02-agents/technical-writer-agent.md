# Agent: Technical Writer

## Profil Roli

| Atrybut | Wartość |
|---------|---------|
| **Rola** | Technical Writer / Documentation Engineer |
| **Stack** | Markdown, Swagger/OpenAPI, Compodoc, Storybook |
| **Odpowiada za** | Dokumentacja API, onboarding guide, CHANGELOG, user manual |

---

## Audyt Obecnej Dokumentacji

| Dokument | Status | Priorytet |
|----------|--------|-----------|
| README.md (root) | ✅ Istnieje | Aktualizacja |
| API dokumentacja (OpenAPI) | ❌ Brak | Wysoki |
| Onboarding guide | ❌ Brak | Wysoki |
| User manual (admin) | ❌ Brak | Średni |
| User manual (klient) | ❌ Brak | Niski |
| CHANGELOG.md | ❌ Brak | Wysoki |
| CONTRIBUTING.md | ❌ Brak | Średni |
| resources/imp/ docs | ✅ Tworzone | — |
| Playwright/SKILLS.md | ✅ Istnieje | — |
| resources/agents/ | ✅ Istnieje | — |

---

## Szablon CHANGELOG

```markdown
# Changelog

## [Unreleased]

### Added
- bcrypt password hashing (INC-001 fix)
- Rate limiting on /login and /register (INC-005 fix)
- Angular AuthGuard and DealerGuard (INC-010 fix)
- Docker + docker-compose configuration
- GitHub Actions CI/CD pipeline

### Changed
- isDealer default value: true → false (INC-002 fix)
- CORS configuration via environment variable (INC-006 fix)

### Fixed
- Missing authenticateSession on /cars/:id/upload (INC-003)
- Wrong property name car.imagePath → car.image (INC-004)

## [0.1.0] - 2026-03-29
### Added
- Initial application (Angular 19 + Express.js)
- 60 Playwright tests (UI, API, Mock, Auth)
- resources/imp/ project documentation
```

---

## Szablon Onboarding Guide

```markdown
# Developer Onboarding Guide

## Prerequisites
- Node.js 20+
- Git
- Docker Desktop (opcjonalnie)

## Quick Start (5 minut)
1. `git clone [repo]`
2. `cd salon-samochodowy-backend && npm install && node server.js`
3. `cd salon-samochodowy-frontend && npm install && ng serve`
4. Otwórz http://localhost:4200

## Logowanie testowe
- Admin: `admin` / `Admin1!`

## Uruchamianie testów
- `cd Playwright && npx playwright test`

## Ważne pliki
- Backend: `salon-samochodowy-backend/server.js`
- Frontend: `salon-samochodowy-frontend/src/app/`
- Dokumentacja: `resources/imp/README.md`
- Incydenty: `resources/imp/09-incidents/`
```

---

## Reusable Prompt

```
Jesteś doświadczonym Technical Writerem projektu "Salon Samochodowy".

PROJEKT: Angular 19 SPA + Express.js REST API
API ENDPOINTY: /register, /login, /logout, /cars, /cars/:id, /users, 
               /cars/:id/rent, /return, /leasing, /buy
DOKUMENTACJA: resources/imp/ (pełna dokumentacja projektu)

Twoje zadanie: [OPISZ DOKUMENT DO NAPISANIA]

Podaj:
- Kompletny dokument w Markdown
- Przykłady kodu tam gdzie potrzebne
- Przykłady JSON request/response dla API
- Linki do powiązanych dokumentów
```
