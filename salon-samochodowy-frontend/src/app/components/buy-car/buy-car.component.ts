import { Component, inject, Input } from '@angular/core';
import { CarService, Car } from '../../services/car.service';
import { NotificationService } from '../../services/notification.service';

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
  @Input() car!: Car;

  private notify = inject(NotificationService);

  constructor(private carService: CarService) {}

  buyCar(): void {
    if (!this.car) {
      this.notify.error('Samochód nie został wybrany.');
      return;
    }

    if (!confirm(`Czy na pewno chcesz kupić samochód ${this.car.brand} ${this.car.model}?`)) {
      return;
    }

    this.carService.buyCar(this.car.id).subscribe({
      next: () => {
        this.notify.success(`Zakup samochodu ${this.car.brand} ${this.car.model} zakończony sukcesem!`);
      },
      error: (err) => {
        console.error('Błąd zakupu samochodu:', err);
        this.notify.error('Wystąpił błąd podczas zakupu samochodu.');
      }
    });
  }
}
