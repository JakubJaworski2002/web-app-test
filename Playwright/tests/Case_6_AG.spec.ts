//Adam Godlewski
import { test, expect } from '@playwright/test';
import { login } from '../utils/auth.utils';
import { registerDialogAutoAccept } from '../utils/dialog.utils';

const BASE_URL = 'http://localhost:4200';

test.describe('[R6] Scenariusz 6: Walidacja formularza dodawania i edycja auta', () => {
  test('Formularz blokuje zapis niepoprawnych danych, po korekcie pozwala dodać i edytować auto', async ({ page }) => {
    registerDialogAutoAccept(page);

    await page.goto(`${BASE_URL}/cars`);
    await login(page, { username: 'admin', password: 'Admin1!' });

    await page.getByRole('button', { name: 'Dodaj Samochód' }).click();
    const form = page.locator('.add-car-form:visible').last();
    await expect(form).toBeVisible();

    const saveButton = form.getByRole('button', { name: 'Zapisz' });
    await expect(saveButton).toBeDisabled();

    await form.locator('#brand').fill('A');
    await form.locator('#brand').fill('');
    await form.locator('#price').fill('-1');
    await form.locator('#horsePower').fill('0');

    await expect(form.getByText('Marka jest wymagana')).toBeVisible();
    await expect(form.getByText('Cena musi być liczbą dodatnią')).toBeVisible();
    await expect(form.getByText('Moc nie może być mniejsza od 1')).toBeVisible();
    await expect(saveButton).toBeDisabled();

    const suffix = Date.now();
    const vinTail = String(suffix).slice(-7).padStart(7, '0');
    const brand = 'ValidationBrand' + suffix;
    const model = 'ValidationModel' + suffix;
    const yearAfterEdit = 2025;

    await form.locator('#brand').fill(brand);
    await form.locator('#model').fill(model);
    await form.locator('#year').fill('2024');
    await form.locator('#vin').fill(`WVWZZZCDZ${vinTail}A`);
    await form.locator('#price').fill('199999');
    await form.locator('#horsePower').fill('320');
    await form.locator('#isAvailableForRent').check();

    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    await page.getByPlaceholder('Wyszukaj markę').fill(brand);
    const createdCard = page.locator('.row.collapse.show .card').filter({
      hasText: `${brand} ${model}`,
    }).last();
    await expect(createdCard).toBeVisible();

    await createdCard.getByRole('button', { name: 'Edytuj' }).click();
    const editForm = page.locator('.add-car-form:visible').last();
    await expect(editForm).toBeVisible();

    await editForm.locator('#year').fill(String(yearAfterEdit));
    const editSaveButton = editForm.getByRole('button', { name: 'Zapisz' });
    await expect(editSaveButton).toBeEnabled({ timeout: 10000 });
    await editSaveButton.click();

    await expect(editForm).toBeHidden({ timeout: 10000 });

    const updatedCard = page.locator('.row.collapse.show .card').filter({
      hasText: `${brand} ${model}`,
    }).last();

    await expect(updatedCard.locator('p.card-text')).toContainText(`Rok: ${yearAfterEdit}`);
  });
});

