//Jakub Zemajduk
import { test, expect } from '@playwright/test';
import { login } from '../utils/auth.utils';
import { addCar, CarData } from '../utils/car.utils';
import { addCustomer, CustomerData } from '../utils/customer.utils';
import { buyCar } from '../utils/transaction.utils';

const BASE_URL = 'http://localhost:4200';

const adminCredentials = { username: 'admin', password: 'Admin1!' };

const newCar: CarData = {
  brand: 'Testowy',
  model: 'Model360' + Date.now(),
  year: 2023,
  vin: 'TEST360' + Date.now().toString().slice(-10),
  price: 99999,
  horsePower: 200,
};

const newClient: CustomerData = {
  username: 'Buyer360_' + Date.now(),
  email: `buyer360_${Date.now()}@test.com`,
  firstName: 'Marek',
  lastName: 'Kupiec',
  password: 'Test1234!',
};

test.describe('[R10] Scenariusz 10: Pełna ścieżka wieloaktorowa (Admin + Klient)', () => {
  test('Admin dodaje auto, klient je kupuje, admin weryfikuje klienta', async ({ page, browser }) => {
    await page.goto(`${BASE_URL}/cars`);
    await login(page, adminCredentials);
    await addCar(page, newCar);

    await page.getByPlaceholder('Wyszukaj markę').fill(newCar.brand);
    const addedCarCard = page.locator('.row.collapse.show .card').filter({
      hasText: `${newCar.brand} ${newCar.model}`,
    }).last();
    await expect(addedCarCard).toBeVisible();

    await addCustomer(page, newClient);
    await page.getByRole('button', { name: 'Wyloguj się' }).click();
    await expect(page.getByRole('button', { name: 'Zaloguj się' })).toBeVisible();

    const clientContext = await browser.newContext();
    const clientPage = await clientContext.newPage();
    await clientPage.goto(`${BASE_URL}/cars`);
    await login(clientPage, { username: newClient.username, password: newClient.password! });

    await clientPage.waitForLoadState('networkidle');
    await clientPage.getByPlaceholder('Wyszukaj markę').fill(newCar.brand);
    const carToBy = clientPage.locator('.row.collapse.show .card').filter({
      hasText: `${newCar.brand} ${newCar.model}`,
    }).last();
    await expect(carToBy).toBeVisible();

    clientPage.on('dialog', dialog => dialog.accept());
    await buyCar(clientPage, carToBy);

    const ownedSection = clientPage.locator('.container').filter({ hasText: 'Lista twoich samochodów' });
    await expect(ownedSection).toBeVisible({ timeout: 8000 });
    await expect(ownedSection.locator('.card').filter({
      hasText: `${newCar.brand} ${newCar.model}`,
    })).toBeVisible();

    await clientPage.getByRole('button', { name: 'Wyloguj się' }).click();
    await clientContext.close();

    await login(page, adminCredentials);
    await page.locator('button[data-bs-target="#customerListModal"]').click();

    const customerListModal = page.locator('#customerListModal');
    await expect(customerListModal).toBeVisible();

    const customerRow = customerListModal.locator('tbody tr').filter({
      hasText: newClient.username,
    });
    await expect(customerRow).toBeVisible();
    await expect(customerRow.locator('td').nth(2)).toHaveText(newClient.firstName);
    await expect(customerRow.locator('td').nth(3)).toHaveText(newClient.lastName);
  });

});

