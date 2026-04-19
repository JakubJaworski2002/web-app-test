import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';

const mockCarFindAll  = jest.fn();
const mockCarFindByPk = jest.fn();
const mockCarDestroy  = jest.fn();
const mockUserFindByPk = jest.fn();

await jest.unstable_mockModule('express-session', () => ({
    default: () => (req, res, next) => {
        const uid = req.headers['x-test-user-id'];
        req.session = {
            userId:  uid ? parseInt(uid, 10) : undefined,
            destroy: (cb) => cb(null),
        };
        next();
    },
}));

await jest.unstable_mockModule('../models.js', () => ({
    Car: {
        findAll:  mockCarFindAll,
        findByPk: mockCarFindByPk,
        destroy:  mockCarDestroy,
        create:   jest.fn(),
    },
    User: {
        findByPk: mockUserFindByPk,
        findOne:  jest.fn().mockResolvedValue(null),
        create:   jest.fn(),
        findAll:  jest.fn().mockResolvedValue([]),
    },
    Transaction: {
        findAll: jest.fn().mockResolvedValue([]),
        create: jest.fn(),
        findByPk: jest.fn(),
        destroy: jest.fn(),
    },
    sequelize: {},
}));

const { app } = await import('../server.js');

describe('GET /cars – Wyświetlanie listy samochodów', () => {

    beforeEach(() => jest.clearAllMocks());

    it('powinien zwrócić pustą listę samochodów', async () => {
        mockCarFindAll.mockResolvedValue([]);
        const res = await request(app).get('/cars');
        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });

    it('powinien zwrócić listę samochodów', async () => {
        const mockCars = [
            { id: 1, brand: 'Toyota', model: 'Corolla', year: 2020, price: 50000 },
            { id: 2, brand: 'Honda',  model: 'Civic',   year: 2019, price: 45000 },
        ];
        mockCarFindAll.mockResolvedValue(mockCars);
        const res = await request(app).get('/cars');
        expect(res.status).toBe(200);
        expect(res.body).toEqual(mockCars);
    });

    it('powinien obsłużyć błąd bazy danych (500)', async () => {
        mockCarFindAll.mockRejectedValue(new Error('Błąd bazy danych'));
        const res = await request(app).get('/cars');
        expect(res.status).toBe(500);
        expect(res.body.error).toBe('Błąd bazy danych');
    });

});

describe('DELETE /cars/:id – Usuwanie samochodu', () => {

    beforeEach(() => jest.clearAllMocks());

    it('powinien pomyślnie usunąć samochód gdy user jest dealerem (200)', async () => {
        const dealer = { id: 1, isDealer: true };
        mockUserFindByPk.mockResolvedValue(dealer);
        mockCarDestroy.mockResolvedValue(1);

        const res = await request(app)
            .delete('/cars/1')
            .set('x-test-user-id', '1');

        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/usunięty/i);
    });

    it('powinien zwrócić 403 gdy user nie jest dealerem', async () => {
        const regularUser = { id: 2, isDealer: false };
        mockUserFindByPk.mockResolvedValue(regularUser);

        const res = await request(app)
            .delete('/cars/1')
            .set('x-test-user-id', '2');

        expect(res.status).toBe(403);
        expect(res.body.error).toMatch(/uprawnień/i);
    });

    it('powinien zwrócić 404 gdy samochód nie istnieje', async () => {
        const dealer = { id: 1, isDealer: true };
        mockUserFindByPk.mockResolvedValue(dealer);
        mockCarDestroy.mockResolvedValue(0);

        const res = await request(app)
            .delete('/cars/999')
            .set('x-test-user-id', '1');

        expect(res.status).toBe(404);
        expect(res.body.error).toMatch(/nie znaleziony/i);
    });

    it('powinien zwrócić 401 gdy użytkownik nie jest zalogowany', async () => {
        const res = await request(app).delete('/cars/1');
        expect(res.status).toBe(401);
        expect(res.body.error).toMatch(/nieautoryzowany/i);
    });

});
