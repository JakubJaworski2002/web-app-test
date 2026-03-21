import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';

const mockCarFindByPk = jest.fn();
const mockCarCreate   = jest.fn();
const mockCarUpdate   = jest.fn();
const mockCarFindAll  = jest.fn().mockResolvedValue([]);

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
        findByPk: mockCarFindByPk,
        create:   mockCarCreate,
        findAll:  mockCarFindAll,
        destroy:  jest.fn(),
    },
    User: {
        findByPk: jest.fn(),
        findOne:  jest.fn().mockResolvedValue(null),
        findAll:  jest.fn().mockResolvedValue([]),
        create:   jest.fn(),
    },
    sequelize: {},
}));

const { app } = await import('../server.js');

const VALID_PAYLOAD = {
    brand:              'Toyota',
    model:              'Corolla',
    year:               2020,
    vin:                'WAUZZZ8V0JA000001',
    price:              75000,
    horsePower:         132,
    isAvailableForRent: true,
};

const MOCK_CAR = { id: 1, ...VALID_PAYLOAD, update: mockCarUpdate };

describe('AG – Dodawanie samochodu [POST /cars]', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        mockCarCreate.mockResolvedValue({ id: 1, ...VALID_PAYLOAD });
    });

    it('TC1 – powinien dodać samochód z poprawnymi danymi i sesją (201)', async () => {
        const res = await request(app)
            .post('/cars')
            .set('x-test-user-id', '1')
            .send(VALID_PAYLOAD);

        expect(res.status).toBe(201);
        expect(mockCarCreate).toHaveBeenCalledTimes(1);
    });

    it('TC2 – brak sesji przy POST /cars powinien zwrócić 401', async () => {
        const res = await request(app)
            .post('/cars')
            .send(VALID_PAYLOAD);

        expect(res.status).toBe(401);
        expect(res.body.error).toMatch(/nieautoryzowany/i);
    });

    it('TC3 – brak pola brand powinien zwrócić 400 (walidacja)', async () => {
        const { brand: _b, ...payload } = VALID_PAYLOAD;
        const res = await request(app)
            .post('/cars')
            .set('x-test-user-id', '1')
            .send(payload);

        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    it('TC4 – pusty brand="" powinien zwrócić 400 (walidacja)', async () => {
        const res = await request(app)
            .post('/cars')
            .set('x-test-user-id', '1')
            .send({ ...VALID_PAYLOAD, brand: '' });

        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    it('TC5 – brak pola isAvailableForRent powinien zwrócić 400', async () => {
        const { isAvailableForRent: _i, ...payload } = VALID_PAYLOAD;
        const res = await request(app)
            .post('/cars')
            .set('x-test-user-id', '1')
            .send(payload);

        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    it('TC6 – year=1885 (przed 1886) powinien zwrócić 400', async () => {
        const res = await request(app)
            .post('/cars')
            .set('x-test-user-id', '1')
            .send({ ...VALID_PAYLOAD, year: 1885 });

        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    it('TC7 – price=-1 (ujemna cena) powinien zwrócić 400', async () => {
        const res = await request(app)
            .post('/cars')
            .set('x-test-user-id', '1')
            .send({ ...VALID_PAYLOAD, price: -1 });

        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    it('TC8 – horsePower=0 powinien zwrócić 400 (min 1)', async () => {
        const res = await request(app)
            .post('/cars')
            .set('x-test-user-id', '1')
            .send({ ...VALID_PAYLOAD, horsePower: 0 });

        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    it('TC9 – VIN o 16 znakach powinien zwrócić 400 (wymagane 17)', async () => {
        const res = await request(app)
            .post('/cars')
            .set('x-test-user-id', '1')
            .send({ ...VALID_PAYLOAD, vin: 'WAUZZZ8V0JA00001' });

        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    it('TC10 – VIN o 18 znakach powinien zwrócić 400 (wymagane 17)', async () => {
        const res = await request(app)
            .post('/cars')
            .set('x-test-user-id', '1')
            .send({ ...VALID_PAYLOAD, vin: 'WAUZZZ8V0JA000001X' });

        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    it('TC11 – duplikat VIN powinien zwrócić błąd serwera (unique constraint)', async () => {
        mockCarCreate.mockRejectedValue(new Error('unique constraint'));

        const res = await request(app)
            .post('/cars')
            .set('x-test-user-id', '1')
            .send(VALID_PAYLOAD);

        expect(res.status).toBe(500);
    });

});

describe('AG – Edycja samochodu [PUT /cars/:id]', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        mockCarFindByPk.mockResolvedValue(MOCK_CAR);
        mockCarUpdate.mockResolvedValue(MOCK_CAR);
    });

    it('TC17 – częściowa edycja (tylko price) powinna zwrócić 200', async () => {
        const res = await request(app)
            .put('/cars/1')
            .set('x-test-user-id', '1')
            .send({ price: 82000 });

        expect(res.status).toBe(200);
    });

    it('TC24 – brak sesji przy PUT /cars/:id powinien zwrócić 401', async () => {
        const res = await request(app)
            .put('/cars/1')
            .send({ price: 82000 });

        expect(res.status).toBe(401);
        expect(res.body.error).toMatch(/nieautoryzowany/i);
    });

    it('TC25 – nieistniejące ID powinno zwrócić 404', async () => {
        mockCarFindByPk.mockResolvedValue(null);

        const res = await request(app)
            .put('/cars/999999')
            .set('x-test-user-id', '1')
            .send({ price: 90000 });

        expect(res.status).toBe(404);
        expect(res.body.error).toMatch(/nie znaleziony/i);
    });

    it('TC26 – nieparametryczne ID (abc) powinno zwrócić 400', async () => {
        const res = await request(app)
            .put('/cars/abc')
            .set('x-test-user-id', '1')
            .send({ price: 90000 });

        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

});
