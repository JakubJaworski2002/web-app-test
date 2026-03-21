// tests/cars.test.ts
const request = require('supertest');

let mockSession: any = {};

jest.mock('express-session', () => {
    return jest.fn(() => (req: any, res: any, next: any) => {
        req.session = mockSession;  // ← uses the shared variable
        next();
    });
});

jest.mock('../models.js', () => ({
    Car: {
        findAll: jest.fn(),
        findByPk: jest.fn(),
        destroy: jest.fn(),
    },
    User: {
        findByPk: jest.fn(),
    },
}));

const { app } = require('../server.js');
const { Car, User } = require('../models.js');

const mockedCar = Car as any;
const mockedUser = User as any;

describe('Car API - Usuwanie i Filtrowanie/Wyświetlanie Listy Samochodów', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSession = {};  // ← reset before each test
    });

    describe('Wyświetlanie listy samochodów (GET /cars)', () => {
        it('powinien zwrócić pustą listę samochodów', async () => {
            mockedCar.findAll.mockResolvedValue([]);
            const response = await request(app).get('/cars');
            expect(mockedCar.findAll).toHaveBeenCalledWith();
            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        });

        it('powinien zwrócić listę samochodów', async () => {
            const mockCars = [
                { id: 1, brand: 'Toyota', model: 'Corolla', year: 2020, price: 50000 },
                { id: 2, brand: 'Honda', model: 'Civic', year: 2019, price: 45000 }
            ];
            mockedCar.findAll.mockResolvedValue(mockCars);
            const response = await request(app).get('/cars');
            expect(mockedCar.findAll).toHaveBeenCalledWith();
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockCars);
        });

        it('powinien obsłużyć błąd bazy danych', async () => {
            mockedCar.findAll.mockRejectedValue(new Error('Błąd bazy danych'));
            const response = await request(app).get('/cars');
            expect(mockedCar.findAll).toHaveBeenCalledWith();
            expect(response.status).toBe(500);
            expect(response.body.error).toBe('Błąd bazy danych');
        });

        it('powinien filtrować samochody po marce (symulacja)', async () => {
            const mockCars = [{ id: 1, brand: 'Toyota', model: 'Corolla' }];
            mockedCar.findAll.mockResolvedValue(mockCars);
            const response = await request(app).get('/cars?brand=Toyota');
            expect(mockedCar.findAll).toHaveBeenCalledWith();
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockCars);
        });

        it('powinien filtrować samochody po dostępności do wynajmu (symulacja)', async () => {
            const mockCars = [{ id: 1, isAvailableForRent: true }];
            mockedCar.findAll.mockResolvedValue(mockCars);
            const response = await request(app).get('/cars?available=true');
            expect(mockedCar.findAll).toHaveBeenCalledWith();
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockCars);
        });  // ← this closing was missing in your original
    });       // ← closes the GET describe block

    describe('Usuwanie samochodu (DELETE /cars/:id)', () => {
        it('powinien pomyślnie usunąć samochód należący do użytkownika', async () => {
            mockSession = { userId: 1 };
            const mockCar = { id: 1, ownerId: 1, destroy: jest.fn().mockResolvedValue(undefined) };
            mockedCar.findByPk.mockResolvedValue(mockCar);
            const response = await request(app).delete('/cars/1');
            expect(mockedCar.findByPk).toHaveBeenCalledWith('1');
            expect(mockCar.destroy).toHaveBeenCalled();
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Samochód został usunięty');
        });

        it('powinien zwrócić 403 jeśli użytkownik nie jest właścicielem', async () => {
            mockSession = { userId: 2 };
            const mockCar = { id: 1, ownerId: 1 };
            mockedCar.findByPk.mockResolvedValue(mockCar);
            const response = await request(app).delete('/cars/1');
            expect(mockedCar.findByPk).toHaveBeenCalledWith('1');
            expect(response.status).toBe(403);
            expect(response.body.error).toBe('Brak uprawnień do usunięcia tego samochodu');
        });

        it('powinien zwrócić 404 jeśli samochód nie istnieje', async () => {
            mockSession = { userId: 1 };
            mockedCar.findByPk.mockResolvedValue(null);
            const response = await request(app).delete('/cars/999');
            expect(mockedCar.findByPk).toHaveBeenCalledWith('999');
            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Samochód nie znaleziony');
        });

        it('powinien obsłużyć błąd bazy danych podczas usuwania', async () => {
            mockSession = { userId: 1 };
            const mockCar = { id: 1, ownerId: 1, destroy: jest.fn().mockRejectedValue(new Error('Błąd bazy danych')) };
            mockedCar.findByPk.mockResolvedValue(mockCar);
            const response = await request(app).delete('/cars/1');
            expect(mockedCar.findByPk).toHaveBeenCalledWith('1');
            expect(mockCar.destroy).toHaveBeenCalled();
            expect(response.status).toBe(500);
            expect(response.body.error).toBe('Błąd serwera');
        });

        it('powinien zwrócić 401 jeśli użytkownik nie jest zalogowany', async () => {
            mockSession = {};
            mockedCar.findByPk.mockResolvedValue({ id: 1, ownerId: 1 });
            const response = await request(app).delete('/cars/1');
            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Użytkownik nie jest zalogowany');
        });
    });
});