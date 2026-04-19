import { ChangeDetectionStrategy, Component, OnDestroy, Input, inject } from '@angular/core';
import { Car, CarRenter, CarService } from '../../services/car.service';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthenticationService } from '../../services/authentication.service';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { NotificationService } from '../../services/notification.service';

/**
 * RentCarComponent umożliwia użytkownikom wypożyczanie oraz zwracanie samochodów.
 *
 * @component
 */
@Component({
  selector: 'app-rent-car',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './rent-car.component.html',
  styleUrls: ['./rent-car.component.css']
})
export class RentCarComponent implements OnDestroy {
  
  /**
   * Obiekt reprezentujący samochód do wypożyczenia.
   * @type {Car}
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
    isAvailableForRent: true
  };

  /**
   * Obiekt reprezentujący wypożyczającego samochód.
   * @type {CarRenter}
   */
  renter: CarRenter = {
    carId: 0,
    renterId: 0
  };

  /**
   * Flaga określająca, czy aktualnie zalogowany użytkownik jest wypożyczającym ten samochód.
   * @type {Observable<boolean>}
   */
  isRenter$: Observable<boolean>;

  /**
   * Subject używany do zarządzania subskrypcjami i zapobiegania wyciekom pamięci.
   * @type {Subject<void>}
   */
  private destroy$ = new Subject<void>();

  private carService = inject(CarService);
  private authService = inject(AuthenticationService);
  private notify = inject(NotificationService);

  constructor() {
    this.isRenter$ = combineLatest([
      this.authService.currentUser$,
      this.carService.getRenterId(this.car.id)
    ]).pipe(
      map(([user, renter]) => user?.id === renter.renterId)
    );
  }

  rentCar(): void {
    this.carService.rentCar(this.car.id).pipe(takeUntil(this.destroy$)).subscribe(
      (carId: number) => {
        console.log('Wypożyczono samochód o id:', carId);
        this.notify.success('Samochód został wypożyczony');
        this.car.isAvailableForRent = false;
      },
      (error: any) => {
        console.error('Błąd przy wypożyczaniu samochodu:', error);
        this.notify.error('Wystąpił błąd przy wypożyczaniu samochodu.');
      }
    );
  }

  returnCar(): void {
    this.carService.returnCar(this.car.id).pipe(takeUntil(this.destroy$)).subscribe(
      (carId: number) => {
        console.log('Zwrócono samochód o id:', carId);
        this.notify.success('Samochód został zwrócony');
        this.car.isAvailableForRent = true;
      },
      (error: any) => {
        console.error('Błąd przy zwracaniu samochodu:', error);
        this.notify.error('Wystąpił błąd przy zwracaniu samochodu.');
      }
    );
  }

  /**
   * Metoda czyszcząca subskrypcje przy niszczeniu komponentu, aby zapobiec wyciekom pamięci.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
