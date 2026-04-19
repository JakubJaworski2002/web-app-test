# Angular Signals — Plan Migracji State Management

## Obecny Stan (BehaviorSubject)

```typescript
// authentication.service.ts — OBECNA implementacja
@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private currentUserSubject = new BehaviorSubject<any>(null);
    currentUser$ = this.currentUserSubject.asObservable();
    
    setCurrentUser(user: any) { this.currentUserSubject.next(user); }
    logout() { this.currentUserSubject.next(null); }
}
```

## Docelowy Stan (Angular Signals)

```typescript
// authentication.service.ts — NOWA implementacja
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

export interface User {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    isDealer: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private http = inject(HttpClient);
    
    // Prywatny writable signal
    private _user = signal<User | null>(null);
    
    // Publiczne computed signals (readonly)
    readonly currentUser = this._user.asReadonly();
    readonly isLoggedIn = computed(() => this._user() !== null);
    readonly isDealer = computed(() => this._user()?.isDealer ?? false);
    readonly userId = computed(() => this._user()?.id ?? -1);
    readonly displayName = computed(() => {
        const u = this._user();
        return u ? `${u.firstName} ${u.lastName}` : '';
    });
    
    // Backward compat (dla komponentów korzystających z currentUser$)
    // USUŃ po migracji wszystkich komponentów
    readonly currentUser$ = toObservable(this._user);
    
    login(credentials: { username: string; password: string }) {
        return this.http.post<{ user: User }>('/login', credentials).pipe(
            tap(res => this._user.set(res.user))
        );
    }
    
    logout() {
        return this.http.post('/logout', {}).pipe(
            tap(() => this._user.set(null))
        );
    }
    
    checkSession() {
        return this.http.get<User>('/current-user').pipe(
            tap(user => this._user.set(user))
        );
    }
}
```

## Migracja Komponentów

```typescript
// car-list.component.ts — PRZED (RxJS)
this.authService.currentUser$.subscribe(user => {
    this.isDealer = user?.isDealer ?? false;
});

// car-list.component.ts — PO (Signals)
// Nie potrzeba subscribe — czytamy signal bezpośrednio
protected isDealer = this.authService.isDealer; // computed signal
protected isLoggedIn = this.authService.isLoggedIn;

// W template:
// <button *ngIf="isDealer()">Dodaj Samochód</button>
// Lub z effect():
```

```typescript
// Kiedy potrzebujesz reagować na zmiany w komponencie:
import { effect } from '@angular/core';

export class CarListComponent {
    constructor() {
        effect(() => {
            const user = this.authService.currentUser();
            if (user) {
                this.loadUserCars(user.id);
            }
        });
    }
}
```

## Strategia Migracji (Inkrementalna)

```
Sprint 3 — Krok po Kroku:

1. Dodaj Signals do AuthenticationService (zachowaj currentUser$ jako alias)
2. Zmigruj NavbarComponent (najprostszy — tylko wyświetla user info)
3. Zmigruj CarListComponent (najbardziej złożony — zrób na końcu)
4. Usuń currentUser$ alias po migracji wszystkich komponentów
```
