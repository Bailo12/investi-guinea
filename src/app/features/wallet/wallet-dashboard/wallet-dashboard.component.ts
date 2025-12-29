import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  WalletService,
  Wallet,
  WalletStats,
} from '../../../core/services/wallet.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-wallet-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="wallet-container">
      <header class="wallet-header">
        <div class="header-content">
          <div>
            <h1>Mon portefeuille</h1>
            <p>Gérez vos dépôts et retraits</p>
          </div>
          <a routerLink="/dashboard" class="btn btn-outline">Retour</a>
        </div>
      </header>

      <main class="wallet-main">
        <div *ngIf="isLoading" class="loading-state">
          <p>Chargement...</p>
        </div>

        <div *ngIf="!isLoading && wallet" class="wallet-content">
          <!-- Balance Card -->
          <div class="balance-card">
            <div class="balance-header">
              <h2>Solde disponible</h2>
              <span class="wallet-status" [class]="'status-' + wallet.status">
                {{ getStatusLabel(wallet.status) }}
              </span>
            </div>
            <div class="balance-amount">
              <span class="currency">{{ wallet.currency }}</span>
              <span class="amount">{{
                formatCurrency(wallet.balance, wallet.currency)
              }}</span>
            </div>
            <div class="balance-actions">
              <a routerLink="/wallet/deposit" class="btn btn-primary"
                >Déposer</a
              >
              <a routerLink="/wallet/withdraw" class="btn btn-outline"
                >Retirer</a
              >
            </div>
          </div>

          <!-- Stats Grid -->
          <div class="stats-grid" *ngIf="stats">
            <div class="stat-card">
              <div class="stat-icon" style="background: #dcfce7;">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
              </div>
              <div class="stat-content">
                <p class="stat-label">Total dépôts</p>
                <p class="stat-value">
                  {{ formatCurrency(stats.totalDeposits, wallet.currency) }}
                </p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon" style="background: #fee2e2;">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <polyline points="19 12 12 19 5 12" />
                </svg>
              </div>
              <div class="stat-content">
                <p class="stat-label">Total retraits</p>
                <p class="stat-value">
                  {{ formatCurrency(stats.totalWithdrawals, wallet.currency) }}
                </p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon" style="background: #fef3c7;">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div class="stat-content">
                <p class="stat-label">Transactions en attente</p>
                <p class="stat-value">{{ stats.pendingTransactions }}</p>
              </div>
            </div>
          </div>

          <!-- Recent Transactions -->
          <div
            class="recent-transactions"
            *ngIf="stats?.recentTransactions?.length"
          >
            <div class="section-header">
              <h2>Transactions récentes</h2>
              <a routerLink="/wallet/transactions" class="view-all"
                >Voir tout</a
              >
            </div>
            <div class="transactions-list">
              <div
                class="transaction-item"
                *ngFor="
                  let transaction of stats?.recentTransactions?.slice(0, 5)
                "
              >
                <div
                  class="transaction-icon"
                  [class]="'type-' + transaction?.type"
                >
                  <svg
                    *ngIf="transaction?.type === 'deposit'"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <line x1="12" y1="19" x2="12" y2="5" />
                    <polyline points="5 12 12 5 19 12" />
                  </svg>
                  <svg
                    *ngIf="transaction?.type === 'withdrawal'"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <polyline points="19 12 12 19 5 12" />
                  </svg>
                </div>
                <div class="transaction-details">
                  <div class="transaction-info">
                    <p class="transaction-type">
                      {{ getTypeLabel(transaction?.type || '') }} -
                      {{ getMethodLabel(transaction?.method || '') }}
                    </p>
                    <p class="transaction-date">
                      {{ formatDate(transaction?.createdAt || '') }}
                    </p>
                  </div>
                  <div class="transaction-amount">
                    <span [class]="'amount-' + transaction?.type">
                      {{ transaction?.type === 'deposit' ? '+' : '-'
                      }}{{
                        formatCurrency(
                          transaction?.amount || 0,
                          transaction?.currency || wallet?.currency || 'GNF'
                        )
                      }}
                    </span>
                    <span
                      class="transaction-status"
                      [class]="'status-' + transaction?.status"
                    >
                      {{ getStatusLabel(transaction?.status || '') }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div
            class="empty-state"
            *ngIf="stats && stats.recentTransactions.length === 0"
          >
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              style="color: var(--text-secondary); margin-bottom: 1rem;"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
            <h3>Aucune transaction</h3>
            <p>Commencez par effectuer votre premier dépôt</p>
            <a
              routerLink="/wallet/deposit"
              class="btn btn-primary"
              style="margin-top: 1rem;"
              >Déposer des fonds</a
            >
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [
    `
      .wallet-container {
        min-height: 100vh;
        background: var(--background);
      }

      .wallet-header {
        background: white;
        border-bottom: 1px solid var(--border-color);
        padding: 1.5rem 2rem;

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;

          h1 {
            font-size: 1.875rem;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 0.25rem;
          }

          p {
            color: var(--text-secondary);
            font-size: 0.875rem;
          }
        }
      }

      .wallet-main {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }

      .balance-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 1rem;
        padding: 2rem;
        color: white;
        margin-bottom: 2rem;
        box-shadow: var(--shadow-lg);
      }

      .balance-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;

        h2 {
          font-size: 1.125rem;
          font-weight: 500;
          opacity: 0.9;
        }
      }

      .wallet-status {
        padding: 0.375rem 0.75rem;
        border-radius: 0.375rem;
        font-size: 0.75rem;
        font-weight: 500;
        background: rgba(255, 255, 255, 0.2);
      }

      .balance-amount {
        display: flex;
        align-items: baseline;
        gap: 0.5rem;
        margin-bottom: 2rem;

        .currency {
          font-size: 1.5rem;
          font-weight: 500;
          opacity: 0.9;
        }

        .amount {
          font-size: 3rem;
          font-weight: 700;
        }
      }

      .balance-actions {
        display: flex;
        gap: 1rem;

        .btn {
          flex: 1;
          background: white;
          color: #667eea;

          &:hover {
            opacity: 0.9;
          }
        }
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
      }

      .stat-card {
        background: white;
        border-radius: 0.75rem;
        padding: 1.5rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        box-shadow: var(--shadow-md);
        border: 1px solid var(--border-color);
      }

      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--primary-color);
      }

      .stat-content {
        flex: 1;
      }

      .stat-label {
        font-size: 0.875rem;
        color: var(--text-secondary);
        margin-bottom: 0.25rem;
      }

      .stat-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-primary);
      }

      .recent-transactions {
        background: white;
        border-radius: 0.75rem;
        padding: 1.5rem;
        box-shadow: var(--shadow-md);
        border: 1px solid var(--border-color);
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;

        h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .view-all {
          color: var(--primary-color);
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;

          &:hover {
            text-decoration: underline;
          }
        }
      }

      .transactions-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .transaction-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: var(--background);
        border-radius: 0.5rem;
        border: 1px solid var(--border-color);
      }

      .transaction-icon {
        width: 40px;
        height: 40px;
        border-radius: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;

        &.type-deposit {
          background: #dcfce7;
          color: #166534;
        }

        &.type-withdrawal {
          background: #fee2e2;
          color: #991b1b;
        }
      }

      .transaction-details {
        flex: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .transaction-info {
        .transaction-type {
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .transaction-date {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
      }

      .transaction-amount {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 0.25rem;

        .amount-deposit {
          color: var(--success-color);
          font-weight: 600;
        }

        .amount-withdrawal {
          color: var(--danger-color);
          font-weight: 600;
        }

        .transaction-status {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-weight: 500;

          &.status-pending {
            background: #fef3c7;
            color: #92400e;
          }

          &.status-completed {
            background: #dcfce7;
            color: #166534;
          }

          &.status-failed {
            background: #fee2e2;
            color: #991b1b;
          }
        }
      }

      .loading-state,
      .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        background: white;
        border-radius: 0.75rem;
        box-shadow: var(--shadow-md);
        border: 1px solid var(--border-color);

        h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        p {
          color: var(--text-secondary);
        }
      }

      @media (max-width: 768px) {
        .wallet-header {
          padding: 1rem;

          .header-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
        }

        .wallet-main {
          padding: 1rem;
        }

        .balance-amount .amount {
          font-size: 2rem;
        }

        .balance-actions {
          flex-direction: column;
        }

        .stats-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class WalletDashboardComponent implements OnInit {
  private walletService = inject(WalletService);
  private authService = inject(AuthService);

  wallet: Wallet | null = null;
  stats: WalletStats | null = null;
  isLoading = true;

  ngOnInit(): void {
    this.loadWallet();
    this.loadStats();
  }

  loadWallet(): void {
    this.walletService.getWallet().subscribe({
      next: (wallet) => {
        this.wallet = wallet;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        // In a real app, handle error appropriately
      },
    });
  }

  loadStats(): void {
    this.walletService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: () => {
        // In a real app, handle error appropriately
      },
    });
  }

  formatCurrency(value: number, currency: string): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(value);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getTypeLabel(type: string): string {
    return type === 'deposit' ? 'Dépôt' : 'Retrait';
  }

  getMethodLabel(method: string): string {
    const labels: { [key: string]: string } = {
      'orange-money': 'Orange Money',
      'mtn-mobile-money': 'MTN Mobile Money',
      'bank-transfer': 'Virement bancaire',
    };
    return labels[method] || method;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      active: 'Actif',
      suspended: 'Suspendu',
      closed: 'Fermé',
      pending: 'En attente',
      completed: 'Complété',
      failed: 'Échoué',
      cancelled: 'Annulé',
    };
    return labels[status] || status;
  }
}
