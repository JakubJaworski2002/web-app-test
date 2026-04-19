import { Component, inject, Input } from '@angular/core';
import { Car, CarService } from '../../services/car.service';
import { MatDialog } from '@angular/material/dialog';
import { ShowCarForm } from '../show-car-form/show-car-form.component';
import { AuthenticationService } from '../../services/authentication.service';
import { NotificationService } from '../../services/notification.service';

/**
 * @module EditCarComponent
 * @description
 * Komponent odpowiedzialny za edycję informacji o samochodzie. Umożliwia użytkownikom dealerom modyfikowanie danych samochodu oraz otwieranie formularza edycji w oknie dialogowym.
 *
 * ## Przykład użycia
 * ```html
 * <edit-car [car]="selectedCar"></edit-car>
 * ```
 */
@Component({
  selector: 'edit-car',
  imports: [],
  templateUrl: './edit-car.component.html',
  styleUrl: './edit-car.component.css'
})
export class EditCarComponent {
  
  /**
   * @input
   * @type {Car}
   * @description
   * Obiekt reprezentujący samochód do edycji. Zawiera wszystkie niezbędne informacje o samochodzie.
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

  /**
   * @property
   * @type {boolean}
   * @description
   * Flaga określająca, czy aktualnie zalogowany użytkownik jest dealerem.
   */
  isDealer = false;

  /**
   * @private
   * @property
   * @type {CarService}
   * @description
   * Usługa do zarządzania danymi samochodów.
   */
  private carService = inject(CarService);
  private dialog = inject(MatDialog);
  private authService = inject(AuthenticationService);
  private notify = inject(NotificationService);

  constructor() {
    this.authService.currentUser$.subscribe((user) => {
      this.isDealer = user?.isDealer ?? false;
    });
  }

  editCar() {
    this.carService.updateCar(this.car.id, this.car).subscribe(
      (updatedCar) => {
        console.log('Samochód zmodyfikowany:', updatedCar);
        this.notify.success('Samochód zmodyfikowany!');
      },
      (error) => {
        console.error('Błąd przy edytowaniu samochodu:', error);
        this.notify.error('Wystąpił błąd przy edytowaniu samochodu.');
      }
    );
  }

  openEditCarDialog(): void {
    const dialogRef = this.dialog.open(ShowCarForm, {
      width: '600px',
      data: { ...this.car },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const { car, file } = result;
        this.carService.updateCar(car.id, car).subscribe(
          (updatedCar) => {
            if (file) {
              this.carService.uploadCarImage(updatedCar.id, file).subscribe(() => {
                this.notify.success('Samochód i zdjęcie zostały zmodyfikowane!');
              });
            } else {
              this.notify.success('Samochód został zmodyfikowany!');
            }
          },
          (error) => {
            console.error('Błąd przy edytowaniu samochodu:', error);
            this.notify.error('Wystąpił błąd przy edytowaniu samochodu.');
          }
        );
      }
    });
  }
}
