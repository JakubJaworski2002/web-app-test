import { test, expect } from '@playwright/test';
const BASE_URL = 'http://localhost:4200';

test.describe('Scenariusz 5: Ochrona dostępu i logowanie', () => {
  test('Niezalogowany użytkownik nie wykonuje akcji dealerskich, błędne logowanie zwraca błąd, poprawne daje dostęp', async ({ page }) => {
    // 1. Wejście bez sesji na ścieżki zarezerwowane dla obszarów wewnętrznych
    await page.goto(`${BASE_URL}/add-car`);
    await expect(page.getByRole('button', { name: 'Dodaj Samochód' })).not.toBeVisible();
    await expect(page.locator('.add-car-form')).toHaveCount(0);

    await page.goto(`${BASE_URL}/customer-list`);
    await expect(page.getByRole('button', { name: 'Lista Klientów' })).not.toBeVisible();

    // 2. Przejście na listę aut i próba błędnego logowania
    await page.goto(`${BASE_URL}/cars`);
    await page.getByRole('button', { name: 'Zaloguj się' }).click();

    const dialog = page.getByRole('dialog', { name: 'Logowanie' });
    await expect(dialog).toBeVisible();

    await dialog.locator('#username').fill('admin');
    await dialog.locator('#password').fill('zleHaslo123!');
    await page.getByLabel('Logowanie').getByRole('button', { name: 'Zaloguj się' }).click();

    await expect(dialog.getByText(/Nie udało się zalogować|Nieprawidłowe dane logowania/i)).toBeVisible();

    // 3. Poprawne logowanie i weryfikacja dostępu do funkcji dealerskich
    await dialog.locator('#username').fill('admin');
    await dialog.locator('#password').fill('Admin1!');
    await page.getByLabel('Logowanie').getByRole('button', { name: 'Zaloguj się' }).click();
    await dialog.waitFor({ state: 'hidden' });

    await expect(page.getByText('Witaj,')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Dodaj Samochód' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Lista Klientów' })).toBeVisible();
  });
});
