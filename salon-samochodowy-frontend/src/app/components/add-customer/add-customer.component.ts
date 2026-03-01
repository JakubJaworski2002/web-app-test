import { Component } from '@angular/core';
import { CustomerService, NewCustomer } from '../../services/customer.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Komponent służący do dodawania nowych klientów.
 * Umożliwia wprowadzenie danych klienta oraz dodanie go do systemu.
 * 
 * @example
 * <app-add-customer></app-add-customer>
 */
@Component({
  selector: 'app-add-customer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-customer.component.html',
  styleUrls: ['./add-customer.component.css']
})
export class AddCustomerComponent {
  /**
   * Obiekt reprezentujący dane nowego klienta.
   * @property {string} username Nazwa użytkownika
   * @property {string} password Hasło
   * @property {string} firstName Imię
   * @property {string} lastName Nazwisko
   */
  newCustomer: NewCustomer = {
    username: '',
    password: '',
    firstName: '',
    lastName: ''
  };

  /**
   * Komunikat wyświetlany po pomyślnym dodaniu klienta.
   */
  successMessage: string = '';

  /**
   * Komunikat wyświetlany w przypadku błędu podczas dodawania klienta.
   */
  errorMessage: string = '';

  /**
   * Inicjuje komponent i wstrzykuje serwis do obsługi klientów.
   * @param {CustomerService} customerService Serwis do operacji na klientach
   */
  constructor(private customerService: CustomerService) { }

  /**
   * Dodaje nowego klienta na podstawie wprowadzonych danych.
   * Waliduje pola oraz wyświetla odpowiedni komunikat o powodzeniu lub błędzie.
   * 
   * @returns {void}
   */
  addCustomer(): void {
    // Walidacja danych wejściowych
    if (!this.newCustomer.username || !this.newCustomer.password || 
        !this.newCustomer.firstName || !this.newCustomer.lastName) {
      this.errorMessage = 'Proszę wypełnić wszystkie pola.';
      this.successMessage = '';
      return;
    }

    // Wywołanie serwisu do dodania klienta
    this.customerService.addCustomer(this.newCustomer).subscribe({
      next: (response) => {
        this.successMessage = `Klient ${response.user.firstName} ${response.user.lastName} został dodany.`;
        this.errorMessage = '';
        // Resetowanie formularza
        this.newCustomer = { username: '', password: '', firstName: '', lastName: '' };
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Wystąpił błąd podczas dodawania klienta.';
        this.successMessage = '';
      }
    });
  }
}
