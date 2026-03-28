import { test, expect } from '@playwright/test';
import { login } from '../utils/auth.utils';

const BASE_URL = 'http://localhost:4200';

const adminCredentials = { username: 'admin', password: 'Admin1!' };

// Unikalny username do sprawdzenia, czy przypadkowo nie trafił do bazy
const partialUsername = 'PartialClient_' + Date.now();

test.describe('Scenariusz 12: Wylogowanie podczas wypełniania formularza klienta', () => {
  test('Częściowo wypełniony formularz nie zapisuje klienta po wylogowaniu', async ({ page }) => {
    // Logowanie jako sprzedawca/admin 
    await page.goto(`${BASE_URL}/cars`);
    await login(page, adminCredentials);
    await expect(page.getByRole('button', { name: 'Wyloguj się' })).toBeVisible();

    // Otwarcie modala "Dodaj Klienta" 
    await page.locator('button[data-bs-target="#addCustomerModal"]').click();
    const addCustomerModal = page.locator('.modal-content').filter({ hasText: 'Dodaj Nowego Klienta' });
    await expect(addCustomerModal).toBeVisible();

    // Wypełnienie tylko części danych (imię i username) bez wysyłania 
    await addCustomerModal.locator('#username').fill(partialUsername);
    await addCustomerModal.locator('#firstName').fill('NieSavedImię');

    // Weryfikacja, że dane zostały wpisane
    await expect(addCustomerModal.locator('#username')).toHaveValue(partialUsername);

    // Przerwanie operacji przez wylogowanie (zamknięcie modala i wylogowanie) 
    // Zamykamy modal przyciskiem (bez wysyłania formularza)
    await addCustomerModal.locator('button[aria-label="Zamknij"]').click();
    await expect(addCustomerModal).not.toBeVisible();

    // Wylogowanie przez navbar
    await page.getByRole('button', { name: 'Wyloguj się' }).click();
    await expect(page.getByRole('button', { name: 'Zaloguj się' })).toBeVisible();

    // Próba powrotu do formularza przez url – aplikacja nie ma chronionej trasy,
    // więc weryfikujemy brak przycisku admina po wylogowaniu 
    await page.goto(`${BASE_URL}/cars`);
    await expect(page.locator('button[data-bs-target="#addCustomerModal"]')).not.toBeVisible();
    await expect(page.locator('button[data-bs-target="#customerListModal"]')).not.toBeVisible();

    // Ponowne logowanie 
    await login(page, adminCredentials);
    await expect(page.getByRole('button', { name: 'Wyloguj się' })).toBeVisible();

    // Otwarcie listy klientów i weryfikacja braku częściowego rekordu 
    await page.locator('button[data-bs-target="#customerListModal"]').click();
    const customerListModal = page.locator('#customerListModal');
    await expect(customerListModal).toBeVisible();

    // Dajemy chwilę na załadowanie listy
    await page.waitForTimeout(1000);

    // Klient z partialUsername NIE powinien figurować na liście
    const ghostRow = customerListModal.locator('tbody tr').filter({ hasText: partialUsername });
    await expect(ghostRow).not.toBeVisible();
  });

});
