import { Routes } from '@angular/router';

export const TRADING_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'crypto',
    pathMatch: 'full'
  },
  {
    path: 'crypto',
    loadComponent: () => import('./crypto/crypto-dashboard/crypto-dashboard.component').then(m => m.CryptoDashboardComponent)
  },
  {
    path: 'crypto/trade',
    loadComponent: () => import('./crypto/crypto-trade/crypto-trade.component').then(m => m.CryptoTradeComponent)
  },
  {
    path: 'crypto/wallets',
    loadComponent: () => import('./crypto/crypto-wallets/crypto-wallets.component').then(m => m.CryptoWalletsComponent)
  },
  {
    path: 'forex',
    loadComponent: () => import('./forex/forex-dashboard/forex-dashboard.component').then(m => m.ForexDashboardComponent)
  },
  {
    path: 'forex/trade',
    loadComponent: () => import('./forex/forex-trade/forex-trade.component').then(m => m.ForexTradeComponent)
  },
  {
    path: 'forex/demo',
    loadComponent: () => import('./forex/forex-demo/forex-demo.component').then(m => m.ForexDemoComponent)
  },
  {
    path: 'risk-management',
    loadComponent: () => import('./risk-management/risk-management.component').then(m => m.RiskManagementComponent)
  }
];


