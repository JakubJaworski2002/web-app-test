import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CarService, Car } from '../../services/car.service';
import { Subscription } from 'rxjs';

/**
 * CarDetailComponent wyświetla szczegółowe informacje o wybranym samochodzie.
 *
 * @component
 */
@Component({
  selector: 'app-car-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="car">
      <h2>{{ car.brand }} {{ car.model }}</h2>
      <p><strong>Rok:</strong> {{ car.year }}</p>
      <p><strong>Moc:</strong> {{ car.horsePower }} KM</p>
      <p><strong>VIN:</strong> {{ car.vin }}</p>
      <p><strong>Cena:</strong> {{ car.price | currency: 'PLN' }}</p>
      <p>
        <strong>Dostępny do wynajmu:</strong>
        <span [ngClass]="car.isAvailableForRent ? 'text-success' : 'text-danger'">
          {{ car.isAvailableForRent ? 'Tak' : 'Nie' }}
        </span>
      </p>
    </div>
  `,
  styleUrls: ['./car-detail.component.css'],
})
export class CarDetailComponent implements OnInit {
  
  /**
   * Obiekt reprezentujący szczegółowe informacje o samochodzie.
   * @type {Car | undefined}
   */
  car?: Car;

  /**
   * Subskrypcja na parametry trasy, umożliwiająca odsubskrybowanie w przypadku konieczności.
   * @type {Subscription}
   */
  private routeSubscription?: Subscription;

  /**
   * Konstruktor komponentu.
   *
   * @param {ActivatedRoute} route - Serwis umożliwiający dostęp do informacji o aktualnie aktywnej trasie.
   * @param {CarService} carService - Serwis do zarządzania danymi samochodów.
   */
  constructor(
    private route: ActivatedRoute,
    private carService: CarService
  ) {}

  /**
   * Metoda inicjalizacyjna wywoływana po utworzeniu komponentu.
   * Pobiera identyfikator samochodu z parametrów trasy i ładuje jego szczegóły.
   */
  ngOnInit(): void {
    this.routeSubscription = this.route.params.subscribe(params => {
      const carId = Number(params['id']);
      if (!isNaN(carId)) {
        this.fetchCarDetails(carId);
      } else {
        console.error('Nieprawidłowy identyfikator samochodu:', params['id']);
      }
    });
  }

  /**
   * Metoda pobierająca szczegółowe informacje o samochodzie na podstawie jego identyfikatora.
   *
   * @param {number} carId - Unikalny identyfikator samochodu.
   */
  private fetchCarDetails(carId: number): void {
    this.carService.getCar(carId).subscribe(
      (car: Car) => {
        this.car = car;
      },
      (error) => {
        console.error('Błąd podczas pobierania szczegółów samochodu:', error);
        // Można tutaj dodać obsługę błędów, np. wyświetlenie komunikatu użytkownikowi
      }
    );
  }

  /**
   * Metoda czyszcząca subskrypcje przy niszczeniu komponentu, aby zapobiec wyciekom pamięci.
   */
  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }
}
