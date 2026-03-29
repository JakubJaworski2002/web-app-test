import { Page } from '@playwright/test';

export function registerDialogAutoAccept(page: Page): void {
  page.on('dialog', (dialog) => {
    void dialog.accept().catch(() => {});
  });
}
