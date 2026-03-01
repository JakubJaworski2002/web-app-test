import { Component, Input, TemplateRef, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Car, LeasingRequest, LeasingResponse, CarService } from '../../services/car.service';
import { AuthenticationService } from '../../services/authentication.service';
import { Subscription } from 'rxjs';

/**
 * CalculateLeasingComponent umożliwia obliczenie warunków leasingu dla wybranego samochodu.
 * 
 * @component
 */
@Component({
  selector: 'calculate-leasing',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './calculate-leasing.component.html',
  styleUrls: ['./calculate-leasing.component.css']
})
export class CalculateLeasingComponent {
  
  /**
   * Obiekt reprezentujący samochód, dla którego obliczany jest leasing.
   * @type {Car}
   */
  @Input() car: Car = {
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
   * Obiekt przechowujący dane żądania leasingowego.
   * @type {LeasingRequest}
   */
  lRequest: LeasingRequest = {
    downPayment: 0,
    months: 0
  };

  /**
   * Obiekt przechowujący odpowiedź z serwisu leasingowego.
   * @type {LeasingResponse}
   */
  lResponse: LeasingResponse = {
    carId: 0,
    carBrand: '',
    carModel: '',
    totalPrice: 0,
    downPayment: 0,
    remainingAmount: '',
    months: 0,
    monthlyRate: ''
  };

  /**
   * Referencja do szablonu dialogu leasingowego.
   * @type {TemplateRef<any>}
   */
  @ViewChild("Leasingdialog") Leasingdialog!: TemplateRef<any>;

  /**
   * Referencja do szablonu podsumowania leasingu.
   * @type {TemplateRef<any>}
   */
  @ViewChild("LeasingSummary") LeasingSummary!: TemplateRef<any>;

  /** 
   * Serwis do zarządzania samochodami.
   */
  private carService = inject(CarService);

  /**
   * Serwis do zarządzania dialogami.
   */
  private dialog = inject(MatDialog);

  /**
   * Flaga określająca, czy aktualnie zalogowany użytkownik jest dealerem.
   * @type {boolean}
   */
  isDealer = false;

  /**
   * Serwis uwierzytelniania.
   */
  private authService = inject(AuthenticationService);

  /**
   * Subskrypcja na strumień aktualnego użytkownika.
   * @type {Subscription}
   */
  private userSubscription: Subscription;

  /**
   * Konstruktor komponentu. Inicjalizuje subskrypcję na aktualnego użytkownika.
   */
  constructor() {
    this.userSubscription = this.authService.currentUser$.subscribe((user) => {
      this.isDealer = user?.isDealer ?? false; // Ustaw flagę na podstawie danych użytkownika
    });
  }

  /**
   * Metoda obliczająca warunki leasingu na podstawie danych wejściowych.
   * Otwiera dialog z podsumowaniem leasingu po pomyślnym obliczeniu.
   */
  calculate(): void {  
    this.carService.leaseCar(this.car.id, this.lRequest).subscribe(
      (leasingData: LeasingResponse) => {
        this.lResponse = leasingData;
        console.log('Leasing wyliczony:', leasingData);
        this.dialog.open(this.LeasingSummary, {
          width: '600px',
          data: this.lResponse,
        });
      },
      (error) => {
        console.error('Błąd przy wyliczeniu leasingu:', error);
        alert('Wystąpił błąd przy wyliczaniu leasingu.');
      }
    );
  }

  /**
   * Metoda otwierająca dialog do wprowadzania danych leasingowych.
   * Po zamknięciu dialogu, aktualizuje informacje o samochodzie, jeśli użytkownik zatwierdził zmiany.
   */
  openLeasingDialog(): void {
    const dialogRef = this.dialog.open(this.Leasingdialog, {
      width: '600px',
      data: this.car,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.car = result;
      }
    });
  }

  /**
   * Metoda zamykająca wszystkie otwarte dialogi.
   */
  closeDialog(): void {
    this.dialog.closeAll();
  }

  /**
   * Metoda czyszcząca subskrypcje przy niszczeniu komponentu.
   */
  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }
}
