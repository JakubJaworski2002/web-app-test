import { Component } from '@angular/core';
import { CarListComponent } from './components/car-list/car-list.component';
import { AddCarComponent } from "./components/add-car/add-car.component";
import { CustomerListComponent } from './components/customer-list/customer-list.component';
import { AddCustomerComponent } from './components/add-customer/add-customer.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { RouterModule } from '@angular/router'; 
import { AuthInterceptor } from './auth.interceptor'; 
import { HTTP_INTERCEPTORS } from '@angular/common/http';

/**
 * AppComponent jest głównym komponentem aplikacji, zarządzającym podstawową strukturą i nawigacją.
 *
 * @component
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    AddCarComponent,
    NavbarComponent,
    RouterModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [
    /**
     * Rejestracja AuthInterceptor jako HTTP_INTERCEPTORS.
     * Umożliwia to dodawanie `withCredentials: true` do wszystkich żądań HTTP.
     */
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
})
export class AppComponent {
  /**
   * Tytuł aplikacji.
   * @type {string}
   */
  title: string = 'salon-samochodowy-frontend';
}
