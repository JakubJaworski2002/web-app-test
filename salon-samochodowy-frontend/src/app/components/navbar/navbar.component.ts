import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginRegisterComponent } from '../login-register/login-register.component';
import { AuthenticationService } from '../../services/authentication.service';
import { Subscription } from 'rxjs';


import { CustomerListComponent } from '../customer-list/customer-list.component';
import { AddCustomerComponent } from '../add-customer/add-customer.component';
import { MatDialog } from '@angular/material/dialog';
import { Car, CarService } from '../../services/car.service';
import { ShowCarForm } from '../show-car-form/show-car-form.component';

/**
 * @module NavbarComponent
 * @description
 * Komponent nawigacyjny aplikacji, odpowiedzialny za wyświetlanie paska nawigacji, zarządzanie autoryzacją użytkowników oraz operacje związane z samochodami.
 *
 * ## Przykład użycia
 * ```html
 * <app-navbar></app-navbar>
 * ```
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    LoginRegisterComponent,
    CustomerListComponent,
    AddCustomerComponent,
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnDestroy {
  
  /**
   * @property
   * @type {any}
   * @description
   * Obiekt reprezentujący aktualnie zalogowanego użytkownika. Może zawierać różne informacje o użytkowniku.
   */
  currentUser: any = null;

  /**
   * @private
   * @property
   * @type {Subscription}
   * @description
   * Subskrypcja strumienia aktualnego użytkownika, używana do odsubskrybowania w metodzie `ngOnDestroy`.
   */
  private userSubscription: Subscription;

  /**
   * @property
   * @type {Car}
   * @description
   * Obiekt reprezentujący samochód do dodania. Zawiera wszystkie niezbędne informacje o samochodzie.
   */
  car: Car = {
    id: 0,
    ownerId: 0,
    renterId: 0,
    brand: '',
    model: '',
    year: 0,
    vin: '',
    price: 0,
    horsePower: 0,
    isAvailableForRent: true,
  };

  /**
   * @constructor
   * @param {AuthenticationService} authService - Usługa do zarządzania uwierzytelnianiem użytkowników.
   * @param {MatDialog} dialog - Serwis do otwierania okien dialogowych.
   * @param {CarService} carService - Usługa do zarządzania danymi samochodów.
   * @description
   * Inicjalizuje komponent, subskrybuje strumień aktualnego użytkownika i ustawia właściwość `currentUser`.
   */
  constructor(
    private authService: AuthenticationService,
    private dialog: MatDialog,
    private carService: CarService
  ) {
    this.userSubscription = this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  /**
   * @method
   * @name openAuthModal
   * @description
   * Otwiera modalne okno logowania/rejestracji użytkownika przy użyciu Bootstrap Modal.
   *
   * @example
   * ```typescript
   * this.openAuthModal();
   * ```
   */
  openAuthModal() {
    const modalElement = document.getElementById('authModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  /**
   * @method
   * @name logout
   * @description
   * Wylogowuje aktualnie zalogowanego użytkownika za pomocą usługi `AuthenticationService`. Po pomyślnym wylogowaniu odświeża stronę. W przypadku błędu wyświetla odpowiedni komunikat.
   *
   * @example
   * ```typescript
   * this.logout();
   * ```
   */
  logout() {
    this.authService.logout().subscribe({
      next: () => {
        window.location.reload(); 
      },
      error: (error) => {
        console.error('Błąd podczas wylogowywania:', error);
        alert('Nie udało się wylogować. Spróbuj ponownie.');
      },
    });
  }

  /**
   * @method
   * @name ngOnDestroy
   * @description
   * Metoda cyklu życia Angular, wywoływana tuż przed zniszczeniem komponentu. Używana do zwolnienia zasobów, takich jak subskrypcje.
   */
  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }

  /**
   * @method
   * @name addCar
   * @description
   * Dodaje nowy samochód za pomocą usługi `CarService`. Po pomyślnym dodaniu wyświetla komunikat o sukcesie, w przeciwnym razie informuje o błędzie.
   *
   * @example
   * ```typescript
   * this.addCar();
   * ```
   */
  addCar() {
    this.carService.addCar(this.car).subscribe(
      (newCar) => {
        console.log('Nowy samochód dodany:', newCar);
        alert('Samochód został dodany!');
      },
      (error) => {
        console.error('Błąd przy dodawaniu samochodu:', error);
        alert('Wystąpił błąd przy dodawaniu samochodu.');
      }
    );
  }

  /**
   * @method
   * @name openAddCarDialog
   * @description
   * Otwiera okno dialogowe z formularzem dodawania samochodu. Po zamknięciu dialogu, jeśli wynik jest dostępny, aktualizuje obiekt `car` i wywołuje metodę `addCar`.
   *
   * @example
   * ```typescript
   * this.openAddCarDialog();
   * ```
   */
  openAddCarDialog(): void {
    const dialogRef = this.dialog.open(ShowCarForm, {
        width: '600px',
        data: { ...this.car },
    });

    dialogRef.afterClosed().subscribe(result => {
        if (result) {
            const { car, file } = result;
            this.carService.addCar(car).subscribe(newCar => {
                if (file) {
                    this.carService.uploadCarImage(newCar.id, file).subscribe(() => {
                        alert('Samochód i zdjęcie zostały dodane!');
                    });
                } else {
                    alert('Samochód został dodany1!');
                    console.log(car);
                }
            });
        }
    });
}
}
