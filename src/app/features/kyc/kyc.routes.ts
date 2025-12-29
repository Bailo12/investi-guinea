import { Routes } from '@angular/router';

export const KYC_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./kyc-verification/kyc-verification.component').then(m => m.KYCVerificationComponent)
  }
];


