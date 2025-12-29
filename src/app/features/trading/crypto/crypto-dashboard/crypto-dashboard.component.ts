import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  CryptoService,
  CryptoPrice,
  CryptoBalance,
  CryptoTrade,
} from '../../../../core/services/crypto.service';

@Component({
  selector: 'app-crypto-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="crypto-container">
      <header class="crypto-header">
        <div class="header-content">
          <div>
            <h1>Trading Crypto</h1>
            <p>Gérez vos portefeuilles et trades crypto</p>
          </div>
          <div class="header-actions">
            <a routerLink="/dashboard" class="btn btn-outline">Retour</a>
            <a routerLink="/trading/crypto/trade" class="btn btn-primary"
              >Nouveau Trade</a
            >
          </div>
        </div>
      </header>

      <main class="crypto-main">
        <!-- Account Type Toggle -->
        <div class="account-toggle">
          <button
            class="toggle-btn"
            [class.active]="!useDemoAccount"
            (click)="switchAccount(false)"
          >
            Compte réel
          </button>
          <button
            class="toggle-btn"
            [class.active]="useDemoAccount"
            (click)="switchAccount(true)"
          >
            Compte démo
          </button>
        </div>

        <!-- Balances -->
        <div class="balances-section">
          <h2>Portefeuilles Crypto</h2>
          <div *ngIf="isLoadingBalances" class="loading-state">
            <p>Chargement...</p>
          </div>
          <div
            *ngIf="!isLoadingBalances && balances.length === 0"
            class="empty-state"
          >
            <p>Aucun portefeuille crypto</p>
            <a routerLink="/trading/crypto/wallets" class="btn btn-primary"
              >Créer un portefeuille</a
            >
          </div>
          <div
            *ngIf="!isLoadingBalances && balances.length > 0"
            class="balances-grid"
          >
            <div class="balance-card" *ngFor="let balance of balances">
              <div class="balance-header">
                <h3>{{ balance.currency }}</h3>
                <span class="balance-value-gnf">{{
                  formatCurrency(balance.valueInGNF)
                }}</span>
              </div>
              <div class="balance-details">
                <div class="balance-item">
                  <span>Disponible:</span>
                  <span class="value">{{
                    formatCrypto(balance.available, balance.currency)
                  }}</span>
                </div>
                <div class="balance-item" *ngIf="balance.locked > 0">
                  <span>Bloqué:</span>
                  <span class="value">{{
                    formatCrypto(balance.locked, balance.currency)
                  }}</span>
                </div>
                <div class="balance-item">
                  <span>Total:</span>
                  <span class="value">{{
                    formatCrypto(balance.balance, balance.currency)
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Market Prices -->
        <div class="prices-section">
          <h2>Prix du marché</h2>
          <div *ngIf="isLoadingPrices" class="loading-state">
            <p>Chargement des prix...</p>
          </div>
          <div
            *ngIf="!isLoadingPrices && prices.length > 0"
            class="prices-grid"
          >
            <div class="price-card" *ngFor="let price of prices">
              <div class="price-header">
                <h3>{{ price.pair }}</h3>
                <span
                  class="price-change"
                  [class.positive]="price.changePercent24h >= 0"
                  [class.negative]="price.changePercent24h < 0"
                >
                  {{ price.changePercent24h >= 0 ? '+' : ''
                  }}{{ price.changePercent24h.toFixed(2) }}%
                </span>
              </div>
              <div class="price-value">
                {{ formatPrice(price.price) }}
              </div>
              <div class="price-details">
                <div class="detail-item">
                  <span>24h High:</span>
                  <span>{{ formatPrice(price.high24h) }}</span>
                </div>
                <div class="detail-item">
                  <span>24h Low:</span>
                  <span>{{ formatPrice(price.low24h) }}</span>
                </div>
                <div class="detail-item">
                  <span>Volume:</span>
                  <span>{{ formatVolume(price.volume24h) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Trades -->
        <div class="trades-section">
          <h2>Trades récents</h2>
          <div *ngIf="isLoadingTrades" class="loading-state">
            <p>Chargement...</p>
          </div>
          <div
            *ngIf="!isLoadingTrades && trades.length === 0"
            class="empty-state"
          >
            <p>Aucun trade effectué</p>
            <a routerLink="/trading/crypto/trade" class="btn btn-primary"
              >Commencer à trader</a
            >
          </div>
          <div
            *ngIf="!isLoadingTrades && trades.length > 0"
            class="trades-list"
          >
            <div class="trade-item" *ngFor="let trade of trades">
              <div class="trade-type" [class]="'type-' + trade.type">
                {{ trade.type === 'buy' ? 'Achat' : 'Vente' }}
              </div>
              <div class="trade-details">
                <div class="trade-pair">{{ trade.pair }}</div>
                <div class="trade-info">
                  <span>{{
                    formatCrypto(trade.amount, trade.pair.split('/')[0])
                  }}</span>
                  <span>&#64; {{ formatPrice(trade.price) }}</span>
                </div>
              </div>
              <div class="trade-total">
                <div class="total-amount">{{ formatPrice(trade.total) }}</div>
                <div class="trade-status" [class]="'status-' + trade.status">
                  {{ getStatusLabel(trade.status) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [
    `
      .crypto-container {
        min-height: 100vh;
        background: var(--background);
      }

      .crypto-header {
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

          .header-actions {
            display: flex;
            gap: 0.75rem;
          }
        }
      }

      .crypto-main {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }

      .account-toggle {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 2rem;
        background: white;
        padding: 0.5rem;
        border-radius: 0.5rem;
        box-shadow: var(--shadow-sm);
        border: 1px solid var(--border-color);
        width: fit-content;
      }

      .toggle-btn {
        padding: 0.75rem 1.5rem;
        border: none;
        background: transparent;
        border-radius: 0.375rem;
        cursor: pointer;
        font-weight: 500;
        color: var(--text-secondary);
        transition: all 0.2s;

        &.active {
          background: var(--primary-color);
          color: white;
        }
      }

      .balances-section,
      .prices-section,
      .trades-section {
        margin-bottom: 2rem;
      }

      h2 {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 1.5rem;
      }

      .balances-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.5rem;
      }

      .balance-card {
        background: white;
        border-radius: 0.75rem;
        padding: 1.5rem;
        box-shadow: var(--shadow-md);
        border: 1px solid var(--border-color);
      }

      .balance-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--border-color);
      }

      .balance-header h3 {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-primary);
      }

      .balance-value-gnf {
        font-size: 0.875rem;
        color: var(--text-secondary);
      }

      .balance-details {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .balance-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.875rem;
      }

      .balance-item .value {
        font-weight: 600;
        color: var(--text-primary);
      }

      .prices-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1.5rem;
      }

      .price-card {
        background: white;
        border-radius: 0.75rem;
        padding: 1.5rem;
        box-shadow: var(--shadow-md);
        border: 1px solid var(--border-color);
      }

      .price-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }

      .price-header h3 {
        font-size: 1rem;
        font-weight: 600;
        color: var(--text-primary);
      }

      .price-change {
        font-size: 0.875rem;
        font-weight: 600;
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;

        &.positive {
          background: #dcfce7;
          color: #166534;
        }

        &.negative {
          background: #fee2e2;
          color: #991b1b;
        }
      }

      .price-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 1rem;
      }

      .price-details {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        font-size: 0.875rem;
      }

      .detail-item {
        display: flex;
        justify-content: space-between;
        color: var(--text-secondary);
      }

      .trades-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .trade-item {
        background: white;
        border-radius: 0.75rem;
        padding: 1.5rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        box-shadow: var(--shadow-md);
        border: 1px solid var(--border-color);
      }

      .trade-type {
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        font-weight: 600;
        font-size: 0.875rem;

        &.type-buy {
          background: #dcfce7;
          color: #166534;
        }

        &.type-sell {
          background: #fee2e2;
          color: #991b1b;
        }
      }

      .trade-details {
        flex: 1;
      }

      .trade-pair {
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 0.25rem;
      }

      .trade-info {
        font-size: 0.875rem;
        color: var(--text-secondary);
      }

      .trade-total {
        text-align: right;
      }

      .total-amount {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 0.25rem;
      }

      .trade-status {
        font-size: 0.75rem;
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-weight: 500;

        &.status-completed {
          background: #dcfce7;
          color: #166534;
        }

        &.status-pending {
          background: #fef3c7;
          color: #92400e;
        }
      }

      .loading-state,
      .empty-state {
        text-align: center;
        padding: 3rem 2rem;
        background: white;
        border-radius: 0.75rem;
        box-shadow: var(--shadow-md);
        border: 1px solid var(--border-color);
      }

      @media (max-width: 768px) {
        .crypto-header {
          padding: 1rem;

          .header-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
        }

        .crypto-main {
          padding: 1rem;
        }
      }
    `,
  ],
})
export class CryptoDashboardComponent implements OnInit {
  private cryptoService = inject(CryptoService);

  balances: CryptoBalance[] = [];
  prices: CryptoPrice[] = [];
  trades: CryptoTrade[] = [];
  useDemoAccount = false;
  isLoadingBalances = true;
  isLoadingPrices = true;
  isLoadingTrades = true;

  ngOnInit(): void {
    this.loadData();
  }

  switchAccount(isDemo: boolean): void {
    this.useDemoAccount = isDemo;
    this.loadData();
  }

  loadData(): void {
    this.loadBalances();
    this.loadPrices();
    this.loadTrades();
  }

  loadBalances(): void {
    this.isLoadingBalances = true;
    if (this.useDemoAccount) {
      this.cryptoService.getDemoBalance().subscribe({
        next: (balances) => {
          this.balances = balances;
          this.isLoadingBalances = false;
        },
        error: () => {
          this.isLoadingBalances = false;
        },
      });
    } else {
      this.cryptoService.getBalances().subscribe({
        next: (balances) => {
          this.balances = balances;
          this.isLoadingBalances = false;
        },
        error: () => {
          this.isLoadingBalances = false;
        },
      });
    }
  }

  loadPrices(): void {
    this.isLoadingPrices = true;
    this.cryptoService
      .getPrices(['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'ADA/USDT'])
      .subscribe({
        next: (prices) => {
          this.prices = prices;
          this.isLoadingPrices = false;
        },
        error: () => {
          this.isLoadingPrices = false;
        },
      });
  }

  loadTrades(): void {
    this.isLoadingTrades = true;
    this.cryptoService.getTrades({ limit: 10 }).subscribe({
      next: (trades) => {
        this.trades = trades;
        this.isLoadingTrades = false;
      },
      error: () => {
        this.isLoadingTrades = false;
      },
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
    }).format(value);
  }

  formatCrypto(value: number, currency: string): string {
    return `${value.toFixed(8)} ${currency}`;
  }

  formatPrice(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(value);
  }

  formatVolume(value: number): string {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(2)}K`;
    }
    return value.toFixed(2);
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      pending: 'En attente',
      completed: 'Complété',
      cancelled: 'Annulé',
      failed: 'Échoué',
    };
    return labels[status] || status;
  }
}
