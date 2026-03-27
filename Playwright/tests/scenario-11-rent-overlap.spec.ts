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

test.describe('Scenariusz 11: Próba wynajmu zajętego samochodu przez drugiego klienta', () => {
  test('Klient B nie może wynająć auta zajętego przez klienta A', async ({ page, browser }) => {
    // [Admin] – logowanie i dodanie obu klientów 
    await page.goto(`${BASE_URL}/cars`);
    await login(page, adminCredentials);

    await addCustomer(page, clientA);
    // Czekamy na komunikat sukcesu 
    await page.locator('#addCustomerModal .alert-success').waitFor({ state: 'visible', timeout: 10000 });
    await page.locator('#addCustomerModal .btn-close').click();
    await page.locator('#addCustomerModal').waitFor({ state: 'hidden' });

    await addCustomer(page, clientB);
    await page.locator('#addCustomerModal .alert-success').waitFor({ state: 'visible', timeout: 10000 });
    await page.locator('#addCustomerModal .btn-close').click();
    await page.locator('#addCustomerModal').waitFor({ state: 'hidden' });

    // [Klient A] – logowanie i wynajem pierwszego dostępnego auta 
    const contextA = await browser.newContext();
    const pageA = await contextA.newPage();
    await pageA.goto(`${BASE_URL}/cars`);
    await login(pageA, { username: clientA.username, password: clientA.password! });

    // Szukamy auta dostępnego do wynajmu
    const availableCard = pageA.locator('.card').filter({
      has: pageA.locator('p.card-text .badge', { hasText: 'Tak' }),
    }).first();
    await expect(availableCard).toBeVisible();

    // Zapisujemy tytuł auta przed wynajmem
    const carTitle = await availableCard.locator('h5.card-title').textContent();

    // rentCar() wywołuje alert() po sukcesie 
    pageA.on('dialog', dialog => dialog.accept());
    await rentCar(pageA, availableCard);

    // Potwierdzenie: odznaka zmieniła się na "Nie"
    const rentedCard = pageA.locator('.card').filter({
      has: pageA.locator('h5.card-title', { hasText: carTitle as string }),
    }).first();
    await expect(rentedCard.locator('p.card-text .badge')).toHaveText(/Nie/, { timeout: 5000 });

    await contextA.close();

    // [Klient B] – logowanie i próba wynajmu tego samego auta 
    const contextB = await browser.newContext();
    const pageB = await contextB.newPage();
    await pageB.goto(`${BASE_URL}/cars`);
    await login(pageB, { username: clientB.username, password: clientB.password! });

    // Znalezienie tego samego auta po tytule
    const sameCarForB = pageB.locator('.card').filter({
      has: pageB.locator('h5.card-title', { hasText: carTitle as string }),
    }).first();
    await expect(sameCarForB).toBeVisible();

    // Weryfikacja: auto jest niedostępne dla klienta B 
    // Odznaka powinna pokazywać "Nie" (bg-danger), a przycisk "Wypożycz" nie powinien istnieć
    await expect(sameCarForB.locator('p.card-text .badge')).toHaveText(/Nie/);
    await expect(sameCarForB.locator('p.card-text .badge')).toHaveClass(/bg-danger/);
    await expect(sameCarForB.getByRole('button', { name: 'Wypożycz' })).not.toBeVisible();

    await contextB.close();
  });

});
