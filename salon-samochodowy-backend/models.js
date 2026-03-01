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
const sequelize = new Sequelize('salon_samochodowy', 'root', 'Admin', {
    host: 'localhost',
    dialect: 'mysql', 
});

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
        defaultValue: true,
    },
}, {
    timestamps: false, 
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
(async () => {
    await sequelize.sync({ alter: true })
        .then(() => console.log('Database synchronized'))
        .catch(err => console.error('Database synchronization error:', err));
})();

export { sequelize, Car, User };