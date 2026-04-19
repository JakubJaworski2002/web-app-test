/**
 * Testy API – Autentykacja i autoryzacja sesji
 *
 * Playlista: A07–A10
 * Pokryte scenariusze UI: R5 (ochrona dostępu i logowanie), R12 (wylogowanie niszczy sesję)
 *
 * Technika: fixture 'request' – weryfikacja odpowiedzi HTTP bez przeglądarki
 * Backend: http://localhost:3000
 */

import { test, expect } from '@playwright/test';

const API = 'http://localhost:3000';

test.describe('API – Autentykacja i zarządzanie sesją', () => {

  /**
   * [A07] Logowanie admina – dane użytkownika w odpowiedzi
   * Scenariusz UI: R5 – poprawne logowanie daje dostęp do panelu dealera
   * Cel: POST /login z poprawnymi danymi zwraca 200 i obiekt user z isDealer: true
   */
  test('[A07] POST /login admin – odpowiedź zawiera isDealer: true i pełne dane użytkownika', async ({ request }) => {
    const res = await request.post(`${API}/login`, {
      data: { username: 'admin', password: 'Admin1!' },
    });

    expect(res.status()).toBe(200);
    const body = await res.json() as {
      message: string;
      user: { id: number; username: string; firstName: string; lastName: string; isDealer: boolean };
    };

    expect(body).toHaveProperty('message');
    expect(body.message).toMatch(/logowanie udane/i);
    expect(body).toHaveProperty('user');
    expect(body.user.username).toBe('admin');
    expect(body.user.isDealer).toBe(true);
    expect(body.user).toHaveProperty('id');
    expect(body.user).toHaveProperty('firstName');
    expect(body.user).toHaveProperty('lastName');
    // Hasło NIE powinno być zwracane w odpowiedzi
    expect(body.user).not.toHaveProperty('password');
  });

  /**
   * [A08] Logowanie z błędnym hasłem – odpowiedź 400
   * Scenariusz UI: R5 – błędne logowanie zwraca komunikat błędu
   * Cel: weryfikacja że backend odrzuca nieprawidłowe dane z odpowiednim statusem
   */
  test('[A08] POST /login z błędnym hasłem zwraca 400 z polem error', async ({ request }) => {
    const res = await request.post(`${API}/login`, {
      data: { username: 'admin', password: 'ZleHasloABC123' },
    });

    expect(res.status()).toBe(400);
    const body = await res.json() as { error: string };
    expect(body).toHaveProperty('error');
    expect(body.error).toMatch(/nieprawidłow|hasło|użytkownik/i);
  });

  /**
   * [A09] Dostęp do chronionego endpointu bez sesji
   * Scenariusz UI: R5 – niezalogowany użytkownik nie ma dostępu do panelu dealera
   * Cel: GET /current-user bez ciasteczka sesji musi zwrócić 401
   */
  test('[A09] GET /current-user bez sesji zwraca 401 Unauthorized', async ({ request }) => {
    // Celowo pomijamy logowanie – request nie ma sesji
    const res = await request.get(`${API}/current-user`);

    expect(res.status()).toBe(401);
    const body = await res.json() as { error: string };
    expect(body).toHaveProperty('error');
    expect(body.error).toMatch(/nieautoryzowany/i);
  });

  /**
   * [A10] Wylogowanie niszczy sesję
   * Scenariusz UI: R12 – po wylogowaniu chronione akcje są niedostępne
   * Cel: POST /logout niszczy sesję, kolejne GET /current-user zwraca 401
   */
  test('[A10] POST /logout niszczy sesję – GET /current-user po wylogowaniu zwraca 401', async ({ request }) => {
    // Krok 1: Zaloguj się
    const loginRes = await request.post(`${API}/login`, {
      data: { username: 'admin', password: 'Admin1!' },
    });
    expect(loginRes.status()).toBe(200);

    // Krok 2: Sprawdź że sesja działa
    const beforeLogout = await request.get(`${API}/current-user`);
    expect(beforeLogout.status()).toBe(200);
    const user = await beforeLogout.json() as { user: { username: string } };
    expect(user.user.username).toBe('admin');

    // Krok 3: Wyloguj się
    const logoutRes = await request.post(`${API}/logout`);
    expect(logoutRes.status()).toBe(200);

    // Krok 4: Sesja powinna być zniszczona
    const afterLogout = await request.get(`${API}/current-user`);
    expect(afterLogout.status()).toBe(401);
  });

});
