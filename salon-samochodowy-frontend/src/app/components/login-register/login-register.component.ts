import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * LoginRegisterComponent umożliwia użytkownikom logowanie oraz rejestrację w aplikacji.
 *
 * @component
 */
@Component({
  selector: 'app-login-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-register.component.html',
  styleUrls: ['./login-register.component.css']
})
export class LoginRegisterComponent implements OnDestroy {
  
  isLoginMode: boolean = true;
  username: string = '';
  password: string = '';
  firstName: string = '';
  lastName: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  
  private destroy$: Subject<void> = new Subject<void>();

  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';
    this.successMessage = '';
    // Resetowanie pól formularza przy przełączaniu trybu
    this.username = '';
    this.password = '';
    this.firstName = '';
    this.lastName = '';
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      // Formularz jest nieprawidłowy, nie wykonuj żadnych akcji
      return;
    }

    if (this.isLoginMode) {
      this.authService.login(this.username, this.password)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.successMessage = response.message;
            this.router.navigate(['/']);
            this.closeModal(); // Zamknięcie modalu po sukcesie
          },
          error: (error) => {
            console.error('Nie udało się zalogować. Sprawdź login i hasło i spróbuj jeszcze raz:', error);
            // Dostosuj do struktury błędu zwracającego API
            this.errorMessage = error.error?.message || 'Nie udało się zalogować. Sprawdź login i hasło i spróbuj jeszcze raz';
          }
        });
    } else {
      this.authService.register(this.username, this.password, this.firstName, this.lastName)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.successMessage = response.message;
            // Opcjonalne automatyczne logowanie po rejestracji
            this.authService.login(this.username, this.password)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: () => {
                  this.router.navigate(['/']);
                  this.closeModal(); // Zamknięcie modalu po sukcesie
                },
                error: (error) => {
                  console.error('Błąd logowania po rejestracji:', error);
                  this.errorMessage = error.error?.message || 'Błąd logowania po rejestracji';
                }
              });
          },
          error: (error) => {
            console.error('Błąd rejestracji:', error);
            this.errorMessage = error.error?.message || 'Błąd rejestracji';
          }
        });
    }
  }

  logout(): void {
    this.authService.logout()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: () => {
          this.errorMessage = 'Nie udało się wylogować.';
        }
      });
  }

  closeModal(): void {
    const modalElement = document.getElementById('authModal');
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      } else {
        // Inicjalizacja modalu, jeśli nie jest jeszcze zainicjalizowany
        const newModal = new (window as any).bootstrap.Modal(modalElement);
        newModal.hide();
      }
    }
    // Resetowanie formularza
    this.username = '';
    this.password = '';
    this.firstName = '';
    this.lastName = '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
