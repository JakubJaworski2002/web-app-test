import { Page, Locator } from '@playwright/test';

export interface LeasingData {
  downPayment: string;
  months: string;
}

export async function calculateLeasing(page: Page, carLocator: Locator, data: LeasingData): Promise<void> {
  await carLocator.getByRole('button', { name: 'Leasing' }).click();

  await page.locator('#downPayment').fill(data.downPayment);
  await page.locator('#months').fill(data.months);

  await page.getByRole('button', { name: 'Oblicz' }).click();
}

export async function closeLeasingSummary(page: Page): Promise<void> {
  await page.locator('.calculate-form').getByRole('button', { name: 'Zamknij' }).last().click();
}

