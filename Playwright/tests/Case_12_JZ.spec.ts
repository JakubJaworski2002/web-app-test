//Jakub Zemajduk
import { test, expect } from '@playwright/test';
import { login } from '../utils/auth.utils';

const BASE_URL = 'http://localhost:4200';

const adminCredentials = { username: 'admin', password: 'Admin1!' };

const partialUsername = 'PartialClient_' + Date.now();

test.describe('[R12] Scenariusz 12: Wylogowanie podczas wypełniania formularza klienta', () => {
  test('Częściowo wypełniony formularz nie zapisuje klienta po wylogowaniu', async ({ page }) => {
    await page.goto(`${BASE_URL}/cars`);
    await login(page, adminCredentials);
    await expect(page.getByRole('button', { name: 'Wyloguj się' })).toBeVisible();

    await page.locator('button[data-bs-target="#addCustomerModal"]').click();
    const addCustomerModal = page.locator('.modal-content').filter({ hasText: 'Dodaj Nowego Klienta' });
    await expect(addCustomerModal).toBeVisible();

    await addCustomerModal.locator('#username').fill(partialUsername);
    await addCustomerModal.locator('#firstName').fill('NieSavedImię');

    await expect(addCustomerModal.locator('#username')).toHaveValue(partialUsername);

    await addCustomerModal.locator('button[aria-label="Zamknij"]').click();
    await expect(addCustomerModal).not.toBeVisible();

    await page.getByRole('button', { name: 'Wyloguj się' }).click();
    await expect(page.getByRole('button', { name: 'Zaloguj się' })).toBeVisible();

    await page.goto(`${BASE_URL}/cars`);
    await expect(page.locator('button[data-bs-target="#addCustomerModal"]')).not.toBeVisible();
    await expect(page.locator('button[data-bs-target="#customerListModal"]')).not.toBeVisible();

    await login(page, adminCredentials);
    await expect(page.getByRole('button', { name: 'Wyloguj się' })).toBeVisible();

    await page.locator('button[data-bs-target="#customerListModal"]').click();
    const customerListModal = page.locator('#customerListModal');
    await expect(customerListModal).toBeVisible();

    await expect(customerListModal.locator('tbody')).toBeVisible();

    const ghostRow = customerListModal.locator('tbody tr').filter({ hasText: partialUsername });
    await expect(ghostRow).not.toBeVisible();
  });

});

