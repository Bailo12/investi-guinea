import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  ProductsService,
  Product,
  ProductType,
} from '../../../core/services/products.service';
import { PremiumService } from '../../../core/services/premium.service';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="products-container">
      <header class="products-header">
        <div class="header-content">
          <div>
            <h1>Nos produits d'investissement</h1>
            <p>
              Découvrez nos solutions d'investissement adaptées à vos besoins
            </p>
          </div>
          <a routerLink="/dashboard" class="btn btn-outline">Retour</a>
        </div>
      </header>

      <main class="products-main">
        <!-- Product Categories -->
        <div class="categories-nav">
          <button
            class="category-btn"
            [class.active]="selectedType === null"
            (click)="selectType(null)"
          >
            Tous les produits
          </button>
          <button
            class="category-btn"
            [class.active]="selectedType === 'micro-investment'"
            (click)="selectType('micro-investment')"
          >
            Micro-investissements
          </button>
          <button
            class="category-btn"
            [class.active]="selectedType === 'savings-account'"
            (click)="selectType('savings-account')"
          >
            Comptes d'épargne
          </button>
          <button
            class="category-btn"
            [class.active]="selectedType === 'local-project'"
            (click)="selectType('local-project')"
          >
            Projets locaux
          </button>
        </div>

        <!-- Products Grid -->
        <div *ngIf="isLoading" class="loading-state">
          <p>Chargement des produits...</p>
        </div>

        <div *ngIf="!isLoading && products.length === 0" class="empty-state">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            style="color: var(--text-secondary); margin-bottom: 1rem;"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
          </svg>
          <h3>Aucun produit disponible</h3>
          <p>Les produits seront disponibles prochainement</p>
        </div>

        <div *ngIf="!isLoading && products && products?.length > 0" class="products-grid">
          <div
            class="product-card"
            *ngFor="let product of products"
            [routerLink]="
              product?.premiumOnly && !isPremium
                ? null
                : ['/products', product?.id]
            "
            [class.premium-locked]="product?.premiumOnly && !isPremium"
          >
            <div class="product-header">
              <div class="product-type-badge" [class]="'type-' + product?.type">
                {{ getTypeLabel(product?.type || '') }}
              </div>
              <div class="product-badges">
                <div
                  class="product-status"
                  [class]="'status-' + product?.status"
                >
                  {{ getStatusLabel(product?.status || '') }}
                </div>
                <div class="premium-badge" *ngIf="product?.premiumOnly">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  </svg>
                  Premium
                </div>
              </div>
            </div>

            <div class="product-image" *ngIf="product?.imageUrl">
              <img [src]="product?.imageUrl" [alt]="product?.name" />
            </div>
            <div class="product-image-placeholder" *ngIf="!product?.imageUrl">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              </svg>
            </div>

            <div class="product-content">
              <h3 class="product-name">{{ product?.name }}</h3>
              <p class="product-description">{{ product?.description }}</p>

              <div class="product-details">
                <div class="detail-item" *ngIf="product.minInvestment">
                  <span class="detail-label">Investissement min:</span>
                  <span class="detail-value">{{
                    formatCurrency(product.minInvestment, product.currency)
                  }}</span>
                </div>
                <div class="detail-item" *ngIf="product.interestRate">
                  <span class="detail-label">Taux d'intérêt:</span>
                  <span class="detail-value">{{ product.interestRate }}%</span>
                </div>
                <div class="detail-item" *ngIf="product.expectedReturn">
                  <span class="detail-label">Rendement attendu:</span>
                  <span class="detail-value"
                    >{{ product.expectedReturn }}%</span
                  >
                </div>
                <div class="detail-item" *ngIf="product.category">
                  <span class="detail-label">Catégorie:</span>
                  <span class="detail-value">{{
                    getCategoryLabel(product.category)
                  }}</span>
                </div>
                <div class="detail-item" *ngIf="product.riskLevel">
                  <span class="detail-label">Risque:</span>
                  <span
                    class="detail-value risk-badge"
                    [class]="'risk-' + product.riskLevel"
                  >
                    {{ getRiskLabel(product.riskLevel) }}
                  </span>
                </div>
              </div>

              <div
                class="product-progress"
                *ngIf="product.targetAmount && product.currentInvestment"
              >
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    [style.width.%]="
                      (product.currentInvestment / product.targetAmount) * 100
                    "
                  ></div>
                </div>
                <p class="progress-text">
                  {{
                    formatCurrency(product.currentInvestment, product.currency)
                  }}
                  / {{ formatCurrency(product.targetAmount, product.currency) }}
                </p>
              </div>

              <div
                class="premium-lock-overlay"
                *ngIf="product.premiumOnly && !isPremium"
              >
                <div class="lock-content">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <p>Projet Premium</p>
                  <a
                    routerLink="/premium/plans"
                    class="btn btn-primary"
                    (click)="$event.stopPropagation()"
                  >
                    Passer à Premium
                  </a>
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
      .products-container {
        min-height: 100vh;
        background: var(--background);
      }

      .products-header {
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
        }
      }

      .products-main {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }

      .categories-nav {
        display: flex;
        gap: 0.75rem;
        margin-bottom: 2rem;
        flex-wrap: wrap;
      }

      .category-btn {
        padding: 0.75rem 1.5rem;
        border: 1px solid var(--border-color);
        border-radius: 0.5rem;
        background: white;
        color: var(--text-primary);
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          border-color: var(--primary-color);
          color: var(--primary-color);
        }

        &.active {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }
      }

      .products-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 1.5rem;
      }

      .product-card {
        background: white;
        border-radius: 0.75rem;
        overflow: hidden;
        box-shadow: var(--shadow-md);
        border: 1px solid var(--border-color);
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
        display: flex;
        flex-direction: column;

        &:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }
      }

      .product-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.5rem;
        border-bottom: 1px solid var(--border-color);
      }

      .product-badges {
        display: flex;
        gap: 0.5rem;
        align-items: center;
      }

      .premium-badge {
        padding: 0.25rem 0.5rem;
        background: #f59e0b;
        color: white;
        border-radius: 0.25rem;
        font-size: 0.75rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      .product-type-badge {
        padding: 0.375rem 0.75rem;
        border-radius: 0.375rem;
        font-size: 0.75rem;
        font-weight: 500;
        text-transform: capitalize;

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
        padding: 0.375rem 0.75rem;
        border-radius: 0.375rem;
        font-size: 0.75rem;
        font-weight: 500;
        text-transform: capitalize;

        &.status-active {
          background: #dcfce7;
          color: #166534;
        }

        &.status-closed {
          background: #fee2e2;
          color: #991b1b;
        }

        &.status-pending {
          background: #fef3c7;
          color: #92400e;
        }

        &.status-sold-out {
          background: #f3f4f6;
          color: #374151;
        }
      }

      .product-image {
        width: 100%;
        height: 200px;
        overflow: hidden;
        background: var(--background);

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .product-image-placeholder {
        width: 100%;
        height: 200px;
        background: var(--background);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-secondary);
      }

      .product-content {
        padding: 1.5rem;
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .product-name {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 0.5rem;
      }

      .product-description {
        font-size: 0.875rem;
        color: var(--text-secondary);
        margin-bottom: 1rem;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .product-details {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }

      .detail-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.875rem;
      }

      .detail-label {
        color: var(--text-secondary);
      }

      .detail-value {
        font-weight: 600;
        color: var(--text-primary);
      }

      .risk-badge {
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.75rem;

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

      .product-progress {
        margin-top: auto;
        padding-top: 1rem;
        border-top: 1px solid var(--border-color);
      }

      .progress-bar {
        height: 8px;
        background: var(--background);
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 0.5rem;
      }

      .progress-fill {
        height: 100%;
        background: var(--primary-color);
        transition: width 0.3s;
      }

      .progress-text {
        font-size: 0.75rem;
        color: var(--text-secondary);
        text-align: center;
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

      @media (max-width: 768px) {
        .products-header {
          padding: 1rem;

          .header-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
        }

        .products-main {
          padding: 1rem;
        }

        .products-grid {
          grid-template-columns: 1fr;
        }

        .categories-nav {
          overflow-x: auto;
          flex-wrap: nowrap;
          padding-bottom: 0.5rem;
        }
      }

      .premium-locked {
        position: relative;
        opacity: 0.7;
      }

      .premium-lock-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 0.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
      }

      .lock-content {
        text-align: center;
        padding: 2rem;

        svg {
          color: #f59e0b;
          margin-bottom: 1rem;
        }

        p {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }
      }
    `,
  ],
})
export class ProductsListComponent implements OnInit {
  private productsService = inject(ProductsService);
  private premiumService = inject(PremiumService);

  products: Product[] = [];
  selectedType: ProductType | null = null;
  isLoading = true;
  isPremium = false;

  ngOnInit(): void {
    this.checkPremiumStatus();
    this.loadProducts();
  }

  checkPremiumStatus(): void {
    this.premiumService.isPremiumUser().subscribe({
      next: (isPremium) => {
        this.isPremium = isPremium;
      },
    });
  }

  selectType(type: ProductType | null): void {
    this.selectedType = type;
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    const filter = this.selectedType ? { type: this.selectedType } : undefined;

    this.productsService.getProducts(filter).subscribe({
      next: (products) => {
        this.products = products;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.products = [];
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

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'micro-investment': 'Micro-investissement',
      'savings-account': "Compte d'épargne",
      'local-project': 'Projet local',
    };
    return labels[type] || type;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      active: 'Actif',
      closed: 'Fermé',
      pending: 'En attente',
      'sold-out': 'Épuisé',
    };
    return labels[status] || status;
  }

  getCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      agriculture: 'Agriculture',
      'real-estate': 'Immobilier',
      infrastructure: 'Infrastructure',
      technology: 'Technologie',
      commerce: 'Commerce',
      other: 'Autre',
    };
    return labels[category] || category;
  }

  getRiskLabel(risk: string): string {
    const labels: { [key: string]: string } = {
      low: 'Faible',
      medium: 'Moyen',
      high: 'Élevé',
    };
    return labels[risk] || risk;
  }
}
