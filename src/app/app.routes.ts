import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'investments',
    loadChildren: () => import('./features/investments/investments.routes').then(m => m.INVESTMENTS_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'wallet',
    loadChildren: () => import('./features/wallet/wallet.routes').then(m => m.WALLET_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'kyc',
    loadChildren: () => import('./features/kyc/kyc.routes').then(m => m.KYC_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'products',
    loadChildren: () => import('./features/products/products.routes').then(m => m.PRODUCTS_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'reports',
    loadChildren: () => import('./features/reports/reports.routes').then(m => m.REPORTS_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'trading',
    loadChildren: () => import('./features/trading/trading.routes').then(m => m.TRADING_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'security',
    loadChildren: () => import('./features/security/security.routes').then(m => m.SECURITY_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'premium',
    loadChildren: () => import('./features/premium/premium.routes').then(m => m.PREMIUM_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];

