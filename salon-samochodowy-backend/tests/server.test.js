import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';

// ── Mock bcrypt to keep tests fast and deterministic ─────────────────────────
const mockBcryptHash    = jest.fn().mockResolvedValue('$2b$12$hashedpassword');
const mockBcryptCompare = jest.fn().mockResolvedValue(true);

await jest.unstable_mockModule('bcrypt', () => ({
    default: {
        hash:    mockBcryptHash,
        compare: mockBcryptCompare,
        genSalt: jest.fn().mockResolvedValue('salt'),
    },
}));

// ── Mock express-session ──────────────────────────────────────────────────────
await jest.unstable_mockModule('express-session', () => ({
    default: () => (req, res, next) => {
        const uid = req.headers['x-test-user-id'];
        req.session = {
            userId:  uid ? parseInt(uid, 10) : undefined,
            username: uid ? 'testuser' : undefined,
            destroy: (cb) => cb(null),
        };
        next();
    },
}));

// ── Mock DB models ────────────────────────────────────────────────────────────
const mockUserFindOne        = jest.fn();
const mockUserFindByPk       = jest.fn();
const mockUserCreate         = jest.fn();
const mockCarFindAll         = jest.fn();
const mockCarFindAndCountAll = jest.fn();
const mockSequelizeAuth      = jest.fn();

await jest.unstable_mockModule('../models.js', () => ({
    sequelize: { authenticate: mockSequelizeAuth },
    Car: {
        findAll:         mockCarFindAll,
        findAndCountAll: mockCarFindAndCountAll,
        findByPk:        jest.fn(),
        create:          jest.fn(),
        destroy:         jest.fn(),
    },
    User: {
        findOne:  mockUserFindOne,
        findByPk: mockUserFindByPk,
        create:   mockUserCreate,
        findAll:  jest.fn().mockResolvedValue([]),
    },
    Transaction: {
        findAll: jest.fn().mockResolvedValue([]),
    },
    Op: {},
}));

const { app } = await import('../server.js');

const uid = () => Math.random().toString(36).slice(2, 10);

beforeEach(() => {
    jest.clearAllMocks();
    mockSequelizeAuth.mockResolvedValue(undefined);
    mockUserFindOne.mockResolvedValue(null);
    mockCarFindAll.mockResolvedValue([]);
    mockBcryptHash.mockResolvedValue('$2b$12$hashedpassword');
    mockBcryptCompare.mockResolvedValue(true);
});

// ── 1. GET /health ────────────────────────────────────────────────────────────
describe('GET /health', () => {
    it('returns 200 with status ok when DB is connected', async () => {
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok');
        expect(res.body.db).toBe('connected');
    });
});

// ── 2 & 3. POST /api/v1/auth/register ────────────────────────────────────────
describe('POST /api/v1/auth/register', () => {
    it('returns 201 with user data on successful registration', async () => {
        const id = uid();
        const newUser = {
            id: 42, username: `user_${id}`, email: `${id}@test.com`,
            firstName: 'Jan', lastName: 'Test', isDealer: false,
        };
        mockUserCreate.mockResolvedValue(newUser);

        const res = await request(app).post('/api/v1/auth/register').send({
            username:  newUser.username,
            email:     newUser.email,
            password:  'Secret123',
            firstName: 'Jan',
            lastName:  'Test',
        });

        expect(res.status).toBe(201);
        expect(res.body.message).toMatch(/rejestracja udana/i);
        expect(res.body.user.username).toBe(newUser.username);
    });

    it('returns 400 when username already exists', async () => {
        mockUserFindOne.mockResolvedValue({ id: 1, username: 'taken' });

        const res = await request(app).post('/api/v1/auth/register').send({
            username: 'taken', email: 'x@x.com',
            password: 'Secret123', firstName: 'A', lastName: 'B',
        });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/zajęta/i);
    });
});

// ── 4 & 5. POST /api/v1/auth/login ───────────────────────────────────────────
describe('POST /api/v1/auth/login', () => {
    const mockUser = {
        id: 1, username: 'jantest', password: '$2b$12$hashedpassword',
        firstName: 'Jan', lastName: 'Test', isDealer: false,
    };

    it('returns 200 with user data on valid credentials', async () => {
        mockUserFindOne.mockResolvedValue(mockUser);
        mockBcryptCompare.mockResolvedValue(true);

        const res = await request(app).post('/api/v1/auth/login').send({
            username: 'jantest', password: 'Secret123',
        });

        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/logowanie udane/i);
        expect(res.body.user.username).toBe('jantest');
    });

    it('returns 401 when password is incorrect', async () => {
        mockUserFindOne.mockResolvedValue(mockUser);
        mockBcryptCompare.mockResolvedValue(false);

        const res = await request(app).post('/api/v1/auth/login').send({
            username: 'jantest', password: 'WrongPassword1',
        });

        expect(res.status).toBe(401);
        expect(res.body.error).toBeDefined();
    });
});

// ── 6 & 7. GET /api/v1/cars ──────────────────────────────────────────────────
describe('GET /api/v1/cars', () => {
    it('returns 200 with an array of cars', async () => {
        const cars = [
            { id: 1, brand: 'Toyota', model: 'Corolla', year: 2020 },
            { id: 2, brand: 'BMW',    model: 'X5',      year: 2022 },
        ];
        mockCarFindAll.mockResolvedValue(cars);

        const res = await request(app).get('/api/v1/cars');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body).toHaveLength(2);
    });

    it('returns 200 with { data, pagination } when page & limit are provided', async () => {
        const rows = [{ id: 1, brand: 'Toyota', model: 'Corolla', year: 2020 }];
        mockCarFindAndCountAll.mockResolvedValue({ count: 5, rows });

        const res = await request(app).get('/api/v1/cars?page=1&limit=1');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.pagination).toBeDefined();
        expect(res.body.pagination.total).toBe(5);
        expect(res.body.pagination.totalPages).toBe(5);
    });
});

// ── 8. POST /api/v1/cars – unauthenticated ────────────────────────────────────
describe('POST /api/v1/cars (unauthenticated)', () => {
    it('returns 401 when no session is provided', async () => {
        const res = await request(app).post('/api/v1/cars').send({
            brand: 'Toyota', model: 'Yaris', year: 2021,
            vin: '12345678901234567', price: 50000,
            horsePower: 100, isAvailableForRent: true,
        });
        expect(res.status).toBe(401);
    });
});

// ── 9. GET /api/v1/transactions – unauthenticated ────────────────────────────
describe('GET /api/v1/transactions (unauthenticated)', () => {
    it('returns 401 when no session is provided', async () => {
        const res = await request(app).get('/api/v1/transactions');
        expect(res.status).toBe(401);
    });
});

// ── 10. POST /api/v1/auth/logout ─────────────────────────────────────────────
describe('POST /api/v1/auth/logout', () => {
    it('returns 200 and success message', async () => {
        const res = await request(app)
            .post('/api/v1/auth/logout')
            .set('x-test-user-id', '1');

        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/wylogowano/i);
    });
});
