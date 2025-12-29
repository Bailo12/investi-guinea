import { Routes } from '@angular/router';

export const WALLET_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./wallet-dashboard/wallet-dashboard.component').then(m => m.WalletDashboardComponent)
  },
  {
    path: 'deposit',
    loadComponent: () => import('./deposit/deposit.component').then(m => m.DepositComponent)
  },
  {
    path: 'withdraw',
    loadComponent: () => import('./withdraw/withdraw.component').then(m => m.WithdrawComponent)
  },
  {
    path: 'transactions',
    loadComponent: () => import('./transactions/transactions.component').then(m => m.TransactionsComponent)
  }
];


