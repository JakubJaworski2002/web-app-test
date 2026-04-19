# Migracja Bazy Danych — Plan Implementacji

## Kolejność Migracji

```
Migracja 001: Dodaj isSold do Cars
Migracja 002: Utwórz tabelę Transactions  
Migracja 003: Dodaj indeksy wydajnościowe
Migracja 004: Zmiana haseł na bcrypt (dane)
```

## Migracja 001 — isSold (Sequelize)

```javascript
// migrations/001-add-isSold.js
export async function up(sequelize) {
    try {
        await sequelize.query(
            'ALTER TABLE Cars ADD COLUMN isSold BOOLEAN NOT NULL DEFAULT false'
        );
        console.log('✅ Migration 001: isSold column added');
    } catch (err) {
        if (err.message.includes('duplicate column')) {
            console.log('⏭️  Migration 001: isSold already exists');
        } else {
            throw err;
        }
    }
}

export async function down(sequelize) {
    // SQLite nie obsługuje DROP COLUMN — pomijamy rollback
    // MySQL:
    // await sequelize.query('ALTER TABLE Cars DROP COLUMN isSold');
    console.warn('⚠️  Rollback 001: Manual intervention required for SQLite');
}
```

## Migracja 002 — Transactions

```javascript
// migrations/002-create-transactions.js
export async function up(sequelize) {
    await sequelize.query(`
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
        )
    `);
    console.log('✅ Migration 002: Transactions table created');
}
```

## Migracja 003 — Indeksy

```javascript
// migrations/003-add-indexes.js
export async function up(sequelize) {
    const indexes = [
        'CREATE INDEX IF NOT EXISTS idx_cars_brand ON Cars(brand)',
        'CREATE INDEX IF NOT EXISTS idx_cars_ownerId ON Cars(ownerId)',
        'CREATE INDEX IF NOT EXISTS idx_cars_isAvailableForRent ON Cars(isAvailableForRent)',
        'CREATE INDEX IF NOT EXISTS idx_users_username ON Users(username)',
        'CREATE INDEX IF NOT EXISTS idx_transactions_userId ON Transactions(userId)',
    ];
    for (const sql of indexes) {
        await sequelize.query(sql);
    }
    console.log('✅ Migration 003: Indexes created');
}
```

## Migracja 004 — Hashowanie Haseł (dane)

```javascript
// migrate-passwords.js — uruchom JEDNORAZOWO
import { User } from './models.js';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

console.log('🔐 Starting password migration...');
const users = await User.findAll();
let migrated = 0, skipped = 0;

for (const user of users) {
    if (user.password.startsWith('$2b$')) {
        console.log(`  ⏭️  Skipped (already hashed): ${user.username}`);
        skipped++;
    } else {
        const hashed = await bcrypt.hash(user.password, SALT_ROUNDS);
        await user.update({ password: hashed });
        console.log(`  ✅ Migrated: ${user.username}`);
        migrated++;
    }
}

console.log(`\nDone! Migrated: ${migrated}, Skipped: ${skipped}`);
process.exit(0);
```

## Skrypt Uruchomienia Migracji

```bash
#!/bin/bash
# run-migrations.sh

echo "🔒 Creating backup..."
cp data/salon-samochodowy.sqlite data/backup-$(date +%Y%m%d-%H%M).sqlite

echo "🔄 Running migrations..."
node migrations/001-add-isSold.js
node migrations/002-create-transactions.js
node migrations/003-add-indexes.js

echo "🔐 Migrating passwords (requires bcrypt in server.js first!)..."
# node migrate-passwords.js  ← Odkomentuj po wdrożeniu bcrypt

echo "✅ Migrations complete!"
```
