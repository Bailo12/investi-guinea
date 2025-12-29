import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ReportingService,
  FeeReport,
} from '../../../core/services/reporting.service';

@Component({
  selector: 'app-fee-report',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="report-container">
      <header class="report-header">
        <div class="header-content">
          <div>
            <a routerLink="/reports" class="back-link">← Retour aux rapports</a>
            <h1>Rapport des frais</h1>
          </div>
        </div>
      </header>

      <main class="report-main">
        <div class="report-filters">
          <select
            [(ngModel)]="selectedPeriod"
            (change)="loadReport()"
            class="filter-select"
          >
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
          <!-- Total Fees -->
          <div class="total-fees-card">
            <h2>Frais totaux collectés</h2>
            <p class="total-amount">{{ formatCurrency(report.totalFees) }}</p>
            <p class="period-note">
              Période: {{ getPeriodLabel(selectedPeriod) }}
            </p>
          </div>

          <!-- Fees by Type -->
          <div class="fees-section">
            <h2>Frais par type de transaction</h2>
            <div class="fees-table" *ngIf="report?.byType?.length">
              <div class="table-header">
                <span>Type</span>
                <span>Nombre</span>
                <span>Frais totaux</span>
                <span>Frais moyen</span>
                <span>Taux moyen</span>
              </div>
              <div class="table-row" *ngFor="let item of report?.byType">
                <span class="type-badge" [class]="'type-' + item?.type">
                  {{ getTypeLabel(item?.type || '') }}
                </span>
                <span>{{ item?.count | number }}</span>
                <span class="fee-amount">{{
                  formatCurrency(item?.totalFees || 0)
                }}</span>
                <span>{{ formatCurrency(item?.averageFee || 0) }}</span>
                <span>{{ (item?.averageFeePercentage || 0).toFixed(2) }}%</span>
              </div>
            </div>
          </div>

          <!-- Fees by Method -->
          <div class="fees-section">
            <h2>Frais par méthode de paiement</h2>
            <div class="fees-grid" *ngIf="report?.byMethod?.length">
              <div class="method-card" *ngFor="let item of report?.byMethod">
                <h3>{{ getMethodLabel(item?.method || '') }}</h3>
                <div class="method-stats">
                  <div class="stat">
                    <span class="stat-label">Transactions:</span>
                    <span class="stat-value">{{ item?.count | number }}</span>
                  </div>
                  <div class="stat">
                    <span class="stat-label">Frais totaux:</span>
                    <span class="stat-value fee">{{
                      formatCurrency(item?.totalFees || 0)
                    }}</span>
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

      .total-fees-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 0.75rem;
        padding: 3rem;
        text-align: center;
        color: white;
        margin-bottom: 2rem;
        box-shadow: var(--shadow-lg);
      }

      .total-fees-card h2 {
        font-size: 1.25rem;
        font-weight: 500;
        opacity: 0.9;
        margin-bottom: 1rem;
      }

      .total-amount {
        font-size: 3rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
      }

      .period-note {
        font-size: 0.875rem;
        opacity: 0.8;
      }

      .fees-section {
        background: white;
        border-radius: 0.75rem;
        padding: 2rem;
        box-shadow: var(--shadow-md);
        border: 1px solid var(--border-color);
        margin-bottom: 2rem;
      }

      .fees-section h2 {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 1.5rem;
      }

      .fees-table {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .table-header,
      .table-row {
        display: grid;
        grid-template-columns: 1.5fr 1fr 1.5fr 1.5fr 1fr;
        gap: 1rem;
        padding: 1rem;
        align-items: center;
      }

      .table-header {
        background: var(--background);
        font-weight: 600;
        color: var(--text-primary);
        border-radius: 0.5rem;
      }

      .table-row {
        background: var(--background);
        border-radius: 0.5rem;
        transition: background 0.2s;

        &:hover {
          background: #f1f5f9;
        }
      }

      .type-badge {
        padding: 0.375rem 0.75rem;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        font-weight: 500;
        width: fit-content;

        &.type-deposit {
          background: #dcfce7;
          color: #166534;
        }

        &.type-withdrawal {
          background: #fee2e2;
          color: #991b1b;
        }

        &.type-investment {
          background: #dbeafe;
          color: #1e40af;
        }
      }

      .fee-amount {
        font-weight: 600;
        color: var(--warning-color);
      }

      .fees-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
      }

      .method-card {
        background: var(--background);
        border-radius: 0.5rem;
        padding: 1.5rem;
        border: 1px solid var(--border-color);
      }

      .method-card h3 {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 1rem;
      }

      .method-stats {
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

      @media (max-width: 968px) {
        .table-header,
        .table-row {
          grid-template-columns: 1fr;
          gap: 0.5rem;
        }

        .table-header {
          display: none;
        }

        .table-row {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
      }
    `,
  ],
})
export class FeeReportComponent implements OnInit {
  private reportingService = inject(ReportingService);

  report: FeeReport | null = null;
  selectedPeriod: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly';
  isLoading = true;

  ngOnInit(): void {
    this.loadReport();
  }

  loadReport(): void {
    this.isLoading = true;
    this.reportingService.getFeeReport(this.selectedPeriod).subscribe({
      next: (report) => {
        this.report = report;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
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

  getPeriodLabel(period: string): string {
    const labels: { [key: string]: string } = {
      daily: 'Quotidien',
      weekly: 'Hebdomadaire',
      monthly: 'Mensuel',
      yearly: 'Annuel',
    };
    return labels[period] || period;
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      deposit: 'Dépôt',
      withdrawal: 'Retrait',
      investment: 'Investissement',
    };
    return labels[type] || type;
  }

  getMethodLabel(method: string): string {
    const labels: { [key: string]: string } = {
      wallet: 'Portefeuille',
      'orange-money': 'Orange Money',
      'mtn-mobile-money': 'MTN Mobile Money',
      'bank-transfer': 'Virement bancaire',
    };
    return labels[method] || method;
  }
}
