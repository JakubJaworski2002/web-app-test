import { Component, OnInit } from '@angular/core';
import { CarService, Car } from '../../services/car.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EditCarComponent } from '../edit-car/edit-car.component';
import { AuthenticationService } from '../../services/authentication.service';
import { RentCarComponent } from '../rent-car/rent-car.component';
import { CalculateLeasingComponent } from '../calculate-leasing/calculate-leasing.component';
import { BuyCarComponent } from '../buy-car/buy-car.component';
import { combineLatest } from 'rxjs';
import {MatExpansionModule} from '@angular/material/expansion';

@Component({
    selector: 'app-car-list',
    standalone: true,
    imports: [
      CommonModule,
      FormsModule,
      EditCarComponent,
      RentCarComponent,
      CalculateLeasingComponent,
      BuyCarComponent,
      RouterModule
    ],
    templateUrl: './car-list.component.html',
    styleUrls: ['./car-list.component.css']
})
export class CarListComponent implements OnInit {
    isDealer = false;
    logged = false;
    userId = -1;
    brandserch = "";
    cars: Car[] = [];
    ownedCars: Car[] = [];
    rentedCars: Car[] = [];
    sortedCars: Car[] = [];
    filteredCars: Car[] = [];
    priceSortDirection: 'asc' | 'desc' = 'asc';
    horsePowerSortDirection: 'asc' | 'desc' = 'asc';
    isCollapsedOwned = true;
    isCollapsedRented = true;
    isCollapsedList = true;

    constructor(
      private carService: CarService,
      private authService: AuthenticationService
    ) { }

    ngOnInit(): void {
        // Połączenie strumieni użytkownika i samochodów
        combineLatest([
            this.authService.currentUser$,
            this.carService.getCars()
        ]).subscribe(([user, cars]) => {
            this.isDealer = user?.isDealer ?? false;
            this.logged = !!user;
            this.userId = user?.id ?? -1;
            this.cars = cars;

            // Aktualizacja ownedCars
            if (this.logged) {
                this.ownedCars = this.cars.filter(car => car.ownerId === this.userId);
                this.rentedCars = this.cars.filter(car => car.renterId === this.userId);
            } else {
                this.ownedCars = [];
                this.rentedCars = [];
            }

            if (this.logged) {
                
            } else {
                
            }

            // Filtracja i sortowanie samochodów dostępnych do wynajmu
            this.sortedCars = this.cars.filter(car => car.ownerId == null);
            this.filterCars();
        });
    }
    

    sortByPrice(): void {
        if (this.priceSortDirection === 'asc') {
            this.sortedCars.sort((a, b) => a.price - b.price);
            this.priceSortDirection = 'desc';
        } else {
            this.sortedCars.sort((a, b) => b.price - a.price);
            this.priceSortDirection = 'asc';
        }
        // Resetowanie sortowania mocy, jeśli jest aktywne
        this.horsePowerSortDirection = 'asc';
        this.filterCars(); // Aktualizacja listy po sortowaniu
    }

    sortByHorsePower(): void {
        if (this.horsePowerSortDirection === 'asc') {
            this.sortedCars.sort((a, b) => a.horsePower - b.horsePower);
            this.horsePowerSortDirection = 'desc';
        } else {
            this.sortedCars.sort((a, b) => b.horsePower - a.horsePower);
            this.horsePowerSortDirection = 'asc';
        }
        // Resetowanie sortowania ceny, jeśli jest aktywne
        this.priceSortDirection = 'asc';
        this.filterCars(); // Aktualizacja listy po sortowaniu
    }

    deleteCar(id: number): void {
        if (!this.isDealer) {
            alert('Nie masz uprawnień do usuwania samochodów.');
            return;
        }

        if (confirm('Czy na pewno chcesz usunąć ten samochód?')) {
            this.carService.deleteCar(id).subscribe(
                () => {
                    this.cars = this.cars.filter((car) => car.id !== id);
                    this.sortedCars = this.sortedCars.filter((car) => car.id !== id);
                    this.ownedCars = this.ownedCars.filter((car) => car.id !== id);
                    this.filterCars(); // Aktualizacja po usunięciu samochodu
                    alert('Samochód został usunięty.');
                },
                (error) => {
                    console.error('Błąd podczas usuwania samochodu:', error);
                    alert('Wystąpił błąd podczas usuwania samochodu.');
                }
            );
        }
    }

    onBrandSearchChange(): void {
        this.filterCars(); // Filtracja samochodów przy każdej zmianie w polu wyszukiwania
    }

    filterCars(): void {
        this.filteredCars = this.sortedCars.filter(car =>
            car.brand.toLowerCase().includes(this.brandserch.toLowerCase())
        );
    }
    CollapseOwnedCar() {
        this.isCollapsedOwned = !this.isCollapsedOwned;
    }
    CollapseRentedCar() {
        this.isCollapsedRented = !this.isCollapsedRented;
    }
    CollapseListCar() {
        this.isCollapsedList = !this.isCollapsedList;
    }
}