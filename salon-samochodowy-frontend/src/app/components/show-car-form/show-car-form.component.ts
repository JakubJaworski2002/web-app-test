import { Component, Inject, Input } from '@angular/core';
import { Car } from '../../services/car.service';
import { FormBuilder, FormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {ReactiveFormsModule, FormControl, FormGroup} from '@angular/forms';

/**
 * @module ShowCarForm
 * @description
 * Komponent odpowiedzialny za wyświetlanie formularza samochodu w oknie dialogowym. Umożliwia dodawanie nowych samochodów poprzez wypełnienie formularza.
 */
@Component({
  selector: 'show-car-form',
  standalone: true,
  imports: [FormsModule,ReactiveFormsModule],
  templateUrl: './show-car-form.component.html',
  styleUrls: ['./show-car-form.component.css'],
})
export class ShowCarForm {
  showcarform: FormGroup;
  /**
   * @input
   * @type {Car}
   * @description
   * Obiekt reprezentujący samochód do wyświetlenia lub edycji w formularzu. Zawiera wszystkie niezbędne informacje o samochodzie.
   */
  @Input() car: Car = {
    id: 0,
    ownerId: 0,
    renterId: 0,
    brand: '',
    model: '',
    year: 0,
    vin: '',
    price: 0,
    horsePower: 0,
    isAvailableForRent: true,
  };
  selectedFile: File | null = null;

  /**
   * @constructor
   * @param {MatDialogRef<ShowCarForm>} dialogRef - Referencja do okna dialogowego, umożliwiająca kontrolę nad jego stanem.
   * @param {Car} data - Dane samochodu przekazane do komponentu przez okno dialogowe.
   * @description
   * Inicjalizuje komponent, przypisując przekazane dane do właściwości `car`.
   */
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ShowCarForm>,
    @Inject(MAT_DIALOG_DATA) data: Car
  ) {
    Object.assign(this.car, data);
    this.showcarform = this.fb.group({
      brand: [this.car.brand, Validators.required],
      model: [this.car.model, Validators.required],
      year: [this.car.year, [Validators.required, Validators.min(1886), Validators.max(new Date().getFullYear())]],
      vin: [this.car.vin,[Validators.required, Validators.pattern(/^[A-HJ-NPR-Z0-9]{17}$/)]],//Dozwolone znaki w walidacji: Duże litery od A do Z z wyłączeniem I oraz O oraz liczby
      price:[this.car.price, [Validators.required, Validators.min(0)]],
      horsePower: [this.car.horsePower, [Validators.required, Validators.min(1)]],
      isAvailableForRent: [this.car.isAvailableForRent]
    })
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
        this.selectedFile = input.files[0];
    }
}

  /**
   * @method
   * @name addCar
   * @description
   * Zamyka okno dialogowe i przekazuje zaktualizowany obiekt `car` do komponentu otwierającego dialog. Umożliwia to dodanie nowego samochodu lub aktualizację istniejącego.
   *
   * @example
   * ```typescript
   * this.addCar();
   * ```
   */
  addCar(): void {
    this.car.brand = this.showcarform.get('brand')!.value;
    this.car.model = this.showcarform.get('model')!.value;
    this.car.year = this.showcarform.get('year')!.value;
    this.car.vin = this.showcarform.get('vin')!.value;
    this.car.price = this.showcarform.get('price')!.value;
    this.car.horsePower = this.showcarform.get('horsePower')!.value;
    this.car.isAvailableForRent = this.showcarform.get('isAvailableForRent')!.value;
    console.log(this.car)
    if (this.selectedFile) {
        this.dialogRef.close({ car: this.car, file: this.selectedFile });
    } else {
        this.dialogRef.close({ car: this.car, file: null });
    }
}

  /**
   * @method
   * @name closeDialog
   * @description
   * Zamyka okno dialogowe bez przekazywania żadnych danych. Używane, gdy użytkownik zdecyduje się anulować operację.
   *
   * @example
   * ```typescript
   * this.closeDialog();
   * ```
   */
  closeDialog(): void {
    this.dialogRef.close();
  }
}
