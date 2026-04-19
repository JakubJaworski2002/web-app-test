# Agent: Database Engineer

## Profil Roli

| Atrybut | Wartość |
|---------|---------|
| **Rola** | Database Engineer |
| **Stack** | Sequelize 6, SQLite3, MySQL 8, SQL |
| **Odpowiada za** | Schemat bazy, migracje, optymalizacja zapytań |

---

## Obecny Schemat Bazy

### Tabela `Cars`
| Kolumna | Typ | Constraints |
|---------|-----|-------------|
| id | INTEGER | PK, AUTO_INCREMENT |
| brand | VARCHAR | NOT NULL |
| model | VARCHAR | NOT NULL |
| year | INTEGER | NOT NULL |
| vin | VARCHAR | NOT NULL, UNIQUE |
| price | FLOAT | NOT NULL |
| horsePower | INTEGER | NOT NULL |
| isAvailableForRent | BOOLEAN | DEFAULT true |
| image | VARCHAR | NULL |
| ownerId | INTEGER | FK → Users.id |
| renterId | INTEGER | FK → Users.id |

### Tabela `Users`
| Kolumna | Typ | Constraints |
|---------|-----|-------------|
| id | INTEGER | PK, AUTO_INCREMENT |
| username | VARCHAR | NOT NULL, UNIQUE |
| email | VARCHAR | NOT NULL, UNIQUE |
| password | VARCHAR | NOT NULL ⚠️ plaintext! |
| firstName | VARCHAR | NOT NULL |
| lastName | VARCHAR | NOT NULL |
| isDealer | BOOLEAN | DEFAULT **true** ⚠️ BUG! |

---

## Planowane Migracje

### Migracja 001 — Dodaj pole `isSold` do Cars
```javascript
// migrations/001-add-isSold-to-cars.js
export async function up(sequelize) {
    await sequelize.query(
        'ALTER TABLE Cars ADD COLUMN isSold BOOLEAN DEFAULT false NOT NULL'
    );
}
export async function down(sequelize) {
    await sequelize.query('ALTER TABLE Cars DROP COLUMN isSold');
}
```

### Migracja 002 — Utwórz tabelę Transactions
```sql
CREATE TABLE Transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    carId INTEGER NOT NULL REFERENCES Cars(id),
    userId INTEGER NOT NULL REFERENCES Users(id),
    type VARCHAR NOT NULL CHECK(type IN ('rent', 'return', 'leasing', 'buy')),
    startDate DATETIME,
    endDate DATETIME,
    monthlyRate FLOAT,
    totalAmount FLOAT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Migracja 003 — Dodaj indeksy
```sql
-- Indeksy wydajnościowe
CREATE INDEX idx_cars_brand ON Cars(brand);
CREATE INDEX idx_cars_ownerId ON Cars(ownerId);
CREATE INDEX idx_cars_renterId ON Cars(renterId);
CREATE INDEX idx_cars_isAvailableForRent ON Cars(isAvailableForRent);
CREATE INDEX idx_users_username ON Users(username);
CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_transactions_userId ON Transactions(userId);
CREATE INDEX idx_transactions_carId ON Transactions(carId);
```

---

## Procedura Migracji

```bash
# 1. Backup bazy
cp data/salon-samochodowy.sqlite data/salon-samochodowy.backup-$(date +%Y%m%d).sqlite

# 2. Uruchom migracje w kolejności
node migrations/001-add-isSold-to-cars.js
node migrations/002-create-transactions.js
node migrations/003-add-indexes.js

# 3. Zmigruj hasła (po wdrożeniu bcrypt)
node migrate-passwords.js

# 4. Weryfikacja
node -e "import('./models.js').then(m => m.Car.findAll({ limit: 1 })).then(r => console.log('OK:', r[0]?.id))"
```

---

## Reusable Prompt

```
Jesteś doświadczonym Database Engineer pracującym przy projekcie "Salon Samochodowy".

ORM: Sequelize 6.37
BAZY: SQLite3 (dev), MySQL 8.0 (prod)
OBECNE MODELE: Car, User (zdefiniowane w models.js)
PLANOWANE MODELE: Transaction

Twoje zadanie: [OPISZ ZADANIE DB]

Podaj:
- Sekwencję SQL (kompatybilną z SQLite i MySQL)
- Sequelize migration file (ES modules format)
- Skrypt rollback
- Plan weryfikacji po migracji
```
