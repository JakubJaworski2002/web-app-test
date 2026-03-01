import { Component, Input } from '@angular/core';
import { CarService, Car } from '../../services/car.service';

/**
 * Komponent umożliwiający zakup wybranego samochodu.
 * Wyświetla przycisk zakupu oraz komunikaty informujące o powodzeniu lub błędzie operacji.
 *
 * @example
 * <app-buy-car [car]="wybranySamochód"></app-buy-car>
 */
@Component({
  selector: 'app-buy-car',
  standalone: true,
  templateUrl: './buy-car.component.html',
  styleUrls: ['./buy-car.component.css']
})
export class BuyCarComponent {
  /**
   * Samochód, który ma zostać kupiony.
   * @property {Car} car Obiekt reprezentujący wybrany samochód
   */
  @Input() car!: Car;

  /**
   * Inicjuje komponent z wstrzykniętym serwisem do obsługi samochodów.
   * @param {CarService} carService Serwis do operacji na samochodach
   */
  constructor(private carService: CarService) {}

  /**
   * Dokonuje próby zakupu wybranego samochodu.
   * Wyświetla okno dialogowe z potwierdzeniem, a po udanym zakupie - komunikat o powodzeniu.
   * W przypadku błędu wyświetlany jest odpowiedni komunikat.
   *
   * @returns {void}
   */
  buyCar(): void {
    if (!this.car) {
      alert('Samochód nie został wybrany.');
      return;
    }

    if (!confirm(`Czy na pewno chcesz kupić samochód ${this.car.brand} ${this.car.model}?`)) {
      return;
    }

    this.carService.buyCar(this.car.id).subscribe({
      next: () => {
        alert(`Zakup samochodu ${this.car.brand} ${this.car.model} zakończony sukcesem!`);
      },
      error: (err) => {
        console.error('Błąd zakupu samochodu:', err);
        alert('Wystąpił błąd podczas zakupu samochodu.');
      }
    });
  }
}
