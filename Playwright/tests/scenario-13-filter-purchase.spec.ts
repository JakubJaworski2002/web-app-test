import { test, expect } from '@playwright/test';
import { login } from '../utils/auth.utils';
import { buyCarFromDetail } from '../utils/transaction.utils';

test.describe('Scenariusz 13: Filtrowanie listy aut i zakup', () => {
  test('Filtrowanie po roku i zakup pojazdu', async ({ page }) => {
    // 1. Zalogowanie jako klient
    await page.goto('http://localhost:4200/cars');
    await login(page, { username: 'client', password: 'Client1!' });

    // 2. Otwarcie listy aut
    await page.goto('http://localhost:4200/car-list');

    // 3. Filtrowanie po roku od 2020
    // Zakładamy, że jest input lub select dla filtrowania
    await page.locator('input[placeholder*="rok"]').fill('2020');
    await page.getByRole('button', { name: 'Filtruj' }).click();

    // 4. Wybranie pierwszego auta z filtrowanej listy
    const carCard = page.locator('.card').first();
    await expect(carCard).toBeVisible();

    // Zapisz tytuł przed zakupem
    const carTitle = await carCard.locator('h5.card-title').textContent();

    // Sprawdź rocznik
    const yearText = await carCard.locator('.card-text').filter({ hasText: 'Rok:' }).textContent();
    expect(parseInt(yearText?.split(':')[1]?.trim() || '0')).toBeGreaterThanOrEqual(2020);

    // 5. Wejście w szczegóły i zakup
    await carCard.getByRole('link', { name: 'Szczegóły' }).click();
    await buyCarFromDetail(page);

    // 6. Weryfikacja: po zakupie lista powinna mieć mniej aut (lub auto oznaczone jako niedostępne)
    await page.goto('http://localhost:4200/car-list');
    // Re-apply filter
    await page.locator('input[placeholder*="rok"]').fill('2020');
    await page.getByRole('button', { name: 'Filtruj' }).click();

    // Sprawdź, że zakupione auto nie jest dostępne lub lista zmniejszyła się
    const filteredCars = page.locator('.card');
    await expect(filteredCars).toHaveCount(await filteredCars.count() - 1); // Zakładamy zmniejszenie
  });
});</content>
<parameter name="filePath">c:\Users\Tomek\web-app-test\Playwright\tests\scenario-13-filter-purchase.spec.ts