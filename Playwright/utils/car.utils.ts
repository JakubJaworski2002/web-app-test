import { Page, Locator, expect } from '@playwright/test';

export interface CarData {
  brand: string;
  model: string;
  year: number;
  vin: string;
  price: number;
  horsePower: number;
  isAvailableForRent?: boolean;
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
  const sanitizedVin = sanitizeVin(car.vin);
  await page.getByRole('textbox', { name: 'VIN' }).fill(sanitizedVin);
  await page.getByRole('spinbutton', { name: 'Cena' }).fill(String(car.price));
  await page.getByRole('spinbutton', { name: 'Moc' }).fill(String(car.horsePower));

  const isAvailableForRent = car.isAvailableForRent ?? true;
  const availabilityCheckbox = page.locator('#isAvailableForRent');
  if (isAvailableForRent) {
    await availabilityCheckbox.check();
  } else {
    await availabilityCheckbox.uncheck();
  }

  if (car.imagePath) {
    await page.locator('#image').setInputFiles(car.imagePath);
  }

  const saveButton = page.getByRole('button', { name: 'Zapisz' });
  await expect(saveButton).toBeEnabled({ timeout: 10000 });
  await saveButton.click();
}

function sanitizeVin(rawVin: string): string {
  let vin = rawVin.toUpperCase().replace(/[^A-Z0-9]/g, '');
  vin = vin.replace(/[IO]/g, 'X');
  if (vin.length < 17) {
    vin = vin.padEnd(17, 'X');
  } else if (vin.length > 17) {
    vin = vin.slice(0, 17);
  }
  return vin;
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
