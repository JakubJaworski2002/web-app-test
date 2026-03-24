import { test, expect } from '@playwright/test';
import { login } from '../utils/auth.utils';
import { addCustomer, CustomerData } from '../utils/customer.utils';
import { rentCar } from '../utils/transaction.utils';

test.describe('Scenariusz 3: Zarządzanie klientami i wynajem', () => {
  const rentClient: CustomerData = {
    username: 'Renter_' + Date.now(),
    email: `rent${Date.now()}@test.com`,
    firstName: 'Anna',
    lastName: 'Nowak'
  };

  test('Rejestracja klienta z poziomu panelu i wykonanie wynajmu', async ({ page, browser }) => {
    // 1. Zalogowanie jako sprzedawca/admin w celu zarządzania klientem
    await page.goto('http://localhost:4200/cars');
    await login(page, { username: 'admin', password: 'Admin1!' });

    // 2. Dodanie klienta (dane wprowadzone do bazy)
    await addCustomer(page, rentClient);

    // 3. Utworzenie nowego bezpiecznego profilu z widokiem front-endu dla roli klienta 
    // Wynika to z faktu, że przyciski kupna i wynajmu pojawiają się tylko dla !isDealer
    const customerContext = await browser.newContext();
    const customerPage = await customerContext.newPage();
    await customerPage.goto('http://localhost:4200/cars');
    await login(customerPage, { username: rentClient.username, password: 'Test1234!' });

    // 4. Wynajem wybranego luksusowego pojazdu (filtrowane po odznace Dostępny do wynajmu: Tak)
    const carCard = customerPage.locator('.card').filter({ has: customerPage.locator('p.card-text .badge', { hasText: 'Tak' }) }).first();
    await expect(carCard).toBeVisible();
    // Zapiszmy tytuł auta przed wynajmem, ponieważ po wynajmie zmieni się status na "Nie"
    // i pierwotny selektor "carCard" (szukający "Tak") przestanie pasować do tego auta!
    const carTitle = await carCard.locator('h5.card-title').textContent();

    // Akcja "Wypożycz" wyciągana z transaction.utils
    await rentCar(customerPage, carCard);

    // Tworzymy nowy selektor wskazujący na to samo auto, ale po niezmiennym tytule
    const rentedCarCard = customerPage.locator('.card').filter({ has: customerPage.locator('h5.card-title', { hasText: carTitle as string }) }).first();

    // 5. Weryfikacja: aplikacja powinna zmienić przycisk na "Zwróć" oraz zmienić odznakę na "Nie" (bg-danger)
    await expect(rentedCarCard.locator('p.card-text .badge')).toHaveText(/Nie/, { timeout: 5000 });
    await expect(rentedCarCard.locator('p.card-text .badge')).toHaveClass(/badge bg-danger/);

    const returnButton = rentedCarCard.getByRole('button', { name: 'Zwróć', exact: false });
    await expect(returnButton).toBeVisible();

    // 6. Zwrot pojazdu
    await returnButton.click();
  });
});
