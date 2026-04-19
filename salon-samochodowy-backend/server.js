import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import session from 'express-session'; // Import express-session
import { sequelize, Car, User, Transaction } from './models.js';
import { Op } from 'sequelize';
import { body, param, validationResult } from 'express-validator'; // Import express-validator
import multer from 'multer';
import path from 'path';
import bcrypt from 'bcrypt';
import rateLimit from 'express-rate-limit';

const SALT_ROUNDS = 12;

if (!process.env.SESSION_SECRET) {
    console.warn('OSTRZEŻENIE: SESSION_SECRET nie jest ustawiony. Używam domyślnego klucza – NIE UŻYWAJ W PRODUKCJI!');
}

const app = express();
const carsRouter = express.Router();
const PORT = process.env.PORT || 3000;
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Folder docelowy
    },
    filename: (req, file, cb) => {
        // Ustalanie unikalnej nazwy pliku
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname); // Zachowanie oryginalnego rozszerzenia
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({ storage });


// Middleware
app.use(bodyParser.json());

// Konfiguracja CORS (INC-006: użyj zmiennej środowiskowej)
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:4200').split(',');
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS: niedozwolone origin'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

// Rate limiting (INC-005)
const isTestLikeEnv = process.env.CI === 'true' || process.env.PLAYWRIGHT === 'true' || process.env.NODE_ENV === 'test';
const authRateLimitMax = Number(process.env.AUTH_RATE_LIMIT_MAX || (isTestLikeEnv ? 2000 : 20));

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minut
    max: authRateLimitMax,
    message: { error: 'Zbyt wiele prób logowania. Spróbuj ponownie za 15 minut.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Konfiguracja sesji
app.use(session({
    secret: process.env.SESSION_SECRET || 'TwojSuperTajnyKlucz',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Ustaw na true, jeśli używasz HTTPS
        httpOnly: true, // Zapobiega dostępowi do ciasteczka z poziomu JavaScript
        maxAge: 1000 * 60 * 60 // Sesja ważna przez 1 godzinę
    }
}));

// Middleware do ochrony tras
const authenticateSession = (req, res, next) => {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.status(401).json({ error: 'Nieautoryzowany' });
    }
};

// Middleware do obsługi wyników walidacji
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

app.get('/', (req, res) => {
    res.send('Witamy w API Zarządzanie Samochodami!');
});

app.get('/health', async (req, res) => {
    try {
        await sequelize.authenticate();
        res.json({ status: 'ok', db: 'connected', uptime: process.uptime(), timestamp: new Date().toISOString() });
    } catch {
        res.status(503).json({ status: 'error', db: 'disconnected' });
    }
});

app.post('/register', authLimiter, [
    body('username')
        .isString().withMessage('Nazwa użytkownika musi być tekstem')
        .isLength({ min: 3 }).withMessage('Nazwa użytkownika musi mieć co najmniej 3 znaki'),
    body('email')
        .isEmail().withMessage('Podaj prawidłowy adres e-mail'),
    body('password')
        .isString().withMessage('Hasło musi być tekstem')
        .isLength({ min: 6 }).withMessage('Hasło musi mieć co najmniej 6 znaków'),
    body('firstName')
        .notEmpty().withMessage('Imię jest wymagane'),
    body('lastName')
        .notEmpty().withMessage('Nazwisko jest wymagane'),
    handleValidationErrors
], async (req, res) => {
    try {
        const { username, email, password, firstName, lastName } = req.body;

        // Sprawdzenie, czy użytkownik już istnieje
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ error: 'Nazwa użytkownika jest już zajęta' });
        }

        // Sprawdzenie, czy e-mail jest już zajęty
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
            return res.status(400).json({ error: 'Adres e-mail jest już zajęty' });
        }

        // Tworzenie nowego użytkownika z hashowanym hasłem (INC-001)
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            firstName,
            lastName,
            isDealer: false // Rejestracja publiczna tworzy klienta, nie dealera
        });

        // Inicjalizacja sesji
        req.session.userId = newUser.id;
        req.session.username = newUser.username;

        res.status(201).json({
            message: 'Rejestracja udana',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                isDealer: newUser.isDealer
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/login', authLimiter, [
    body('username')
        .isString().withMessage('Nazwa użytkownika musi być tekstem')
        .isLength({ min: 3 }).withMessage('Nazwa użytkownika musi mieć co najmniej 3 znaki'),
    body('password')
        .isString().withMessage('Hasło musi być tekstem')
        .isLength({ min: 6 }).withMessage('Hasło musi mieć co najmniej 6 znaków'),
    handleValidationErrors
], async (req, res) => {
    try {
        const { username, password } = req.body;

        // Znajdź użytkownika po nazwie użytkownika
        const user = await User.findOne({ where: { username } });

        if (!user) {
            return res.status(400).json({ error: 'Nieprawidłowa nazwa użytkownika lub hasło' });
        }

        // Sprawdź hasło z bcrypt (INC-001)
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(400).json({ error: 'Nieprawidłowa nazwa użytkownika lub hasło' });
        }

        // Inicjalizacja sesji
        req.session.userId = user.id;
        req.session.username = user.username;

        res.status(200).json({
            message: 'Logowanie udane',
            user: {
                id: user.id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                isDealer: user.isDealer
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                return res.status(500).json({ error: 'Nie udało się wylogować' });
            } else {
                res.status(200).json({ message: 'Wylogowano pomyślnie' });
            }
        });
    } else {
        res.status(400).json({ error: 'Brak aktywnej sesji' });
    }
});

carsRouter.get('/', async (req, res) => {
    try {
        const { page, limit } = req.query;
        if (page !== undefined && limit !== undefined) {
            const pageNum = parseInt(page, 10);
            const limitNum = parseInt(limit, 10);
            if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
                return res.status(400).json({ error: 'page and limit must be positive integers' });
            }
            const offset = (pageNum - 1) * limitNum;
            const { count, rows } = await Car.findAndCountAll({ limit: limitNum, offset });
            return res.json({
                data: rows,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total: count,
                    totalPages: Math.ceil(count / limitNum),
                },
            });
        }
        const cars = await Car.findAll();
        res.json(cars);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

carsRouter.get('/:id', [
    param('id')
        .isInt({ min: 1 }).withMessage('ID samochodu musi być liczbą całkowitą większą lub równą 1'),
    handleValidationErrors
], async (req, res) => {
    try {
        const car = await Car.findByPk(req.params.id);
        if (car) {
            res.json(car);
        } else {
            res.status(404).json({ error: 'Samochód nie znaleziony' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

carsRouter.post('/', authenticateSession, [
    body('brand')
        .isString().withMessage('Marka musi być tekstem')
        .notEmpty().withMessage('Marka jest wymagana'),
    body('model')
        .isString().withMessage('Model musi być tekstem')
        .notEmpty().withMessage('Model jest wymagany'),
    body('year')
        .isInt({ min: 1886 }).withMessage('Rok produkcji musi być liczbą całkowitą nie mniejszą niż 1886'),
    body('vin')
        .isString().withMessage('Numer VIN musi być tekstem')
        .isLength({ min: 17, max: 17 }).withMessage('Numer VIN musi mieć dokładnie 17 znaków'),
    body('price')
        .isFloat({ min: 0 }).withMessage('Cena musi być liczbą dodatnią'),
    body('horsePower')
        .isInt({ min: 1 }).withMessage('Moc silnika musi być liczbą całkowitą nie mniejszą niż 1'),
    body('isAvailableForRent')
        .isBoolean().withMessage('Status dostępności do wynajmu musi być wartością boolean'),
    handleValidationErrors
], async (req, res) => {
    try {
        const { brand, model, year, vin, price, horsePower, isAvailableForRent } = req.body;
        const newCar = await Car.create({
            brand,
            model,
            year,
            vin,
            price,
            horsePower,
            isAvailableForRent
        });
        res.status(201).json(newCar);
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log(error)
    }
});
carsRouter.post('/:id/upload', authenticateSession, upload.single('image'), async (req, res) => {
    try {
        const car = await Car.findByPk(req.params.id);
        if (!car) {
            return res.status(404).json({ error: 'Samochód nie znaleziony' });
        }

        // Zapisz ścieżkę do pliku w bazie danych
        car.image = req.file.path;
        await car.save();

        res.status(200).json({ message: 'Zdjęcie dodane pomyślnie', imagePath: car.image });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.use('/uploads', express.static('uploads'));


carsRouter.put('/:id', authenticateSession, [
    param('id')
        .isInt({ min: 1 }).withMessage('ID samochodu musi być liczbą całkowitą większą lub równą 1'),
    body('brand')
        .optional()
        .isString().withMessage('Marka musi być tekstem')
        .notEmpty().withMessage('Marka nie może być pusta'),
    body('model')
        .optional()
        .isString().withMessage('Model musi być tekstem')
        .notEmpty().withMessage('Model nie może być pusty'),
    body('year')
        .optional()
        .isInt({ min: 1886 }).withMessage('Rok produkcji musi być liczbą całkowitą nie mniejszą niż 1886'),
    body('vin')
        .optional()
        .isString().withMessage('Numer VIN musi być tekstem')
        .isLength({ min: 17, max: 17 }).withMessage('Numer VIN musi mieć dokładnie 17 znaków'),
    body('price')
        .optional()
        .isFloat({ min: 0 }).withMessage('Cena musi być liczbą dodatnią'),
    body('horsePower')
        .optional()
        .isInt({ min: 1 }).withMessage('Moc silnika musi być liczbą całkowitą nie mniejszą niż 1'),
    body('isAvailableForRent')
        .optional()
        .isBoolean().withMessage('Status dostępności do wynajmu musi być wartością boolean'),
    handleValidationErrors
], async (req, res) => {
    try {
        const { brand, model, year, vin, price, horsePower, isAvailableForRent } = req.body;
        const car = await Car.findByPk(req.params.id);
        if (car) {
            await car.update({ brand, model, year, vin, price, horsePower, isAvailableForRent });
            res.json(car);
        } else {
            res.status(404).json({ error: 'Samochód nie znaleziony' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

carsRouter.delete('/:id', authenticateSession, [
    param('id')
        .isInt({ min: 1 }).withMessage('ID samochodu musi być liczbą całkowitą większą lub równą 1'),
    handleValidationErrors
], async (req, res) => {
    const userId = req.session.userId;
    const carId = req.params.id;

    try {
        // Sprawdź, czy użytkownik jest dealerem
        const user = await User.findByPk(userId);
        if (!user || !user.isDealer) {
            return res.status(403).json({ error: 'Brak uprawnień do usuwania samochodów' });
        }

        // Usuń samochód
        const deleted = await Car.destroy({ where: { id: carId } });
        if (deleted) {
            res.status(200).json({ message: 'Samochód usunięty.' });
        } else {
            res.status(404).json({ error: 'Samochód nie znaleziony' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/users', authenticateSession, async (req, res) => {
    try {
        const users = await User.findAll({
            where: { isDealer: false } // Klienci mają isDealer: false
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/users/:id', authenticateSession, [
    param('id')
        .isInt({ min: 1 }).withMessage('ID użytkownika musi być liczbą całkowitą większą lub równą 1'),
    handleValidationErrors
], async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (user && !user.isDealer) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'Klient nie znaleziony' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/users/:id', authenticateSession, [
    param('id')
        .isInt({ min: 1 }).withMessage('ID użytkownika musi być liczbą całkowitą większą lub równą 1'),
    body('username')
        .optional()
        .isString().withMessage('Nazwa użytkownika musi być tekstem')
        .isLength({ min: 3 }).withMessage('Nazwa użytkownika musi mieć co najmniej 3 znaki'),
    body('password')
        .optional()
        .isString().withMessage('Hasło musi być tekstem')
        .isLength({ min: 6 }).withMessage('Hasło musi mieć co najmniej 6 znaków'),
    body('firstName')
        .optional()
        .notEmpty().withMessage('Imię nie może być puste'),
    body('lastName')
        .optional()
        .notEmpty().withMessage('Nazwisko nie może być puste'),
    handleValidationErrors
], async (req, res) => {
    try {
        const { username, password, firstName, lastName } = req.body;
        const user = await User.findByPk(req.params.id);
        if (user && !user.isDealer) {
            // Opcjonalnie: Możesz dodać logikę, aby użytkownik mógł edytować tylko swoje własne dane
            if (user.id !== req.session.userId) {
                return res.status(403).json({ error: 'Nie masz uprawnień do edycji tego użytkownika' });
            }

            await user.update({ username, password, firstName, lastName });
            res.json(user);
        } else {
            res.status(404).json({ error: 'Klient nie znaleziony' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/users/:id', authenticateSession, [
    param('id')
        .isInt({ min: 1 }).withMessage('ID użytkownika musi być liczbą całkowitą większą lub równą 1'),
    handleValidationErrors
], async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (user && !user.isDealer) {
            // Opcjonalnie: Użytkownik może usunąć tylko swoje konto
            if (user.id !== req.session.userId) {
                return res.status(403).json({ error: 'Nie masz uprawnień do usunięcia tego użytkownika' });
            }

            await user.destroy();
            res.json({ message: 'Klient usunięty' });
        } else {
            res.status(404).json({ error: 'Klient nie znaleziony' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

carsRouter.post('/:id/rent', authenticateSession, [
    param('id')
        .isInt({ min: 1 }).withMessage('ID samochodu musi być liczbą całkowitą większą lub równą 1'),
    handleValidationErrors
], async (req, res) => {
    try {
        const carId = req.params.id;

        // Znajdź samochód po ID
        const car = await Car.findByPk(carId);

        if (!car) {
            return res.status(404).json({ error: 'Samochód nie znaleziony' });
        }

        if (!car.isAvailableForRent) {
            return res.status(400).json({ error: 'Samochód jest już wynajęty' });
        }

        // Wynajem samochodu
        car.isAvailableForRent = false;
        car.renterId = req.session.userId; // Przypisujemy ID użytkownika jako wynajmującego

        await car.save();

        res.status(200).json({ message: 'Samochód został wynajęty', car });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

carsRouter.post('/:id/return', authenticateSession, [
    param('id')
        .isInt({ min: 1 }).withMessage('ID samochodu musi być liczbą całkowitą większą lub równą 1'),
    handleValidationErrors
], async (req, res) => {
    try {
        const carId = req.params.id;

        // Znajdź samochód po ID
        const car = await Car.findByPk(carId);

        if (!car) {
            return res.status(404).json({ error: 'Samochód nie znaleziony' });
        }

        if (car.isAvailableForRent) {
            return res.status(400).json({ error: 'Samochód już jest dostępny' });
        }

        if (car.renterId !== req.session.userId) {
            return res.status(403).json({ error: 'Nie możesz zwrócić tego samochodu, ponieważ nie jesteś jego wynajmującym' });
        }

        // Zwrócenie samochodu
        car.isAvailableForRent = true;
        car.renterId = null; // Usuwamy powiązanie z wynajmującym

        await car.save();

        res.status(200).json({ message: 'Samochód został zwrócony', car });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

carsRouter.get('/:id/renter', [
    param('id')
        .isInt({ min: 1 }).withMessage('ID samochodu musi być liczbą całkowitą większą lub równą 1'),
    handleValidationErrors
], async (req, res) => {
    const carId = req.params.id; // ID samochodu z parametru URL
    try {
        // Znajdź samochód na podstawie ID
        const car = await Car.findByPk(carId);

        if (car) {
            res.json({ carId: car.id, renterId: car.renterId });
        } else {
            res.status(404).json({ error: 'Samochód nie znaleziony' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

carsRouter.post('/:id/buy', authenticateSession, [
    param('id')
        .isInt({ min: 1 }).withMessage('ID samochodu musi być liczbą całkowitą większą lub równą 1'),
    handleValidationErrors
], async (req, res) => {
    try {
        const carId = req.params.id;

        // Znajdź samochód po ID
        const car = await Car.findByPk(carId);

        if (!car) {
            return res.status(404).json({ error: 'Samochód nie znaleziony' });
        }

        if (!car.isAvailableForRent) {
            return res.status(400).json({ error: 'Samochód jest już sprzedany lub wynajęty' });
        }

        // Kupno samochodu
        car.isAvailableForRent = false; // Samochód jest teraz niedostępny do wynajmu
        car.ownerId = req.session.userId; // Przypisujemy właściciela

        await car.save();

        res.status(200).json({ message: 'Samochód został kupiony', car });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/current-user', authenticateSession, async (req, res) => {
    try {
        const user = await User.findByPk(req.session.userId, {
            attributes: ['id', 'username', 'firstName', 'lastName', 'isDealer']
        });
        if (user) {
            res.json({ user });
        } else {
            res.status(404).json({ error: 'Użytkownik nie znaleziony' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

carsRouter.post('/:id/leasing', [
    param('id')
        .isInt({ min: 1 }).withMessage('ID samochodu musi być liczbą całkowitą większą lub równą 1'),
    body('downPayment')
        .isFloat({ min: 0 }).withMessage('Wpłata wstępna musi być liczbą dodatnią'),
    body('months')
        .isInt({ min: 1 }).withMessage('Liczba miesięcy musi być liczbą całkowitą nie mniejszą niż 1'),
    handleValidationErrors
], async (req, res) => {
    try {
        const carId = req.params.id;
        const { downPayment, months } = req.body;

        const car = await Car.findByPk(carId);

        if (!car) {
            return res.status(404).json({ error: 'Samochód nie znaleziony' });
        }

        const remainingAmount = car.price - downPayment;

        if (remainingAmount < 0) {
            return res.status(400).json({ error: 'Wpłata wstępna nie może być większa niż cena samochodu' });
        }

        const monthlyRate = remainingAmount / months;

        res.status(200).json({
            carId: car.id,
            carBrand: car.brand,
            carModel: car.model,
            totalPrice: car.price,
            downPayment: downPayment,
            remainingAmount: remainingAmount.toFixed(2),
            months: months,
            monthlyRate: monthlyRate.toFixed(2),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mount cars router at both legacy path and new API v1 path
app.use('/cars', carsRouter);
app.use('/api/v1/cars', carsRouter);

app.post('/admin/create-customer', authenticateSession, [
    body('username')
        .isString().withMessage('Nazwa użytkownika musi być tekstem')
        .isLength({ min: 3 }).withMessage('Nazwa użytkownika musi mieć co najmniej 3 znaki'),
    body('email')
        .isEmail().withMessage('Podaj prawidłowy adres e-mail'),
    body('password')
        .isString().withMessage('Hasło musi być tekstem')
        .isLength({ min: 6 }).withMessage('Hasło musi mieć co najmniej 6 znaków'),
    body('firstName')
        .notEmpty().withMessage('Imię jest wymagane'),
    body('lastName')
        .notEmpty().withMessage('Nazwisko jest wymagane'),
    handleValidationErrors
], async (req, res) => {
    try {
        const { username, email, password, firstName, lastName } = req.body;
        
        // Sprawdzenie, czy aktualny użytkownik jest dealerem
        const dealer = await User.findByPk(req.session.userId);
        if (!dealer || !dealer.isDealer) {
            return res.status(403).json({ error: 'Brak uprawnień do tworzenia klientów' });
        }

        // Sprawdzenie, czy użytkownik już istnieje
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ error: 'Nazwa użytkownika jest już zajęta' });
        }

        // Sprawdzenie, czy e-mail jest już zajęty
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
            return res.status(400).json({ error: 'Adres e-mail jest już zajęty' });
        }

        // Tworzenie nowego klienta bez haszowania hasła
        const newUser = await User.create({
            username,
            email,
            password,
            firstName,
            lastName,
            isDealer: false // Upewniamy się, że tworzymy klienta, a nie dealera
        });

        res.status(201).json({
            message: 'Klient został pomyślnie dodany',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                isDealer: newUser.isDealer
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/v1/transactions', authenticateSession, async (req, res) => {
    try {
        const transactions = await Transaction.findAll({
            where: { userId: req.session.userId },
            include: [{ model: Car, as: 'car', attributes: ['id', 'brand', 'model', 'year'] }],
            order: [['createdAt', 'DESC']],
            limit: 50
        });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ====== API v1 Auth routes ======
app.post('/api/v1/auth/register', authLimiter, [
    body('username')
        .isString().withMessage('Nazwa użytkownika musi być tekstem')
        .isLength({ min: 3 }).withMessage('Nazwa użytkownika musi mieć co najmniej 3 znaki'),
    body('email')
        .isEmail().withMessage('Podaj prawidłowy adres e-mail'),
    body('password')
        .isString().withMessage('Hasło musi być tekstem')
        .isLength({ min: 6 }).withMessage('Hasło musi mieć co najmniej 6 znaków'),
    body('firstName')
        .notEmpty().withMessage('Imię jest wymagane'),
    body('lastName')
        .notEmpty().withMessage('Nazwisko jest wymagane'),
    handleValidationErrors
], async (req, res) => {
    try {
        const { username, email, password, firstName, lastName } = req.body;
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ error: 'Nazwa użytkownika jest już zajęta' });
        }
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
            return res.status(400).json({ error: 'Adres e-mail jest już zajęty' });
        }
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const newUser = await User.create({
            username, email, password: hashedPassword,
            firstName, lastName, isDealer: false
        });
        req.session.userId = newUser.id;
        req.session.username = newUser.username;
        res.status(201).json({
            message: 'Rejestracja udana',
            user: {
                id: newUser.id, username: newUser.username, email: newUser.email,
                firstName: newUser.firstName, lastName: newUser.lastName, isDealer: newUser.isDealer
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/v1/auth/login', authLimiter, [
    body('username')
        .isString().withMessage('Nazwa użytkownika musi być tekstem')
        .isLength({ min: 3 }).withMessage('Nazwa użytkownika musi mieć co najmniej 3 znaki'),
    body('password')
        .isString().withMessage('Hasło musi być tekstem')
        .isLength({ min: 6 }).withMessage('Hasło musi mieć co najmniej 6 znaków'),
    handleValidationErrors
], async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(401).json({ error: 'Nieprawidłowa nazwa użytkownika lub hasło' });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Nieprawidłowa nazwa użytkownika lub hasło' });
        }
        req.session.userId = user.id;
        req.session.username = user.username;
        res.status(200).json({
            message: 'Logowanie udane',
            user: {
                id: user.id, username: user.username,
                firstName: user.firstName, lastName: user.lastName, isDealer: user.isDealer
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/v1/auth/logout', (req, res) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                return res.status(500).json({ error: 'Nie udało się wylogować' });
            } else {
                res.status(200).json({ message: 'Wylogowano pomyślnie' });
            }
        });
    } else {
        res.status(400).json({ error: 'Brak aktywnej sesji' });
    }
});

app.get('/api/v1/auth/profile', authenticateSession, async (req, res) => {
    try {
        const user = await User.findByPk(req.session.userId, {
            attributes: ['id', 'username', 'firstName', 'lastName', 'isDealer']
        });
        if (user) {
            res.json({ user });
        } else {
            res.status(404).json({ error: 'Użytkownik nie znaleziony' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ====== START SERWERA ======
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Serwer działa na porcie ${PORT}`);
    });
}

export { app };
