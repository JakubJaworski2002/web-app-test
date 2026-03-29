//Tomasz Jarmoc
import { test, expect } from '@playwright/test';
import { login } from '../utils/auth.utils';
import { addCar, CarData, editCar } from '../utils/car.utils';

test.describe('[R14] Scenariusz 14: Modyfikacja ceny przez admina widoczna dla klienta', () => {
  test('Zmiana ceny przez admina i weryfikacja przez klienta', async ({ page, browser }) => {
    const suffix = Date.now();
    const carForPriceChange: CarData = {
      brand: `PriceBrand${suffix}`,
      model: `PriceModel${suffix}`,
      year: 2024,
      vin: `PRC${String(suffix).slice(-14).padStart(14, '0')}`.slice(0, 17),
      price: 50000,
      horsePower: 250,
      isAvailableForRent: true,
    };

    const originalPrice = carForPriceChange.price;
    const newPrice = originalPrice - 15000;

    await page.goto('http://localhost:4200/cars');
    await login(page, { username: 'admin', password: 'Admin1!' });
    await addCar(page, carForPriceChange);

    await page.getByPlaceholder('Wyszukaj markę').fill(carForPriceChange.brand);

    const carCard = page.locator('.row.collapse.show .card').filter({
      hasText: `${carForPriceChange.brand} ${carForPriceChange.model}`,
    }).last();
    await expect(carCard).toBeVisible();

    const updateResponse = page.waitForResponse((response) =>
      response.request().method() === 'PUT' && /\/cars\/\d+$/.test(response.url())
    );
    await editCar(page, carCard, { price: newPrice });
    expect((await updateResponse).ok()).toBeTruthy();

    await page.reload();
    await page.getByPlaceholder('Wyszukaj markę').fill(carForPriceChange.brand);
    const adminUpdatedCard = page.locator('.row.collapse.show .card').filter({
      hasText: `${carForPriceChange.brand} ${carForPriceChange.model}`,
    }).last();
    await expect(adminUpdatedCard).toBeVisible();

    const adminEditedPriceText = await adminUpdatedCard.locator('.card-subtitle').first().textContent();
    const adminEditedPriceDigits = (adminEditedPriceText ?? '').replace(/\D/g, '');
    expect(adminEditedPriceDigits).toContain(String(newPrice));

    const customerContext = await browser.newContext();
    const customerPage = await customerContext.newPage();
    await customerPage.goto('http://localhost:4200/cars');
    await customerPage.getByPlaceholder('Wyszukaj markę').fill(carForPriceChange.brand);

    const customerCarCard = customerPage.locator('.row.collapse.show .card').filter({
      hasText: `${carForPriceChange.brand} ${carForPriceChange.model}`,
    }).last();
    await expect(customerCarCard).toBeVisible();

    const editedPriceText = await customerCarCard.locator('.card-subtitle').first().textContent();
    const editedPriceDigits = (editedPriceText ?? '').replace(/\D/g, '');
    expect(editedPriceDigits).toContain(String(newPrice));

    await page.bringToFront();
    await page.getByPlaceholder('Wyszukaj markę').fill(carForPriceChange.brand);
    const adminCarCard = page.locator('.row.collapse.show .card').filter({
      hasText: `${carForPriceChange.brand} ${carForPriceChange.model}`,
    }).last();
    const revertResponse = page.waitForResponse((response) =>
      response.request().method() === 'PUT' && /\/cars\/\d+$/.test(response.url())
    );
    await editCar(page, adminCarCard, { price: originalPrice });
    expect((await revertResponse).ok()).toBeTruthy();

    await customerPage.reload();
    await customerPage.getByPlaceholder('Wyszukaj markę').fill(carForPriceChange.brand);
    const revertedCarCard = customerPage.locator('.row.collapse.show .card').filter({
      hasText: `${carForPriceChange.brand} ${carForPriceChange.model}`,
    }).last();
    const revertedPriceText = await revertedCarCard.locator('.card-subtitle').first().textContent();
    const revertedPriceDigits = (revertedPriceText ?? '').replace(/\D/g, '');
    expect(revertedPriceDigits).toContain(String(originalPrice));

    await customerContext.close();
  });
});
