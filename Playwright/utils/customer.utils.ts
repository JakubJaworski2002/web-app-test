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
  // Kliknięcie guzika w navbarze otwierającego modal
  await page.locator('button[data-bs-target="#addCustomerModal"]').click();

  // Oczekiwanie aż modal wejdzie w interakcję
  const modal = page.locator('.modal-content').filter({ hasText: 'Dodaj Nowego Klienta' });
  await modal.waitFor({ state: 'visible' });

  await modal.locator('#username').fill(customer.username);
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
  
  // Zależnie od działania aplikacji, modal może się zamknąć pomyślnie.
  // Jeśli tak, warto poczekać na jego zniknięcie. Jeśli alertu/toastu użyto - można na to zezwolić w specach przodujących
  // await modal.waitFor({ state: 'hidden' }); 
}
