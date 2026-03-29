import { Page, Locator, expect } from '@playwright/test';

export interface CarData {
  brand: string;
  model: string;
  year: number;
  vin: string;
  price: number;
  horsePower: number;
  isAvailableForRent?: boolean;
  imagePath?: string;
}

export interface EditCarData {
  price?: number;
  year?: number;
}

export async function addCar(page: Page, car: CarData): Promise<void> {
  await page.getByRole('button', { name: 'Dodaj Samochód' }).click();

  const form = page.locator('.add-car-form').last();
  await expect(form).toBeVisible({ timeout: 10000 });

  await form.locator('#brand').fill(car.brand);
  await form.locator('#model').fill(car.model);
  await form.locator('#year').fill(String(car.year));
  const sanitizedVin = sanitizeVin(car.vin);
  await form.locator('#vin').fill(sanitizedVin);
  await form.locator('#price').fill(String(car.price));
  await form.locator('#horsePower').fill(String(car.horsePower));

  const isAvailableForRent = car.isAvailableForRent ?? true;
  const availabilityCheckbox = form.locator('#isAvailableForRent');
  if (isAvailableForRent) {
    await availabilityCheckbox.check();
  } else {
    await availabilityCheckbox.uncheck();
  }

  if (car.imagePath) {
    await form.locator('#image').setInputFiles(car.imagePath);
  }

  const saveButton = form.getByRole('button', { name: 'Zapisz' });
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

export async function editCar(page: Page, carLocator: Locator, editData: EditCarData): Promise<void> {
  await carLocator.getByRole('button', { name: 'Edytuj' }).click();

  const form = page.locator('.add-car-form').last();
  await expect(form).toBeVisible({ timeout: 10000 });

  if (editData.price !== undefined) {
    await form.locator('#price').fill(String(editData.price));
  }
  if (editData.year !== undefined) {
    await form.locator('#year').fill(String(editData.year));
  }

  await form.getByRole('button', { name: 'Zapisz' }).click();
}

