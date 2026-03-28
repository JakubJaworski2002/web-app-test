import { test, expect } from '@playwright/test';
import { login } from '../utils/auth.utils';
import { addCustomer, CustomerData } from '../utils/customer.utils';
import { buyCarFromDetail } from '../utils/transaction.utils';

test.describe('Scenariusz 15: Odrzucenie kupna dla niekompletnego profilu', () => {
  const incompleteClient: CustomerData = {
    username: 'Incomplete_' + Date.now(),
    email: `incomplete${Date.now()}@test.com`,
    firstName: 'Jan',
    lastName: 'Kowalski'
    // Brak telefonu i innych danych
  };

  test('Próba kupna z niekompletnym profilem', async ({ page }) => {
    // 1. Dodanie klienta z niekompletnymi danymi przez admina
    await page.goto('http://localhost:4200/cars');
    await login(page, { username: 'admin', password: 'Admin1!' });
    await addCustomer(page, incompleteClient);

    // 2. Zalogowanie jako ten klient
    await page.goto('http://localhost:4200/login-register');
    await login(page, { username: incompleteClient.username, password: 'Test1234!' });

    // 3. Przejście do szczegółów auta i próba kupna
    await page.goto('http://localhost:4200/car-list');
    const carCard = page.locator('.card').first();
    await carCard.getByRole('link', { name: 'Szczegóły' }).click();

    // Próba kupna
    await buyCarFromDetail(page);

    // 4. Weryfikacja: błąd o niekompletnym profilu
    await expect(page.locator('.alert-danger')).toContainText('Wymagane jest pełne uzupełnienie profilu');

    // 5. Uzupełnienie profilu (zakładamy, że jest opcja edycji profilu)
    await page.getByRole('link', { name: 'Edytuj profil' }).click();
    await page.locator('input[name="phone"]').fill('123456789');
    await page.getByRole('button', { name: 'Zapisz' }).click();

    // 6. Ponowna próba kupna
    await buyCarFromDetail(page);
    await expect(page.locator('.alert-success')).toContainText('Zakup zakończony pomyślnie');
  });
});
