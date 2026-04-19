import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Car, CarService } from '../../services/car.service';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ShowCarForm } from '../show-car-form/show-car-form.component';
import { NotificationService } from '../../services/notification.service';

/**
 * Komponent odpowiedzialny za dodawanie nowego samochodu do systemu.
 * 
 * @remarks
 * Ten komponent umożliwia użytkownikowi wprowadzenie danych nowego samochodu
 * oraz zapisanie go za pomocą serwisu `CarService`. 
 * 
 * @example
 * ```html
 * <app-add-car></app-add-car>
 * ```
 */
@Component({
  selector: 'app-add-car',
  standalone: true,  
  imports: [MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,  
  templateUrl: './add-car.component.html',
  styleUrls: ['./add-car.component.css']
})
export class AddCarComponent {
  
  /**
   * Obiekt reprezentujący samochód, który ma zostać dodany.
   */
  car: Car = {
    id: 0,
    ownerId: 0,
    renterId: 0,
    brand: '',
    model: '',
    year: 0,
    vin: '',
    price: 0,
    horsePower: 0,
    isAvailableForRent: true
  };
  
  private dialog = inject(MatDialog);
  private carService = inject(CarService);
  private notify = inject(NotificationService);

openAddCarDialog(): void {
    const dialogRef = this.dialog.open(ShowCarForm, {
        width: '600px',
        data: { ...this.car },
    });

    dialogRef.afterClosed().subscribe(result => {
        if (result) {
            const { car, file } = result;
            this.carService.addCar(car).subscribe(newCar => {
                if (file) {
                    this.carService.uploadCarImage(newCar.id, file).subscribe(() => {
                        this.notify.success('Samochód i zdjęcie zostały dodane!');
                    });
                } else {
                    this.notify.success('Samochód został dodany!');
                }
            }, () => {
                this.notify.error('Wystąpił błąd przy dodawaniu samochodu.');
            });
        }
    });
}
}
