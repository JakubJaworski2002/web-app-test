import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CarService } from '../../services/car.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-dealer-dashboard',
  standalone: true,
  imports: [RouterModule, MatProgressSpinnerModule, DecimalPipe],
  templateUrl: './dealer-dashboard.component.html',
  styleUrls: ['./dealer-dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DealerDashboardComponent {
  private readonly carService = inject(CarService);
  private readonly notify = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isLoading = signal(true);

  readonly carsCount = this.carService.carsCount;
  readonly availableCarsCount = computed(() => this.carService.availableCars().length);
  readonly soldCars = computed(
    () => this.carService.carsSignal().filter(c => c.ownerId !== null).length
  );
  readonly rentedCars = computed(
    () => this.carService.carsSignal().filter(c => c.renterId !== null).length
  );
  readonly totalFleetValue = computed(() =>
    this.carService.carsSignal().reduce((sum, c) => sum + (c.price ?? 0), 0)
  );

  constructor() {
    this.carService
      .getCars()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.isLoading.set(false),
        error: () => {
          this.isLoading.set(false);
          this.notify.error('Nie udało się załadować danych floty.');
        },
      });
  }
}
