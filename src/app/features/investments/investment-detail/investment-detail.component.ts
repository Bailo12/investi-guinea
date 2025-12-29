import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { InvestmentService, Investment } from '../../../core/services/investment.service';

@Component({
  selector: 'app-investment-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="detail-container">
      <header class="detail-header">
        <div class="header-content">
          <div>
            <a routerLink="/investments" class="back-link">← Retour à la liste</a>
            <h1>{{ investment?.name || 'Chargement...' }}</h1>
          </div>
          <div class="header-actions" *ngIf="investment">
            <a [routerLink]="['/investments', investment.id, 'edit']" class="btn btn-primary">Modifier</a>
            <button class="btn btn-danger" (click)="deleteInvestment()" [disabled]="isDeleting">
              {{ isDeleting ? 'Suppression...' : 'Supprimer' }}
            </button>
          </div>
        </div>
      </header>

      <main class="detail-main" *ngIf="investment">
        <div class="detail-grid">
          <div class="detail-card">
            <h2>Informations générales</h2>
            <div class="detail-info">
              <div class="info-item">
                <span class="info-label">Type</span>
                <span class="info-value type-badge" [class]="'type-' + investment.type">
                  {{ getTypeLabel(investment.type) }}
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Statut</span>
                <span class="info-value status-badge" [class]="'status-' + investment.status">
                  {{ getStatusLabel(investment.status) }}
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Date d'achat</span>
                <span class="info-value">{{ formatDate(investment.purchaseDate) }}</span>
              </div>
              <div class="info-item" *ngIf="investment.description">
                <span class="info-label">Description</span>
                <span class="info-value">{{ investment.description }}</span>
              </div>
            </div>
          </div>

          <div class="detail-card">
            <h2>Valeur financière</h2>
            <div class="detail-info">
              <div class="info-item">
                <span class="info-label">Montant investi</span>
                <span class="info-value large">{{ formatCurrency(investment.amount, investment.currency) }}</span>
              </div>
              <div class="info-item" *ngIf="investment.currentValue">
                <span class="info-label">Valeur actuelle</span>
                <span class="info-value large">{{ formatCurrency(investment.currentValue, investment.currency) }}</span>
              </div>
              <div class="info-item" *ngIf="investment.returnPercentage !== undefined">
                <span class="info-label">Rendement</span>
                <span class="info-value large" [class.positive]="investment.returnPercentage >= 0" [class.negative]="investment.returnPercentage < 0">
                  {{ investment.returnPercentage >= 0 ? '+' : '' }}{{ investment.returnPercentage.toFixed(2) }}%
                </span>
              </div>
              <div class="info-item" *ngIf="investment.currentValue && investment.returnPercentage !== undefined">
                <span class="info-label">Gain/Perte</span>
                <span class="info-value large" [class.positive]="investment.returnPercentage >= 0" [class.negative]="investment.returnPercentage < 0">
                  {{ formatCurrency(investment.currentValue - investment.amount, investment.currency) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="detail-card">
          <h2>Historique</h2>
          <div class="detail-info">
            <div class="info-item">
              <span class="info-label">Créé le</span>
              <span class="info-value">{{ formatDateTime(investment.createdAt) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Dernière mise à jour</span>
              <span class="info-value">{{ formatDateTime(investment.updatedAt) }}</span>
            </div>
          </div>
        </div>
      </main>

      <div *ngIf="isLoading" class="loading-state">
        <p>Chargement...</p>
      </div>
    </div>
  `,
  styles: [`
    .detail-container {
      min-height: 100vh;
      background: var(--background);
    }

    .detail-header {
      background: white;
      border-bottom: 1px solid var(--border-color);
      padding: 1.5rem 2rem;

      .header-content {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        flex-wrap: wrap;
        gap: 1rem;

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

        .header-actions {
          display: flex;
          gap: 0.75rem;
        }
      }
    }

    .detail-main {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .detail-card {
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

    .detail-info {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .info-label {
      font-size: 0.875rem;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .info-value {
      font-size: 1rem;
      color: var(--text-primary);

      &.large {
        font-size: 1.5rem;
        font-weight: 700;
      }

      &.positive {
        color: var(--success-color);
      }

      &.negative {
        color: var(--danger-color);
      }
    }

    .type-badge, .status-badge {
      display: inline-block;
      padding: 0.375rem 0.75rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      text-transform: capitalize;
      width: fit-content;
    }

    .type-badge {
      &.type-stocks { background: #dbeafe; color: #1e40af; }
      &.type-bonds { background: #dcfce7; color: #166534; }
      &.type-real-estate { background: #fef3c7; color: #92400e; }
      &.type-crypto { background: #e0e7ff; color: #3730a3; }
      &.type-mutual-funds { background: #fce7f3; color: #9f1239; }
      &.type-other { background: #f3f4f6; color: #374151; }
    }

    .status-badge {
      &.status-active { background: #dcfce7; color: #166534; }
      &.status-sold { background: #fee2e2; color: #991b1b; }
      &.status-pending { background: #fef3c7; color: #92400e; }
    }

    .loading-state {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 0.75rem;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border-color);
      max-width: 1200px;
      margin: 2rem auto;
    }

    @media (max-width: 768px) {
      .detail-header {
        padding: 1rem;

        .header-content {
          flex-direction: column;
        }
      }

      .detail-main {
        padding: 1rem;
      }

      .detail-grid {
        grid-template-columns: 1fr;
      }

      .header-actions {
        width: 100%;

        .btn {
          flex: 1;
        }
      }
    }
  `]
})
export class InvestmentDetailComponent implements OnInit {
  private investmentService = inject(InvestmentService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  investment: Investment | null = null;
  isLoading = true;
  isDeleting = false;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadInvestment(params['id']);
      }
    });
  }

  loadInvestment(id: string): void {
    this.isLoading = true;
    this.investmentService.getInvestment(id).subscribe({
      next: (investment) => {
        this.investment = investment;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(['/investments']);
      }
    });
  }

  deleteInvestment(): void {
    if (!this.investment || !confirm('Êtes-vous sûr de vouloir supprimer cet investissement ?')) {
      return;
    }

    this.isDeleting = true;
    this.investmentService.deleteInvestment(this.investment.id).subscribe({
      next: () => {
        this.router.navigate(['/investments']);
      },
      error: () => {
        this.isDeleting = false;
        alert('Erreur lors de la suppression');
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

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'stocks': 'Actions',
      'bonds': 'Obligations',
      'real-estate': 'Immobilier',
      'crypto': 'Cryptomonnaie',
      'mutual-funds': 'Fonds mutuels',
      'other': 'Autre'
    };
    return labels[type] || type;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'active': 'Actif',
      'sold': 'Vendu',
      'pending': 'En attente'
    };
    return labels[status] || status;
  }
}


