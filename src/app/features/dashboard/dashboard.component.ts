import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import {
  InvestmentService,
  InvestmentStats,
} from '../../core/services/investment.service';
import {
  ReportsService,
  DashboardReport,
} from '../../core/services/reports.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <div class="header-content">
          <div>
            <h1>Tableau de bord</h1>
            <p class="welcome-text">
              Bienvenue, {{ user?.firstName }} {{ user?.lastName }}
            </p>
          </div>
          <button class="btn btn-outline" (click)="logout()">
            Déconnexion
          </button>
        </div>
      </header>

      <main class="dashboard-main">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background: #dbeafe;">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
                />
              </svg>
            </div>
            <div class="stat-content">
              <p class="stat-label">Valeur totale</p>
              <p class="stat-value">
                {{ formatCurrency(stats?.totalValue || 0) }}
              </p>
            </div>
          </div>

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
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <div class="stat-content">
              <p class="stat-label">Rendement total</p>
              <p
                class="stat-value"
                [class.positive]="(stats?.returnPercentage || 0) >= 0"
                [class.negative]="(stats?.returnPercentage || 0) < 0"
              >
                {{ formatCurrency(stats?.totalReturn || 0) }}
              </p>
              <p
                class="stat-percentage"
                [class.positive]="(stats?.returnPercentage || 0) >= 0"
                [class.negative]="(stats?.returnPercentage || 0) < 0"
              >
                {{ (stats?.returnPercentage || 0) >= 0 ? '+' : ''
                }}{{ (stats?.returnPercentage || 0).toFixed(2) }}%
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
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
                <line x1="3" y1="9" x2="21" y2="9" />
              </svg>
            </div>
            <div class="stat-content">
              <p class="stat-label">Investissements actifs</p>
              <p class="stat-value">{{ stats?.activeInvestments || 0 }}</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: #e0e7ff;">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
                />
              </svg>
            </div>
            <div class="stat-content">
              <p class="stat-label">Total investissements</p>
              <p class="stat-value">{{ stats?.totalInvestments || 0 }}</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: #fff1f2;">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M12 8v8M8 12h8" />
              </svg>
            </div>
            <div class="stat-content">
              <p class="stat-label">Frais totaux</p>
              <p class="stat-value">{{ formatCurrency(fees || 0) }}</p>
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
                <circle cx="12" cy="12" r="8" />
                <path d="M12 8v4l2 2" />
              </svg>
            </div>
            <div class="stat-content">
              <p class="stat-label">Risque</p>
              <p class="stat-value" [class.negative]="(riskScore || 0) > 70">
                {{ riskScore != null ? riskScore + '%' : '—' }}
              </p>
            </div>
          </div>
        </div>

        <div class="dashboard-actions">
          <div class="actions-grid">
            <a routerLink="/investments" class="action-card">
              <div class="action-icon" style="background: #dbeafe;">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
                  />
                </svg>
              </div>
              <h3>Investissements</h3>
              <p>Gérer mon portefeuille</p>
            </a>

            <a routerLink="/wallet" class="action-card">
              <div class="action-icon" style="background: #dcfce7;">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
              </div>
              <h3>Portefeuille</h3>
              <p>Dépôts et retraits</p>
            </a>

            <a
              routerLink="/kyc"
              class="action-card"
              [class.kyc-pending]="
                user?.kycStatus === 'pending' || user?.kycStatus === 'rejected'
              "
            >
              <div
                class="action-icon"
                [style.background]="
                  user?.kycStatus === 'approved' ? '#dcfce7' : '#fef3c7'
                "
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h3>Vérification KYC</h3>
              <p *ngIf="user?.kycStatus === 'approved'">Vérifié</p>
              <p *ngIf="user?.kycStatus === 'pending' || !user?.kycStatus">
                À compléter
              </p>
              <p *ngIf="user?.kycStatus === 'rejected'">À corriger</p>
            </a>

            <a routerLink="/products" class="action-card">
              <div class="action-icon" style="background: #e0e7ff;">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                </svg>
              </div>
              <h3>Produits</h3>
              <p>Découvrir nos produits</p>
            </a>

            <a routerLink="/reports" class="action-card">
              <div class="action-icon" style="background: #fce7f3;">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                </svg>
              </div>
              <h3>Rapports</h3>
              <p>Transparence et statistiques</p>
            </a>

            <a routerLink="/trading" class="action-card">
              <div class="action-icon" style="background: #fef3c7;">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <h3>Trading</h3>
              <p>Crypto & Forex</p>
            </a>

            <a routerLink="/security" class="action-card">
              <div class="action-icon" style="background: #fee2e2;">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h3>Sécurité</h3>
              <p>Monitoring & Conformité</p>
            </a>

            <a routerLink="/premium" class="action-card premium-highlight">
              <div class="action-icon" style="background: #fef3c7;">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <h3>Premium</h3>
              <p>Projets exclusifs</p>
            </a>
          </div>
        </div>

        <div class="investments-section">
          <div class="investments-by-type" *ngIf="stats?.byType?.length">
            <h2>Investissements par type</h2>
            <div class="type-grid">
              <div class="type-card" *ngFor="let type of stats?.byType">
                <h3>{{ getTypeLabel(type?.type || '') }}</h3>
                <p class="type-count">{{ type?.count }} investissement(s)</p>
                <p class="type-value">{{ formatCurrency(type.value) }}</p>
              </div>
            </div>
          </div>

          <div
            class="recent-investments"
            *ngIf="recentInvestments && recentInvestments.length"
          >
            <h2>Investissements récents</h2>
            <div class="recent-list">
              <div class="recent-item" *ngFor="let inv of recentInvestments">
                <div class="recent-left">
                  <div class="inv-name">{{ inv.name }}</div>
                  <div class="inv-type">{{ getTypeLabel(inv.type) }}</div>
                </div>
                <div class="recent-right">
                  <div class="inv-amount">{{ formatCurrency(inv.amount) }}</div>
                  <div class="inv-current">
                    {{
                      inv.currentValue != null
                        ? formatCurrency(inv.currentValue)
                        : '—'
                    }}
                  </div>
                  <div
                    class="inv-return"
                    [class.positive]="(inv.returnPercentage || 0) >= 0"
                    [class.negative]="(inv.returnPercentage || 0) < 0"
                  >
                    {{
                      inv.returnPercentage != null
                        ? (inv.returnPercentage >= 0 ? '+' : '') +
                          inv.returnPercentage.toFixed(2) +
                          '%'
                        : '—'
                    }}
                  </div>
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
      .dashboard-container {
        min-height: 100vh;
        background: var(--background);
      }

      .dashboard-header {
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

          .welcome-text {
            color: var(--text-secondary);
            font-size: 0.875rem;
          }
        }
      }

      .dashboard-main {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
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
        transition: transform 0.2s, box-shadow 0.2s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }
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

        &.positive {
          color: var(--success-color);
        }

        &.negative {
          color: var(--danger-color);
        }
      }

      .stat-percentage {
        font-size: 0.75rem;
        font-weight: 500;
        margin-top: 0.25rem;

        &.positive {
          color: var(--success-color);
        }

        &.negative {
          color: var(--danger-color);
        }
      }

      .dashboard-actions {
        margin-bottom: 2rem;
      }

      .actions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
      }

      .action-card {
        background: white;
        border-radius: 0.75rem;
        padding: 1.5rem;
        text-decoration: none;
        color: inherit;
        box-shadow: var(--shadow-md);
        border: 1px solid var(--border-color);
        transition: transform 0.2s, box-shadow 0.2s;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;

        &:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }

        &.kyc-pending {
          border: 2px solid var(--warning-color);
        }
      }

      .action-icon {
        width: 64px;
        height: 64px;
        border-radius: 0.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--primary-color);
        margin-bottom: 1rem;
      }

      .action-card h3 {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 0.5rem;
      }

      .action-card p {
        font-size: 0.875rem;
        color: var(--text-secondary);
        margin: 0;
      }

      .action-card.premium-highlight {
        border: 2px solid #f59e0b;
      }

      .investments-by-type {
        background: white;
        border-radius: 0.75rem;
        padding: 1.5rem;
        box-shadow: var(--shadow-md);
        border: 1px solid var(--border-color);

        h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
        }
      }

      .type-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
      }

      .type-card {
        padding: 1rem;
        background: var(--background);
        border-radius: 0.5rem;
        border: 1px solid var(--border-color);

        h3 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
          text-transform: capitalize;
        }

        .type-count {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }

        .type-value {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--primary-color);
        }
      }

      @media (max-width: 768px) {
        .dashboard-header {
          padding: 1rem;

          .header-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
        }

        .dashboard-main {
          padding: 1rem;
        }

        .stats-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private investmentService = inject(InvestmentService);
  private reportsService = inject(ReportsService);

  user = this.authService.getCurrentUser();
  stats: InvestmentStats | null = null;
  fees: number | null = null;
  riskScore: number | null = null;
  recentInvestments:
    | import('../../core/services/investment.service').Investment[]
    | null = null;
  isLoading = false;

  ngOnInit(): void {
    this.loadStats();
    this.loadRecentInvestments();
  }

  loadStats(): void {
    this.isLoading = true;
    // Fetch investment stats and additional report metrics (fees, risk)
    this.investmentService.getStats().subscribe({
      next: (stats: InvestmentStats) => {
        this.stats = stats;
      },
      error: () => {
        this.stats = {
          totalInvestments: 0,
          totalValue: 0,
          totalReturn: 0,
          returnPercentage: 0,
          activeInvestments: 0,
          byType: [],
        };
      },
    });

    this.reportsService.getDashboard().subscribe({
      next: (report: DashboardReport) => {
        this.fees = report.totalFees || 0;
        // Use provided return if available
        if (report.totalReturn != null) {
          if (this.stats) {
            this.stats.totalReturn = report.totalReturn;
            this.stats.returnPercentage =
              report.returnPercentage || this.stats.returnPercentage;
          }
        }
        // Compute a simple risk score if backend doesn't provide one
        this.riskScore =
          report.riskScore != null
            ? report.riskScore
            : Math.min(100, Math.round((report.transactionCount || 0) / 10));
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.fees = 0;
        this.riskScore = null;
      },
    });
  }

  loadRecentInvestments(): void {
    this.investmentService.getInvestments().subscribe({
      next: (
        items: import('../../core/services/investment.service').Investment[]
      ) => {
        // sort by purchaseDate desc and take top 5
        this.recentInvestments = items
          .slice()
          .sort(
            (
              a: import('../../core/services/investment.service').Investment,
              b: import('../../core/services/investment.service').Investment
            ) =>
              new Date(b.purchaseDate).getTime() -
              new Date(a.purchaseDate).getTime()
          )
          .slice(0, 5);
      },
      error: () => {
        this.recentInvestments = [];
      },
    });
  }

  logout(): void {
    this.authService.logout();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
    }).format(value);
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      stocks: 'Actions',
      bonds: 'Obligations',
      'real-estate': 'Immobilier',
      crypto: 'Cryptomonnaie',
      'mutual-funds': 'Fonds mutuels',
      other: 'Autre',
    };
    return labels[type] || type;
  }
}
