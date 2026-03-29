//Tomasz Jarmoc
import { test, expect } from '@playwright/test';
import { login } from '../utils/auth.utils';
import { addCustomer, CustomerData } from '../utils/customer.utils';
import { buyCar } from '../utils/transaction.utils';

test.describe('[R15] Scenariusz 15: Zakup auta przez klienta z minimalnym profilem', () => {
  const incompleteClient: CustomerData = {
    username: 'Incomplete_' + Date.now(),
    email: `incomplete${Date.now()}@test.com`,
    firstName: 'Jan',
    lastName: 'Kowalski',
  };

  test('Klient kupuje auto z poziomu listy', async ({ page }) => {
    await page.goto('http://localhost:4200/cars');
    await login(page, { username: 'admin', password: 'Admin1!' });
    await addCustomer(page, incompleteClient);
    await page.getByRole('button', { name: 'Wyloguj się' }).click();

    await expect(page.getByRole('button', { name: 'Zaloguj się' })).toBeVisible();
    await login(page, { username: incompleteClient.username, password: 'Test1234!' });

    const carCard = page.locator('.row.collapse.show .card').filter({
      has: page.getByRole('button', { name: 'Kup' }),
    }).first();
    await expect(carCard).toBeVisible();

    const carTitle = (await carCard.locator('h5.card-title').textContent())?.trim() ?? '';
    expect(carTitle).not.toEqual('');

    page.on('dialog', (dialog) => dialog.accept());
    await buyCar(page, carCard);

    const ownedSection = page.locator('.container').filter({ hasText: 'Lista twoich samochodów' });
    await expect(ownedSection).toBeVisible();
    await expect(ownedSection.locator('.card').filter({ hasText: carTitle })).toBeVisible();
  });
});

