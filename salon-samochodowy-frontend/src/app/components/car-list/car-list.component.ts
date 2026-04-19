import {
  ChangeDetectionStrategy, Component, computed,
  DestroyRef, effect, inject, signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { CarService, Car } from '../../services/car.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EditCarComponent } from '../edit-car/edit-car.component';
import { AuthenticationService } from '../../services/authentication.service';
import { RentCarComponent } from '../rent-car/rent-car.component';
import { CalculateLeasingComponent } from '../calculate-leasing/calculate-leasing.component';
import { BuyCarComponent } from '../buy-car/buy-car.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { NotificationService } from '../../services/notification.service';

@Component({
    selector: 'app-car-list',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
      CommonModule,
      FormsModule,
      EditCarComponent,
      RentCarComponent,
      CalculateLeasingComponent,
      BuyCarComponent,
      RouterModule,
      MatExpansionModule,
    ],
    templateUrl: './car-list.component.html',
    styleUrls: ['./car-list.component.css']
})
export class CarListComponent {
    // ─── Signals ──────────────────────────────────────────────────────────────
    private readonly carService  = inject(CarService);
    private readonly authService = inject(AuthenticationService);
    private readonly notify      = inject(NotificationService);
    private readonly destroyRef  = inject(DestroyRef);

    /** Stan sesji z AuthService jako signal */
    private readonly currentUser = toSignal(this.authService.currentUser$, { initialValue: null });

    readonly isDealer = computed(() => this.currentUser()?.isDealer ?? false);
    readonly logged   = computed(() => !!this.currentUser());
    readonly userId   = computed(() => this.currentUser()?.id ?? -1);

    // Samochody (signal reaktywny + imperatywne zarządzanie dla sortowania)
    private readonly _cars     = signal<Car[]>([]);
    readonly isLoading          = signal(true);
    readonly brandSearch        = signal('');

    // Posortowana tablica (imperatywna — użytkownik klika sort)
    private readonly _sorted   = signal<Car[]>([]);

    readonly filteredCars = computed(() =>
      this._sorted().filter(c =>
        c.brand.toLowerCase().includes(this.brandSearch().toLowerCase())
      )
    );

    readonly ownedCars  = computed(() =>
      this._cars().filter(c => c.ownerId === this.userId())
    );
    readonly rentedCars = computed(() =>
      this._cars().filter(c => c.renterId === this.userId())
    );

    priceSortDirection: 'asc' | 'desc'       = 'asc';
    horsePowerSortDirection: 'asc' | 'desc'  = 'asc';
    isCollapsedOwned  = true;
    isCollapsedRented = true;
    isCollapsedList   = true;

    constructor() {
        // Subskrypcja getCars() — automatyczne odsubskrybowanie przez DestroyRef
        this.carService.getCars()
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(cars => {
              this._cars.set(cars);
              this._sorted.set(cars.filter(c => c.ownerId == null));
              this.isLoading.set(false);
          });
    }

    // ─── Sorting ──────────────────────────────────────────────────────────────
    sortByPrice(): void {
        const dir = this.priceSortDirection;
        this._sorted.update(list =>
          [...list].sort((a, b) => dir === 'asc' ? a.price - b.price : b.price - a.price)
        );
        this.priceSortDirection      = dir === 'asc' ? 'desc' : 'asc';
        this.horsePowerSortDirection = 'asc';
    }

    sortByHorsePower(): void {
        const dir = this.horsePowerSortDirection;
        this._sorted.update(list =>
          [...list].sort((a, b) => dir === 'asc' ? a.horsePower - b.horsePower : b.horsePower - a.horsePower)
        );
        this.horsePowerSortDirection = dir === 'asc' ? 'desc' : 'asc';
        this.priceSortDirection      = 'asc';
    }

    // ─── Mutations ────────────────────────────────────────────────────────────
    deleteCar(id: number): void {
        if (!this.isDealer()) {
            this.notify.error('Nie masz uprawnień do usuwania samochodów.');
            return;
        }
        if (confirm('Czy na pewno chcesz usunąć ten samochód?')) {
            this.carService.deleteCar(id).subscribe({
                next: () => {
                    this._cars.update(list => list.filter(c => c.id !== id));
                    this._sorted.update(list => list.filter(c => c.id !== id));
                    this.notify.success('Samochód został usunięty.');
                },
                error: (err) => {
                    console.error('Błąd podczas usuwania samochodu:', err);
                    this.notify.error('Wystąpił błąd podczas usuwania samochodu.');
                }
            });
        }
    }

    onBrandSearchChange(value: string): void {
        this.brandSearch.set(value);
    }

    trackByCar(_index: number, car: Car): number { return car.id; }

    CollapseOwnedCar()  { this.isCollapsedOwned  = !this.isCollapsedOwned;  }
    CollapseRentedCar() { this.isCollapsedRented = !this.isCollapsedRented; }
    CollapseListCar()   { this.isCollapsedList   = !this.isCollapsedList;   }
}