import { test, expect } from '@playwright/test';
import { login } from '../utils/auth.utils';
import { addCustomer, CustomerData } from '../utils/customer.utils';
import { addCar, CarData } from '../utils/car.utils';
import { calculateLeasing, closeLeasingSummary } from '../utils/leasing.utils';
import { buyCar } from '../utils/transaction.utils';

const BASE_URL = 'http://localhost:4200';
const adminCredentials = { username: 'admin', password: 'Admin1!' };

test.describe('Scenariusz 9: Porównanie leasingu na dwóch autach + zakup', () => {
  test('Porównanie i finalizacja kupna droższego auta', async ({ page, browser }) => {
    await page.goto(`${BASE_URL}/cars`);
    await login(page, adminCredentials);

    const customer: CustomerData = {
      username: `LeasingC_${Date.now()}`,
      email: `leasingc${Date.now()}@test.com`,
      firstName: 'Norbert',
      lastName: 'Krawczyk',
    };
    await addCustomer(page, customer);

    const customerContext = await browser.newContext();
    const customerPage = await customerContext.newPage();
    await customerPage.goto(`${BASE_URL}/cars`);
    await login(customerPage, { username: customer.username, password: 'Test1234!' });

    const buyableCars = () => customerPage.locator('.card').filter({ has: customerPage.getByRole('button', { name: 'Kup' }) });

    let buyableCount = await buyableCars().count();
    while (buyableCount < 2) {
      const extraCar: CarData = {
        brand: `Autko-${Date.now()}`,
        model: 'TestModel',
        year: 2022,
        vin: `VIN${Date.now()}ABCDEFG`.slice(0, 17),
        price: 99999,
        horsePower: 220,
        isAvailableForRent: true,
      };
      await addCar(page, extraCar);

      // refresh customer view to pick up new car
      await customerPage.reload();
      buyableCount = await buyableCars().count();
    }

    const buyableCountAfterSetup = await buyableCars().count();
    expect(buyableCountAfterSetup).toBeGreaterThanOrEqual(2);

    const firstCar = buyableCars().nth(0);
    const secondCar = buyableCars().nth(1);

    await expect(firstCar).toBeVisible();
    await expect(secondCar).toBeVisible();

    await calculateLeasing(customerPage, firstCar, { downPayment: '10', months: '24' });
    const firstRateText = await customerPage.locator('.calculate-form', { hasText: 'Leasing - podsumowanie' }).textContent();
    await closeLeasingSummary(customerPage);

    await calculateLeasing(customerPage, secondCar, { downPayment: '20', months: '48' });
    const secondRateText = await customerPage.locator('.calculate-form', { hasText: 'Leasing - podsumowanie' }).textContent();
    await closeLeasingSummary(customerPage);

    const firstValue = Number((firstRateText ?? '').match(/Miesięczna rata:\s*([\d.,]+)/)?.[1].replace(',', '.'));
    const secondValue = Number((secondRateText ?? '').match(/Miesięczna rata:\s*([\d.,]+)/)?.[1].replace(',', '.'));

    expect(firstValue).toBeGreaterThan(0);
    expect(secondValue).toBeGreaterThan(0);
    expect(secondValue).not.toBe(firstValue);

    customerPage.on('dialog', (d) => d.accept());
    const secondCarButton = secondCar.getByRole('button', { name: 'Kup' });
    await expect(secondCarButton).toBeVisible({ timeout: 10000 });
    await secondCarButton.click();

    await expect(customerPage.locator('.card').filter({ has: customerPage.getByRole('button', { name: 'Kup' }) })).toHaveCount(buyableCountAfterSetup - 1, { timeout: 20000 });

    await customerContext.close();
  });
});