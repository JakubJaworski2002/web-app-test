import { Component, inject, Input } from '@angular/core';
import { Car, CarService } from '../../services/car.service';
import { MatDialog } from '@angular/material/dialog';
import { ShowCarForm } from '../show-car-form/show-car-form.component';
import { AuthenticationService } from '../../services/authentication.service';

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

  /**
   * @private
   * @property
   * @type {MatDialog}
   * @description
   * Serwis do otwierania okien dialogowych.
   */
  private dialog = inject(MatDialog);

  /**
   * @private
   * @property
   * @type {AuthenticationService}
   * @description
   * Usługa do zarządzania uwierzytelnianiem użytkowników.
   */
  private authService = inject(AuthenticationService);

  /**
   * @constructor
   * @description
   * Inicjalizuje komponent i subskrybuje strumień aktualnego użytkownika, aby ustawić flagę `isDealer` na podstawie danych użytkownika.
   */
  constructor() {
    // Subskrybuj strumień currentUser$
    this.authService.currentUser$.subscribe((user) => {
      this.isDealer = user?.isDealer ?? false; // Ustaw flagę na podstawie danych użytkownika
    });
  }

  /**
   * @method
   * @name editCar
   * @description
   * Aktualizuje dane samochodu za pomocą usługi `CarService`. Po pomyślnej aktualizacji wyświetla komunikat o sukcesie, w przeciwnym razie informuje o błędzie.
   *
   * @example
   * ```typescript
   * this.editCar();
   * ```
   */
  editCar() {
    this.carService.updateCar(this.car.id, this.car).subscribe(
      (updatedCar) => {
        console.log('Samochód zmodyfikowany:', updatedCar);
        alert('Samochód zmodyfikowany!');
      },
      (error) => {
        console.error('Błąd przy edytowaniu samochodu:', error);
        alert('Wystąpił błąd przy edytowaniu samochodu.');
      }
    );
  }

  /**
   * @method
   * @name openEditCarDialog
   * @description
   * Otwiera okno dialogowe z formularzem edycji samochodu. Po zamknięciu dialogu, jeśli wynik jest dostępny, aktualizuje dane samochodu i wywołuje metodę `editCar`.
   *
   * @example
   * ```typescript
   * this.openEditCarDialog();
   * ```
   */
  openEditCarDialog(): void {
    const dialogRef = this.dialog.open(ShowCarForm, {
      width: '600px',
      data: { ...this.car },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const { car, file } = result;

        // Aktualizuj dane samochodu w bazie
        this.carService.updateCar(car.id, car).subscribe(
          (updatedCar) => {
            console.log('Samochód zmodyfikowany:', updatedCar);

            // Jeśli dodano plik, wyślij go na serwer
            if (file) {
              this.carService.uploadCarImage(updatedCar.id, file).subscribe(() => {
                alert('Samochód i zdjęcie zostały zmodyfikowane!');
              });
            } else {
              alert('Samochód został zmodyfikowany!');
            }
          },
          (error) => {
            console.error('Błąd przy edytowaniu samochodu:', error);
            alert('Wystąpił błąd przy edytowaniu samochodu.');
          }
        );
      }
    });
  }
}
