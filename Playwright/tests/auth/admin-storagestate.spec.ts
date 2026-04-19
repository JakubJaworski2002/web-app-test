/**
 * Testy StorageState – Panel admina bez UI login
 *
 * Playlista: S01-S06
 * Pokryte scenariusze UI: R1 (dodawanie auta), R5 (ochrona dostepu), R10 (lista klientow)
 *
 * Technika: storageState – zapisany stan sesji admina z global.setup.ts
 * Testy startuja jako juz zalogowany admin, bez wypelniania formularza logowania
 *
 * Warunek wstepny: uruchomic projekt 'setup' najpierw (npx playwright test --project=setup)
 */

import { test, expect } from '@playwright/test';
import path from 'path';

const ADMIN_AUTH_FILE = path.join(__dirname, '../../.auth/admin.json');
const APP = 'http://localhost:4200';

// Wszystkie testy w tym pliku startuja z sesja admina
test.use({ storageState: ADMIN_AUTH_FILE });

test.describe('StorageState – Panel admina (bez UI login)', () => {

  /**
   * [S01] Admin widzi przycisk Wyloguj sie natychmiast po zaladowaniu strony
   * Scenariusz UI: R5 – zalogowany uzytkownik ma dostep do panelu
   * Cel: storageState eliminuje potrzebe UI login – admin startuje jako zalogowany
   * Kluczowe: krotki timeout (5s) - brak oczekiwania na animacje logowania
   */
  test('[S01] Admin widzi przycisk Wyloguj sie natychmiast bez UI login', async ({ page }) => {
    await page.goto(`${APP}/cars`);

    // Krotki timeout – nie czekamy na proces logowania, sesja juz istnieje
    await expect(page.getByRole('button', { name: 'Wyloguj się' })).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: 'Zaloguj się' })).not.toBeVisible();
  });

  /**
   * [S02] Admin widzi powitanie po zaladowaniu strony
   * Scenariusz UI: R5 – po zalogowaniu pojawia sie powitanie "Witaj, [imie]"
   * Cel: storageState przywraca pelny stan zalogowanego uzytkownika lacznie z UI
   */
  test('[S02] Admin widzi powitanie Witaj, po zaladowaniu strony', async ({ page }) => {
    await page.goto(`${APP}/cars`);

    await expect(page.getByText(/Witaj,/)).toBeVisible({ timeout: 5000 });
  });

  /**
   * [S03] Admin widzi przycisk Dodaj Samochod bez logowania
   * Scenariusz UI: R1 – dealer moze dodac auto do katalogu
   * Cel: chroniony przycisk dealera dostepny natychmiast dzieki storageState
   */
  test('[S03] Admin widzi przycisk Dodaj Samochod bez logowania', async ({ page }) => {
    await page.goto(`${APP}/cars`);

    await expect(page.getByRole('button', { name: 'Dodaj Samochód' })).toBeVisible({ timeout: 8000 });
  });

  /**
   * [S04] Admin widzi caly panel dealera bez logowania
   * Scenariusz UI: R5 (panel dealera), R10 (zarzadzanie klientami)
   * Cel: wszystkie przyciski dealerskie dostepne po zaladowaniu storageState
   */
  test('[S04] Admin widzi pelny panel dealera bez logowania', async ({ page }) => {
    await page.goto(`${APP}/cars`);

    // Przyciski dealerskie
    await expect(page.getByRole('button', { name: 'Dodaj Samochód' })).toBeVisible({ timeout: 8000 });
    await expect(page.locator('button[data-bs-target="#addCustomerModal"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button[data-bs-target="#customerListModal"]')).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: 'Wyloguj się' })).toBeVisible({ timeout: 5000 });
  });

  /**
   * [S05] Admin moze otworzyc formularz dodawania auta bez logowania
   * Scenariusz UI: R1 – admin klika Dodaj Samochod i formularz sie otwiera
   * Cel: weryfikacja ze formularz dealera jest dostepny po zaladowaniu storageState
   */
  test('[S05] Admin moze otworzyc formularz dodawania auta bez logowania', async ({ page }) => {
    await page.goto(`${APP}/cars`);

    // Kliknij Dodaj Samochod bez wczesniejszego logowania
    await page.getByRole('button', { name: 'Dodaj Samochód' }).click();

    const form = page.locator('.add-car-form').last();
    await expect(form).toBeVisible({ timeout: 10000 });

    // Sprawdz ze formularz ma wymagane pola
    await expect(form.locator('#brand')).toBeVisible();
    await expect(form.locator('#model')).toBeVisible();
    await expect(form.locator('#year')).toBeVisible();
    await expect(form.locator('#vin')).toBeVisible();
    await expect(form.locator('#price')).toBeVisible();
  });

  /**
   * [S06] Admin widzi liste klientow w modalu bez logowania
   * Scenariusz UI: R10 (admin weryfikuje klientow), R12 (lista klientow)
   * Cel: chroniony modal listy klientow dostepny natychmiast po zaladowaniu storageState
   */
  test('[S06] Admin widzi liste klientow w modalu bez logowania', async ({ page }) => {
    await page.goto(`${APP}/cars`);

    // Otwierz modal listy klientow bez logowania
    await page.locator('button[data-bs-target="#customerListModal"]').click();

    const modal = page.locator('#customerListModal');
    await expect(modal).toBeVisible({ timeout: 10000 });
    await expect(modal.locator('tbody')).toBeVisible({ timeout: 5000 });
  });

});
