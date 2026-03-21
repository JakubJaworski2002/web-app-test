/**
 * tests/rental.test.js
 *
 * Testy jednostkowe – Wynajem / Zwrot samochodu
 * Testują REALNE endpointy z server.js przez HTTP (Supertest).
 * Baza danych jest mockowana przez jest.unstable_mockModule.
 *
 * Pokryte przypadki testowe:
 *   TC1  – R4 – wynajem dostępnego auta przez zalogowanego usera     (+)
 *   TC5  – R4 – wynajem bez sesji (niezalogowany)                    (-)
 *   TC6  – R4 – wynajem auta o statusie niedostępny (RENTED)         (-)
 *   TC8  – R4 – user próbuje wynająć auto które już wynajmuje        (-)
 *   TC9  – R4 – wynajem z poprawnymi datami przyszłymi               (+)
 *   TC10 – R4 – nieprawidłowe carId (nie-liczba) → błąd walidacji    (-)
 *   TC11 – R5 – zwrot auta w terminie                                (+)
 *   TC13 – R5 – próba zwrotu cudzego auta (403)                      (-)
 *   TC14 – R5 – zwrot bez sesji (niezalogowany)                      (-)
 *   TC17 – R5 – zwrot nieistniejącego auta (404)                     (-)
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';

// ─────────────────────────────────────────────────────────────
//  MOCKS – muszą być ustawione PRZED importem server.js
// ─────────────────────────────────────────────────────────────

/**
 * Mock modeli Sequelize.
 * Każdy test ustawia odpowiednią implementację przez mockCarFindByPk.mockResolvedValue(...)
 */
const mockCarSave    = jest.fn().mockResolvedValue(undefined);
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
    sequelize: {},
}));

/**
 * Mock express-session.
 * Zamiast prawdziwej sesji, middleware czyta nagłówek 'x-test-user-id'.
 * Dzięki temu:
 *  - żądania Z nagłówkiem  → zalogowany user (req.session.userId jest ustawione)
 *  - żądania BEZ nagłówka → niezalogowany (sesja pusta → authenticateSession zwraca 401)
 */
await jest.unstable_mockModule('express-session', () => ({
    default: (/* options */) => (req, res, next) => {
        const uid = req.headers['x-test-user-id'];
        req.session = {
            userId:  uid ? parseInt(uid, 10) : undefined,
            destroy: (cb) => cb(null),
        };
        next();
    },
}));

// Import app MUSI być po ustawieniu wszystkich mocków
const { app } = await import('../server.js');

// ─────────────────────────────────────────────────────────────
//  Dane testowe
// ─────────────────────────────────────────────────────────────
const USER_ID       = 1;
const OTHER_USER_ID = 99;

/** Samochód dostępny do wynajmu (isAvailableForRent = true) */
const makeCar = (overrides = {}) => ({
    id:                 10,
    brand:              'Toyota',
    model:              'Corolla',
    isAvailableForRent: true,
    renterId:           null,
    save:               mockCarSave,
    ...overrides,
});

// ─────────────────────────────────────────────────────────────
//  R4 – Wynajem samochodu  POST /cars/:id/rent
// ─────────────────────────────────────────────────────────────
describe('R4 – Wynajem samochodu [POST /cars/:id/rent]', () => {

    beforeEach(() => jest.clearAllMocks());

    /**
     * TC1
     * War. WE:  user zalogowany, auto isAvailableForRent = true
     * War. WY:  status 200, car.isAvailableForRent = false, car.renterId = userId
     * Rezultat: +
     */
    it('TC1 – powinien wynająć dostępny samochód zalogowanemu użytkownikowi (200)', async () => {
        const car = makeCar();
        mockCarFindByPk.mockResolvedValue(car);

        const res = await request(app)
            .post('/cars/10/rent')
            .set('x-test-user-id', String(USER_ID));

        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/wynajęty/i);
        // Sprawdzamy że save() zostało wywołane – czyli auto zostało zapisane w bazie
        expect(mockCarSave).toHaveBeenCalledTimes(1);
        // Weryfikujemy że na obiekcie wynajem został oznaczony
        expect(car.isAvailableForRent).toBe(false);
        expect(car.renterId).toBe(USER_ID);
    });

    /**
     * TC5
     * War. WE:  brak sesji (niezalogowany)
     * War. WY:  status 401 Unauthorized
     * Rezultat: -
     */
    it('TC5 – powinien zwrócić 401 gdy użytkownik nie jest zalogowany', async () => {
        const res = await request(app)
            .post('/cars/10/rent');
        // Brak nagłówka x-test-user-id → req.session.userId = undefined → 401

        expect(res.status).toBe(401);
        expect(res.body.error).toMatch(/nieautoryzowany/i);
    });

    /**
     * TC6
     * War. WE:  user zalogowany, auto isAvailableForRent = false (wynajęte przez innego)
     * War. WY:  status 400, komunikat o niedostępności
     * Rezultat: -
     */
    it('TC6 – powinien odmówić wynajmu gdy samochód jest już wynajęty (RENTED)', async () => {
        const car = makeCar({ isAvailableForRent: false, renterId: OTHER_USER_ID });
        mockCarFindByPk.mockResolvedValue(car);

        const res = await request(app)
            .post('/cars/10/rent')
            .set('x-test-user-id', String(USER_ID));

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/wynajęty/i);
    });

    /**
     * TC8
     * War. WE:  user zalogowany, auto isAvailableForRent = false, renterId = userId
     *           (użytkownik już wynajmuje to konkretne auto)
     * War. WY:  status 400, komunikat o niedostępności zwrócony przez serwer
     * Rezultat: -
     * Uwaga:    server.js sprawdza tylko isAvailableForRent – jeśli false, odmawia
     */
    it('TC8 – powinien odmówić wynajmu gdy user już wynajmuje ten samochód', async () => {
        // Auto jest niedostępne (zajęte przez aktualnego usera)
        const car = makeCar({ isAvailableForRent: false, renterId: USER_ID });
        mockCarFindByPk.mockResolvedValue(car);

        const res = await request(app)
            .post('/cars/10/rent')
            .set('x-test-user-id', String(USER_ID));

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/wynajęty/i);
    });

    /**
     * TC9
     * War. WE:  user zalogowany, auto dostępne, przekazane poprawne daty przyszłe
     *           (express-validator nie waliduje dat – wynajem przebiega poprawnie)
     * War. WY:  status 200, auto oznaczone jako wynajęte
     * Rezultat: +
     */
    it('TC9 – powinien wynająć auto gdy przekazano poprawne daty przyszłe (200)', async () => {
        const car = makeCar();
        mockCarFindByPk.mockResolvedValue(car);

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const in5Days = new Date();
        in5Days.setDate(in5Days.getDate() + 5);

        // Daty są opcjonalne w body – server.js ich nie waliduje, ale poprawność biznesowa jest zachowana
        const res = await request(app)
            .post('/cars/10/rent')
            .set('x-test-user-id', String(USER_ID))
            .send({ startDate: tomorrow.toISOString(), endDate: in5Days.toISOString() });

        expect(res.status).toBe(200);
        expect(mockCarSave).toHaveBeenCalledTimes(1);
        expect(car.renterId).toBe(USER_ID);
    });

    /**
     * TC10
     * War. WE:  user zalogowany, carId nie jest liczbą całkowitą (walidacja param)
     * War. WY:  status 400, błąd walidacji express-validator
     * Rezultat: -
     */
    it('TC10 – powinien zwrócić 400 gdy carId nie jest poprawną liczbą całkowitą', async () => {
        const res = await request(app)
            .post('/cars/abc/rent')
            .set('x-test-user-id', String(USER_ID));

        expect(res.status).toBe(400);
        // express-validator zwraca tablicę errors
        expect(res.body.errors).toBeDefined();
    });

});

// ─────────────────────────────────────────────────────────────
//  R5 – Zwrot samochodu  POST /cars/:id/return
// ─────────────────────────────────────────────────────────────
describe('R5 – Zwrot samochodu [POST /cars/:id/return]', () => {

    beforeEach(() => jest.clearAllMocks());

    /**
     * TC11
     * War. WE:  user zalogowany, auto wynajęte przez usera (renterId = userId)
     * War. WY:  status 200, isAvailableForRent = true, renterId = null
     * Rezultat: +
     */
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

    /**
     * TC13
     * War. WE:  user zalogowany, auto wynajęte przez innego użytkownika
     * War. WY:  status 403 Forbidden
     * Rezultat: -
     */
    it('TC13 – powinien odmówić zwrotu cudzego samochodu (403)', async () => {
        const car = makeCar({ isAvailableForRent: false, renterId: OTHER_USER_ID });
        mockCarFindByPk.mockResolvedValue(car);

        const res = await request(app)
            .post('/cars/10/return')
            .set('x-test-user-id', String(USER_ID));

        expect(res.status).toBe(403);
        expect(res.body.error).toMatch(/wynajmującym/i);
    });

    /**
     * TC14
     * War. WE:  brak sesji (niezalogowany)
     * War. WY:  status 401 Unauthorized
     * Rezultat: -
     */
    it('TC14 – powinien zwrócić 401 gdy użytkownik nie jest zalogowany', async () => {
        const res = await request(app)
            .post('/cars/10/return');
        // Brak nagłówka x-test-user-id → req.session.userId = undefined → 401

        expect(res.status).toBe(401);
        expect(res.body.error).toMatch(/nieautoryzowany/i);
    });

    /**
     * TC17
     * War. WE:  user zalogowany, auto o podanym ID nie istnieje w bazie (findByPk → null)
     * War. WY:  status 404 Not Found
     * Rezultat: -
     */
    it('TC17 – powinien zwrócić 404 gdy samochód o podanym ID nie istnieje', async () => {
        mockCarFindByPk.mockResolvedValue(null);

        const res = await request(app)
            .post('/cars/999/return')
            .set('x-test-user-id', String(USER_ID));

        expect(res.status).toBe(404);
        expect(res.body.error).toMatch(/nie znaleziony/i);
    });

});
