import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationService {
    private snackBar = inject(MatSnackBar);

    private defaultConfig: MatSnackBarConfig = {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
    };

    success(message: string): void {
        this.snackBar.open(message, '✕', {
            ...this.defaultConfig,
            panelClass: ['snack-success'],
        });
    }

    error(message: string): void {
        this.snackBar.open(message, '✕', {
            ...this.defaultConfig,
            duration: 5000,
            panelClass: ['snack-error'],
        });
    }

    info(message: string): void {
        this.snackBar.open(message, '✕', {
            ...this.defaultConfig,
            panelClass: ['snack-info'],
        });
    }
}
