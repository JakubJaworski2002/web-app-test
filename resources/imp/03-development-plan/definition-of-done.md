# Definicja Gotowości (DoD) — Salon Samochodowy

## DoD: User Story

- [ ] Kod zaimplementowany zgodnie z wymaganiami
- [ ] Code review zaakceptowany (Code Reviewer + Tech Lead)
- [ ] Testy jednostkowe napisane i przechodzą
- [ ] Test Playwright dodany lub zaktualizowany (jeśli dotyczy)
- [ ] Brak regresji w istniejących testach
- [ ] Dokumentacja zaktualizowana (jeśli nowe API)
- [ ] Brak `any` typów TypeScript
- [ ] Brak `console.log` w kodzie produkcyjnym
- [ ] PR zaakceptowany i zmergowany
- [ ] Product Owner zaakceptował demonstrację

## DoD: Sprint

- [ ] Wszystkie User Stories spełniają DoD
- [ ] Regression test suite przechodzi
- [ ] Coverage nie spada poniżej poprzedniego sprintu
- [ ] Otwarte bugi CRITICAL = 0
- [ ] Dokumentacja `resources/imp/` zaktualizowana
- [ ] Sprint Review przeprowadzony
- [ ] Retrospektywna przeprowadzona

## DoD: Release

- [ ] Wszystkie quality gates spełnione (QG-01 do QG-07)
- [ ] `npm audit` — zero HIGH/CRITICAL vulnerabilities
- [ ] 90 testów Playwright — wszystkie zielone
- [ ] Coverage backend ≥80%, frontend ≥80%
- [ ] docker-compose build kończy się bez błędów
- [ ] CHANGELOG.md zaktualizowany
- [ ] Onboarding guide zaktualizowany
- [ ] Deployment na staging zweryfikowany
- [ ] Sign-off: Product Owner + Tech Lead + QA Lead
