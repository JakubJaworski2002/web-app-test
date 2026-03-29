//Jakub Jaworski
import { test, expect } from '@playwright/test';
import { login } from '../utils/auth.utils';
import { addCustomer, CustomerData } from '../utils/customer.utils';
import { rentCar } from '../utils/transaction.utils';
import { registerDialogAutoAccept } from '../utils/dialog.utils';

test.describe('[R3] Scenariusz 3: Zarządzanie klientami i wynajem', () => {
  const rentClient: CustomerData = {
    username: 'Renter_' + Date.now(),
    email: `rent${Date.now()}@test.com`,
    firstName: 'Anna',
    lastName: 'Nowak'
  };

  test('Rejestracja klienta z poziomu panelu i wykonanie wynajmu', async ({ page, browser }) => {
    registerDialogAutoAccept(page);

    await page.goto('http://localhost:4200/cars');
    await login(page, { username: 'admin', password: 'Admin1!' });

    await addCustomer(page, rentClient);

    const customerContext = await browser.newContext();
    const customerPage = await customerContext.newPage();
    registerDialogAutoAccept(customerPage);
    await customerPage.goto('http://localhost:4200/cars');
    await login(customerPage, { username: rentClient.username, password: 'Test1234!' });

    const carCard = customerPage.locator('.card').filter({ has: customerPage.locator('p.card-text .badge', { hasText: 'Tak' }) }).first();
    await expect(carCard).toBeVisible();
    const carTitle = (await carCard.locator('h5.card-title').textContent())?.trim() ?? '';
    expect(carTitle).not.toEqual('');

    await rentCar(customerPage, carCard);

    const rentedCarCard = customerPage.locator('.card').filter({ has: customerPage.locator('h5.card-title', { hasText: carTitle }) }).first();

    await expect(rentedCarCard.locator('p.card-text .badge')).toHaveText(/Nie/, { timeout: 5000 });
    await expect(rentedCarCard.locator('p.card-text .badge')).toHaveClass(/badge bg-danger/);

    const returnButton = rentedCarCard.getByRole('button', { name: 'Zwróć', exact: false });
    await expect(returnButton).toBeVisible();

    await returnButton.click();
  });
});

