import { Injectable, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, of, Subject, throwError } from 'rxjs';
import { tap, switchMap, catchError, takeUntil } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthenticationService, User } from './authentication.service';

/**
 * Interface reprezentująca klienta.
 */
export interface Customer {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  isDealer: boolean;
}

/**
 * Interface reprezentująca dane nowego klienta.
 */
export interface NewCustomer {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

/**
 * CustomerService zarządza operacjami związanymi z klientami, takimi jak pobieranie, dodawanie klientów.
 *
 * @injectable
 */
@Injectable({
  providedIn: 'root'
})
export class CustomerService implements OnDestroy {
  /**
   * URL do backendu API.
   * Można rozważyć przeniesienie tego do pliku konfiguracyjnego.
   * @type {string}
   */
  private apiUrl: string = 'http://localhost:3000';

  /**
   * BehaviorSubject przechowujący listę klientów.
   * Inicjalizowany jako pusty array.
   * @type {BehaviorSubject<Customer[]>}
   */
  private customersSubject: BehaviorSubject<Customer[]> = new BehaviorSubject<Customer[]>([]);

  /**
   * Observable emitujący zmiany w liście klientów.
   * @type {Observable<Customer[]>}
   */
  public customers$: Observable<Customer[]> = this.customersSubject.asObservable();

  /**
   * Subject używany do zarządzania subskrypcjami i zapobiegania wyciekom pamięci.
   * @type {Subject<void>}
   */
  private destroy$: Subject<void> = new Subject<void>();

  /**
   * Konstruktor serwisu.
   *
   * @param {HttpClient} http - Serwis HttpClient do wykonywania żądań HTTP.
   * @param {AuthenticationService} authService - Serwis uwierzytelniania użytkowników.
   */
  constructor(
    private http: HttpClient,
    private authService: AuthenticationService
  ) {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user && user.isDealer) {
          this.loadInitialData();
        } else {
          this.customersSubject.next([]);
        }
      });
  }

  /**
   * Metoda pobierająca początkowe dane klientów z backendu.
   * Aktualizuje BehaviorSubject `customersSubject` z pobranymi danymi.
   *
   * @private
   */
  private loadInitialData(): void {
    this.http.get<Customer[]>(`${this.apiUrl}/users`, { withCredentials: true })
      .pipe(
        catchError(error => {
          console.error('Error loading customers:', error);
          return of([]); 
        })
      )
      .subscribe(
        (customers: Customer[]) => this.customersSubject.next(customers)
      );
  }

  /**
   * Metoda zwracająca Observable emitujące listę klientów.
   *
   * @returns {Observable<Customer[]>} Observable emitujące listę klientów.
   */
  getCustomers(): Observable<Customer[]> {
    return this.customers$;
  }

  /**
   * Metoda dodająca nowego klienta poprzez wysłanie żądania POST do backendu.
   * Po pomyślnym dodaniu klienta, aktualizuje BehaviorSubject `customersSubject`.
   *
   * @param {NewCustomer} newCustomer - Obiekt zawierający dane nowego klienta.
   * @returns {Observable<{ message: string, user: Customer }>} Observable zawierający odpowiedź z serwera.
   */
  addCustomer(newCustomer: NewCustomer): Observable<{ message: string, user: Customer }> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<{ message: string, user: Customer }>(
      `${this.apiUrl}/admin/create-customer`, 
      newCustomer, 
      { headers, withCredentials: true }
    ).pipe(
      tap(response => {
        if (response.user) {
          const currentCustomers = this.customersSubject.getValue();
          this.customersSubject.next([...currentCustomers, response.user]);
        }
      }),
      catchError(error => {
        console.error('Error adding customer:', error);
        return throwError(error); 
      })
    );
  }

  /**
   * Metoda czyszcząca subskrypcje przy zniszczeniu serwisu, aby zapobiec wyciekom pamięci.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
