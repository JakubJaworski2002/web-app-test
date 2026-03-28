import { Page, Locator } from '@playwright/test';

export interface CarData {
  brand: string;
  model: string;
  year: number;
  vin: string;
  price: number;
  horsePower: number;
  imagePath?: string; // opcjonalna ścieżka do zdjęcia z folderu src/
}

export interface EditCarData {
  price?: number;
  year?: number;
  // Dodaj inne pola jeśli potrzebne
}

/**
 * Wypełnia i zapisuje formularz dodawania nowego samochodu.
 * @param page - instancja Playwright Page
 * @param car  - dane samochodu { brand, model, year, vin, price, horsePower, imagePath? }
 */
export async function addCar(page: Page, car: CarData): Promise<void> {
  await page.getByRole('button', { name: 'Dodaj Samochód' }).click();

  await page.getByRole('textbox', { name: 'Marka' }).fill(car.brand);
  await page.getByRole('textbox', { name: 'Model' }).fill(car.model);
  await page.getByRole('spinbutton', { name: 'Rok' }).fill(String(car.year));
  await page.getByRole('textbox', { name: 'VIN' }).fill(car.vin);
  await page.getByRole('spinbutton', { name: 'Cena' }).fill(String(car.price));
  await page.getByRole('spinbutton', { name: 'Moc' }).fill(String(car.horsePower));

  if (car.imagePath) {
    await page.locator('#image').setInputFiles(car.imagePath);
  }

  await page.getByRole('button', { name: 'Zapisz' }).click();
}

/**
 * Edytuje istniejący samochód.
 * @param page - instancja Playwright Page
 * @param carLocator - locator karty samochodu
 * @param editData - dane do edycji
 */
export async function editCar(page: Page, carLocator: Locator, editData: EditCarData): Promise<void> {
  await carLocator.getByRole('button', { name: 'Edytuj' }).click();

  if (editData.price !== undefined) {
    await page.getByRole('spinbutton', { name: 'Cena' }).fill(String(editData.price));
  }
  if (editData.year !== undefined) {
    await page.getByRole('spinbutton', { name: 'Rok' }).fill(String(editData.year));
  }

  await page.getByRole('button', { name: 'Zapisz' }).click();
}
