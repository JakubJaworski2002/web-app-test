import { Routes } from '@angular/router';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';
import { authGuard } from './auth.guard';
import { dealerGuard } from './dealer.guard';
import { NotFoundComponent } from './not-found.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'cars',
    pathMatch: 'full',
  },
  {
    path: 'cars',
    loadComponent: () =>
      import('./components/car-list/car-list.component').then((m) => m.CarListComponent),
  },
  {
    path: 'cars/:id',
    loadComponent: () =>
      import('./components/car-detail/car-detail.component').then((m) => m.CarDetailComponent),
  },
  {
    path: 'privacy-policy',
    component: PrivacyPolicyComponent
  },
  {
    path: 'transactions',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./transaction-history.component').then(
        (m) => m.TransactionHistoryComponent
      ),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard, dealerGuard],
    loadComponent: () =>
      import('./dealer-dashboard.component').then(
        (m) => m.DealerDashboardComponent
      ),
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];
