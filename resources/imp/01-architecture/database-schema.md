# Schemat Bazy Danych

## Obecny Schemat (ER Diagram)

```
┌──────────────────────────────┐      ┌───────────────────────────────┐
│            Users             │      │             Cars               │
├──────────────────────────────┤      ├───────────────────────────────┤
│ id          INTEGER PK       │      │ id          INTEGER PK         │
│ username    VARCHAR UNIQUE   │      │ brand       VARCHAR NOT NULL   │
│ email       VARCHAR UNIQUE   │      │ model       VARCHAR NOT NULL   │
│ password    VARCHAR ⚠️plaintext│     │ year        INTEGER NOT NULL   │
│ firstName   VARCHAR          │      │ vin         VARCHAR UNIQUE     │
│ lastName    VARCHAR          │      │ price       FLOAT NOT NULL     │
│ isDealer    BOOLEAN ⚠️def=true│      │ horsePower  INTEGER NOT NULL   │
└──────────┬───────────────────┘      │ isAvailableForRent BOOL=true   │
           │                          │ image       VARCHAR NULL       │
           │  ownerId FK ─────────────┤ ownerId     INTEGER FK        │
           │  renterId FK ────────────┤ renterId    INTEGER FK        │
           └──────────────────────────┘
```

## Proponowany Schemat (po migracjach)

```
┌──────────────────────────────┐
│            Users             │
├──────────────────────────────┤
│ id          INTEGER PK       │
│ username    VARCHAR UNIQUE   │
│ email       VARCHAR UNIQUE   │
│ password    VARCHAR (bcrypt) │ ← zmiana: hash zamiast plaintext
│ firstName   VARCHAR          │
│ lastName    VARCHAR          │
│ isDealer    BOOLEAN def=false│ ← zmiana: false (bezpieczny default)
└──────────────────────────────┘

┌────────────────────────────────┐
│              Cars              │
├────────────────────────────────┤
│ id            INTEGER PK       │
│ brand         VARCHAR INDEX    │ ← nowy indeks
│ model         VARCHAR          │
│ year          INTEGER          │
│ vin           VARCHAR UNIQUE   │
│ price         FLOAT            │
│ horsePower    INTEGER          │
│ isAvailableForRent BOOL=true   │
│ isSold        BOOL=false       │ ← nowe pole (migracja 001)
│ image         VARCHAR NULL     │
│ ownerId       INTEGER FK INDEX │ ← nowy indeks
│ renterId      INTEGER FK INDEX │ ← nowy indeks
└────────────────────────────────┘

┌────────────────────────────────┐
│          Transactions          │ ← nowa tabela (migracja 002)
├────────────────────────────────┤
│ id          INTEGER PK         │
│ carId       INTEGER FK NOT NULL│
│ userId      INTEGER FK NOT NULL│
│ type        ENUM(rent,return,  │
│             leasing,buy)       │
│ startDate   DATETIME NULL      │
│ endDate     DATETIME NULL      │
│ monthlyRate FLOAT NULL         │
│ totalAmount FLOAT NULL         │
│ createdAt   DATETIME DEFAULT   │
└────────────────────────────────┘
```

## Migracje SQL

### Migracja 001 — Dodaj isSold
```sql
ALTER TABLE Cars ADD COLUMN isSold BOOLEAN NOT NULL DEFAULT false;
```

### Migracja 002 — Tabela Transactions
```sql
CREATE TABLE IF NOT EXISTS Transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    carId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL CHECK(type IN ('rent','return','leasing','buy')),
    startDate DATETIME,
    endDate DATETIME,
    monthlyRate FLOAT,
    totalAmount FLOAT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (carId) REFERENCES Cars(id) ON DELETE RESTRICT,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE RESTRICT
);
```

### Migracja 003 — Indeksy
```sql
CREATE INDEX IF NOT EXISTS idx_cars_brand ON Cars(brand);
CREATE INDEX IF NOT EXISTS idx_cars_ownerId ON Cars(ownerId);
CREATE INDEX IF NOT EXISTS idx_cars_renterId ON Cars(renterId);
CREATE INDEX IF NOT EXISTS idx_users_username ON Users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON Users(email);
CREATE INDEX IF NOT EXISTS idx_transactions_userId ON Transactions(userId);
CREATE INDEX IF NOT EXISTS idx_transactions_carId ON Transactions(carId);
```

## Procedure Backupu

```bash
# Przed każdą migracją
cp data/salon-samochodowy.sqlite data/backup-$(date +%Y%m%d-%H%M).sqlite

# Weryfikacja po migracji
sqlite3 data/salon-samochodowy.sqlite ".schema"
sqlite3 data/salon-samochodowy.sqlite "SELECT COUNT(*) FROM Cars"
```

---

## Szczegółowe Definicje Kolumn — Stan Obecny

### Tabela `Users` — Pełna Specyfikacja

```sql
-- Definicja zgodna z Sequelize models.js
CREATE TABLE Users (
    id          INTEGER        PRIMARY KEY AUTOINCREMENT,
    username    VARCHAR(255)   NOT NULL,
    email       VARCHAR(255)   NOT NULL,
    password    VARCHAR(255)   NOT NULL,
    -- KRYTYCZNE: hasło przechowywane jako plaintext (INC-001)
    -- Przykład wartości: 'Admin1!' zamiast '$2b$12$hash...'
    firstName   VARCHAR(255)   NOT NULL,
    lastName    VARCHAR(255)   NOT NULL,
    isDealer    BOOLEAN        NOT NULL DEFAULT 1,
    -- BŁĄD: defaultValue=true zamiast false (INC-002)
    -- BRAK: createdAt, updatedAt (timestamps=false w konfiguracji)
    UNIQUE(username),
    UNIQUE(email)
);
```

### Tabela `Cars` — Pełna Specyfikacja

```sql
CREATE TABLE Cars (
    id                  INTEGER        PRIMARY KEY AUTOINCREMENT,
    brand               VARCHAR(255)   NOT NULL,
    model               VARCHAR(255)   NOT NULL,
    year                INTEGER        NOT NULL,
    vin                 VARCHAR(255)   NOT NULL,
    price               FLOAT          NOT NULL,
    horsePower          INTEGER        NOT NULL,
    isAvailableForRent  BOOLEAN        NOT NULL DEFAULT 1,
    image               VARCHAR(255),
    -- nullable — ścieżka do pliku zdjęcia (multer upload)
    ownerId             INTEGER        NOT NULL,
    -- FK do Users.id (dealer/właściciel)
    renterId            INTEGER,
    -- nullable FK do Users.id (aktualny najemca)
    -- BRAK: isSold (prowadzi do INC-003)
    -- BRAK: createdAt, updatedAt
    UNIQUE(vin),
    FOREIGN KEY (ownerId)  REFERENCES Users(id),
    FOREIGN KEY (renterId) REFERENCES Users(id)
);
```

---

## Proponowane Zmiany Schematu — Pełne SQL

### Migracja 001 — Dodanie pola `isSold` i innych do Cars

```sql
-- SQLite (dev) — ALTER TABLE możliwy dla ADD COLUMN
ALTER TABLE Cars ADD COLUMN isSold         BOOLEAN  NOT NULL DEFAULT 0;
ALTER TABLE Cars ADD COLUMN soldAt         DATETIME;
ALTER TABLE Cars ADD COLUMN leasingEndDate DATETIME;
ALTER TABLE Cars ADD COLUMN createdAt      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE Cars ADD COLUMN updatedAt      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Weryfikacja migracji
SELECT name, type, notnull, dflt_value FROM pragma_table_info('Cars');
SELECT COUNT(*) as total, SUM(isSold) as sold FROM Cars;
```

### Migracja 002 — Tabela Transactions (rozszerzona)

```sql
CREATE TABLE IF NOT EXISTS Transactions (
    id          INTEGER       PRIMARY KEY AUTOINCREMENT,
    carId       INTEGER       NOT NULL,
    userId      INTEGER       NOT NULL,
    type        VARCHAR(20)   NOT NULL
                              CHECK(type IN ('RENT','RETURN','BUY','LEASING')),
    amount      DECIMAL(10,2) NOT NULL DEFAULT 0.00
                              CHECK(amount >= 0),
    startDate   DATETIME,
    endDate     DATETIME,
    status      VARCHAR(20)   NOT NULL DEFAULT 'ACTIVE'
                              CHECK(status IN ('ACTIVE','COMPLETED','CANCELLED')),
    notes       TEXT,
    createdAt   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (carId)  REFERENCES Cars(id)  ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Indeksy wydajnościowe dla Transactions
CREATE INDEX idx_transactions_carId   ON Transactions(carId);
CREATE INDEX idx_transactions_userId  ON Transactions(userId);
CREATE INDEX idx_transactions_type    ON Transactions(type);
CREATE INDEX idx_transactions_status  ON Transactions(status);
CREATE INDEX idx_transactions_created ON Transactions(createdAt DESC);
```

### Migracja 003 — Poprawki w tabeli Users

```sql
-- SQLite nie obsługuje ALTER COLUMN DEFAULT ani DROP COLUMN bezpośrednio
-- Wymagana migracja przez kopiowanie tabeli

BEGIN TRANSACTION;

-- Krok 1: Nowa tabela z poprawionym defaultValue isDealer
CREATE TABLE Users_v2 (
    id          INTEGER       PRIMARY KEY AUTOINCREMENT,
    username    VARCHAR(255)  NOT NULL,
    email       VARCHAR(255)  NOT NULL,
    password    VARCHAR(255)  NOT NULL,  -- będzie bcrypt hash po INC-001 fix
    firstName   VARCHAR(255)  NOT NULL,
    lastName    VARCHAR(255)  NOT NULL,
    isDealer    BOOLEAN       NOT NULL DEFAULT 0,  -- NAPRAWIONE: 1→0
    isActive    BOOLEAN       NOT NULL DEFAULT 1,  -- nowe pole soft delete
    createdAt   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(username),
    UNIQUE(email)
);

-- Krok 2: Kopiowanie danych (isDealer zachowany z istniejących rekordów)
INSERT INTO Users_v2 (id, username, email, password, firstName, lastName, isDealer)
SELECT id, username, email, password, firstName, lastName, isDealer
FROM Users;

-- Krok 3: Zamiana tabel
DROP TABLE Users;
ALTER TABLE Users_v2 RENAME TO Users;

COMMIT;

-- Weryfikacja
SELECT id, username, isDealer, createdAt FROM Users LIMIT 5;
SELECT dflt_value FROM pragma_table_info('Users') WHERE name='isDealer';
-- Oczekiwane: dflt_value = '0'
```

### Migracja 004 — Indeksy wydajnościowe

```sql
-- Indeksy dla tabeli Cars
CREATE INDEX IF NOT EXISTS idx_cars_ownerId     ON Cars(ownerId);
CREATE INDEX IF NOT EXISTS idx_cars_renterId    ON Cars(renterId) WHERE renterId IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cars_brand       ON Cars(brand);
CREATE INDEX IF NOT EXISTS idx_cars_brand_model ON Cars(brand, model);
CREATE INDEX IF NOT EXISTS idx_cars_isAvail     ON Cars(isAvailableForRent);
CREATE INDEX IF NOT EXISTS idx_cars_isSold      ON Cars(isSold);
CREATE INDEX IF NOT EXISTS idx_cars_year        ON Cars(year);
CREATE INDEX IF NOT EXISTS idx_cars_price       ON Cars(price);

-- Indeksy dla tabeli Users
CREATE INDEX IF NOT EXISTS idx_users_username   ON Users(username);
CREATE INDEX IF NOT EXISTS idx_users_email      ON Users(email);
CREATE INDEX IF NOT EXISTS idx_users_isDealer   ON Users(isDealer);
CREATE INDEX IF NOT EXISTS idx_users_isActive   ON Users(isActive);
```

---

## Migracja Sequelize — Przykłady JavaScript

### Model User (po migracji)

```javascript
// models/user.model.js
'use strict';
const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 12;

module.exports = (sequelize) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Car, { foreignKey: 'ownerId',  as: 'ownedCars' });
      User.hasMany(models.Car, { foreignKey: 'renterId', as: 'rentedCars' });
      User.hasMany(models.Transaction, { foreignKey: 'userId', as: 'transactions' });
    }

    // Instance method — weryfikacja hasła
    async comparePassword(inputPassword) {
      return bcrypt.compare(inputPassword, this.password);
    }
  }

  User.init({
    id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username:  { type: DataTypes.STRING, allowNull: false, unique: true,
                 validate: { len: [3, 50], notEmpty: true } },
    email:     { type: DataTypes.STRING, allowNull: false, unique: true,
                 validate: { isEmail: true } },
    password:  { type: DataTypes.STRING, allowNull: false },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName:  { type: DataTypes.STRING, allowNull: false },
    isDealer:  { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    isActive:  { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    timestamps: true,
    hooks: {
      // Automatyczne hashowanie hasła przed zapisem
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
        }
      }
    }
  });

  return User;
};
```

### Model Car (po migracji)

```javascript
// models/car.model.js
'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Car extends Model {
    static associate(models) {
      Car.belongsTo(models.User, { foreignKey: 'ownerId',  as: 'owner' });
      Car.belongsTo(models.User, { foreignKey: 'renterId', as: 'renter' });
      Car.hasMany(models.Transaction, { foreignKey: 'carId', as: 'transactions' });
    }

    // Computed property — czy auto jest dostępne do jakiejkolwiek transakcji
    get isAvailable() {
      return this.isAvailableForRent && !this.isSold;
    }
  }

  Car.init({
    id:                 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    brand:              { type: DataTypes.STRING,  allowNull: false },
    model:              { type: DataTypes.STRING,  allowNull: false },
    year:               { type: DataTypes.INTEGER, allowNull: false,
                          validate: { min: 1900, max: new Date().getFullYear() + 1 } },
    vin:                { type: DataTypes.STRING,  allowNull: false, unique: true,
                          validate: { len: [17, 17] } },
    price:              { type: DataTypes.DECIMAL(10, 2), allowNull: false,
                          validate: { min: 0.01 } },
    horsePower:         { type: DataTypes.INTEGER, allowNull: false,
                          validate: { min: 1 } },
    isAvailableForRent: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    isSold:             { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    soldAt:             { type: DataTypes.DATE,    allowNull: true },
    leasingEndDate:     { type: DataTypes.DATE,    allowNull: true },
    image:              { type: DataTypes.STRING,  allowNull: true },
    ownerId:            { type: DataTypes.INTEGER, allowNull: false },
    renterId:           { type: DataTypes.INTEGER, allowNull: true }
  }, {
    sequelize,
    modelName: 'Car',
    tableName: 'Cars',
    timestamps: true
  });

  return Car;
};
```

---

## Ograniczenia Integralności Danych

### Ograniczenia na poziomie aplikacji (Sequelize validators)

| Model | Pole | Validator | Reguła |
|-------|------|-----------|--------|
| User | username | `len: [3, 50]` | Minimalna długość 3 znaki |
| User | email | `isEmail: true` | Format email |
| User | password | `len: [8, 255]` | Minimum 8 znaków (przed hashowaniem) |
| Car | year | `min: 1900, max: currentYear+1` | Realistyczny rok produkcji |
| Car | vin | `len: [17, 17]` | VIN zawsze 17 znaków |
| Car | price | `min: 0.01` | Cena > 0 |
| Car | horsePower | `min: 1` | Moc > 0 |
| Transaction | amount | `min: 0` | Kwota >= 0 |

### Ograniczenia na poziomie bazy danych (MySQL 8.0)

```sql
-- MySQL 8.0 (prod) — ograniczenia CHECK
ALTER TABLE Cars ADD CONSTRAINT chk_year   CHECK (year BETWEEN 1900 AND 2100);
ALTER TABLE Cars ADD CONSTRAINT chk_price  CHECK (price > 0);
ALTER TABLE Cars ADD CONSTRAINT chk_hp     CHECK (horsePower > 0);
ALTER TABLE Cars ADD CONSTRAINT chk_vin    CHECK (LENGTH(vin) = 17);

ALTER TABLE Transactions ADD CONSTRAINT chk_amount CHECK (amount >= 0);
ALTER TABLE Transactions ADD CONSTRAINT chk_dates
    CHECK (endDate IS NULL OR endDate >= startDate);
```

---

## Strategia Backup i Recovery

### Procedura Backup SQLite (dev)

```bash
#!/bin/bash
# scripts/backup-dev.sh

DB_PATH="data/salon-samochodowy.sqlite"
BACKUP_DIR="data/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

# Backup z weryfikacją integralności
sqlite3 "$DB_PATH" "PRAGMA integrity_check;" | grep -q "ok" && \
  sqlite3 "$DB_PATH" ".backup $BACKUP_DIR/salon_$TIMESTAMP.db" && \
  echo "Backup: $BACKUP_DIR/salon_$TIMESTAMP.db" || \
  echo "BŁĄD: Baza uszkodzona, backup pominięty"

# Usuń backupy starsze niż 7 dni
find "$BACKUP_DIR" -name "*.db" -mtime +7 -delete
```

### Procedura Backup MySQL (prod)

```bash
#!/bin/bash
# scripts/backup-prod.sh — uruchamiany przez cron co 6h

set -euo pipefail

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_NAME:-salon_db}"
DB_USER="${DB_USER:-salon_user}"
BACKUP_DIR="/backups/mysql"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/salon_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

# Dump z kompresją
mysqldump \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --user="$DB_USER" \
  --password="$MYSQL_PASSWORD" \
  --single-transaction \
  --routines \
  --triggers \
  --set-gtid-purged=OFF \
  "$DB_NAME" | gzip > "$BACKUP_FILE"

echo "$(date): Backup saved to $BACKUP_FILE ($(du -sh $BACKUP_FILE | cut -f1))"

# Retencja: usuń backupy starsze niż 30 dni
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete
```

### Tabela RPO/RTO

| Scenariusz | RPO (max utrata danych) | RTO (czas do przywrócenia) | Procedura |
|-----------|------------------------|--------------------------|-----------|
| Dev: przypadkowe DROP TABLE | 0 (SQLite ROLLBACK) | 5 min | `sqlite3 salon.db < backup.sql` |
| Dev: korupcja pliku SQLite | 1h (ostatni backup) | 15 min | Przywróć plik backup |
| Prod: utrata rekordu | 6h (cron backup) | 30 min | Point-in-time recovery z binlog |
| Prod: utrata serwera | 6h (cron backup) | 2h | Deploy na nowym VPS + restore |
| Prod: katastrofalna awaria DC | 24h (daily snapshot) | 4h | Restore z innej lokalizacji |

---

*Schemat Bazy Danych — wersja 1.0 — styczeń 2025*  
*Autor: DB Engineer | Zatwierdził: IT Architect*
