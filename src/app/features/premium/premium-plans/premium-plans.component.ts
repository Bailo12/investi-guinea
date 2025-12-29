import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  PremiumService,
  PremiumPlan,
  PremiumSubscription,
} from '../../../core/services/premium.service';

@Component({
  selector: 'app-premium-plans',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="plans-container">
      <header class="plans-header">
        <div class="header-content">
          <div>
            <a routerLink="/premium" class="back-link">← Retour</a>
            <h1>Plans Premium</h1>
            <p>Choisissez le plan qui vous convient</p>
          </div>
        </div>
      </header>

      <main class="plans-main">
        <div *ngIf="isLoading" class="loading-state">
          <p>Chargement des plans...</p>
        </div>

        <div *ngIf="!isLoading && plans && plans.length > 0" class="plans-grid">
          <div
            class="plan-card"
            *ngFor="let plan of plans"
            [class.featured]="plan?.plan === 'premium'"
          >
            <div class="plan-badge" *ngIf="plan?.plan === 'premium'">
              Populaire
            </div>
            <div class="plan-header">
              <h2>{{ plan?.name }}</h2>
              <div class="plan-price">
                <span class="price-amount">{{
                  formatCurrency(plan?.price || 0, plan?.currency || 'GNF')
                }}</span>
                <span class="price-period">/ {{ plan?.duration }} mois</span>
              </div>
            </div>

            <div class="plan-features">
              <h3>Fonctionnalités incluses</h3>
              <ul>
                <li *ngFor="let feature of plan?.features">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {{ feature }}
                </li>
              </ul>
            </div>

            <div class="plan-benefits">
              <h3>Avantages</h3>
              <div class="benefits-list">
                <div
                  class="benefit-item"
                  *ngFor="let benefit of plan?.benefits"
                >
                  <span class="benefit-name">{{ benefit?.name }}</span>
                </div>
              </div>
            </div>

            <button
              class="btn btn-primary"
              (click)="selectPlan(plan)"
              [disabled]="selectedPlanId === plan?.id && isSubscribing"
            >
              <span *ngIf="selectedPlanId !== plan?.id || !isSubscribing"
                >Choisir ce plan</span
              >
              <span *ngIf="selectedPlanId === plan?.id && isSubscribing"
                >Abonnement...</span
              >
            </button>
          </div>
        </div>

        <!-- Subscription Form Modal -->
        <div
          class="modal-overlay"
          *ngIf="showSubscriptionModal && selectedPlan"
          (click)="closeModal()"
        >
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>S'abonner à {{ selectedPlan.name }}</h2>
              <button class="modal-close" (click)="closeModal()">×</button>
            </div>
            <div class="modal-body">
              <form [formGroup]="subscriptionForm" (ngSubmit)="subscribe()">
                <div class="plan-summary">
                  <div class="summary-item">
                    <span>Plan:</span>
                    <span>{{ selectedPlan.name }}</span>
                  </div>
                  <div class="summary-item">
                    <span>Prix:</span>
                    <span>{{
                      formatCurrency(selectedPlan.price, selectedPlan.currency)
                    }}</span>
                  </div>
                  <div class="summary-item">
                    <span>Durée:</span>
                    <span>{{ selectedPlan.duration }} mois</span>
                  </div>
                </div>

                <div class="form-group">
                  <label for="paymentMethod">Méthode de paiement</label>
                  <select id="paymentMethod" formControlName="paymentMethod">
                    <option value="">Sélectionner</option>
                    <option value="wallet">Portefeuille</option>
                    <option value="orange-money">Orange Money</option>
                    <option value="mtn-mobile-money">MTN Mobile Money</option>
                    <option value="bank-transfer">Virement bancaire</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="checkbox-label">
                    <input type="checkbox" formControlName="autoRenew" />
                    <span>Renouvellement automatique</span>
                  </label>
                </div>

                <div class="error-message" *ngIf="errorMessage">
                  {{ errorMessage }}
                </div>

                <div class="modal-actions">
                  <button
                    type="button"
                    class="btn btn-outline"
                    (click)="closeModal()"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    class="btn btn-primary"
                    [disabled]="subscriptionForm.invalid || isSubscribing"
                  >
                    <span *ngIf="!isSubscribing">Confirmer l'abonnement</span>
                    <span *ngIf="isSubscribing">Traitement...</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [
    `
      .plans-container {
        min-height: 100vh;
        background: var(--background);
      }

      .plans-header {
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
            margin-bottom: 0.25rem;
          }

          p {
            color: var(--text-secondary);
            font-size: 0.875rem;
          }
        }
      }

      .plans-main {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }

      .plans-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 2rem;
      }

      .plan-card {
        background: white;
        border-radius: 0.75rem;
        padding: 2rem;
        box-shadow: var(--shadow-md);
        border: 1px solid var(--border-color);
        position: relative;
        display: flex;
        flex-direction: column;

        &.featured {
          border: 2px solid #f59e0b;
          transform: scale(1.05);
        }
      }

      .plan-badge {
        position: absolute;
        top: -12px;
        right: 2rem;
        background: #f59e0b;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        font-size: 0.75rem;
        font-weight: 600;
      }

      .plan-header {
        text-align: center;
        margin-bottom: 2rem;
        padding-bottom: 2rem;
        border-bottom: 1px solid var(--border-color);
      }

      .plan-header h2 {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 1rem;
      }

      .plan-price {
        display: flex;
        align-items: baseline;
        justify-content: center;
        gap: 0.5rem;
      }

      .price-amount {
        font-size: 2.5rem;
        font-weight: 700;
        color: var(--primary-color);
      }

      .price-period {
        font-size: 1rem;
        color: var(--text-secondary);
      }

      .plan-features {
        flex: 1;
        margin-bottom: 1.5rem;
      }

      .plan-features h3 {
        font-size: 1rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 1rem;
      }

      .plan-features ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .plan-features li {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        color: var(--text-secondary);
        font-size: 0.875rem;
      }

      .plan-features li svg {
        color: var(--success-color);
        flex-shrink: 0;
      }

      .plan-benefits {
        margin-bottom: 2rem;
      }

      .plan-benefits h3 {
        font-size: 1rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 1rem;
      }

      .benefits-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .benefit-item {
        padding: 0.5rem;
        background: var(--background);
        border-radius: 0.375rem;
        font-size: 0.875rem;
      }

      .benefit-name {
        color: var(--text-primary);
        font-weight: 500;
      }

      .plan-card .btn {
        width: 100%;
        margin-top: auto;
      }

      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }

      .modal-content {
        background: white;
        border-radius: 0.75rem;
        width: 90%;
        max-width: 500px;
        box-shadow: var(--shadow-xl);
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid var(--border-color);

        h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
        }
      }

      .modal-close {
        background: none;
        border: none;
        font-size: 2rem;
        color: var(--text-secondary);
        cursor: pointer;
        line-height: 1;
      }

      .modal-body {
        padding: 1.5rem;
      }

      .plan-summary {
        background: var(--background);
        border-radius: 0.5rem;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
      }

      .summary-item {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 0;
        color: var(--text-secondary);
      }

      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 1.5rem;
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
        .plans-header {
          padding: 1rem;
        }

        .plans-main {
          padding: 1rem;
        }

        .plans-grid {
          grid-template-columns: 1fr;
        }

        .plan-card.featured {
          transform: none;
        }
      }
    `,
  ],
})
export class PremiumPlansComponent implements OnInit {
  private fb = inject(FormBuilder);
  private premiumService = inject(PremiumService);
  private router = inject(Router);

  plans: PremiumPlan[] = [];
  selectedPlan: PremiumPlan | null = null;
  selectedPlanId: string | null = null;
  showSubscriptionModal = false;
  subscriptionForm: FormGroup;
  isSubscribing = false;
  isLoading = true;
  errorMessage = '';

  constructor() {
    this.subscriptionForm = this.fb.group({
      paymentMethod: ['', [Validators.required]],
      autoRenew: [true],
    });
  }

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(): void {
    this.isLoading = true;
    this.premiumService.getPlans().subscribe({
      next: (plans) => {
        this.plans = plans;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  selectPlan(plan: PremiumPlan): void {
    this.selectedPlan = plan;
    this.selectedPlanId = plan.id;
    this.showSubscriptionModal = true;
  }

  closeModal(): void {
    this.showSubscriptionModal = false;
    this.selectedPlan = null;
    this.selectedPlanId = null;
    this.subscriptionForm.reset({ autoRenew: true });
  }

  subscribe(): void {
    if (this.subscriptionForm.invalid || !this.selectedPlan) return;

    this.isSubscribing = true;
    this.errorMessage = '';

    const subscription: PremiumSubscription = {
      planId: this.selectedPlan.id,
      paymentMethod: this.subscriptionForm.value.paymentMethod,
      autoRenew: this.subscriptionForm.value.autoRenew,
    };

    this.premiumService.subscribe(subscription).subscribe({
      next: () => {
        this.router.navigate(['/premium']);
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message || "Erreur lors de l'abonnement";
        this.isSubscribing = false;
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
}
