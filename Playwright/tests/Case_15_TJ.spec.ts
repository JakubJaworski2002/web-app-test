//Tomasz Jarmoc
import { test, expect } from '@playwright/test';
import { login } from '../utils/auth.utils';
import { addCustomer, CustomerData } from '../utils/customer.utils';
import { addCar, CarData } from '../utils/car.utils';
import { buyCar } from '../utils/transaction.utils';

test.describe('[R15] Scenariusz 15: Zakup auta przez klienta z minimalnym profilem', () => {
  const incompleteClient: CustomerData = {
    username: 'Incomplete_' + Date.now(),
    email: `incomplete${Date.now()}@test.com`,
    firstName: 'Jan',
    lastName: 'Kowalski',
  };

  test('Klient kupuje auto z poziomu listy', async ({ page, browser }) => {
    const suffix = Date.now();
    const dedicatedCar: CarData = {
      brand: `MinimalBuyerBrand${suffix}`,
      model: `MinimalBuyerModel${suffix}`,
      year: 2024,
      vin: `MBR${String(suffix).slice(-14).padStart(14, '0')}`.slice(0, 17),
      price: 110000,
      horsePower: 170,
      isAvailableForRent: true,
    };

    await page.goto('http://localhost:4200/cars');
    await login(page, { username: 'admin', password: 'Admin1!' });
    await addCustomer(page, incompleteClient);
    await addCar(page, dedicatedCar);

    await page.getByPlaceholder('Wyszukaj markę').fill(dedicatedCar.brand);
    const insertedCard = page.locator('.row.collapse.show .card').filter({
      hasText: `${dedicatedCar.brand} ${dedicatedCar.model}`,
    }).last();
    await expect(insertedCard).toBeVisible();

    const customerContext = await browser.newContext();
    const customerPage = await customerContext.newPage();
    await customerPage.goto('http://localhost:4200/cars');
    await login(customerPage, { username: incompleteClient.username, password: 'Test1234!' });

    await customerPage.getByPlaceholder('Wyszukaj markę').fill(dedicatedCar.brand);
    const carCard = customerPage.locator('.row.collapse.show .card').filter({
      hasText: `${dedicatedCar.brand} ${dedicatedCar.model}`,
      has: customerPage.getByRole('button', { name: 'Kup' }),
    }).last();
    await expect(carCard).toBeVisible({ timeout: 15000 });

    const carTitle = (await carCard.locator('h5.card-title').textContent())?.trim() ?? '';
    expect(carTitle).not.toEqual('');

    customerPage.on('dialog', (dialog) => dialog.accept());
    await buyCar(customerPage, carCard);

    const ownedSection = customerPage.locator('.container').filter({ hasText: 'Lista twoich samochodów' });
    await expect(ownedSection).toBeVisible();
    await expect(ownedSection.locator('.card').filter({ hasText: carTitle })).toBeVisible();

    await customerContext.close();
  });
});

