import { Page, Locator } from '@playwright/test';

export interface LeasingData {
  downPayment: string;
  months: string;
}

/**
 * Klika przycisk Leasingu dla wybranego samochodu, wypełnia dane w kalkulatorze i naciska Oblicz.
 * Oczekuje pojawienia się podsumowania leasingu.
 * @param page
 * @param carLocator - Selektor wskazujący na konkretną kartę auta (.card)
 * @param data - { downPayment, months }
 */
export async function calculateLeasing(page: Page, carLocator: Locator, data: LeasingData): Promise<void> {
  // Otwarcie dialogu w obrębie danego auta
  await carLocator.getByRole('button', { name: 'Leasing' }).click();

  // W systemie pojawi się dialog, korzystamy z globalnych id dla uproszczenia
  // Zakładamy, że naraz otwarty jest tylko jeden dialog kalkulatora
  await page.locator('#downPayment').fill(data.downPayment);
  await page.locator('#months').fill(data.months);

  await page.getByRole('button', { name: 'Oblicz' }).click();
}

/**
 * Zamyka dialog podsumowania leasingowego zdefiniowanym przyciskiem Zamknij.
 * @param page 
 */
export async function closeLeasingSummary(page: Page): Promise<void> {
  // Klikamy przycisk Zamknij w obrębie formularza podsumowania leasingu
  await page.locator('.calculate-form').getByRole('button', { name: 'Zamknij' }).last().click();
}
