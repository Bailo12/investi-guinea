import { Routes } from '@angular/router';

export const INVESTMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./investments-list/investments-list.component').then(m => m.InvestmentsListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./investment-form/investment-form.component').then(m => m.InvestmentFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./investment-detail/investment-detail.component').then(m => m.InvestmentDetailComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./investment-form/investment-form.component').then(m => m.InvestmentFormComponent)
  }
];


