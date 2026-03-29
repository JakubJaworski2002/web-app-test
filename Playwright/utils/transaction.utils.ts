import { Page, Locator, expect } from '@playwright/test';

export async function buyCar(page: Page, carLocator: Locator): Promise<void> {
  const buyButton = carLocator.getByRole('button', { name: 'Kup' });
  await expect(buyButton).toBeVisible({ timeout: 10000 });
  await buyButton.click();
}

export async function buyCarFromDetail(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Kup' }).click();
}

export async function rentCar(page: Page, carLocator: Locator): Promise<void> {
  await carLocator.getByRole('button', { name: 'Wypożycz' }).click();
}

export async function returnCar(page: Page, carLocator: Locator): Promise<void> {
  await carLocator.getByRole('button', { name: 'Zwróć' }).click();
}

