import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';

/**
 * Interface reprezentująca samochód.
 */
export interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  vin: string;
  price: number;
  horsePower: number;
  ownerId: number;
  renterId: number;
  isAvailableForRent: boolean;
  image?: string;
}

/**
 * Interface reprezentujący wypożyczającego samochód.
 */
export interface CarRenter {
  carId: number;
  renterId: number;
}

/**
 * Interface reprezentujący żądanie leasingowe.
 */
export interface LeasingRequest {
  downPayment: number;
  months: number;
}

/**
 * Interface reprezentujący odpowiedź na żądanie leasingowe.
 */
export interface LeasingResponse {
  carId: number;
  carBrand: string;
  carModel: string;
  totalPrice: number;
  downPayment: number;
  remainingAmount: string;
  months: number;
  monthlyRate: string;
}

/**
 * CarService zarządza operacjami związanymi z samochodami, takimi jak pobieranie, dodawanie, edytowanie, usuwanie, wypożyczanie, zwracanie, leasingowanie i zakup samochodów.
 *
 * @injectable
 */
@Injectable({
  providedIn: 'root'
})
export class CarService {
  /**
   * URL do backendu API dla operacji związanych z samochodami.
   * Można rozważyć przeniesienie tego do pliku konfiguracyjnego.
   * @type {string}
   */
  private apiUrl: string = 'http://localhost:3000/cars';
  
  /**
   * BehaviorSubject przechowujący bieżącą listę samochodów.
   * Inicjalizowany jest jako pusta tablica.
   * @type {BehaviorSubject<Car[]>}
   */
  private carsSubject: BehaviorSubject<Car[]> = new BehaviorSubject<Car[]>([]);
  
  /**
   * Observable emitujący zmiany listy samochodów.
   * @type {Observable<Car[]>}
   */
  public cars$: Observable<Car[]> = this.carsSubject.asObservable();

  /**
   * Konstruktor serwisu CarService.
   *
   * @param {HttpClient} http - Serwis HttpClient do wykonywania żądań HTTP.
   */
  constructor(private http: HttpClient) { 
    this.loadInitialData();
  }

  /**
   * Metoda ładowania początkowych danych samochodów z backendu.
   * Aktualizuje BehaviorSubject `carsSubject` z pobranymi danymi.
   */
  private loadInitialData(): void {
    this.http.get<Car[]>(this.apiUrl, { withCredentials: true })
      .pipe(
        catchError(error => {
          console.error('Error loading cars:', error);
          return of([]); 
        })
      )
      .subscribe(
        (cars) => this.carsSubject.next(cars)
      );
  }

  /**
   * Pobiera listę wszystkich samochodów.
   *
   * @returns {Observable<Car[]>} Observable emitujący listę samochodów.
   */
  getCars(): Observable<Car[]> {
    return this.cars$;
  }

  /**
   * Pobiera szczegółowe informacje o samochodzie na podstawie jego identyfikatora.
   *
   * @param {number} carId - Unikalny identyfikator samochodu.
   * @returns {Observable<Car>} Observable emitujący szczegółowe informacje o samochodzie.
   */
  getCar(carId: number): Observable<Car> {
    return this.http.get<Car>(`${this.apiUrl}/${carId}`, { withCredentials: true })
      .pipe(
        catchError(error => {
          console.error(`Error fetching car with ID ${carId}:`, error);
          return of(null as any); 
        })
      );
  }

  /**
   * Dodaje nowy samochód do systemu.
   *
   * @param {Car} newCar - Obiekt reprezentujący nowy samochód.
   * @returns {Observable<Car>} Observable emitujący dodany samochód.
   */
  addCar(newCar: Car): Observable<Car> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<Car>(this.apiUrl, newCar, { headers, withCredentials: true })
      .pipe(
        tap((car: Car) => {
          const currentCars = this.carsSubject.getValue();
          this.carsSubject.next([...currentCars, car]);
        }),
        catchError(error => {
          console.error('Error adding car:', error);
          return of(null as any); 
        })
      );
  }
  uploadCarImage(carId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);

    return this.http.post(`${this.apiUrl}/${carId}/upload`, formData, { withCredentials: true })
      .pipe(
        catchError(error => {
          console.error(`Error uploading image for car ID ${carId}:`, error);
          return of(null);
        })
      );
}


  /**
   * Aktualizuje informacje o istniejącym samochodzie.
   *
   * @param {number} id - Unikalny identyfikator samochodu do aktualizacji.
   * @param {Car} updatedCar - Obiekt reprezentujący zaktualizowane informacje o samochodzie.
   * @returns {Observable<Car>} Observable emitujący zaktualizowany samochód.
   */
  updateCar(id: number, updatedCar: Car): Observable<Car> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<Car>(`${this.apiUrl}/${id}`, updatedCar, { headers, withCredentials: true })
      .pipe(
        tap((car: Car) => {
          const currentCars = this.carsSubject.getValue();
          const index = currentCars.findIndex(c => c.id === id);
          if (index !== -1) {
            currentCars[index] = car;
            this.carsSubject.next([...currentCars]);
          }
        }),
        catchError(error => {
          console.error(`Error updating car with ID ${id}:`, error);
          return of(null as any); 
        })
      );
  }

  /**
   * Usuwa samochód z systemu na podstawie jego identyfikatora.
   *
   * @param {number} id - Unikalny identyfikator samochodu do usunięcia.
   * @returns {Observable<void>} Observable emitujący `void` po zakończeniu operacji.
   */
  deleteCar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { withCredentials: true })
      .pipe(
        tap(() => {
          const currentCars = this.carsSubject.getValue();
          const updatedCars = currentCars.filter(car => car.id !== id);
          this.carsSubject.next(updatedCars);
        }),
        catchError(error => {
          console.error(`Error deleting car with ID ${id}:`, error);
          return of(null as any); 
        })
      );
  }

  /**
   * Wypożycza samochód na podstawie jego identyfikatora.
   *
   * @param {number} carId - Unikalny identyfikator samochodu do wypożyczenia.
   * @returns {Observable<any>} Observable emitujący odpowiedź serwera.
   */
  rentCar(carId: number): Observable<any> {
    const url = `${this.apiUrl}/${carId}/rent`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(url, {}, { headers, withCredentials: true })
      .pipe(
        tap(() => {
          this.refreshCar(carId);
        }),
        catchError(error => {
          console.error(`Error renting car with ID ${carId}:`, error);
          return of(null as any); 
        })
      );
  }

  /**
   * Zwraca wypożyczony samochód na podstawie jego identyfikatora.
   *
   * @param {number} carId - Unikalny identyfikator samochodu do zwrotu.
   * @returns {Observable<any>} Observable emitujący odpowiedź serwera.
   */
  returnCar(carId: number): Observable<any> {
    const url = `${this.apiUrl}/${carId}/return`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(url, {}, { headers, withCredentials: true })
      .pipe(
        tap(() => {
          this.refreshCar(carId);
        }),
        catchError(error => {
          console.error(`Error returning car with ID ${carId}:`, error);
          return of(null as any); 
        })
      );
  }

  /**
   * Pobiera identyfikator wypożyczającego samochód na podstawie jego identyfikatora.
   *
   * @param {number} carId - Unikalny identyfikator samochodu.
   * @returns {Observable<CarRenter>} Observable emitujący identyfikator wypożyczającego.
   */
  getRenterId(carId: number): Observable<CarRenter> {
    const url = `${this.apiUrl}/${carId}/renter`;
    return this.http.get<CarRenter>(url, { withCredentials: true })
      .pipe(
        catchError(error => {
          console.error(`Error fetching renter for car ID ${carId}:`, error);
          return of({ carId, renterId: 0 } as CarRenter); 
        })
      );
  }  

  /**
   * Tworzy leasing dla samochodu na podstawie jego identyfikatora i danych leasingowych.
   *
   * @param {number} carId - Unikalny identyfikator samochodu.
   * @param {LeasingRequest} leasingData - Dane dotyczące leasingu.
   * @returns {Observable<LeasingResponse>} Observable emitujący odpowiedź na żądanie leasingowe.
   */
  leaseCar(carId: number, leasingData: LeasingRequest): Observable<LeasingResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<LeasingResponse>(`${this.apiUrl}/${carId}/leasing`, leasingData, { headers, withCredentials: true })
      .pipe(
        tap(() => {
          this.refreshCar(carId);
        }),
        catchError(error => {
          console.error(`Error leasing car with ID ${carId}:`, error);
          return of(null as any); 
        })
      );
  }

  /**
   * Kupuje samochód na podstawie jego identyfikatora.
   *
   * @param {number} carId - Unikalny identyfikator samochodu do zakupu.
   * @returns {Observable<any>} Observable emitujący odpowiedź serwera.
   */
  buyCar(carId: number): Observable<any> {
    const url = `${this.apiUrl}/${carId}/buy`; 
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(url, {}, { headers, withCredentials: true })
      .pipe(
        tap(() => {
          this.refreshCar(carId);
        }),
        catchError(error => {
          console.error(`Error buying car with ID ${carId}:`, error);
          return of(null as any); 
        })
      );
  }

  /**
   * Pomocnicza metoda do odświeżania danych pojedynczego samochodu po operacjach takich jak wypożyczenie, zwrot, leasing czy zakup.
   *
   * @param {number} carId - Unikalny identyfikator samochodu do odświeżenia.
   */
  private refreshCar(carId: number): void {
    this.http.get<Car>(`${this.apiUrl}/${carId}`, { withCredentials: true })
      .pipe(
        catchError(error => {
          console.error(`Error refreshing car with ID ${carId}:`, error);
          return of(null as any); 
        })
      )
      .subscribe(
        (updatedCar) => {
          if (updatedCar) {
            const currentCars = this.carsSubject.getValue();
            const index = currentCars.findIndex(c => c.id === carId);
            if (index !== -1) {
              currentCars[index] = updatedCar;
              this.carsSubject.next([...currentCars]);
            }
          }
        }
      );
  }
}
