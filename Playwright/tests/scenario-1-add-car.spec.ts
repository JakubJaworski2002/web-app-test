import { test, expect } from '@playwright/test';
import path from 'path';
import { login, LoginCredentials } from '../utils/auth.utils';
import { addCar, CarData } from '../utils/car.utils';

const BASE_URL = 'http://localhost:4200';
// ── Dane testowe ──────────────────────────────────────────────
const adminCredentials: LoginCredentials = {
  username: 'admin',
  password: 'Admin1!',
};

const golfRData: CarData = {
  brand: 'Volkswagen',
  model: 'Golf R (Mk8.5)',
  year: 2024,
  vin: 'WVWZZZCDZRW012340',
  price: 245500,
  horsePower: 333,
  imagePath: path.join(__dirname, '..', 'src', 'golf-r.jpg'),
};
// ─────────────────────────────────────────────────────────────

test.describe('Samochody – zarządzanie (dealer)', () => {

  test('Admin może dodać nowy samochód', async ({ page }) => {
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
