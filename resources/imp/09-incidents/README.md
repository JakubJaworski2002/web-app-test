# 🚨 Rejestr Incydentów — Salon Samochodowy

> **Wersja:** 1.0.0 | **Data:** 2026-03-29 | **Status:** 🟡 W toku — 8 otwartych incydentów

Centralny rejestr wszystkich zidentyfikowanych problemów bezpieczeństwa, błędów i długu technicznego projektu Salon Samochodowy. Każdy incydent posiada pełny raport z dowodem, analizą wpływu i planem naprawy.

## Tabela Wszystkich Incydentów

| ID | Tytuł | Severity | Status | Komponent | Sprint |
|----|-------|----------|--------|-----------|--------|
| [INC-001](INC-001-plaintext-passwords.md) | Hasła w plaintext | 🔴 CRITICAL | **OPEN** | server.js:107,156 | Sprint 0 |
| [INC-002](INC-002-isDealer-default-true.md) | isDealer default=true | 🟠 HIGH | **OPEN** | models.js:178 | Sprint 0 |
| [INC-003](INC-003-missing-auth-upload.md) | Brak auth na upload | 🟠 HIGH | ✅ FIXED | server.js:256 | - |
| [INC-004](INC-004-imagepath-property.md) | Błędna właściwość imagePath | 🔵 LOW | ✅ FIXED | server.js:267 | - |
| [INC-005](INC-005-no-rate-limiting.md) | Brak rate limitingu | 🟠 HIGH | **OPEN** | server.js | Sprint 1 |
| [INC-006](INC-006-hardcoded-cors.md) | Hardcoded CORS origin | 🟡 MEDIUM | **OPEN** | server.js:37 | Sprint 1 |
| [INC-007](INC-007-frontend-typo-brandserch.md) | Literówka brandserch | 🔵 LOW | **OPEN** | car-list.component.ts:33 | Sprint 3 |
| [INC-008](INC-008-alert-usage.md) | alert() w Angular | 🟡 MEDIUM | **OPEN** | car-list, buy-car, rent-car | Sprint 3 |
| [INC-009](INC-009-memory-leak.md) | Memory leak (RxJS) | 🟡 MEDIUM | **OPEN** | car-list.component.ts:52 | Sprint 3 |
| [INC-010](INC-010-missing-auth-guards.md) | Brak Angular auth guards | 🟠 HIGH | **OPEN** | app.routes.ts | Sprint 1 |

## Statystyki

| Severity | Łącznie | Otwarte | Naprawione |
|----------|---------|---------|------------|
| 🔴 CRITICAL | 1 | 1 | 0 |
| 🟠 HIGH | 4 | 3 | 1 |
| 🟡 MEDIUM | 3 | 3 | 0 |
| 🔵 LOW | 2 | 1 | 1 |
| **Razem** | **10** | **8** | **2** |

## Definicja Poziomów Severity

| Poziom | Opis | SLA naprawy |
|--------|------|-------------|
| 🔴 CRITICAL | Krytyczna luka bezpieczeństwa / utrata danych | Przed każdym deploy na production |
| 🟠 HIGH | Poważny problem bezpieczeństwa lub funkcjonalności | Sprint 0 lub 1 |
| 🟡 MEDIUM | Zły UX / dług techniczny / potencjalny problem | Sprint 2 lub 3 |
| 🔵 LOW | Kosmetyczny / nazewnictwo / drobna poprawka | Sprint 3 lub 4 |

## Cykl Życia Incydentu

```
Detected → Triaged → Assigned → In Progress → Fixed → Verified → Closed
```

## Cykl Życia Incydentu — Szczegółowy

```
WYKRYTO → SKLASYFIKOWANO → PRZYPISANO → W TOKU → NAPRAWIONO → ZWERYFIKOWANO → ZAMKNIĘTO
   │             │               │           │            │              │              │
Code Review    Severity       Sprint     Deweloper   Pull Request   QA/Tester    Lead + PO
   │          Assessment     Planning     Fix          + Tests       Approval      Sign-off
Testy CI    (max 24h)      (max 48h)    Impl.       Code Review   (max 48h)     Archived
```

### Opis etapów

| Etap | Opis | Odpowiedzialny | Czas |
|------|------|----------------|------|
| **WYKRYTO** | Identyfikacja problemu (kod review, testy, zgłoszenie) | Odkrywca | - |
| **SKLASYFIKOWANO** | Określenie severity, priorytetu, komponentu | Tech Lead | max 24h |
| **PRZYPISANO** | Przypisanie do dewelopera i sprintu naprawy | Scrum Master | max 48h |
| **W TOKU** | Aktywna implementacja naprawy | Deweloper | wg SLA |
| **NAPRAWIONE** | Pull Request z naprawą + testy jednostkowe | Deweloper | - |
| **ZWERYFIKOWANE** | QA weryfikuje naprawę, testy regresji | QA Lead | max 48h |
| **ZAMKNIĘTE** | Oficjalne zamknięcie, dokumentacja, post-mortem | Tech Lead + PO | - |

---

## Odpowiedzialne Strony

| Severity | Wykrycie | Klasyfikacja | Naprawa | Weryfikacja | Escalacja |
|----------|----------|--------------|---------|-------------|-----------|
| 🔴 CRITICAL | Cały zespół | Tech Lead (natychmiast) | Senior Dev | QA Lead + PO | Project Owner |
| 🟠 HIGH | Deweloper/QA | Tech Lead (24h) | Deweloper | QA Lead | Tech Lead |
| 🟡 MEDIUM | Deweloper/QA | Tech Lead (48h) | Deweloper | QA | Tech Lead |
| 🔵 LOW | Deweloper | Deweloper | Deweloper | Code Review | - |

---

## Macierz Eskalacji

```
Incydent Wykryty
       │
       ▼
Czy Severity = CRITICAL?
  ├─ TAK → Natychmiastowe powiadomienie: Tech Lead + Project Owner
  │        Tworzenie hotfix branch → Deploy w ciągu 24h
  │        Post-mortem obowiązkowy
  │
  └─ NIE → Czy Severity = HIGH?
             ├─ TAK → Powiadomienie Tech Lead (max 24h)
             │        Naprawa w bieżącym lub następnym sprincie
             │
             └─ NIE → Dodanie do backlogu z odpowiednim priorytetem
                       Planowanie w kolejnym sprint planowaniu
```

### Ścieżki eskalacji

| Scenariusz | Eskalacja do | Kanał | Czas reakcji |
|------------|-------------|-------|--------------|
| CRITICAL w production | Project Owner + Tech Lead | Natychmiast (Slack/call) | 1h |
| HIGH nienaprawione >1 sprint | Tech Lead | Email + Slack | 24h |
| MEDIUM blokuje dostawę | Tech Lead | Slack | 48h |
| Deweloper nie odpowiada | Scrum Master | Email | 24h |
| Fix odrzucony w code review | Tech Lead arbitraż | Meeting | 48h |

---

## Post-Mortem Template

```markdown
## Post-Mortem: [INC-XXX] — [Tytuł Incydentu]

**Data wykrycia:** YYYY-MM-DD
**Data naprawy:** YYYY-MM-DD
**Czas do naprawy:** X dni roboczych
**Severity:** CRITICAL/HIGH/MEDIUM/LOW
**Środowisko:** Development/Staging/Production
**Odkrywca:** [Imię/Rola]
**Właściciel naprawy:** [Imię/Rola]

---

### 1. Streszczenie

[2-3 zdania opisujące incydent, jego wpływ i rozwiązanie]

### 2. Oś Czasu

| Czas | Zdarzenie |
|------|-----------|
| YYYY-MM-DD | Incydent wykryty |
| YYYY-MM-DD | Klasyfikacja i przypisanie |
| YYYY-MM-DD | Rozpoczęcie naprawy |
| YYYY-MM-DD | Pull Request otwarty |
| YYYY-MM-DD | Code review zakończony |
| YYYY-MM-DD | Naprawa wdrożona |
| YYYY-MM-DD | Weryfikacja QA zakończona |
| YYYY-MM-DD | Incydent zamknięty |

### 3. Co Się Stało?

[Szczegółowy opis techniczny co było nie tak]

### 4. Jaki Był Wpływ?

- Wpływ na bezpieczeństwo: [...]
- Wpływ na użytkowników: [...]
- Wpływ na dane: [...]
- Wpływ na dostępność: [...]

### 5. Dlaczego To Się Stało? (Analiza 5 Why)

1. **Dlaczego?** [pierwsza przyczyna]
2. **Dlaczego?** [druga przyczyna]
3. **Dlaczego?** [trzecia przyczyna]
4. **Dlaczego?** [czwarta przyczyna]
5. **Przyczyna korzenna:** [ostateczna przyczyna]

### 6. Co Zostało Naprawione?

- [ ] Opis zmiany 1 (plik:linia)
- [ ] Opis zmiany 2
- [ ] Testy dodane/zaktualizowane

### 7. Weryfikacja Naprawy

- [ ] Testy jednostkowe przechodzą
- [ ] Testy integracyjne przechodzą
- [ ] Testy E2E Playwright przechodzą
- [ ] Manualna weryfikacja zakończona
- [ ] Code review zaakceptowany

### 8. Działania Zapobiegawcze

| Działanie | Odpowiedzialny | Termin | Status |
|-----------|---------------|--------|--------|
| [Opis działania 1] | [Rola] | YYYY-MM-DD | Planowane |
| [Opis działania 2] | [Rola] | YYYY-MM-DD | Planowane |

### 9. Wnioski

[Kluczowe lekcje wyciągnięte z incydentu]

---
*Post-mortem przygotowany przez: [Imię], [Data]*
```

---

## Procedura Zgłaszania Nowego Incydentu

1. **Utwórz plik** `INC-XXX-krótki-opis.md` w katalogu `09-incidents/`
2. **Uzupełnij** wszystkie sekcje szablonu (ID, tytuł, severity, opis, dowód, wpływ, naprawa)
3. **Zaktualizuj** tabelę w tym pliku README.md
4. **Zaktualizuj** statystyki (sekcja Statystyki)
5. **Powiadom** Tech Lead zgodnie z macierzą eskalacji
6. **Utwórz** GitHub Issue z linkiem do pliku incydentu
7. **Śledź** status do zamknięcia

---

## Powiązane Dokumenty

- [Raport Audytu Bezpieczeństwa](../10-reports/security-audit-report.md)
- [Raport Wstępnego Audytu](../10-reports/initial-audit-report.md)
- [Analiza Stanu Obecnego](../01-architecture/current-state-analysis.md)
- [Plan Sprintów](../03-development-plan/sprint-plan.md)

---

*Rejestr incydentów projektu Salon Samochodowy — AiTSI | Ostatnia aktualizacja: 2026-03-29*
