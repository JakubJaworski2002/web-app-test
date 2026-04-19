import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../services/notification.service';

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
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.css'],
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
    buy: 'badge-buy', rent: 'badge-rent', leasing: 'badge-leasing', return: 'badge-return',
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
