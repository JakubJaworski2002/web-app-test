import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

/**
 * Interface reprezentująca użytkownika.
 */
export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  isDealer: boolean;
}

/**
 * AuthenticationService zarządza uwierzytelnianiem użytkowników, w tym rejestracją, logowaniem i wylogowywaniem.
 *
 * @injectable
 */
@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  /**
   * URL do backendu API.
   * Można rozważyć przeniesienie tego do pliku konfiguracyjnego.
   * @type {string}
   */
  private apiUrl: string = 'http://localhost:3000'; 

  /**
   * BehaviorSubject przechowujący bieżącego użytkownika.
   * Inicjalizowany jest jako null, gdy użytkownik nie jest zalogowany.
   * @type {BehaviorSubject<User | null>}
   */
  private currentUserSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);

  /**
   * Observable emitujący zmiany bieżącego użytkownika.
   * @type {Observable<User | null>}
   */
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  /**
   * Konstruktor serwisu.
   *
   * @param {HttpClient} http - Serwis HttpClient do wykonywania żądań HTTP.
   * @param {Router} router - Serwis Router do nawigacji między trasami.
   */
  constructor(private http: HttpClient, private router: Router) {
    this.checkCurrentUser();
  }

  /**
   * Sprawdza, czy użytkownik jest aktualnie zalogowany, wykonując żądanie do backendu.
   * Aktualizuje currentUserSubject na podstawie odpowiedzi.
   * Jeśli żądanie zakończy się błędem, ustawia currentUserSubject na null.
   */
  private checkCurrentUser(): void {
    this.http.get<{ user: User }>(`${this.apiUrl}/current-user`, { withCredentials: true })
      .pipe(
        tap(response => {
          this.currentUserSubject.next(response.user);
        }),
        catchError((error) => {
        //  console.warn('Brak zalogowanego użytkownika lub wystąpił błąd:', error);
          this.currentUserSubject.next(null);
          return throwError(error);
        })
      )
      .subscribe({
        next: () => {},
        error: () => {} 
      });
  }

  /**
   * Rejestruje nowego użytkownika.
   *
   * @param {string} username - Nazwa użytkownika.
   * @param {string} password - Hasło użytkownika.
   * @param {string} firstName - Imię użytkownika.
   * @param {string} lastName - Nazwisko użytkownika.
   * @returns {Observable<any>} Observable emitujący odpowiedź z backendu.
   */
  register(username: string, password: string, firstName: string, lastName: string): Observable<any> {
    return this.http.post<{ user: User }>(
      `${this.apiUrl}/register`,
      { username, password, firstName, lastName },
      { withCredentials: true }
    ).pipe(
      tap(response => {
        if (response.user) {
          this.currentUserSubject.next(response.user);
        }
      }),
      catchError(this.handleError) 
    );
  }

  /**
   * Loguje użytkownika.
   *
   * @param {string} username - Nazwa użytkownika.
   * @param {string} password - Hasło użytkownika.
   * @returns {Observable<any>} Observable emitujący odpowiedź z backendu.
   */
  login(username: string, password: string): Observable<any> {
    return this.http.post<{ user: User }>(
      `${this.apiUrl}/login`,
      { username, password },
      { withCredentials: true }
    ).pipe(
      tap(response => {
        if (response.user) {
          this.currentUserSubject.next(response.user);
        }
      }),
      catchError(this.handleError) 
    );
  }

  /**
   * Wylogowuje aktualnie zalogowanego użytkownika.
   *
   * @returns {Observable<any>} Observable emitujący odpowiedź z backendu.
   */
  logout(): Observable<any> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/logout`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(() => {
        this.currentUserSubject.next(null);
        this.router.navigate(['/']); // Przekierowanie na stronę główną po wylogowaniu
      }),
      catchError(this.handleError) // Przekazanie błędu do handlera
    );
  }

  /**
   * Metoda pomocnicza do sprawdzania, czy użytkownik jest zalogowany.
   *
   * @returns {boolean} true jeśli użytkownik jest zalogowany, w przeciwnym razie false.
   */
  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  /**
   * Pobiera bieżącego użytkownika jako User lub null.
   *
   * @returns {User | null} Aktualny użytkownik lub null jeśli nie jest zalogowany.
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Handler do obsługi błędów HTTP.
   *
   * @param {HttpErrorResponse} error - Błąd HTTP.
   * @returns {Observable<never>} Observable z wyrzuconym błędem.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
   // console.error('Błąd w AuthenticationService:', error);
    return throwError(error);
  }
}
