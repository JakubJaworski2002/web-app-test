import { test, expect } from '@playwright/test';
import { login } from '../utils/auth.utils';
import { addCustomer, CustomerData } from '../utils/customer.utils';
import { calculateLeasing, closeLeasingSummary } from '../utils/leasing.utils';

test.describe('Scenariusz 2: Kalkulator leasingowy', () => {
  const testClient: CustomerData = {
    username: 'Leaser_' + Date.now(),
    email: `leasing${Date.now()}@test.com`,
    firstName: 'Jan',
    lastName: 'Kowalski'
  };

  test('Klient oblicza leasing i kupuje auto', async ({ page, browser }) => {
    // 1. Logowanie dealera w celu stworzenia konta klienta
    await page.goto('http://localhost:4200/cars');
    await login(page, { username: 'admin', password: 'Admin1!' });

    // 2. Dodawanie nowego klienta i wylogowanie/zamknięcie kontekstu
    await addCustomer(page, testClient);

    // 3. Otwarcie nowej sesji klienta po pomyślnej rejestracji przez admina
    const customerContext = await browser.newContext();
    const customerPage = await customerContext.newPage();
    await customerPage.goto('http://localhost:4200/cars');
    await login(customerPage, { username: testClient.username, password: 'Test1234!' });

    // 4. Szukanie dostępnego auta na liście aut (.card z widocznymi przyciskami transakcji)
    // Ograniczamy do pierwszego z brzegu, które ma przycisk "Kup"
    const carCard = customerPage.locator('.card').filter({ has: customerPage.getByRole('button', { name: 'Kup' }) }).first();
    await expect(carCard).toBeVisible();

    // 5. Kalkulator leasingowy
    await calculateLeasing(customerPage, carCard, { downPayment: '20000', months: '36' });
    await expect(customerPage.getByText('Leasing - podsumowanie')).toBeVisible();
    await closeLeasingSummary(customerPage);
  });
});
