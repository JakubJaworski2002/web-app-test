//Tomasz Jarmoc
import { test, expect } from '@playwright/test';
import { login } from '../utils/auth.utils';
import { addCustomer, CustomerData } from '../utils/customer.utils';
import { addCar, CarData } from '../utils/car.utils';
import { buyCar } from '../utils/transaction.utils';

test.describe('[R13] Scenariusz 13: Filtrowanie listy aut i zakup', () => {
  test('Filtrowanie po marce i zakup pojazdu', async ({ page }) => {
    const suffix = Date.now();
    const carForFilter: CarData = {
      brand: `FilterBrand${suffix}`,
      model: `FilterModel${suffix}`,
      year: 2024,
      vin: `FLT${String(suffix).slice(-14).padStart(14, '0')}`.slice(0, 17),
      price: 123456,
      horsePower: 190,
      isAvailableForRent: true,
    };

    const testClient: CustomerData = {
      username: `FilterBuyer_${suffix}`,
      email: `filterbuyer_${suffix}@test.com`,
      firstName: 'Filip',
      lastName: 'Kupujacy',
      password: 'Test1234!',
    };

    await page.goto('http://localhost:4200/cars');
    await login(page, { username: 'admin', password: 'Admin1!' });
    await addCustomer(page, testClient);
    await addCar(page, carForFilter);

    await page.getByPlaceholder('Wyszukaj markę').fill(carForFilter.brand);
    const insertedCard = page.locator('.row.collapse.show .card').filter({
      hasText: `${carForFilter.brand} ${carForFilter.model}`,
    }).last();
    await expect(insertedCard).toBeVisible();

    await page.getByRole('button', { name: 'Wyloguj się' }).click();

    await login(page, { username: testClient.username, password: testClient.password! });

    await page.goto('http://localhost:4200/cars');

    await page.getByPlaceholder('Wyszukaj markę').fill(carForFilter.brand);

    const filteredCars = page.locator('.row.collapse.show .card');
    const carCard = filteredCars.filter({
      hasText: `${carForFilter.brand} ${carForFilter.model}`,
      has: page.getByRole('button', { name: 'Kup' }),
    }).last();
    await expect(carCard).toBeVisible();

    page.on('dialog', (dialog) => dialog.accept());
    await buyCar(page, carCard);

    await page.goto('http://localhost:4200/cars');
    await page.getByPlaceholder('Wyszukaj markę').fill(carForFilter.brand);

    const purchasedCar = page.locator('.row.collapse.show .card').filter({
      hasText: `${carForFilter.brand} ${carForFilter.model}`,
    }).last();
    await expect(purchasedCar).toBeVisible();
    await expect(purchasedCar.getByRole('button', { name: 'Kup' })).toHaveCount(0);
  });
});
