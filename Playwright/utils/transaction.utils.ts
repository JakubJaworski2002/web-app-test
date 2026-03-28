import { Page, Locator, expect } from '@playwright/test';

/**
 * Klika przycisk "Kup" dla wybranego samochodu zdefiniowanego przez selektor
 * @param page
 * @param carLocator - selektor konkretnej karty (.card)
 */
export async function buyCar(page: Page, carLocator: Locator): Promise<void> {
  const buyButton = carLocator.getByRole('button', { name: 'Kup' });
  await expect(buyButton).toBeVisible({ timeout: 10000 });
  await buyButton.click();
}

/**
 * Klika przycisk "Kup" na stronie szczegółów samochodu
 * @param page
 */
export async function buyCarFromDetail(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Kup' }).click();
}

/**
 * Klika przycisk "Wypożycz" dla wybranego samochodu
 * @param page
 * @param carLocator - selektor karty pojazdu (.card)
 */
export async function rentCar(page: Page, carLocator: Locator): Promise<void> {
  await carLocator.getByRole('button', { name: 'Wypożycz' }).click();
}

/**
 * Klika przycisk "Zwróć" dla wybranego auta
 */
export async function returnCar(page: Page, carLocator: Locator): Promise<void> {
  await carLocator.getByRole('button', { name: 'Zwróć' }).click();
}
