import { Page, Locator, expect } from '@playwright/test';

export interface LeasingData {
  downPayment: string;
  months: string;
}

async function waitForOverlaysToDisappear(page: Page): Promise<void> {
  await page.locator('.modal-backdrop.show').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
  await page.locator('.cdk-overlay-backdrop.cdk-overlay-backdrop-showing').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
}

export async function calculateLeasing(page: Page, carLocator: Locator, data: LeasingData): Promise<void> {
  await waitForOverlaysToDisappear(page);

  const leasingButton = carLocator.getByRole('button', { name: 'Leasing' });
  await leasingButton.scrollIntoViewIfNeeded();
  await expect(leasingButton).toBeVisible({ timeout: 10000 });

  try {
    await leasingButton.click({ timeout: 10000 });
  } catch {
    await leasingButton.evaluate((element) => {
      element.scrollIntoView({ block: 'center', inline: 'center' });
    });
    await leasingButton.click({ force: true });
  }

  const leasingForm = page.locator('.calculate-form').filter({ hasText: 'Wpłata własna' }).last();
  await expect(leasingForm).toBeVisible({ timeout: 10000 });

  await leasingForm.locator('#downPayment').fill(data.downPayment);
  await leasingForm.locator('#months').fill(data.months);

  await leasingForm.getByRole('button', { name: 'Oblicz' }).click();

  const summary = page.locator('.calculate-form').filter({ hasText: 'Leasing - podsumowanie' }).last();
  await expect(summary).toBeVisible({ timeout: 10000 });
}

export async function closeLeasingSummary(page: Page): Promise<void> {
  const summary = page.locator('.calculate-form').filter({ hasText: 'Leasing - podsumowanie' }).last();
  await expect(summary).toBeVisible({ timeout: 10000 });

  await summary.getByRole('button', { name: 'Zamknij' }).click();
  await expect(summary).toBeHidden({ timeout: 10000 });
  await waitForOverlaysToDisappear(page);
}

