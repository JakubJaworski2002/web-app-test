import { test, expect } from '@playwright/test';
import { login } from '../utils/auth.utils';
import { addCustomer, CustomerData } from '../utils/customer.utils';
import { buyCar } from '../utils/transaction.utils';

test.describe('Scenariusz 4 NJ: Zakup samochodu (leasing realizowany z potwierdzeniem)', () => {
  test('TC 11_NJ - aktywna sesja i kupno auta zmienia dostepnosc', async ({ page, browser }) => {
    // Dealer loguje i tworzy klienta
    await page.goto('http://localhost:4200/cars');
    await login(page, { username: 'admin', password: 'Admin1!' });

    const njClient: CustomerData = {
      username: `NJClient_${Date.now()}`,
      email: `nj${Date.now()}@test.com`,
      firstName: 'Marek',
      lastName: 'Żurawski',
    };

    await addCustomer(page, njClient);

    const customerContext = await browser.newContext();
    const customerPage = await customerContext.newPage();
    await customerPage.goto('http://localhost:4200/cars');
    await login(customerPage, { username: njClient.username, password: 'Test1234!' });

    // Wybierz pierwsze dostępne auto z przyciskiem Kup
    const carCard = customerPage.locator('.card').filter({ has: customerPage.getByRole('button', { name: 'Kup' }) }).first();
    await expect(carCard).toBeVisible();

    // Używamy potwierdzenia z dialogu modal
    customerPage.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      expect(dialog.message()).toContain('Czy na pewno chcesz kupić samochód');
      await dialog.accept();
    });

    await buyCar(customerPage, carCard);

    // Po zakupie przycisk Kup powinien zniknąć dla tego auta (status Sprzedany)
    await expect(carCard.getByRole('button', { name: 'Kup' })).toHaveCount(0);

    // Dodatkowa weryfikacja: jeżeli jest etykieta stanu, to nie pokazuje 'Available' jako aktywne
    const rentBadge = carCard.locator('p.card-text span.badge');
    await expect(rentBadge).toHaveText(/Nie|Brak/);
  });
});
