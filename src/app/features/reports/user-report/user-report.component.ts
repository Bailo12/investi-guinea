import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ReportingService, UserReport } from '../../../core/services/reporting.service';

@Component({
  selector: 'app-user-report',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="report-container">
      <header class="report-header">
        <div class="header-content">
          <div>
            <a routerLink="/reports" class="back-link">← Retour aux rapports</a>
            <h1>Mon rapport personnel</h1>
          </div>
        </div>
      </header>

      <main class="report-main">
        <div class="report-filters">
          <select [(ngModel)]="selectedPeriod" (change)="loadReport()" class="filter-select">
            <option value="daily">Quotidien</option>
            <option value="weekly">Hebdomadaire</option>
            <option value="monthly">Mensuel</option>
            <option value="yearly">Annuel</option>
          </select>
        </div>

        <div *ngIf="isLoading" class="loading-state">
          <p>Chargement du rapport...</p>
        </div>

        <div *ngIf="!isLoading && report" class="report-content">
          <!-- Summary Cards -->
          <div class="summary-grid">
            <div class="summary-card">
              <h3>Total investi</h3>
              <p class="summary-value">{{ formatCurrency(report.totalInvested) }}</p>
            </div>
            <div class="summary-card positive">
              <h3>Total gagné</h3>
              <p class="summary-value">{{ formatCurrency(report.totalEarned) }}</p>
            </div>
            <div class="summary-card fee">
              <h3>Frais payés</h3>
              <p class="summary-value">{{ formatCurrency(report.totalFeesPaid) }}</p>
            </div>
            <div class="summary-card">
              <h3>Valeur du portefeuille</h3>
              <p class="summary-value">{{ formatCurrency(report.portfolioValue) }}</p>
            </div>
          </div>

          <!-- Performance -->
          <div class="performance-section">
            <h2>Performance</h2>
            <div class="performance-card">
              <div class="performance-header">
                <h3>Rendement</h3>
                <span class="return-badge" [class.positive]="report.returnPercentage >= 0" [class.negative]="report.returnPercentage < 0">
                  {{ report.returnPercentage >= 0 ? '+' : '' }}{{ report.returnPercentage.toFixed(2) }}%
                </span>
              </div>
              <p class="performance-note">
                Basé sur vos investissements et gains totaux
              </p>
            </div>
          </div>

          <!-- Transactions Breakdown -->
          <div class="transactions-section">
            <h2>Répartition des transactions</h2>
            <div class="transactions-grid">
              <div class="transaction-card">
                <div class="transaction-icon" style="background: #dcfce7;">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="19" x2="12" y2="5"/>
                    <polyline points="5 12 12 5 19 12"/>
                  </svg>
                </div>
                <div class="transaction-info">
                  <h3>Dépôts</h3>
                  <p class="transaction-count">{{ report.transactions.deposits | number }}</p>
                </div>
              </div>

              <div class="transaction-card">
                <div class="transaction-icon" style="background: #fee2e2;">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <polyline points="19 12 12 19 5 12"/>
                  </svg>
                </div>
                <div class="transaction-info">
                  <h3>Retraits</h3>
                  <p class="transaction-count">{{ report.transactions.withdrawals | number }}</p>
                </div>
              </div>

              <div class="transaction-card">
                <div class="transaction-icon" style="background: #dbeafe;">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  </svg>
                </div>
                <div class="transaction-info">
                  <h3>Investissements</h3>
                  <p class="transaction-count">{{ report.transactions.investments | number }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .report-container {
      min-height: 100vh;
      background: var(--background);
    }

    .report-header {
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

    .report-main {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .report-filters {
      margin-bottom: 2rem;
    }

    .filter-select {
      padding: 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 0.5rem;
      background: white;
      font-size: 0.875rem;
      cursor: pointer;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .summary-card {
      background: white;
      border-radius: 0.75rem;
      padding: 1.5rem;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border-color);
      text-align: center;

      &.positive {
        border-left: 4px solid var(--success-color);
      }

      &.fee {
        border-left: 4px solid var(--warning-color);
      }
    }

    .summary-card h3 {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-secondary);
      margin-bottom: 0.75rem;
    }

    .summary-value {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .performance-section {
      background: white;
      border-radius: 0.75rem;
      padding: 2rem;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border-color);
      margin-bottom: 2rem;
    }

    .performance-section h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 1.5rem;
    }

    .performance-card {
      background: var(--background);
      border-radius: 0.5rem;
      padding: 1.5rem;
    }

    .performance-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .performance-header h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .return-badge {
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-size: 1.25rem;
      font-weight: 700;

      &.positive {
        background: #dcfce7;
        color: #166534;
      }

      &.negative {
        background: #fee2e2;
        color: #991b1b;
      }
    }

    .performance-note {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-top: 0.5rem;
    }

    .transactions-section {
      background: white;
      border-radius: 0.75rem;
      padding: 2rem;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border-color);
    }

    .transactions-section h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 1.5rem;
    }

    .transactions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .transaction-card {
      background: var(--background);
      border-radius: 0.5rem;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      border: 1px solid var(--border-color);
    }

    .transaction-icon {
      width: 48px;
      height: 48px;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary-color);
    }

    .transaction-info {
      flex: 1;
    }

    .transaction-info h3 {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-secondary);
      margin-bottom: 0.25rem;
    }

    .transaction-count {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .loading-state {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 0.75rem;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border-color);
    }

    @media (max-width: 768px) {
      .report-header {
        padding: 1rem;
      }

      .report-main {
        padding: 1rem;
      }

      .summary-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class UserReportComponent implements OnInit {
  private reportingService = inject(ReportingService);

  report: UserReport | null = null;
  selectedPeriod: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly';
  isLoading = true;

  ngOnInit(): void {
    this.loadReport();
  }

  loadReport(): void {
    this.isLoading = true;
    this.reportingService.getUserReport(this.selectedPeriod).subscribe({
      next: (report) => {
        this.report = report;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0
    }).format(value);
  }
}


