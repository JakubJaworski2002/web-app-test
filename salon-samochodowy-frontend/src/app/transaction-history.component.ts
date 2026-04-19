import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from './services/notification.service';

export interface TransactionCar {
  brand: string;
  model: string;
  year: number;
  price: number;
}

export interface Transaction {
  id: number;
  type: 'rent' | 'return' | 'leasing' | 'buy';
  CarId: number;
  UserId: number;
  createdAt: string;
  Car: TransactionCar;
}

@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="container mt-4">
  <h2 class="mb-4">
    <i class="bi bi-clock-history me-2"></i>Historia transakcji
  </h2>

  @if (isLoading) {
    <div class="d-flex justify-content-center align-items-center py-5">
      <div class="text-center">
        <div class="spinner-border text-primary" role="status" style="width:3rem;height:3rem">
          <span class="visually-hidden">Ładowanie...</span>
        </div>
        <p class="mt-3 text-muted">Ładowanie historii transakcji...</p>
      </div>
    </div>
  }

  @if (!isLoading && transactions.length === 0) {
    <div class="text-center py-5">
      <i class="bi bi-receipt" style="font-size:4rem;color:#ccc"></i>
      <h4 class="mt-3 text-muted">Brak transakcji</h4>
      <p class="text-muted">Nie masz jeszcze żadnych transakcji w swoim koncie.</p>
    </div>
  }

  @if (!isLoading && transactions.length > 0) {
    <div class="table-responsive" style="border-radius:.5rem;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">
      <table class="table table-striped table-hover align-middle mb-0">
        <thead class="table-dark">
          <tr>
            <th>Data</th>
            <th>Typ</th>
            <th>Samochód</th>
            <th>Kwota</th>
          </tr>
        </thead>
        <tbody>
          @for (tx of transactions; track tx.id) {
            <tr>
              <td>{{ formatDate(tx.createdAt) }}</td>
              <td>
                <span class="badge" [ngClass]="typeBadgeClass[tx.type]">
                  {{ typeLabels[tx.type] }}
                </span>
              </td>
              <td>
                @if (tx.Car) {
                  {{ tx.Car.brand }} {{ tx.Car.model }} ({{ tx.Car.year }})
                } @else {
                  <span class="text-muted">—</span>
                }
              </td>
              <td>
                @if (tx.Car) { {{ formatPrice(tx.Car.price) }} }
                @else { <span class="text-muted">—</span> }
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  }
</div>
  `,
  styles: [`
    .badge { padding: .4em .75em; border-radius: .375rem; font-size: .85em; font-weight: 600; }
    .buy     { background-color: #28a745; color: #fff; }
    .rent    { background-color: #0d6efd; color: #fff; }
    .leasing { background-color: #fd7e14; color: #fff; }
    .return  { background-color: #6c757d; color: #fff; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionHistoryComponent implements OnInit {
  private http = inject(HttpClient);
  private notify = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  transactions: Transaction[] = [];
  isLoading = true;

  readonly typeLabels: Record<Transaction['type'], string> = {
    buy: 'Zakup', rent: 'Wynajem', leasing: 'Leasing', return: 'Zwrot',
  };

  readonly typeBadgeClass: Record<Transaction['type'], string> = {
    buy: 'buy', rent: 'rent', leasing: 'leasing', return: 'return',
  };

  ngOnInit(): void {
    this.http
      .get<Transaction[]>('http://localhost:3000/api/v1/transactions', { withCredentials: true })
      .subscribe({
        next: (data) => {
          this.transactions = data;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.notify.error('Nie udało się pobrać historii transakcji.');
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(price);
  }

  formatDate(dateStr: string): string {
    return new Intl.DateTimeFormat('pl-PL', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(dateStr));
  }
}
