import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

vi.mock('../models.js', () => ({
    User: {
        findOne: vi.fn(),
        create: vi.fn(),
        findByPk: vi.fn(),
    },
    Car: {
        findAll: vi.fn(),
    },
    sequelize: {},
}));

const { app } = await import('../server.js');
const { User } = await import('../models.js');


const validRegisterPayload = {
    username: 'jankowalski',
    email: 'test@wp.pl',
    password: 'Passw0rd!',
    firstName: 'Jan',
    lastName: 'Kowalski',
};

const validCustomerPayload = {
    username: 'nowyKlient',
    email: 'klient@example.com',
    password: 'Passw0rd!',
    firstName: 'Anna',
    lastName: 'Nowak',
};

const adminUser  = { id: 1, username: 'admin', isDealer: true };
const regularUser = { id: 2, username: 'user',  isDealer: false };


async function loginAs(user) {
    User.findOne.mockResolvedValueOnce({ ...user, password: 'Passw0rd!', email: `${user.username}@example.com` });
    const res = await request(app).post('/login').send({
        email: `${user.username}@example.com`,
        password: 'Passw0rd!',
    });
    return res.headers['set-cookie'];
}


beforeEach(() => {
    vi.clearAllMocks();
    User.findOne.mockResolvedValue(null);
    User.create.mockImplementation(async (data) => ({ id: 1, ...data }));
});

describe('R1 - Walidacja emaila przy rejestracji', () => {
    it('TC1: poprawny email "test@wp.pl" powinien przejść walidację', async () => {
        const res = await request(app).post('/register').send(validRegisterPayload);
        expect(res.status).toBe(201);
    });

    it('TC2: email bez @ "testwp.pl" powinien być odrzucony', async () => {
        const res = await request(app).post('/register').send({
            ...validRegisterPayload,
            email: 'testwp.pl',
        });
        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    it('TC3: email bez domeny "test@" powinien być odrzucony', async () => {
        const res = await request(app).post('/register').send({
            ...validRegisterPayload,
            email: 'test@',
        });
        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });
});


describe('R2 - Walidacja hasła przy rejestracji', () => {
    it('TC11: hasło "Passw0rd!" spełnia wszystkie wymagania', async () => {
        const res = await request(app).post('/register').send({
            ...validRegisterPayload,
            password: 'Passw0rd!',
        });
        expect(res.status).toBe(201);
    });

    it('TC12: hasło "Pass1!" krótsze niż 8 znaków powinno być odrzucone', async () => {
        const res = await request(app).post('/register').send({
            ...validRegisterPayload,
            password: 'Pass1!',
        });
        expect(res.status).toBe(400);
        const msgs = res.body.errors.map((e) => e.msg);
        expect(msgs.some((m) => /8 znaków/i.test(m))).toBe(true);
    });

    it('TC14: hasło "passw0rd!" bez wielkiej litery powinno być odrzucone', async () => {
        const res = await request(app).post('/register').send({
            ...validRegisterPayload,
            password: 'passw0rd!',
        });
        expect(res.status).toBe(400);
        const msgs = res.body.errors.map((e) => e.msg);
        expect(msgs.some((m) => /wielką literę/i.test(m))).toBe(true);
    });

    it('TC16: hasło "Passw0rd" bez znaku specjalnego powinno być odrzucone', async () => {
        const res = await request(app).post('/register').send({
            ...validRegisterPayload,
            password: 'Passw0rd',
        });
        expect(res.status).toBe(400);
        const msgs = res.body.errors.map((e) => e.msg);
        expect(msgs.some((m) => /znak specjalny/i.test(m))).toBe(true);
    });
});

describe('R3 - Tworzenie klienta przez administratora', () => {
    it('TC21: admin z poprawnymi danymi powinien pomyślnie utworzyć klienta', async () => {
        const cookies = await loginAs(adminUser);

        User.findByPk.mockResolvedValue(adminUser);
        User.findOne.mockResolvedValue(null);
        User.create.mockResolvedValue({ id: 99, ...validCustomerPayload, isDealer: false });

        const res = await request(app)
            .post('/admin/create-customer')
            .set('Cookie', cookies)
            .send(validCustomerPayload);

        expect(res.status).toBe(201);
        expect(res.body.user.email).toBe(validCustomerPayload.email);
        expect(res.body.user.isDealer).toBe(false);
    });

    it('TC22: użytkownik z rolą USER powinien otrzymać 403', async () => {
        const cookies = await loginAs(regularUser);

        User.findByPk.mockResolvedValue(regularUser);
        User.findOne.mockResolvedValue(null);

        const res = await request(app)
            .post('/admin/create-customer')
            .set('Cookie', cookies)
            .send(validCustomerPayload);

        expect(res.status).toBe(403);
        expect(res.body.error).toMatch(/brak uprawnień/i);
    });

    it('TC26: niezalogowany użytkownik powinien otrzymać 401', async () => {
        const res = await request(app)
            .post('/admin/create-customer')
            .send(validCustomerPayload);

        expect(res.status).toBe(401);
    });
});
