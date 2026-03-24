import { Page } from '@playwright/test';

export function registerDialogAutoAccept(page: Page): void {
  page.on('dialog', async (dialog) => {
    try {
      await dialog.accept();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      if (
        message.includes('Test ended') ||
        message.includes('Target page, context or browser has been closed') ||
        message.includes('Internal server error, session closed')
      ) {
        return;
      }

      throw error;
    }
  });
}