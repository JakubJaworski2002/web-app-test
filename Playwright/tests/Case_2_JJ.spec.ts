// Jakub Jaworski
import { test, expect } from '@playwright/test';
import { login } from '../utils/auth.utils';
import { addCustomer, CustomerData } from '../utils/customer.utils';
import { calculateLeasing, closeLeasingSummary } from '../utils/leasing.utils';
import { registerDialogAutoAccept } from '../utils/dialog.utils';

test.describe('[R2] Scenariusz 2: Kalkulator leasingowy', () => {
  const testClient: CustomerData = {
    username: 'Leaser_' + Date.now(),
    email: `leasing${Date.now()}@test.com`,
    firstName: 'Jan',
    lastName: 'Kowalski'
  };

  test('Klient oblicza leasing i kupuje auto', async ({ page, browser }) => {
    registerDialogAutoAccept(page);

    await page.goto('http://localhost:4200/cars');
    await login(page, { username: 'admin', password: 'Admin1!' });

    await addCustomer(page, testClient);

    const customerContext = await browser.newContext();
    const customerPage = await customerContext.newPage();
    registerDialogAutoAccept(customerPage);
    await customerPage.goto('http://localhost:4200/cars');
    await login(customerPage, { username: testClient.username, password: 'Test1234!' });

    const carCard = customerPage.locator('.card').filter({ has: customerPage.getByRole('button', { name: 'Kup' }) }).first();
    await expect(carCard).toBeVisible();

    await calculateLeasing(customerPage, carCard, { downPayment: '20000', months: '36' });
    await expect(customerPage.getByText('Leasing - podsumowanie')).toBeVisible();
    await closeLeasingSummary(customerPage);
  });
});

