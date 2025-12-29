import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { WalletService, Transaction } from '../../../core/services/wallet.service';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="transactions-container">
      <header class="transactions-header">
        <div class="header-content">
          <div>
            <a routerLink="/wallet" class="back-link">← Retour au portefeuille</a>
            <h1>Historique des transactions</h1>
          </div>
        </div>
      </header>

      <main class="transactions-main">
        <div class="filters-bar">
          <select [(ngModel)]="selectedType" (change)="loadTransactions()" class="filter-select">
            <option value="">Tous les types</option>
            <option value="deposit">Dépôts</option>
            <option value="withdrawal">Retraits</option>
          </select>
        </div>

        <div *ngIf="isLoading" class="loading-state">
          <p>Chargement...</p>
        </div>

        <div *ngIf="!isLoading && transactions.length === 0" class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--text-secondary); margin-bottom: 1rem;">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
          </svg>
          <h3>Aucune transaction</h3>
          <p>Vos transactions apparaîtront ici</p>
        </div>

        <div *ngIf="!isLoading && transactions.length > 0" class="transactions-list">
          <div class="transaction-item" *ngFor="let transaction of transactions">
            <div class="transaction-icon" [class]="'type-' + transaction.type">
              <svg *ngIf="transaction.type === 'deposit'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="19" x2="12" y2="5"/>
                <polyline points="5 12 12 5 19 12"/>
              </svg>
              <svg *ngIf="transaction.type === 'withdrawal'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <polyline points="19 12 12 19 5 12"/>
              </svg>
            </div>
            <div class="transaction-details">
              <div class="transaction-info">
                <p class="transaction-type">{{ getTypeLabel(transaction.type) }} - {{ getMethodLabel(transaction.method) }}</p>
                <p class="transaction-meta">
                  {{ formatDateTime(transaction.createdAt) }}
                  <span *ngIf="transaction.phoneNumber"> • {{ transaction.phoneNumber }}</span>
                </p>
                <p class="transaction-reference" *ngIf="transaction.reference">Réf: {{ transaction.reference }}</p>
              </div>
              <div class="transaction-amount">
                <span [class]="'amount-' + transaction.type">
                  {{ transaction.type === 'deposit' ? '+' : '-' }}{{ formatCurrency(transaction.amount, transaction.currency) }}
                </span>
                <span class="transaction-status" [class]="'status-' + transaction.status">
                  {{ getStatusLabel(transaction.status) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .transactions-container {
      min-height: 100vh;
      background: var(--background);
    }

    .transactions-header {
      background: white;
      border-bottom: 1px solid var(--border-color);
      padding: 1.5rem 2rem;

      .header-content {
        max-width: 1200px;
        margin: 0 auto;

        .back-link {
          color: var(--primary-color);
          text-decoration: none;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
          display: inline-block;

          &:hover {
            text-decoration: underline;
          }
        }

        h1 {
          font-size: 1.875rem;
          font-weight: 700;
          color: var(--text-primary);
        }
      }
    }

    .transactions-main {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .filters-bar {
      margin-bottom: 1.5rem;
    }

    .filter-select {
      padding: 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 0.5rem;
      background: white;
      font-size: 0.875rem;
      cursor: pointer;
    }

    .transactions-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .transaction-item {
      background: white;
      border-radius: 0.75rem;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border-color);
      transition: transform 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
      }
    }

    .transaction-icon {
      width: 48px;
      height: 48px;
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
      gap: 1rem;
    }

    .transaction-info {
      flex: 1;

      .transaction-type {
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 0.25rem;
      }

      .transaction-meta {
        font-size: 0.875rem;
        color: var(--text-secondary);
        margin-bottom: 0.25rem;
      }

      .transaction-reference {
        font-size: 0.75rem;
        color: var(--text-secondary);
        font-family: monospace;
      }
    }

    .transaction-amount {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.5rem;

      .amount-deposit {
        color: var(--success-color);
        font-weight: 700;
        font-size: 1.125rem;
      }

      .amount-withdrawal {
        color: var(--danger-color);
        font-weight: 700;
        font-size: 1.125rem;
      }

      .transaction-status {
        font-size: 0.75rem;
        padding: 0.25rem 0.75rem;
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

        &.status-cancelled {
          background: #f3f4f6;
          color: #374151;
        }
      }
    }

    .loading-state, .empty-state {
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
      .transactions-header {
        padding: 1rem;
      }

      .transactions-main {
        padding: 1rem;
      }

      .transaction-details {
        flex-direction: column;
        align-items: flex-start;
      }

      .transaction-amount {
        align-items: flex-start;
        width: 100%;
      }
    }
  `]
})
export class TransactionsComponent implements OnInit {
  private walletService = inject(WalletService);

  transactions: Transaction[] = [];
  selectedType: string = '';
  isLoading = true;

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.isLoading = true;
    const params: any = { limit: 50 };
    if (this.selectedType) {
      params.type = this.selectedType;
    }

    this.walletService.getTransactions(params).subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.transactions = [];
      }
    });
  }

  formatCurrency(value: number, currency: string): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(value);
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getTypeLabel(type: string): string {
    return type === 'deposit' ? 'Dépôt' : 'Retrait';
  }

  getMethodLabel(method: string): string {
    const labels: { [key: string]: string } = {
      'orange-money': 'Orange Money',
      'mtn-mobile-money': 'MTN Mobile Money',
      'bank-transfer': 'Virement bancaire'
    };
    return labels[method] || method;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'En attente',
      'completed': 'Complété',
      'failed': 'Échoué',
      'cancelled': 'Annulé'
    };
    return labels[status] || status;
  }
}

