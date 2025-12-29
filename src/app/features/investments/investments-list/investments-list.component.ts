import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  InvestmentService,
  Investment,
} from '../../../core/services/investment.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-investments-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="investments-container">
      <header class="investments-header">
        <div class="header-content">
          <div>
            <h1>Mes investissements</h1>
            <p>Gérez votre portefeuille d'investissements</p>
          </div>
          <div class="header-actions">
            <a routerLink="/dashboard" class="btn btn-outline">Retour</a>
            <a routerLink="/investments/new" class="btn btn-primary">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                style="margin-right: 0.5rem;"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nouvel investissement
            </a>
          </div>
        </div>
      </header>

      <main class="investments-main">
        <div *ngIf="isLoading" class="loading-state">
          <p>Chargement...</p>
        </div>

        <div *ngIf="!isLoading && investments.length === 0" class="empty-state">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            style="color: var(--text-secondary); margin-bottom: 1rem;"
          >
            <path
              d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
            />
          </svg>
          <h3>Aucun investissement</h3>
          <p>Commencez par ajouter votre premier investissement</p>
          <a
            routerLink="/investments/new"
            class="btn btn-primary"
            style="margin-top: 1rem;"
            >Ajouter un investissement</a
          >
        </div>

        <div
          *ngIf="!isLoading && investments.length > 0"
          class="investments-grid"
        >
          <div
            class="investment-card"
            *ngFor="let investment of investments"
            [routerLink]="['/investments', investment?.id]"
          >
            <div class="investment-header">
              <div
                class="investment-type-badge"
                [class]="'type-' + investment?.type"
              >
                {{ getTypeLabel(investment?.type || '') }}
              </div>
              <div
                class="investment-status"
                [class]="'status-' + investment?.status"
              >
                {{ getStatusLabel(investment?.status || '') }}
              </div>
            </div>

            <h3 class="investment-name">{{ investment?.name }}</h3>

            <div class="investment-details">
              <div class="detail-item">
                <span class="detail-label">Montant investi</span>
                <span class="detail-value">{{
                  formatCurrency(
                    investment?.amount || 0,
                    investment?.currency || 'GNF'
                  )
                }}</span>
              </div>

              <div class="detail-item" *ngIf="investment?.currentValue">
                <span class="detail-label">Valeur actuelle</span>
                <span class="detail-value">{{
                  formatCurrency(
                    investment?.currentValue || 0,
                    investment?.currency || 'GNF'
                  )
                }}</span>
              </div>

              <div
                class="detail-item"
                *ngIf="investment?.returnPercentage !== undefined"
              >
                <span class="detail-label">Rendement</span>
                <span
                  class="detail-value"
                  [class.positive]="(investment?.returnPercentage || 0) >= 0"
                  [class.negative]="(investment?.returnPercentage || 0) < 0"
                >
                  {{ (investment?.returnPercentage || 0) >= 0 ? '+' : ''
                  }}{{ (investment?.returnPercentage || 0).toFixed(2) }}%
                </span>
              </div>
            </div>

            <div class="investment-footer">
              <span class="investment-date"
                >Acheté le
                {{ formatDate(investment?.purchaseDate || '') }}</span
              >
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [
    `
      .investments-container {
        min-height: 100vh;
        background: var(--background);
      }

      .investments-header {
        background: white;
        border-bottom: 1px solid var(--border-color);
        padding: 1.5rem 2rem;

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;

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

      .investments-main {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
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

      .investments-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 1.5rem;
      }

      .investment-card {
        background: white;
        border-radius: 0.75rem;
        padding: 1.5rem;
        box-shadow: var(--shadow-md);
        border: 1px solid var(--border-color);
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;

        &:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }
      }

      .investment-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }

      .investment-type-badge {
        padding: 0.375rem 0.75rem;
        border-radius: 0.375rem;
        font-size: 0.75rem;
        font-weight: 500;
        text-transform: capitalize;

        &.type-stocks {
          background: #dbeafe;
          color: #1e40af;
        }
        &.type-bonds {
          background: #dcfce7;
          color: #166534;
        }
        &.type-real-estate {
          background: #fef3c7;
          color: #92400e;
        }
        &.type-crypto {
          background: #e0e7ff;
          color: #3730a3;
        }
        &.type-mutual-funds {
          background: #fce7f3;
          color: #9f1239;
        }
        &.type-other {
          background: #f3f4f6;
          color: #374151;
        }
      }

      .investment-status {
        padding: 0.375rem 0.75rem;
        border-radius: 0.375rem;
        font-size: 0.75rem;
        font-weight: 500;
        text-transform: capitalize;

        &.status-active {
          background: #dcfce7;
          color: #166534;
        }
        &.status-sold {
          background: #fee2e2;
          color: #991b1b;
        }
        &.status-pending {
          background: #fef3c7;
          color: #92400e;
        }
      }

      .investment-name {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 1rem;
      }

      .investment-details {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-bottom: 1rem;
      }

      .detail-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .detail-label {
        font-size: 0.875rem;
        color: var(--text-secondary);
      }

      .detail-value {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--text-primary);

        &.positive {
          color: var(--success-color);
        }

        &.negative {
          color: var(--danger-color);
        }
      }

      .investment-footer {
        padding-top: 1rem;
        border-top: 1px solid var(--border-color);
      }

      .investment-date {
        font-size: 0.75rem;
        color: var(--text-secondary);
      }

      @media (max-width: 768px) {
        .investments-header {
          padding: 1rem;

          .header-content {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        .investments-main {
          padding: 1rem;
        }

        .investments-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class InvestmentsListComponent implements OnInit {
  private investmentService = inject(InvestmentService);

  investments: Investment[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.loadInvestments();
  }

  loadInvestments(): void {
    this.isLoading = true;
    this.investmentService.getInvestments().subscribe({
      next: (investments) => {
        this.investments = investments;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        // In a real app, handle error appropriately
        this.investments = [];
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
      month: 'long',
      day: 'numeric',
    });
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

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      active: 'Actif',
      sold: 'Vendu',
      pending: 'En attente',
    };
    return labels[status] || status;
  }
}
