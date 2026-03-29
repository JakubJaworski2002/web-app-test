//Jakub Zemajduk
import { test, expect } from '@playwright/test';
import { login } from '../utils/auth.utils';
import { addCustomer, CustomerData } from '../utils/customer.utils';
import { rentCar } from '../utils/transaction.utils';

const BASE_URL = 'http://localhost:4200';

const adminCredentials = { username: 'admin', password: 'Admin1!' };

const clientA: CustomerData = {
  username: 'RenterA_' + Date.now(),
  email: `renterA_${Date.now()}@test.com`,
  firstName: 'Adam',
  lastName: 'Kowalski',
  password: 'Test1234!',
};

const clientB: CustomerData = {
  username: 'RenterB_' + Date.now(),
  email: `renterB_${Date.now()}@test.com`,
  firstName: 'Barbara',
  lastName: 'Nowak',
  password: 'Test1234!',
};

test.describe('[R11] Scenariusz 11: Próba wynajmu zajętego samochodu przez drugiego klienta', () => {
  test('Klient B nie może wynająć auta zajętego przez klienta A', async ({ page, browser }) => {
    await page.goto(`${BASE_URL}/cars`);
    await login(page, adminCredentials);

    await addCustomer(page, clientA);

    await addCustomer(page, clientB);

    const contextA = await browser.newContext();
    const pageA = await contextA.newPage();
    await pageA.goto(`${BASE_URL}/cars`);
    await login(pageA, { username: clientA.username, password: clientA.password! });

    const availableCard = pageA.locator('.card').filter({
      has: pageA.locator('p.card-text .badge', { hasText: 'Tak' }),
    }).first();
    await expect(availableCard).toBeVisible();

    const carTitle = (await availableCard.locator('h5.card-title').textContent())?.trim() ?? '';
    expect(carTitle).not.toEqual('');

    pageA.on('dialog', dialog => dialog.accept());
    await rentCar(pageA, availableCard);

    const rentedCard = pageA.locator('.card').filter({
      has: pageA.locator('h5.card-title', { hasText: carTitle }),
    }).first();
    await expect(rentedCard.locator('p.card-text .badge')).toHaveText(/Nie/, { timeout: 5000 });

    await contextA.close();

    const contextB = await browser.newContext();
    const pageB = await contextB.newPage();
    await pageB.goto(`${BASE_URL}/cars`);
    await login(pageB, { username: clientB.username, password: clientB.password! });

    const sameCarForB = pageB.locator('.card').filter({
      has: pageB.locator('h5.card-title', { hasText: carTitle }),
    }).first();
    await expect(sameCarForB).toBeVisible();

    await expect(sameCarForB.locator('p.card-text .badge')).toHaveText(/Nie/);
    await expect(sameCarForB.locator('p.card-text .badge')).toHaveClass(/bg-danger/);
    await expect(sameCarForB.getByRole('button', { name: 'Wypożycz' })).not.toBeVisible();

    await contextB.close();
  });

});

