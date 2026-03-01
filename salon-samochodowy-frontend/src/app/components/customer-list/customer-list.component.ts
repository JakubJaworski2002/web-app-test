import { Component, OnInit, OnDestroy } from '@angular/core';
import { CustomerService, Customer } from '../../services/customer.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

/**
 * CustomerListComponent wyświetla listę klientów pobranych z serwisu CustomerService.
 *
 * @component
 */
@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.css']
})
export class CustomerListComponent implements OnInit, OnDestroy {
  
  /**
   * Lista klientów pobrana z serwisu CustomerService.
   * @type {Customer[]}
   */
  customers: Customer[] = [];
  
  /**
   * Przechowuje komunikaty o błędach występujących podczas pobierania danych.
   * @type {string}
   */
  error: string = '';
  
  /**
   * Subskrypcja na strumień pobierania klientów, umożliwiająca odsubskrybowanie w metodzie ngOnDestroy.
   * @type {Subscription | undefined}
   */
  private customersSubscription?: Subscription;

  /**
   * Konstruktor komponentu.
   *
   * @param {CustomerService} customerService - Serwis do zarządzania danymi klientów.
   */
  constructor(private customerService: CustomerService) { }

  /**
   * Metoda inicjalizacyjna wywoływana po utworzeniu komponentu.
   * Inicjuje pobieranie listy klientów.
   */
  ngOnInit(): void {
    this.fetchCustomers();
  }

  /**
   * Metoda pobierająca listę klientów z serwisu CustomerService.
   * Subskrybuje się na strumień zwracany przez metodę getCustomers.
   * Obsługuje dane zwrócone oraz ewentualne błędy.
   */
  fetchCustomers(): void {
    this.customersSubscription = this.customerService.getCustomers().subscribe({
      next: (data: Customer[]) => {
        this.customers = data;
        this.error = ''; // Resetowanie błędu w przypadku sukcesu
      },
      error: (err: any) => {
        console.error('Błąd podczas pobierania klientów:', err);
        this.error = 'Wystąpił błąd podczas pobierania listy klientów.';
      }
    });
  }

  /**
   * Metoda czyszcząca subskrypcje przy niszczeniu komponentu, aby zapobiec wyciekom pamięci.
   */
  ngOnDestroy(): void {
    this.customersSubscription?.unsubscribe();
  }
}
