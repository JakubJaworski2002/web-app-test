import { Page } from '@playwright/test';

export interface CustomerData {
  username: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
}

export async function addCustomer(page: Page, customer: CustomerData): Promise<void> {
  const authModal = page.locator('#authModal');
  if (await authModal.isVisible()) {
    await authModal.locator('.btn-close').click().catch(() => {});
    await authModal.waitFor({ state: 'hidden' });
  }

  const addCustomerModal = page.locator('#addCustomerModal');
  if (await addCustomerModal.isVisible()) {
    await addCustomerModal.locator('.btn-close, button[data-bs-dismiss="modal"]').first().click().catch(() => {});
    await addCustomerModal.waitFor({ state: 'hidden' });
  }

  await page.locator('button[data-bs-target="#addCustomerModal"]').click();

  const modal = page.locator('#addCustomerModal');
  await modal.waitFor({ state: 'visible' });

  const modalContent = modal.locator('.modal-content').filter({ hasText: 'Dodaj Nowego Klienta' });
  await modalContent.waitFor({ state: 'visible' });

  await modalContent.locator('#username').fill(customer.username);
  await modal.locator('#email').fill(customer.email);
  
  if (customer.password) {
    await modal.locator('#password').fill(customer.password);
  } else {
    await modal.locator('#password').fill('Test1234!');
  }
  
  await modal.locator('#firstName').fill(customer.firstName);
  await modal.locator('#lastName').fill(customer.lastName);

  const createCustomerResponsePromise = page.waitForResponse(
    (response) => response.request().method() === 'POST' && response.url().includes('/admin/create-customer'),
    { timeout: 15000 }
  );

  await modal.locator('button[type="submit"]').click();

  const createCustomerResponse = await createCustomerResponsePromise;
  if (!createCustomerResponse.ok()) {
    throw new Error(`Tworzenie klienta nie powiodlo sie (HTTP ${createCustomerResponse.status()})`);
  }

  await modal.locator('.btn-close, button[data-bs-dismiss="modal"]').first().click().catch(() => {});
  await modal.waitFor({ state: 'hidden', timeout: 10000 });
  await page.locator('.modal-backdrop.show').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
}

