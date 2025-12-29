import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  ForexService,
  ForexPair,
  ForexAccount,
  ForexPosition,
  ForexTrade,
} from '../../../../core/services/forex.service';

@Component({
  selector: 'app-forex-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="forex-container">
      <header class="forex-header">
        <div class="header-content">
          <div>
            <h1>Trading Forex</h1>
            <p>Tradez les paires de devises en temps réel</p>
          </div>
          <div class="header-actions">
            <a routerLink="/dashboard" class="btn btn-outline">Retour</a>
            <a routerLink="/trading/forex/trade" class="btn btn-primary"
              >Nouveau Trade</a
            >
            <a routerLink="/trading/forex/demo" class="btn btn-secondary"
              >Compte Démo</a
            >
          </div>
        </div>
      </header>

      <main class="forex-main">
        <!-- Account Info -->
        <div class="account-section" *ngIf="account">
          <div class="account-card">
            <div class="account-header">
              <h2>
                {{ account.type === 'demo' ? 'Compte Démo' : 'Compte Réel' }}
              </h2>
              <span class="account-badge" [class]="'type-' + account.type">
                {{ account.type === 'demo' ? 'Démo' : 'Réel' }}
              </span>
            </div>
            <div class="account-stats">
              <div class="stat-item">
                <span class="stat-label">Solde</span>
                <span class="stat-value">{{
                  formatCurrency(account.balance, account.currency)
                }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Équité</span>
                <span class="stat-value">{{
                  formatCurrency(account.equity, account.currency)
                }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Marge utilisée</span>
                <span class="stat-value">{{
                  formatCurrency(account.margin, account.currency)
                }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Marge libre</span>
                <span class="stat-value">{{
                  formatCurrency(account.freeMargin, account.currency)
                }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Niveau de marge</span>
                <span
                  class="stat-value"
                  [class.warning]="account.marginLevel < 100"
                >
                  {{ account.marginLevel.toFixed(2) }}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Market Rates -->
        <div class="rates-section">
          <h2>Cours en direct</h2>
          <div *ngIf="isLoadingPairs" class="loading-state">
            <p>Chargement des cours...</p>
          </div>
          <div *ngIf="!isLoadingPairs && pairs.length > 0" class="pairs-grid">
            <div
              class="pair-card"
              *ngFor="let pair of pairs"
              [routerLink]="['/trading/forex/trade']"
              [queryParams]="{ pair: pair.symbol }"
            >
              <div class="pair-header">
                <h3>{{ pair.symbol }}</h3>
                <span
                  class="pair-change"
                  [class.positive]="pair.change >= 0"
                  [class.negative]="pair.change < 0"
                >
                  {{ pair.change >= 0 ? '+' : '' }}{{ pair.change.toFixed(5) }}
                </span>
              </div>
              <div class="pair-prices">
                <div class="price-row">
                  <span>Bid:</span>
                  <span class="price-value">{{ formatPrice(pair.bid) }}</span>
                </div>
                <div class="price-row">
                  <span>Ask:</span>
                  <span class="price-value">{{ formatPrice(pair.ask) }}</span>
                </div>
                <div class="price-row">
                  <span>Spread:</span>
                  <span class="spread-value">{{
                    formatPrice(pair.spread)
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Open Positions -->
        <div class="positions-section" *ngIf="positions.length > 0">
          <h2>Positions ouvertes</h2>
          <div class="positions-list">
            <div class="position-card" *ngFor="let position of positions">
              <div class="position-header">
                <div
                  class="position-type"
                  [class]="'type-' + position.trade.type"
                >
                  {{ position.trade.type === 'buy' ? 'Achat' : 'Vente' }}
                </div>
                <div class="position-pair">{{ position.trade.pair }}</div>
                <div
                  class="position-profit"
                  [class.positive]="position.unrealizedProfit >= 0"
                  [class.negative]="position.unrealizedProfit < 0"
                >
                  {{
                    formatCurrency(
                      position.unrealizedProfit,
                      account?.currency || 'USD'
                    )
                  }}
                </div>
              </div>
              <div class="position-details">
                <div class="detail-item">
                  <span>Lot:</span>
                  <span>{{ position.trade.lotSize }}</span>
                </div>
                <div class="detail-item">
                  <span>Prix d'entrée:</span>
                  <span>{{ formatPrice(position.trade.entryPrice) }}</span>
                </div>
                <div class="detail-item" *ngIf="position.trade.currentPrice">
                  <span>Prix actuel:</span>
                  <span>{{ formatPrice(position.trade.currentPrice) }}</span>
                </div>
                <div class="detail-item" *ngIf="position.trade.stopLoss">
                  <span>Stop-Loss:</span>
                  <span>{{ formatPrice(position.trade.stopLoss) }}</span>
                </div>
                <div class="detail-item" *ngIf="position.trade.takeProfit">
                  <span>Take Profit:</span>
                  <span>{{ formatPrice(position.trade.takeProfit) }}</span>
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
            *ngIf="!isLoadingTrades && recentTrades.length === 0"
            class="empty-state"
          >
            <p>Aucun trade effectué</p>
          </div>
          <div
            *ngIf="!isLoadingTrades && recentTrades.length > 0"
            class="trades-list"
          >
            <div class="trade-item" *ngFor="let trade of recentTrades">
              <div class="trade-type" [class]="'type-' + trade.type">
                {{ trade.type === 'buy' ? 'Achat' : 'Vente' }}
              </div>
              <div class="trade-details">
                <div class="trade-pair">{{ trade.pair }}</div>
                <div class="trade-info">
                  <span>{{ trade.lotSize }} lots</span>
                  <span>&#64; {{ formatPrice(trade.entryPrice) }}</span>
                </div>
              </div>
              <div class="trade-status" [class]="'status-' + trade.status">
                {{ getStatusLabel(trade.status) }}
              </div>
              <div
                class="trade-profit"
                *ngIf="trade.profit !== undefined"
                [class.positive]="trade.profit >= 0"
                [class.negative]="trade.profit < 0"
              >
                {{ formatCurrency(trade.profit, account?.currency || 'USD') }}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [
    `
      .forex-container {
        min-height: 100vh;
        background: var(--background);
      }

      .forex-header {
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

      .forex-main {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }

      .account-section {
        margin-bottom: 2rem;
      }

      .account-card {
        background: white;
        border-radius: 0.75rem;
        padding: 2rem;
        box-shadow: var(--shadow-md);
        border: 1px solid var(--border-color);
      }

      .account-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }

      .account-header h2 {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-primary);
      }

      .account-badge {
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        font-weight: 600;

        &.type-real {
          background: #dcfce7;
          color: #166534;
        }

        &.type-demo {
          background: #fef3c7;
          color: #92400e;
        }
      }

      .account-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
      }

      .stat-item {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .stat-label {
        font-size: 0.875rem;
        color: var(--text-secondary);
      }

      .stat-value {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--text-primary);

        &.warning {
          color: var(--warning-color);
        }
      }

      .rates-section,
      .positions-section,
      .trades-section {
        margin-bottom: 2rem;
      }

      h2 {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 1.5rem;
      }

      .pairs-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.5rem;
      }

      .pair-card {
        background: white;
        border-radius: 0.75rem;
        padding: 1.5rem;
        box-shadow: var(--shadow-md);
        border: 1px solid var(--border-color);
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }
      }

      .pair-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }

      .pair-header h3 {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-primary);
      }

      .pair-change {
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

      .pair-prices {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .price-row {
        display: flex;
        justify-content: space-between;
        font-size: 0.875rem;
      }

      .price-value {
        font-weight: 600;
        color: var(--text-primary);
      }

      .spread-value {
        color: var(--text-secondary);
      }

      .positions-list,
      .trades-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .position-card,
      .trade-item {
        background: white;
        border-radius: 0.75rem;
        padding: 1.5rem;
        box-shadow: var(--shadow-md);
        border: 1px solid var(--border-color);
      }

      .position-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .position-type {
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

      .position-pair {
        flex: 1;
        font-weight: 600;
        color: var(--text-primary);
      }

      .position-profit {
        font-size: 1.25rem;
        font-weight: 700;

        &.positive {
          color: var(--success-color);
        }

        &.negative {
          color: var(--danger-color);
        }
      }

      .position-details {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 0.75rem;
      }

      .detail-item {
        display: flex;
        justify-content: space-between;
        font-size: 0.875rem;
        color: var(--text-secondary);
      }

      .trade-item {
        display: flex;
        align-items: center;
        gap: 1rem;
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

      .trade-status {
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        font-weight: 500;

        &.status-open {
          background: #fef3c7;
          color: #92400e;
        }

        &.status-closed {
          background: #dcfce7;
          color: #166534;
        }
      }

      .trade-profit {
        font-weight: 700;
        font-size: 1.125rem;

        &.positive {
          color: var(--success-color);
        }

        &.negative {
          color: var(--danger-color);
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
        .forex-header {
          padding: 1rem;

          .header-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
        }

        .forex-main {
          padding: 1rem;
        }
      }
    `,
  ],
})
export class ForexDashboardComponent implements OnInit {
  private forexService = inject(ForexService);

  account: ForexAccount | null = null;
  pairs: ForexPair[] = [];
  positions: ForexPosition[] = [];
  recentTrades: ForexTrade[] = [];
  isLoadingPairs = true;
  isLoadingTrades = true;

  ngOnInit(): void {
    this.loadAccount();
    this.loadPairs();
    this.loadPositions();
    this.loadTrades();
  }

  loadAccount(): void {
    this.forexService.getAccount().subscribe({
      next: (account) => {
        this.account = account;
      },
      error: () => {
        // Try demo account
        this.forexService.getAccount('demo').subscribe({
          next: (account) => {
            this.account = account;
          },
        });
      },
    });
  }

  loadPairs(): void {
    this.isLoadingPairs = true;
    this.forexService.getPairs().subscribe({
      next: (pairs) => {
        this.pairs = pairs;
        this.isLoadingPairs = false;
      },
      error: () => {
        this.isLoadingPairs = false;
      },
    });
  }

  loadPositions(): void {
    this.forexService.getPositions().subscribe({
      next: (positions) => {
        this.positions = positions;
      },
    });
  }

  loadTrades(): void {
    this.isLoadingTrades = true;
    this.forexService.getTrades({ status: 'closed' }).subscribe({
      next: (trades) => {
        this.recentTrades = trades.slice(0, 10);
        this.isLoadingTrades = false;
      },
      error: () => {
        this.isLoadingTrades = false;
      },
    });
  }

  formatCurrency(value: number, currency: string): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(value);
  }

  formatPrice(value: number): string {
    return value.toFixed(5);
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      open: 'Ouvert',
      closed: 'Fermé',
      stopped: 'Stop-Loss',
      'take-profit': 'Take Profit',
    };
    return labels[status] || status;
  }
}
