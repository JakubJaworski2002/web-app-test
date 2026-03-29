import { Page } from '@playwright/test';

export interface CustomerData {
  username: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
}

/**
 * Otwiera modal i dodaje klienta do bazy
 * @param page 
 * @param customer - Obiekt ze standardowymi danymi klienta
 */
export async function addCustomer(page: Page, customer: CustomerData): Promise<void> {
  // Upewnij się, że żaden modal nie blokuje kliknięć
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

  // Oczekiwanie aż modal będzie otwarty i aktywny
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

  // Zapisz za pomocą przycisku Dodaj Klienta w tym formularzu
  await modal.locator('button[type="submit"]').click();

  // Upewnij się, że modal się zamyka, zanim przejdziemy dalej
  await modal.waitFor({ state: 'hidden', timeout: 10000 }).catch(async () => {
    // W razie problemów spróbuj zamknąć ręcznie
    await modal.locator('.btn-close, button[data-bs-dismiss="modal"]').first().click().catch(() => {});
    await modal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
  });
}
