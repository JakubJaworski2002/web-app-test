import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';

const mockCarSave     = jest.fn().mockResolvedValue(undefined);
const mockCarFindByPk = jest.fn();
const mockUserFindByPk = jest.fn();
const mockUserFindOne  = jest.fn();

await jest.unstable_mockModule('../models.js', () => ({
    Car: {
        findByPk: mockCarFindByPk,
        destroy:  jest.fn(),
        findAll:  jest.fn().mockResolvedValue([]),
        create:   jest.fn(),
    },
    User: {
        findByPk: mockUserFindByPk,
        findOne:  mockUserFindOne,
        findAll:  jest.fn().mockResolvedValue([]),
        create:   jest.fn(),
    },
    Transaction: {
        findAll: jest.fn().mockResolvedValue([]),
        create: jest.fn(),
        findByPk: jest.fn(),
        destroy: jest.fn(),
    },
    sequelize: {},
}));

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

const { app } = await import('../server.js');

const USER_ID       = 1;
const OTHER_USER_ID = 99;

const makeCar = (overrides = {}) => ({
    id:                 10,
    brand:              'Toyota',
    model:              'Corolla',
    isAvailableForRent: true,
    renterId:           null,
    save:               mockCarSave,
    ...overrides,
});

describe('R4 – Wynajem samochodu [POST /cars/:id/rent]', () => {

    beforeEach(() => jest.clearAllMocks());

    it('TC1 – powinien wynająć dostępny samochód zalogowanemu użytkownikowi (200)', async () => {
        const car = makeCar();
        mockCarFindByPk.mockResolvedValue(car);

        const res = await request(app)
            .post('/cars/10/rent')
            .set('x-test-user-id', String(USER_ID));

        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/wynajęty/i);
        expect(mockCarSave).toHaveBeenCalledTimes(1);
        expect(car.isAvailableForRent).toBe(false);
        expect(car.renterId).toBe(USER_ID);
    });

    it('TC5 – powinien zwrócić 401 gdy użytkownik nie jest zalogowany', async () => {
        const res = await request(app)
            .post('/cars/10/rent');

        expect(res.status).toBe(401);
        expect(res.body.error).toMatch(/nieautoryzowany/i);
    });

    it('TC6 – powinien odmówić wynajmu gdy samochód jest już wynajęty (RENTED)', async () => {
        const car = makeCar({ isAvailableForRent: false, renterId: OTHER_USER_ID });
        mockCarFindByPk.mockResolvedValue(car);

        const res = await request(app)
            .post('/cars/10/rent')
            .set('x-test-user-id', String(USER_ID));

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/wynajęty/i);
    });

    it('TC8 – powinien odmówić wynajmu gdy user już wynajmuje ten samochód', async () => {
        const car = makeCar({ isAvailableForRent: false, renterId: USER_ID });
        mockCarFindByPk.mockResolvedValue(car);

        const res = await request(app)
            .post('/cars/10/rent')
            .set('x-test-user-id', String(USER_ID));

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/wynajęty/i);
    });

    it('TC9 – powinien wynająć auto gdy przekazano poprawne daty przyszłe (200)', async () => {
        const car = makeCar();
        mockCarFindByPk.mockResolvedValue(car);

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const in5Days = new Date();
        in5Days.setDate(in5Days.getDate() + 5);

        const res = await request(app)
            .post('/cars/10/rent')
            .set('x-test-user-id', String(USER_ID))
            .send({ startDate: tomorrow.toISOString(), endDate: in5Days.toISOString() });

        expect(res.status).toBe(200);
        expect(mockCarSave).toHaveBeenCalledTimes(1);
        expect(car.renterId).toBe(USER_ID);
    });

    it('TC10 – powinien zwrócić 400 gdy carId nie jest poprawną liczbą całkowitą', async () => {
        const res = await request(app)
            .post('/cars/abc/rent')
            .set('x-test-user-id', String(USER_ID));

        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

});

describe('R5 – Zwrot samochodu [POST /cars/:id/return]', () => {

    beforeEach(() => jest.clearAllMocks());

    it('TC11 – powinien zwrócić samochód i oznaczyć go jako dostępny (200)', async () => {
        const car = makeCar({ isAvailableForRent: false, renterId: USER_ID });
        mockCarFindByPk.mockResolvedValue(car);

        const res = await request(app)
            .post('/cars/10/return')
            .set('x-test-user-id', String(USER_ID));

        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/zwrócony/i);
        expect(mockCarSave).toHaveBeenCalledTimes(1);
        expect(car.isAvailableForRent).toBe(true);
        expect(car.renterId).toBeNull();
    });

    it('TC13 – powinien odmówić zwrotu cudzego samochodu (403)', async () => {
        const car = makeCar({ isAvailableForRent: false, renterId: OTHER_USER_ID });
        mockCarFindByPk.mockResolvedValue(car);

        const res = await request(app)
            .post('/cars/10/return')
            .set('x-test-user-id', String(USER_ID));

        expect(res.status).toBe(403);
        expect(res.body.error).toMatch(/wynajmującym/i);
    });

    it('TC14 – powinien zwrócić 401 gdy użytkownik nie jest zalogowany', async () => {
        const res = await request(app)
            .post('/cars/10/return');

        expect(res.status).toBe(401);
        expect(res.body.error).toMatch(/nieautoryzowany/i);
    });

    it('TC17 – powinien zwrócić 404 gdy samochód o podanym ID nie istnieje', async () => {
        mockCarFindByPk.mockResolvedValue(null);

        const res = await request(app)
            .post('/cars/999/return')
            .set('x-test-user-id', String(USER_ID));

        expect(res.status).toBe(404);
        expect(res.body.error).toMatch(/nie znaleziony/i);
    });

});
