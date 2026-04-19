import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { CarService, Car } from '../../services/car.service';
import { AuthenticationService, User } from '../../services/authentication.service';
import { Subscription } from 'rxjs';
import { BuyCarComponent } from '../buy-car/buy-car.component';
import { RentCarComponent } from '../rent-car/rent-car.component';
import { CalculateLeasingComponent } from '../calculate-leasing/calculate-leasing.component';
import { EditCarComponent } from '../edit-car/edit-car.component';

/**
 * CarDetailComponent wyświetla szczegółowe informacje o wybranym samochodzie.
 *
 * @component
 */
@Component({
  selector: 'app-car-detail',
  standalone: true,
  imports: [CommonModule, BuyCarComponent, RentCarComponent, CalculateLeasingComponent, EditCarComponent],
  templateUrl: './car-detail.component.html',
  styleUrls: ['./car-detail.component.css'],
})
export class CarDetailComponent implements OnInit, OnDestroy {

  /**
   * Obiekt reprezentujący szczegółowe informacje o samochodzie.
   * @type {Car | undefined}
   */
  car?: Car;

  /** Czy samochód nie posiada zdjęcia. */
  noImage = false;

  /** Czy użytkownik jest zalogowany. */
  isLoggedIn = false;

  /** Czy zalogowany użytkownik jest dealerem. */
  isDealer = false;

  private routeSubscription?: Subscription;
  private authSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private carService: CarService,
    private authService: AuthenticationService
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.params.subscribe(params => {
      const carId = Number(params['id']);
      if (!isNaN(carId)) {
        this.fetchCarDetails(carId);
      } else {
        console.error('Nieprawidłowy identyfikator samochodu:', params['id']);
      }
    });

    this.authSubscription = this.authService.currentUser$.subscribe((user: User | null) => {
      this.isLoggedIn = user !== null;
      this.isDealer = user?.isDealer ?? false;
    });
  }

  /** Navigates back in browser history. */
  goBack(): void {
    this.location.back();
  }

  /** Deletes the current car after confirmation and redirects to the car list. */
  deleteCar(): void {
    if (this.car && confirm(`Czy na pewno chcesz usunąć samochód ${this.car.brand} ${this.car.model}?`)) {
      this.carService.deleteCar(this.car.id).subscribe(() => {
        this.router.navigate(['/cars']);
      });
    }
  }

  private fetchCarDetails(carId: number): void {
    this.carService.getCar(carId).subscribe(
      (car: Car) => {
        this.car = car;
        this.noImage = !car?.image;
      },
      (error) => {
        console.error('Błąd podczas pobierania szczegółów samochodu:', error);
      }
    );
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.authSubscription?.unsubscribe();
  }
}
