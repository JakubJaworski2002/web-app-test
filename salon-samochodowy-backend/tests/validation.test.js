import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';

const mockUserFindOne  = jest.fn();
const mockUserFindByPk = jest.fn();
const mockUserCreate   = jest.fn();
const mockCarFindAll   = jest.fn().mockResolvedValue([]);

await jest.unstable_mockModule('../models.js', () => ({
    User: {
        findOne:  mockUserFindOne,
        findByPk: mockUserFindByPk,
        create:   mockUserCreate,
        findAll:  jest.fn().mockResolvedValue([]),
    },
    Car: {
        findAll:  mockCarFindAll,
        findByPk: jest.fn(),
        create:   jest.fn(),
        destroy:  jest.fn(),
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
            userId:   uid ? parseInt(uid, 10) : undefined,
            username: uid ? 'testuser' : undefined,
            destroy:  (cb) => cb(null),
        };
        next();
    },
}));

const { app } = await import('../server.js');

const basePayload = {
    username:  'jankowalski',
    email:     'jankowalski@example.com',
    password:  'Passw0rd!',
    firstName: 'Jan',
    lastName:  'Kowalski',
};

const adminPayload = {
    username:  'nowyKlient',
    email:     'nowy.klient@example.com',
    password:  'Passw0rd!',
    firstName: 'Anna',
    lastName:  'Nowak',
};

beforeEach(() => {
    jest.clearAllMocks();
    mockUserFindOne.mockResolvedValue(null);
    mockUserCreate.mockImplementation(async (data) => ({ id: 1, ...data }));
});

describe('R1 – Walidacja nazwy użytkownika przy rejestracji [POST /register]', () => {

    it('TC1 – poprawna rejestracja z unikalną nazwą użytkownika', async () => {
        const res = await request(app).post('/register').send(basePayload);
        expect(res.status).toBe(201);
        expect(res.body.message).toMatch(/rejestracja udana/i);
    });

    it('TC2 – nazwa użytkownika krótsza niż 3 znaki powinna być odrzucona', async () => {
        const res = await request(app).post('/register').send({
            ...basePayload,
            username: 'ab',
        });
        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    it('TC3 – brak nazwy użytkownika (puste pole) powinien być odrzucony', async () => {
        const res = await request(app).post('/register').send({
            ...basePayload,
            username: '',
        });
        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

});

describe('R2 – Walidacja hasła przy rejestracji [POST /register]', () => {

    it('TC11 – poprawne hasło "Passw0rd!" spełniające wszystkie wymagania (201)', async () => {
        const res = await request(app).post('/register').send({
            ...basePayload,
            password: 'Passw0rd!',
        });
        expect(res.status).toBe(201);
    });

    it('TC12 – hasło "Pass!" krótsze niż 6 znaków powinno być odrzucone (400)', async () => {
        const res = await request(app).post('/register').send({
            ...basePayload,
            password: 'Pass!',
        });
        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    it('TC17 – puste hasło powinno być odrzucone (400)', async () => {
        const res = await request(app).post('/register').send({
            ...basePayload,
            password: '',
        });
        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

});

describe('R3 – Tworzenie klienta przez administratora [POST /admin/create-customer]', () => {

    it('TC21 – admin powinien pomyślnie utworzyć klienta (201)', async () => {
        const adminUser = { id: 1, username: 'admin', isDealer: true };
        mockUserFindByPk.mockResolvedValue(adminUser);
        mockUserCreate.mockResolvedValue({ id: 99, ...adminPayload, isDealer: false });

        const res = await request(app)
            .post('/admin/create-customer')
            .set('x-test-user-id', '1')
            .send(adminPayload);

        expect(res.status).toBe(201);
        expect(res.body.user.isDealer).toBe(false);
    });

    it('TC22 – użytkownik z rolą USER (isDealer=false) powinien otrzymać 403', async () => {
        const regularUser = { id: 2, username: 'user', isDealer: false };
        mockUserFindByPk.mockResolvedValue(regularUser);

        const res = await request(app)
            .post('/admin/create-customer')
            .set('x-test-user-id', '2')
            .send(adminPayload);

        expect(res.status).toBe(403);
        expect(res.body.error).toMatch(/brak uprawnień/i);
    });

    it('TC26 – niezalogowany użytkownik powinien otrzymać 401', async () => {
        const res = await request(app)
            .post('/admin/create-customer')
            .send(adminPayload);

        expect(res.status).toBe(401);
        expect(res.body.error).toMatch(/nieautoryzowany/i);
    });

});
