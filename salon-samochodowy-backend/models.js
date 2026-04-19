import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Sequelize } from 'sequelize';

/**
 * @api {object} SequelizeInstance Instancja połączenia z bazą danych
 * @apiName SequelizeInstance
 * @apiGroup Database
 * 
 * @apiDescription 
 * Tworzy połączenie z bazą danych MySQL przy użyciu Sequelize.
 * 
 * @apiParam {string} database Nazwa bazy danych
 * @apiParam {string} username Nazwa użytkownika bazy danych
 * @apiParam {string} password Hasło użytkownika bazy danych
 * @apiParam {string} host Adres hosta bazy danych
 * @apiParam {string} dialect Dialekt bazy danych (np. 'mysql')
 */
const mysqlConfig = {
    database: process.env.DB_NAME || 'salon_samochodowy',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Admin',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
};

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = path.dirname(currentFilePath);
const sqliteStoragePath = process.env.SQLITE_STORAGE || path.join(currentDirPath, 'data', 'salon-samochodowy.sqlite');

const createMySqlSequelize = () => new Sequelize(
    mysqlConfig.database,
    mysqlConfig.username,
    mysqlConfig.password,
    {
        host: mysqlConfig.host,
        port: mysqlConfig.port,
        dialect: 'mysql',
        logging: false,
    }
);

const createSqliteSequelize = () => {
    const sqliteDir = path.dirname(sqliteStoragePath);
    if (!fs.existsSync(sqliteDir)) {
        fs.mkdirSync(sqliteDir, { recursive: true });
    }

    return new Sequelize({
        dialect: 'sqlite',
        storage: sqliteStoragePath,
        logging: false,
    });
};

const createSequelizeWithFallback = async () => {
    const mysqlSequelize = createMySqlSequelize();

    try {
        await mysqlSequelize.authenticate();
        console.log('Połączono z bazą MySQL.');
        return mysqlSequelize;
    } catch (mysqlError) {
        console.error('Nie udało się połączyć z MySQL. Przełączanie na SQLite.', mysqlError.message);

        try {
            await mysqlSequelize.close();
        } catch (closeError) {
            console.error('Nie udało się zamknąć połączenia MySQL:', closeError.message);
        }

        const sqliteSequelize = createSqliteSequelize();
        await sqliteSequelize.authenticate();
        console.log(`Połączono z bazą SQLite: ${sqliteStoragePath}`);
        return sqliteSequelize;
    }
};

const sequelize = await createSequelizeWithFallback();

/**
 * @api {model} Car Model samochodu
 * @apiName CarModel
 * @apiGroup Models
 * 
 * @apiDescription 
 * Reprezentacja samochodu w systemie, przechowująca podstawowe informacje o pojeździe.
 * 
 * @apiParam {number} id Unikalny identyfikator samochodu
 * @apiParam {string} brand Marka samochodu
 * @apiParam {string} model Nazwa modelu samochodu
 * @apiParam {number} year Rok produkcji
 * @apiParam {string} vin Unikalny numer identyfikacyjny pojazdu (VIN)
 * @apiParam {number} price Cena samochodu
 * @apiParam {number} horsePower Moc silnika w koniach mechanicznych
 * @apiParam {boolean} [isAvailableForRent=true] Status dostępności samochodu do wynajmu
 * @apiParam {number} [ownerId] Opcjonalne ID właściciela samochodu
 * @apiParam {number} [renterId] Opcjonalne ID wynajmującego samochód
 */
const Car = sequelize.define('Car', {
    brand: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    model: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    year: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    vin: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
    price: {
        type: Sequelize.FLOAT,
        allowNull: false,
    },
    horsePower:{
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    isAvailableForRent: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
    },
    image: {
        type: Sequelize.STRING,
        allowNull: true,
    },
}, {
    timestamps: false, 
});

/**
 * @api {model} User Model użytkownika
 * @apiName UserModel
 * @apiGroup Models
 * 
 * @apiDescription 
 * Reprezentacja użytkownika w systemie, przechowująca informacje o koncie.
 * 
 * @apiParam {number} id Unikalny identyfikator użytkownika
 * @apiParam {string} username Unikalna nazwa użytkownika
 * @apiParam {string} password Zaszyfrowane hasło użytkownika
 * @apiParam {string} firstName Imię użytkownika
 * @apiParam {string} lastName Nazwisko użytkownika
 * @apiParam {boolean} [isDealer=true] Status dealera (true dla dealerów, false dla klientów)
 */
const User = sequelize.define('User', {
    username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    firstName: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    lastName: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    isDealer: {
        type: Sequelize.BOOLEAN,
        defaultValue: false, // INC-002: było true — każdy nowy user stawał się dealerem
    },
}, {
    timestamps: false, 
});

const Transaction = sequelize.define('Transaction', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    carId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    type: {
        type: Sequelize.ENUM('rent', 'return', 'leasing', 'buy'),
        allowNull: false,
    },
    totalAmount: {
        type: Sequelize.FLOAT,
        allowNull: true,
    },
    monthlyRate: {
        type: Sequelize.FLOAT,
        allowNull: true,
    },
    notes: {
        type: Sequelize.STRING,
        allowNull: true,
    },
}, {
    timestamps: true,
});

/**
 * @api {relation} UserCarRelations Relacje między użytkownikami a samochodami
 * @apiName UserCarRelations
 * @apiGroup Relationships
 * 
 * @apiDescription
 * Definiuje relacje między modelami User i Car:
 * - Jeden użytkownik może posiadać wiele samochodów
 * - Jeden użytkownik może wynajmować wiele samochodów
 */
User.hasMany(Car, { as: 'carsOwned', foreignKey: 'ownerId' });
Car.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });

User.hasMany(Car, { as: 'carsRented', foreignKey: 'renterId' });
Car.belongsTo(User, { as: 'renter', foreignKey: 'renterId' });

Transaction.belongsTo(Car, { foreignKey: 'carId', as: 'car' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Car.hasMany(Transaction, { foreignKey: 'carId', as: 'transactions' });
User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });

/**
 * @api {function} syncDatabase Synchronizacja bazy danych
 * @apiName SyncDatabase
 * @apiGroup Database
 * 
 * @apiDescription 
 * Automatycznie synchronizuje modele z bazą danych, tworząc lub aktualizując tabele.
 * 
 * @apiSuccess {string} message Komunikat o pomyślnej synchronizacji
 * @apiError {Error} error Błąd podczas synchronizacji bazy danych
 */
try {
    await sequelize.sync({ alter: true });
    console.log('Database synchronized');
} catch (err) {
    console.error('Database synchronization error:', err);
}

export { sequelize, Car, User, Transaction };