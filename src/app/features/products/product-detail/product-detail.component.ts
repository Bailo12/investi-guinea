import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ProductsService, Product } from '../../../core/services/products.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="product-detail-container">
      <header class="product-detail-header">
        <div class="header-content">
          <div>
            <a routerLink="/products" class="back-link">← Retour aux produits</a>
            <h1>{{ product?.name || 'Chargement...' }}</h1>
          </div>
        </div>
      </header>

      <main class="product-detail-main" *ngIf="product">
        <div class="product-detail-grid">
          <!-- Main Content -->
          <div class="product-main">
            <div class="product-image-section">
              <div class="product-image" *ngIf="product.imageUrl">
                <img [src]="product.imageUrl" [alt]="product.name" />
              </div>
              <div class="product-image-placeholder" *ngIf="!product.imageUrl">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                </svg>
              </div>
            </div>

            <div class="product-info-card">
              <div class="product-header-badges">
                <span class="product-type-badge" [class]="'type-' + product.type">
                  {{ getTypeLabel(product.type) }}
                </span>
                <span class="product-status" [class]="'status-' + product.status">
                  {{ getStatusLabel(product.status) }}
                </span>
                <span class="risk-badge" *ngIf="product.riskLevel" [class]="'risk-' + product.riskLevel">
                  Risque: {{ getRiskLabel(product.riskLevel) }}
                </span>
              </div>

              <h2>{{ product.name }}</h2>
              <p class="product-description">{{ product.description }}</p>

              <div class="product-specs">
                <div class="spec-item" *ngIf="product.minInvestment">
                  <span class="spec-label">Investissement minimum</span>
                  <span class="spec-value">{{ formatCurrency(product.minInvestment, product.currency) }}</span>
                </div>
                <div class="spec-item" *ngIf="product.maxInvestment">
                  <span class="spec-label">Investissement maximum</span>
                  <span class="spec-value">{{ formatCurrency(product.maxInvestment, product.currency) }}</span>
                </div>
                <div class="spec-item" *ngIf="product.interestRate">
                  <span class="spec-label">Taux d'intérêt</span>
                  <span class="spec-value">{{ product.interestRate }}%</span>
                </div>
                <div class="spec-item" *ngIf="product.expectedReturn">
                  <span class="spec-label">Rendement attendu</span>
                  <span class="spec-value highlight">{{ product.expectedReturn }}%</span>
                </div>
                <div class="spec-item" *ngIf="product.duration">
                  <span class="spec-label">Durée</span>
                  <span class="spec-value">{{ product.duration }} mois</span>
                </div>
                <div class="spec-item" *ngIf="product.category">
                  <span class="spec-label">Catégorie</span>
                  <span class="spec-value">{{ getCategoryLabel(product.category) }}</span>
                </div>
                <div class="spec-item" *ngIf="product.location">
                  <span class="spec-label">Localisation</span>
                  <span class="spec-value">{{ product.location }}</span>
                </div>
                <div class="spec-item" *ngIf="product.startDate">
                  <span class="spec-label">Date de début</span>
                  <span class="spec-value">{{ formatDate(product.startDate) }}</span>
                </div>
                <div class="spec-item" *ngIf="product.endDate">
                  <span class="spec-label">Date de fin</span>
                  <span class="spec-value">{{ formatDate(product.endDate) }}</span>
                </div>
              </div>

              <div class="product-progress" *ngIf="product.targetAmount && product.currentInvestment">
                <div class="progress-header">
                  <span>Financement</span>
                  <span>{{ ((product.currentInvestment / product.targetAmount) * 100).toFixed(1) }}%</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" [style.width.%]="(product.currentInvestment / product.targetAmount) * 100"></div>
                </div>
                <div class="progress-footer">
                  <span>{{ formatCurrency(product.currentInvestment, product.currency) }}</span>
                  <span>{{ formatCurrency(product.targetAmount, product.currency) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Investment Card -->
          <div class="investment-card">
            <h3>Investir maintenant</h3>
            
            <div class="investment-summary" *ngIf="product.minInvestment">
              <div class="summary-item">
                <span>Minimum:</span>
                <span class="summary-value">{{ formatCurrency(product.minInvestment, product.currency) }}</span>
              </div>
              <div class="summary-item" *ngIf="product.maxInvestment">
                <span>Maximum:</span>
                <span class="summary-value">{{ formatCurrency(product.maxInvestment, product.currency) }}</span>
              </div>
              <div class="summary-item highlight" *ngIf="product.expectedReturn">
                <span>Rendement attendu:</span>
                <span class="summary-value">{{ product.expectedReturn }}%</span>
              </div>
            </div>

            <div class="investment-actions">
              <button
                class="btn btn-primary"
                [disabled]="product.status !== 'active'"
                (click)="invest()"
              >
                Investir maintenant
              </button>
              <p class="help-text" *ngIf="product.status !== 'active'">
                Ce produit n'est pas disponible pour l'investissement
              </p>
              <p class="help-text" *ngIf="product.status === 'active' && product.type === 'micro-investment'">
                Investissement minimum: 50,000 GNF
              </p>
            </div>

            <div class="investment-features">
              <h4>Avantages</h4>
              <ul>
                <li *ngIf="product.type === 'micro-investment'">Investissement accessible dès 50,000 GNF</li>
                <li *ngIf="product.type === 'savings-account'">Intérêts compétitifs</li>
                <li *ngIf="product.type === 'local-project'">Impact local positif</li>
                <li>Paiement sécurisé</li>
                <li>Suivi en temps réel</li>
              </ul>
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
    .product-detail-container {
      min-height: 100vh;
      background: var(--background);
    }

    .product-detail-header {
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

    .product-detail-main {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .product-detail-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
    }

    .product-main {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .product-image-section {
      background: white;
      border-radius: 0.75rem;
      overflow: hidden;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border-color);
    }

    .product-image {
      width: 100%;
      height: 400px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .product-image-placeholder {
      width: 100%;
      height: 400px;
      background: var(--background);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
    }

    .product-info-card {
      background: white;
      border-radius: 0.75rem;
      padding: 2rem;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border-color);
    }

    .product-header-badges {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }

    .product-type-badge, .product-status, .risk-badge {
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .product-type-badge {
      &.type-micro-investment {
        background: #dbeafe;
        color: #1e40af;
      }

      &.type-savings-account {
        background: #dcfce7;
        color: #166534;
      }

      &.type-local-project {
        background: #fef3c7;
        color: #92400e;
      }
    }

    .product-status {
      &.status-active {
        background: #dcfce7;
        color: #166534;
      }

      &.status-closed {
        background: #fee2e2;
        color: #991b1b;
      }
    }

    .risk-badge {
      &.risk-low {
        background: #dcfce7;
        color: #166534;
      }

      &.risk-medium {
        background: #fef3c7;
        color: #92400e;
      }

      &.risk-high {
        background: #fee2e2;
        color: #991b1b;
      }
    }

    .product-info-card h2 {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 1rem;
    }

    .product-description {
      font-size: 1rem;
      color: var(--text-secondary);
      line-height: 1.6;
      margin-bottom: 2rem;
    }

    .product-specs {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .spec-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .spec-label {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .spec-value {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);

      &.highlight {
        color: var(--primary-color);
        font-size: 1.25rem;
      }
    }

    .product-progress {
      padding: 1.5rem;
      background: var(--background);
      border-radius: 0.5rem;
      border: 1px solid var(--border-color);
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.75rem;
      font-weight: 600;
    }

    .progress-bar {
      height: 12px;
      background: white;
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 0.75rem;
    }

    .progress-fill {
      height: 100%;
      background: var(--primary-color);
      transition: width 0.3s;
    }

    .progress-footer {
      display: flex;
      justify-content: space-between;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .investment-card {
      background: white;
      border-radius: 0.75rem;
      padding: 2rem;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border-color);
      height: fit-content;
      position: sticky;
      top: 2rem;
    }

    .investment-card h3 {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 1.5rem;
    }

    .investment-summary {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: var(--background);
      border-radius: 0.5rem;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;

      &.highlight {
        padding-top: 1rem;
        border-top: 1px solid var(--border-color);
        font-weight: 600;
      }
    }

    .summary-value {
      font-weight: 600;
      color: var(--text-primary);
    }

    .investment-actions {
      margin-bottom: 2rem;

      .btn {
        width: 100%;
        margin-bottom: 0.75rem;
      }
    }

    .help-text {
      font-size: 0.875rem;
      color: var(--text-secondary);
      text-align: center;
    }

    .investment-features {
      h4 {
        font-size: 1rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 1rem;
      }

      ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      li {
        font-size: 0.875rem;
        color: var(--text-secondary);
        padding-left: 1.5rem;
        position: relative;

        &:before {
          content: '✓';
          position: absolute;
          left: 0;
          color: var(--success-color);
          font-weight: 600;
        }
      }
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

    @media (max-width: 968px) {
      .product-detail-grid {
        grid-template-columns: 1fr;
      }

      .investment-card {
        position: static;
      }

      .product-specs {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  private productsService = inject(ProductsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  product: Product | null = null;
  isLoading = true;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadProduct(params['id']);
      }
    });
  }

  loadProduct(id: string): void {
    this.isLoading = true;
    this.productsService.getProduct(id).subscribe({
      next: (product) => {
        this.product = product;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(['/products']);
      }
    });
  }

  invest(): void {
    if (this.product) {
      this.router.navigate(['/products', this.product.id, 'invest']);
    }
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

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'micro-investment': 'Micro-investissement',
      'savings-account': 'Compte d\'épargne',
      'local-project': 'Projet local'
    };
    return labels[type] || type;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'active': 'Actif',
      'closed': 'Fermé',
      'pending': 'En attente',
      'sold-out': 'Épuisé'
    };
    return labels[status] || status;
  }

  getCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      'agriculture': 'Agriculture',
      'real-estate': 'Immobilier',
      'infrastructure': 'Infrastructure',
      'technology': 'Technologie',
      'commerce': 'Commerce',
      'other': 'Autre'
    };
    return labels[category] || category;
  }

  getRiskLabel(risk: string): string {
    const labels: { [key: string]: string } = {
      'low': 'Faible',
      'medium': 'Moyen',
      'high': 'Élevé'
    };
    return labels[risk] || risk;
  }
}


