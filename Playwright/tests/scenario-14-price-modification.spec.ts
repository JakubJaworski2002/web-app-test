import { test, expect } from '@playwright/test';
import { login } from '../utils/auth.utils';
import { editCar } from '../utils/car.utils';

test.describe('Scenariusz 14: Modyfikacja ceny przez admina widoczna dla klienta', () => {
  const originalPrice = 50000; // Zakładana oryginalna cena
  const newPrice = 35000; // Obniżona cena

  test('Zmiana ceny przez admina i weryfikacja przez klienta', async ({ page, browser }) => {
    // 1. Admin: logowanie i edycja ceny
    await page.goto('http://localhost:4200/cars');
    await login(page, { username: 'admin', password: 'Admin1!' });

    // Wybór auta do edycji
    const carCard = page.locator('.card').first();
    const carTitle = await carCard.locator('h5.card-title').textContent();

    // Edycja ceny
    await editCar(page, carCard, { price: newPrice });

    // 2. Nowy kontekst: klient sprawdza cenę
    const customerContext = await browser.newContext();
    const customerPage = await customerContext.newPage();
    await customerPage.goto('http://localhost:4200/car-list');

    const customerCarCard = customerPage.locator('.card').filter({ hasText: carTitle as string }).first();
    await expect(customerCarCard.locator('.card-text').filter({ hasText: 'Cena:' })).toContainText(newPrice.toString());

    // 3. Admin cofa zmianę
    await page.bringToFront();
    await editCar(page, carCard, { price: originalPrice });

    // Weryfikacja dla klienta
    await customerPage.reload();
    await expect(customerCarCard.locator('.card-text').filter({ hasText: 'Cena:' })).toContainText(originalPrice.toString());

    await customerContext.close();
  });
});</content>
<parameter name="filePath">c:\Users\Tomek\web-app-test\Playwright\tests\scenario-14-price-modification.spec.ts