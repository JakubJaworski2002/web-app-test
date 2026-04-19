# Zarządzanie Środowiskami i Konfiguracją

## Wszystkie Zmienne Środowiskowe

### Backend (`salon-samochodowy-backend/.env`)

| Zmienna | Opis | Dev default | Wymagana prod |
|---------|------|-------------|---------------|
| `SESSION_SECRET` | Tajny klucz sesji (min. 32 znaki) | `TwojSuperTajnyKlucz` | ✅ WYMAGANA |
| `PORT` | Port backendu | `3000` | Opcjonalna |
| `ALLOWED_ORIGINS` | CORS origins (CSV) | `http://localhost:4200` | ✅ WYMAGANA |
| `DB_HOST` | Host MySQL | `localhost` | Opcjonalna |
| `DB_NAME` | Nazwa bazy | `salon_samochodowy` | Opcjonalna |
| `DB_USER` | User MySQL | `root` | Opcjonalna |
| `DB_PASSWORD` | Hasło MySQL | `Admin` | ✅ WYMAGANA |
| `DB_PORT` | Port MySQL | `3306` | Opcjonalna |
| `SQLITE_STORAGE` | Ścieżka SQLite | `data/salon-samochodowy.sqlite` | Opcjonalna |
| `NODE_ENV` | Środowisko | `development` | ✅ WYMAGANA |

### Szablony .env

```bash
# .env.development (przykład)
SESSION_SECRET=dev-only-secret-not-for-production-use
PORT=3000
ALLOWED_ORIGINS=http://localhost:4200
NODE_ENV=development

# .env.production (NIE commituj!)
SESSION_SECRET=<min-32-random-characters>
PORT=3000
ALLOWED_ORIGINS=https://salon-samochodowy.pl
DB_HOST=mysql
DB_NAME=salon_samochodowy
DB_USER=salon_user
DB_PASSWORD=<strong-password>
NODE_ENV=production
```

### Frontend — Angular Environment Files

```typescript
// src/environments/environment.ts (development)
export const environment = {
    production: false,
    apiUrl: 'http://localhost:3000'
};

// src/environments/environment.prod.ts (production)
export const environment = {
    production: true,
    apiUrl: 'https://api.salon-samochodowy.pl'
};
```

## Zasady Zarządzania Sekretami

1. **Nigdy** nie commituj `.env` do repozytorium (`.gitignore` już to zawiera)
2. **Zawsze** używaj GitHub Secrets dla CI/CD
3. **Rotuj** sekrety co 90 dni w produkcji
4. **Audituj** dostęp do sekretów kwartalnie
5. Minimalna długość `SESSION_SECRET`: **32 znaki**
