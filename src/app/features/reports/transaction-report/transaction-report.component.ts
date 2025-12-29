import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ReportingService, TransactionReport } from '../../../core/services/reporting.service';

@Component({
  selector: 'app-transaction-report',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="report-container">
      <header class="report-header">
        <div class="header-content">
          <div>
            <a routerLink="/reports" class="back-link">← Retour aux rapports</a>
            <h1>Rapport des transactions</h1>
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
              <h3>Transactions totales</h3>
              <p class="summary-value">{{ report.totalTransactions | number }}</p>
            </div>
            <div class="summary-card">
              <h3>Montant total</h3>
              <p class="summary-value">{{ formatCurrency(report.totalAmount) }}</p>
            </div>
            <div class="summary-card">
              <h3>Frais totaux</h3>
              <p class="summary-value fee">{{ formatCurrency(report.totalFees) }}</p>
            </div>
          </div>

          <!-- Breakdown by Type -->
          <div class="breakdown-section">
            <h2>Répartition par type</h2>
            <div class="breakdown-grid">
              <div class="breakdown-card">
                <h3>Dépôts</h3>
                <div class="breakdown-stats">
                  <div class="stat">
                    <span class="stat-label">Nombre:</span>
                    <span class="stat-value">{{ report.deposits.count | number }}</span>
                  </div>
                  <div class="stat">
                    <span class="stat-label">Montant:</span>
                    <span class="stat-value">{{ formatCurrency(report.deposits.amount) }}</span>
                  </div>
                  <div class="stat">
                    <span class="stat-label">Frais:</span>
                    <span class="stat-value fee">{{ formatCurrency(report.deposits.fees) }}</span>
                  </div>
                </div>
              </div>

              <div class="breakdown-card">
                <h3>Retraits</h3>
                <div class="breakdown-stats">
                  <div class="stat">
                    <span class="stat-label">Nombre:</span>
                    <span class="stat-value">{{ report.withdrawals.count | number }}</span>
                  </div>
                  <div class="stat">
                    <span class="stat-label">Montant:</span>
                    <span class="stat-value">{{ formatCurrency(report.withdrawals.amount) }}</span>
                  </div>
                  <div class="stat">
                    <span class="stat-label">Frais:</span>
                    <span class="stat-value fee">{{ formatCurrency(report.withdrawals.fees) }}</span>
                  </div>
                </div>
              </div>

              <div class="breakdown-card">
                <h3>Investissements</h3>
                <div class="breakdown-stats">
                  <div class="stat">
                    <span class="stat-label">Nombre:</span>
                    <span class="stat-value">{{ report.investments.count | number }}</span>
                  </div>
                  <div class="stat">
                    <span class="stat-label">Montant:</span>
                    <span class="stat-value">{{ formatCurrency(report.investments.amount) }}</span>
                  </div>
                  <div class="stat">
                    <span class="stat-label">Frais:</span>
                    <span class="stat-value fee">{{ formatCurrency(report.investments.fees) }}</span>
                  </div>
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

      &.fee {
        color: var(--warning-color);
      }
    }

    .breakdown-section {
      background: white;
      border-radius: 0.75rem;
      padding: 2rem;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border-color);
    }

    .breakdown-section h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 1.5rem;
    }

    .breakdown-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .breakdown-card {
      background: var(--background);
      border-radius: 0.5rem;
      padding: 1.5rem;
      border: 1px solid var(--border-color);
    }

    .breakdown-card h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 1rem;
    }

    .breakdown-stats {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .stat {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .stat-label {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .stat-value {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);

      &.fee {
        color: var(--warning-color);
      }
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

      .breakdown-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class TransactionReportComponent implements OnInit {
  private reportingService = inject(ReportingService);

  report: TransactionReport | null = null;
  selectedPeriod: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly';
  isLoading = true;

  ngOnInit(): void {
    this.loadReport();
  }

  loadReport(): void {
    this.isLoading = true;
    this.reportingService.getTransactionReport(this.selectedPeriod).subscribe({
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


