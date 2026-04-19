# Agenci Testowi – Salon Samochodowy 🤖

Ten folder zawiera definicje, instrukcje i procedury dla agentów AI wykorzystywanych do generowania i utrzymania testów Playwright w projekcie "Salon Samochodowy".

## Dostępni agenci

| Plik | Agent | Zadanie | Folder testów |
|------|-------|---------|---------------|
| `api-testing-agent.md` | Agent API | Testy backendu przez `request` fixture | `tests/api/` |
| `mocking-agent.md` | Agent Mockowania | Izolacja UI przez `page.route()` | `tests/mock/` |
| `auth-agent.md` | Agent Auth | Zarządzanie sesją przez `storageState` | `tests/auth/` |

## Konwencje nazewnictwa testów

### Playlista ID
Każdy test ma unikalny identyfikator w formacie `[XNN]`:
- `[A01]–[A15]` – testy API (fixture `request`)
- `[M01]–[M15]` – testy mockowania (`page.route()`)
- `[S01]–[S15]` – testy storageState/auth

### Mapowanie na scenariusze UI
Każdy test ma komentarz `Scenariusz UI: RX` wskazujący odpowiadający scenariusz z `Case_X.spec.ts`.

## Struktura projektu

```
Playwright/
├── tests/
│   ├── api/                    ← Agent API (A01-A15)
│   │   ├── auth-api.spec.ts
│   │   ├── business-api.spec.ts
│   │   └── cars-crud.spec.ts
│   ├── mock/                   ← Agent Mockowania (M01-M15)
│   │   ├── advanced-mock.spec.ts
│   │   ├── auth-mock.spec.ts
│   │   ├── cars-list-mock.spec.ts
│   │   └── transactions-mock.spec.ts
│   ├── auth/                   ← Agent Auth/StorageState (S01-S15)
│   │   ├── admin-storagestate.spec.ts
│   │   ├── auth-workflow.spec.ts
│   │   ├── public-vs-auth.spec.ts
│   │   └── session-persistence.spec.ts
│   ├── global.setup.ts         ← Setup autentykacji
│   ├── Case_1_JJ.spec.ts       ← Oryginalne testy UI
│   └── ...
├── utils/                      ← Helpery wielokrotnego użytku
├── .auth/                      ← Pliki storageState (nie commituj!)
├── playwright.config.ts        ← Konfiguracja
└── SKILLS.md                   ← Przewodnik dla studentów
```

## Uruchamianie testów

```bash
cd Playwright

# Wszystkie testy (setup → chromium → chromium-public)
npx playwright test

# Tylko testy API
npx playwright test tests/api/

# Tylko testy mockowania
npx playwright test tests/mock/

# Tylko testy auth/storageState
npx playwright test tests/auth/

# Konkretny plik
npx playwright test tests/api/cars-crud.spec.ts

# Z debuggerem
npx playwright test tests/api/ --debug

# Raport HTML
npx playwright show-report
```

## Jak ponownie użyć agenta

1. Otwórz odpowiedni plik `.md` agenta
2. Skopiuj sekcję "Prompt agenta" jako wiadomość do GitHub Copilot
3. Agent wygeneruje testy zgodne z konwencjami projektu
4. Sprawdź testy i uruchom: `npx playwright test tests/<folder>/`
