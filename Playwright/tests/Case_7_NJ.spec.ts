//Nikodem Jasionowski
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:4200';

test.describe('[R7] Scenariusz 7: Privacy Policy i rejestracja', () => {
  test('Przejście na Privacy Policy i rejestracja użytkownika', async ({ page }) => {
    await page.goto(`${BASE_URL}/cars`);

    await expect(page.getByRole('link', { name: 'Polityka Prywatności' })).toBeVisible();
    await page.getByRole('link', { name: 'Polityka Prywatności' }).click();
    await expect(page).toHaveURL(/\/privacy-policy$/);

    await expect(page.getByRole('heading', { name: 'Polityka prywatności' })).toBeVisible();
    await expect(page.getByText('Informacje ogólne')).toBeVisible();
    await expect(page.getByText('Bezpieczeństwo danych')).toBeVisible();

    await page.getByRole('button', { name: 'Zaloguj się' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByRole('button', { name: 'Nie masz konta? Zarejestruj się' }).click();

    const user = {
      username: `Privacy7_${Date.now()}`,
      email: `privacy7${Date.now()}@test.com`,
      firstName: 'Katarzyna',
      lastName: 'Mazur',
    };

    const authModal = page.locator('#authModal');
    await expect(authModal).toBeVisible();

    await authModal.locator('#username').fill(user.username);
    await authModal.locator('#email').fill(user.email);
    await authModal.locator('#password').fill('Test1234!');
    await authModal.locator('#firstName').fill(user.firstName);
    await authModal.locator('#lastName').fill(user.lastName);

    await page.getByRole('button', { name: 'Zarejestruj się' }).click();
    await expect(page.getByText(/Witaj, /)).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/\/cars$/);
  });
});
