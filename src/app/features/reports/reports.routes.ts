import { Routes } from '@angular/router';

export const REPORTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./reports-dashboard/reports-dashboard.component').then(m => m.ReportsDashboardComponent)
  },
  {
    path: 'transactions',
    loadComponent: () => import('./transaction-report/transaction-report.component').then(m => m.TransactionReportComponent)
  },
  {
    path: 'fees',
    loadComponent: () => import('./fee-report/fee-report.component').then(m => m.FeeReportComponent)
  },
  {
    path: 'user',
    loadComponent: () => import('./user-report/user-report.component').then(m => m.UserReportComponent)
  }
];


