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
import { CarService } from './services/car.service';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-dealer-dashboard',
  standalone: true,
  imports: [RouterModule, MatProgressSpinnerModule, DecimalPipe],
  template: `
<div class="container py-4">
  @if (isLoading()) {
    <div class="d-flex justify-content-center py-5">
      <mat-spinner diameter="56"></mat-spinner>
    </div>
  } @else {
    <div class="mb-4">
      <h1 style="font-size:1.75rem;font-weight:700">
        <i class="bi bi-speedometer2 me-2"></i>Panel Dealera — Statystyki floty
      </h1>
      <p class="text-muted">Przegląd aktualnego stanu floty samochodów.</p>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="p-3 rounded border bg-white d-flex align-items-center gap-3" style="box-shadow:0 1px 3px rgba(0,0,0,.08)">
          <div class="d-flex align-items-center justify-content-center rounded-circle" style="width:56px;height:56px;background:#e3f2fd;color:#1565c0;font-size:1.6rem">
            <i class="bi bi-car-front"></i>
          </div>
          <div>
            <div style="font-size:.85rem;color:#6c757d">Wszystkie auta</div>
            <div style="font-size:1.75rem;font-weight:700">{{ carsCount() }}</div>
          </div>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="p-3 rounded border bg-white d-flex align-items-center gap-3" style="box-shadow:0 1px 3px rgba(0,0,0,.08)">
          <div class="d-flex align-items-center justify-content-center rounded-circle" style="width:56px;height:56px;background:#e8f5e9;color:#2e7d32;font-size:1.6rem">
            <i class="bi bi-check-circle"></i>
          </div>
          <div>
            <div style="font-size:.85rem;color:#6c757d">Dostępne do wynajmu</div>
            <div style="font-size:1.75rem;font-weight:700">{{ availableCarsCount() }}</div>
          </div>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="p-3 rounded border bg-white d-flex align-items-center gap-3" style="box-shadow:0 1px 3px rgba(0,0,0,.08)">
          <div class="d-flex align-items-center justify-content-center rounded-circle" style="width:56px;height:56px;background:#ffebee;color:#c62828;font-size:1.6rem">
            <i class="bi bi-bag-check"></i>
          </div>
          <div>
            <div style="font-size:.85rem;color:#6c757d">Sprzedane</div>
            <div style="font-size:1.75rem;font-weight:700">{{ soldCars() }}</div>
          </div>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="p-3 rounded border bg-white d-flex align-items-center gap-3" style="box-shadow:0 1px 3px rgba(0,0,0,.08)">
          <div class="d-flex align-items-center justify-content-center rounded-circle" style="width:56px;height:56px;background:#fff3e0;color:#e65100;font-size:1.6rem">
            <i class="bi bi-key"></i>
          </div>
          <div>
            <div style="font-size:.85rem;color:#6c757d">Wynajęte</div>
            <div style="font-size:1.75rem;font-weight:700">{{ rentedCars() }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="d-flex align-items-center gap-3 p-4 rounded mb-4" style="background:var(--primary-color,#3f51b5);color:#fff;box-shadow:0 4px 12px rgba(0,0,0,.15)">
      <i class="bi bi-currency-exchange" style="font-size:2.4rem;opacity:.85"></i>
      <div>
        <div style="font-size:.85rem;opacity:.85">Wartość floty</div>
        <div style="font-size:1.75rem;font-weight:700">{{ totalFleetValue() | number:'1.0-0' }} PLN</div>
      </div>
    </div>

    <div class="p-3 rounded border bg-white" style="box-shadow:0 1px 3px rgba(0,0,0,.08)">
      <h2 style="font-size:1.1rem;font-weight:600;margin-bottom:.75rem">Szybkie akcje</h2>
      <a routerLink="/cars" class="btn btn-outline-primary">
        <i class="bi bi-list-ul me-1"></i>Lista samochodów
      </a>
    </div>
  }
</div>
  `,
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
