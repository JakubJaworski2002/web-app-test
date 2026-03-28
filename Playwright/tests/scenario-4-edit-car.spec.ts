import { test, expect } from '@playwright/test';
import { login } from '../utils/auth.utils';
import { addCar, CarData } from '../utils/car.utils';
import { registerDialogAutoAccept } from '../utils/dialog.utils';

const BASE_URL = 'http://localhost:4200';

test.describe('Scenariusz 4: Edycja istniejącego auta', () => {
  test('Admin modyfikuje dane istniejącego auta', async ({ page }) => {
    registerDialogAutoAccept(page);

    // 1. Logowanie jako administrator
    await page.goto(`${BASE_URL}/cars`);
    await login(page, { username: 'admin', password: 'Admin1!' });

    // 2. Dodanie unikalnego auta, żeby edytować dokładnie ten sam rekord
    const suffix = Date.now();
    const createdCar: CarData = {
      brand: `EditBrand${suffix}`,
      model: `EditModel${suffix}`,
      year: 2023,
      vin: `WVWZZZCDZ${String(suffix).slice(-7).padStart(7, '0')}A`,
      price: 222222,
      horsePower: 333,
    };

    await addCar(page, createdCar);
    await page.getByPlaceholder('Wyszukaj markę').fill(createdCar.brand);

    const editableCard = page.locator('.row.collapse.show .card').filter({
      hasText: `${createdCar.brand} ${createdCar.model}`,
    }).last();

    await expect(editableCard).toBeVisible();
    const carTitle = (await editableCard.locator('h5.card-title').textContent())?.trim() ?? '';
    expect(carTitle).not.toEqual('');

    // 3. Edycja danych auta w dialogu
    const newPrice = 177777;
    const newHorsePower = 444;
    const newYear = 2022;
    const newVin = `WVWZZZCDZ${String(suffix + 1).slice(-7).padStart(7, '0')}B`;

    await editableCard.getByRole('button', { name: 'Edytuj' }).click();

    const form = page.locator('.add-car-form').last();
    await expect(form).toBeVisible();
    await form.locator('#vin').fill(newVin);
    await form.locator('#year').fill(String(newYear));
    await form.locator('#price').fill(String(newPrice));
    await form.locator('#horsePower').fill(String(newHorsePower));
    await form.getByRole('button', { name: 'Zapisz' }).click();

    // 4. Weryfikacja zmian na liście aut po niezmiennym tytule
    const updatedCard = page.locator('.row.collapse.show .card').filter({
      hasText: `${createdCar.brand} ${createdCar.model}`,
    }).last();

    await expect(updatedCard).toBeVisible();
    await expect(updatedCard.locator('h5.card-title')).toHaveText(carTitle);
    await expect(updatedCard.locator('p.card-text')).toContainText(`Rok: ${newYear}`);
  });
});
