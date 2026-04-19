import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterModule],
  template: `
<div class="d-flex flex-column align-items-center justify-content-center text-center"
     style="min-height:calc(100vh - 60px);padding:2rem">
  <i class="bi bi-exclamation-triangle-fill" style="font-size:5rem;color:var(--warning-color,#ff9800)"></i>
  <h1 class="mt-3" style="font-size:6rem;font-weight:800;color:#dee2e6;line-height:1">404</h1>
  <h2 class="mb-2" style="font-weight:700">Strona nie istnieje</h2>
  <p class="text-muted mb-4" style="max-width:400px">
    Strona, której szukasz, mogła zostać przeniesiona lub usunięta.
  </p>
  <a routerLink="/cars" class="btn btn-primary btn-lg px-4">
    <i class="bi bi-house me-2"></i>Wróć do listy samochodów
  </a>
</div>
  `,
})
export class NotFoundComponent {}
