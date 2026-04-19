import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-register.component.html',
  styleUrls: ['./login-register.component.css']
})
export class LoginRegisterComponent implements OnInit, OnDestroy {
  
  isLoginMode: boolean = true;
  errorMessage: string = '';
  successMessage: string = '';

  loginForm!: FormGroup;
  registerForm!: FormGroup;
  
  private destroy$: Subject<void> = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const passwordValidators = [
      Validators.required,
      Validators.minLength(6),
      Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).+$/)
    ];
    const usernameValidators = [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(30)
    ];

    this.loginForm = this.fb.group({
      username: ['', usernameValidators],
      password: ['', passwordValidators]
    });

    this.registerForm = this.fb.group({
      username: ['', usernameValidators],
      email: ['', [Validators.required, Validators.email]],
      password: ['', passwordValidators],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  get activeForm(): FormGroup {
    return this.isLoginMode ? this.loginForm : this.registerForm;
  }

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';
    this.successMessage = '';
    this.loginForm.reset();
    this.registerForm.reset();
  }

  onSubmit(): void {
    const form = this.activeForm;
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    if (this.isLoginMode) {
      const { username, password } = this.loginForm.value;
      this.authService.login(username, password)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.successMessage = response.message;
            this.router.navigate(['/']);
            this.closeModal();
          },
          error: (error) => {
            console.error('Nie udało się zalogować. Sprawdź login i hasło i spróbuj jeszcze raz:', error);
            this.errorMessage = error.error?.message || 'Nie udało się zalogować. Sprawdź login i hasło i spróbuj jeszcze raz';
          }
        });
    } else {
      const { username, email, password, firstName, lastName } = this.registerForm.value;
      this.authService.register(username, email, password, firstName, lastName)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.successMessage = response.message;
            this.authService.login(username, password)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: () => {
                  this.router.navigate(['/']);
                  this.closeModal();
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
    this.loginForm.reset();
    this.registerForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
