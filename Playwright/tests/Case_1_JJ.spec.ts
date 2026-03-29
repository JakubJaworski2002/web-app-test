//Jakub Jaworski
import { test, expect } from '@playwright/test';
import { login, LoginCredentials } from '../utils/auth.utils';
import { addCar, CarData } from '../utils/car.utils';
import { registerDialogAutoAccept } from '../utils/dialog.utils';

const BASE_URL = 'http://localhost:4200';
const adminCredentials: LoginCredentials = {
  username: 'admin',
  password: 'Admin1!',
};

test.describe('[R1] Scenariusz 1: Samochody - zarządzanie (dealer)', () => {

  test('Admin może dodać nowy samochód', async ({ page }) => {
    const suffix = Date.now();
    const golfRData: CarData = {
      brand: `Volkswagen${suffix}`,
      model: `GolfR${suffix}`,
      year: 2024,
      vin: `WVWZZZCDZ${String(suffix).slice(-8).padStart(8, '0')}`,
      price: 245500,
      horsePower: 333,
      isAvailableForRent: true,
    };

    registerDialogAutoAccept(page);

    await page.goto(`${BASE_URL}/cars`);

    await login(page, adminCredentials);

    await addCar(page, golfRData);

    await page.getByPlaceholder('Wyszukaj markę').fill(golfRData.brand);

    const carCards = page.locator('.row.collapse.show .card').filter({
      hasText: `${golfRData.brand} ${golfRData.model}`
    });
    const addedCar = carCards.last();

    await expect(addedCar).toBeVisible();
    await expect(addedCar.locator('.card-title')).toHaveText(`${golfRData.brand} ${golfRData.model}`);
    await expect(addedCar.locator('.card-text')).toContainText(`Rok: ${golfRData.year}`);
    await expect(addedCar.locator('.card-text')).toContainText(`Moc: ${golfRData.horsePower} KM`);

    const formattedPrice = golfRData.price.toLocaleString('en-US');
    await expect(addedCar.locator('.card-subtitle')).toContainText(formattedPrice);
  });

});

