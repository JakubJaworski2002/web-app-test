/**
 * Testy StorageState – Pelny przeplyw pracy admina bez UI login
 *
 * Playlista: S14-S15
 * Pokryte scenariusze UI: R1 (dodawanie auta), R10/R12 (lista klientow)
 *
 * Technika: storageState + rzeczywiste akcje dealera
 * Testy demonstruja ze admin moze wykonywac akcje od razu po zaladowaniu strony
 */

import { test, expect } from '@playwright/test';
import path from 'path';

const ADMIN_AUTH_FILE = path.join(__dirname, '../../.auth/admin.json');
const APP = 'http://localhost:4200';

test.use({ storageState: ADMIN_AUTH_FILE });

test.describe('StorageState – Workflow admina bez UI login', () => {

  /**
   * [S14] Admin ze storageState dodaje samochod przez formularz
   * Scenariusz UI: R1 – admin dodaje nowy samochod
   * Cel: pelny workflow R1 ale z pominieta faza UI logowania dzieki storageState
   * Oszczednosc: ~3 sekundy na UI login zaoszczedzone
   */
  test('[S14] Admin ze storageState dodaje samochod bez UI login', async ({ page }) => {
    const suffix = Date.now();
    const brand = `StorageBrand${suffix}`;
    const model = `StorageModel${suffix}`;
    const vin = `STG${String(suffix).slice(-10)}ABCD`.slice(0, 17).toUpperCase();

    page.on('dialog', (dialog) => dialog.accept().catch(() => {}));

    await page.goto(`${APP}/cars`);

    // Bez logowania – od razu klikamy Dodaj Samochód
    await page.getByRole('button', { name: 'Dodaj Samochód' }).click();

    const form = page.locator('.add-car-form').last();
    await expect(form).toBeVisible({ timeout: 10000 });

    await form.locator('#brand').fill(brand);
    await form.locator('#model').fill(model);
    await form.locator('#year').fill('2024');
    await form.locator('#vin').fill(vin);
    await form.locator('#price').fill('95000');
    await form.locator('#horsePower').fill('220');

    const checkbox = form.locator('#isAvailableForRent');
    if (!(await checkbox.isChecked())) {
      await checkbox.check();
    }

    const saveButton = form.getByRole('button', { name: 'Zapisz' });
    await expect(saveButton).toBeEnabled({ timeout: 10000 });
    await saveButton.click();

    // Szukaj dodanego auta
    await page.getByPlaceholder('Wyszukaj marke').fill(brand);

    const addedCard = page.locator('.row.collapse.show .card').filter({
      hasText: `${brand} ${model}`,
    }).last();

    await expect(addedCard).toBeVisible({ timeout: 15000 });
    await expect(addedCard.locator('.card-title')).toHaveText(`${brand} ${model}`);
  });

  /**
   * [S15] Admin ze storageState przegladuje liste klientow w modalu
   * Scenariusz UI: R10 (admin weryfikuje klientow po transakcji), R12 (lista klientow)
   * Cel: admin moze od razu otworzyc panel klientow bez przechodzenia przez UI login
   */
  test('[S15] Admin ze storageState przegladuje liste klientow w modalu', async ({ page }) => {
    await page.goto(`${APP}/cars`);

    // Bez logowania – od razu otwieramy modal listy klientow
    await page.locator('button[data-bs-target="#customerListModal"]').click();

    const modal = page.locator('#customerListModal');
    await expect(modal).toBeVisible({ timeout: 10000 });

    const tableBody = modal.locator('tbody');
    await expect(tableBody).toBeVisible({ timeout: 5000 });

    // Sprawdz ze tabela sie zaladowala (moze byc 0 lub wiecej klientow)
    const rowCount = await tableBody.locator('tr').count();
    expect(rowCount).toBeGreaterThanOrEqual(0);

    // Jesli sa klienci, sprawdz ze wiersze maja zawartosc
    if (rowCount > 0) {
      const firstRow = tableBody.locator('tr').first();
      await expect(firstRow).toBeVisible();
    }
  });

});
