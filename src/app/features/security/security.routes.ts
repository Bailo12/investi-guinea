import { Routes } from '@angular/router';

export const SECURITY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./security-dashboard/security-dashboard.component').then(m => m.SecurityDashboardComponent)
  },
  {
    path: 'fraud-detection',
    loadComponent: () => import('./fraud-detection/fraud-detection.component').then(m => m.FraudDetectionComponent)
  },
  {
    path: 'audit-logs',
    loadComponent: () => import('./audit-logs/audit-logs.component').then(m => m.AuditLogsComponent)
  },
  {
    path: 'compliance',
    loadComponent: () => import('./compliance/compliance.component').then(m => m.ComplianceComponent)
  },
  {
    path: 'penetration-tests',
    loadComponent: () => import('./penetration-tests/penetration-tests.component').then(m => m.PenetrationTestsComponent)
  }
];


