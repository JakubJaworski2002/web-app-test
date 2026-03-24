import { Page } from '@playwright/test';

export function registerDialogAutoAccept(page: Page): void {
  page.on('dialog', (dialog) => {
    // The application uses native alerts as success/error notifications.
    // In CI they can fire while the page is already closing, so ignore any
    // protocol/session errors from late dialog handling.
    void dialog.accept().catch(() => {});
  });
}