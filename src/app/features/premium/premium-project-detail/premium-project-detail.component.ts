import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { PremiumService, PremiumProject } from '../../../core/services/premium.service';
import { WalletService, Wallet } from '../../../core/services/wallet.service';
import { TransactionFeeService } from '../../../core/services/transaction-fee.service';

@Component({
  selector: 'app-premium-project-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="project-detail-container">
      <header class="project-detail-header">
        <div class="header-content">
          <div>
            <a routerLink="/premium/projects" class="back-link">← Retour aux projets</a>
            <h1>{{ project?.name || 'Chargement...' }}</h1>
          </div>
        </div>
      </header>

      <main class="project-detail-main" *ngIf="project">
        <!-- Premium Access Check -->
        <div class="premium-warning" *ngIf="!isPremium">
          <div class="warning-content">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            </svg>
            <h2>Accès Premium requis</h2>
            <p>Ce projet est exclusif aux membres Premium. Abonnez-vous pour investir.</p>
            <a routerLink="/premium/plans" class="btn btn-primary">Passer à Premium</a>
          </div>
        </div>

        <div class="project-detail-content" *ngIf="isPremium">
          <div class="project-main">
            <div class="project-image-section">
              <div class="project-image" *ngIf="project.imageUrl">
                <img [src]="project.imageUrl" [alt]="project.name" />
              </div>
              <div class="project-image-placeholder" *ngIf="!project.imageUrl">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                </svg>
              </div>
            </div>

            <div class="project-info-card">
              <div class="project-badges">
                <span class="premium-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  </svg>
                  Premium Exclusif
                </span>
                <span class="category-badge">{{ getCategoryLabel(project.category) }}</span>
                <span class="risk-badge" [class]="'risk-' + project.riskLevel">
                  Risque: {{ getRiskLabel(project.riskLevel) }}
                </span>
              </div>

              <h2>{{ project.name }}</h2>
              <p class="project-description">{{ project.description }}</p>

              <div class="project-specs">
                <div class="spec-item">
                  <span class="spec-label">Investissement minimum</span>
                  <span class="spec-value">{{ formatCurrency(project.minInvestment, 'GNF') }}</span>
                </div>
                <div class="spec-item" *ngIf="project.maxInvestment">
                  <span class="spec-label">Investissement maximum</span>
                  <span class="spec-value">{{ formatCurrency(project.maxInvestment, 'GNF') }}</span>
                </div>
                <div class="spec-item">
                  <span class="spec-label">Rendement attendu</span>
                  <span class="spec-value highlight">{{ project.expectedReturn }}%</span>
                </div>
                <div class="spec-item" *ngIf="project.location">
                  <span class="spec-label">Localisation</span>
                  <span class="spec-value">{{ project.location }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Investment Card -->
          <div class="investment-card">
            <h3>Investir dans ce projet</h3>
            
            <form [formGroup]="investForm" (ngSubmit)="onInvest()">
              <div class="form-group">
                <label for="amount">Montant à investir</label>
                <div class="amount-input-wrapper">
                  <span class="currency-symbol">GNF</span>
                  <input
                    id="amount"
                    type="number"
                    formControlName="amount"
                    placeholder="0"
                    [min]="project.minInvestment"
                    [max]="project.maxInvestment"
                    [step]="1000"
                    [class.error]="investForm.get('amount')?.invalid && investForm.get('amount')?.touched"
                  />
                </div>
                <div class="error-message" *ngIf="investForm.get('amount')?.invalid && investForm.get('amount')?.touched">
                  <span *ngIf="investForm.get('amount')?.errors?.['min']">
                    Minimum: {{ formatCurrency(project.minInvestment, 'GNF') }}
                  </span>
                  <span *ngIf="investForm.get('amount')?.errors?.['max']">
                    Maximum: {{ formatCurrency(project.maxInvestment || 0, 'GNF') }}
                  </span>
                </div>
              </div>

              <div class="form-group">
                <label for="paymentMethod">Méthode de paiement</label>
                <select id="paymentMethod" formControlName="paymentMethod">
                  <option value="">Sélectionner</option>
                  <option value="wallet" *ngIf="wallet && wallet.balance >= (investForm.get('amount')?.value || 0)">
                    Portefeuille ({{ formatCurrency(wallet.balance, wallet.currency) }} disponible)
                  </option>
                  <option value="orange-money">Orange Money</option>
                  <option value="mtn-mobile-money">MTN Mobile Money</option>
                </select>
              </div>

              <div class="summary-box" *ngIf="feeCalculation">
                <div class="summary-item">
                  <span>Montant investi:</span>
                  <span class="summary-value">{{ formatCurrency(investForm.get('amount')?.value || 0, 'GNF') }}</span>
                </div>
                <div class="summary-item">
                  <span>Frais ({{ feeCalculation.feePercentage }}%):</span>
                  <span class="summary-value fee">{{ formatCurrency(feeCalculation.fee, 'GNF') }}</span>
                </div>
                <div class="summary-item total">
                  <span>Total à payer:</span>
                  <span class="summary-value">{{ formatCurrency(feeCalculation.total, 'GNF') }}</span>
                </div>
              </div>

              <div class="error-message" *ngIf="errorMessage">
                {{ errorMessage }}
              </div>

              <div class="form-actions">
                <button type="button" class="btn btn-outline" (click)="cancel()">Annuler</button>
                <button type="submit" class="btn btn-primary" [disabled]="investForm.invalid || isLoading">
                  <span *ngIf="!isLoading">Confirmer l'investissement</span>
                  <span *ngIf="isLoading">Traitement...</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .project-detail-container {
      min-height: 100vh;
      background: var(--background);
    }

    .project-detail-header {
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      color: white;
      padding: 1.5rem 2rem;

      .header-content {
        max-width: 1200px;
        margin: 0 auto;

        .back-link {
          color: white;
          text-decoration: none;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
          display: inline-block;
          opacity: 0.9;

          &:hover {
            text-decoration: underline;
          }
        }

        h1 {
          font-size: 1.875rem;
          font-weight: 700;
        }
      }
    }

    .project-detail-main {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .premium-warning {
      background: white;
      border-radius: 0.75rem;
      padding: 3rem;
      text-align: center;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border-color);
      margin-bottom: 2rem;
    }

    .warning-content svg {
      width: 64px;
      height: 64px;
      margin: 0 auto 1.5rem;
      color: #f59e0b;
    }

    .warning-content h2 {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 1rem;
    }

    .warning-content p {
      color: var(--text-secondary);
      margin-bottom: 2rem;
    }

    .project-detail-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
    }

    .project-main {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .project-image-section {
      background: white;
      border-radius: 0.75rem;
      overflow: hidden;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border-color);
    }

    .project-image {
      width: 100%;
      height: 400px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .project-image-placeholder {
      width: 100%;
      height: 400px;
      background: var(--background);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
    }

    .project-info-card {
      background: white;
      border-radius: 0.75rem;
      padding: 2rem;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border-color);
    }

    .project-badges {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }

    .premium-badge {
      padding: 0.5rem 1rem;
      background: #f59e0b;
      color: white;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .category-badge {
      padding: 0.5rem 1rem;
      background: var(--background);
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-primary);
    }

    .risk-badge {
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;

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

    .project-info-card h2 {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 1rem;
    }

    .project-description {
      font-size: 1rem;
      color: var(--text-secondary);
      line-height: 1.6;
      margin-bottom: 2rem;
    }

    .project-specs {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
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

    .amount-input-wrapper {
      display: flex;
      align-items: center;
      border: 1px solid var(--border-color);
      border-radius: 0.5rem;
      overflow: hidden;

      .currency-symbol {
        padding: 0.75rem 1rem;
        background: var(--background);
        font-weight: 500;
        color: var(--text-secondary);
        border-right: 1px solid var(--border-color);
      }

      input {
        flex: 1;
        border: none;
        padding: 0.75rem;
        font-size: 1.125rem;
        font-weight: 600;

        &:focus {
          outline: none;
        }
      }
    }

    .summary-box {
      background: var(--background);
      border-radius: 0.5rem;
      padding: 1.5rem;
      margin: 2rem 0;
      border: 1px solid var(--border-color);
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem 0;
      color: var(--text-secondary);
      font-size: 0.875rem;

      &.total {
        border-top: 1px solid var(--border-color);
        margin-top: 0.75rem;
        padding-top: 1rem;
        font-weight: 600;
        font-size: 1rem;
        color: var(--text-primary);
      }
    }

    .summary-value {
      font-weight: 600;
      color: var(--text-primary);

      &.fee {
        color: var(--warning-color);
      }
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
    }

    @media (max-width: 968px) {
      .project-detail-content {
        grid-template-columns: 1fr;
      }

      .investment-card {
        position: static;
      }

      .project-specs {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PremiumProjectDetailComponent implements OnInit {
  private fb = inject(FormBuilder);
  private premiumService = inject(PremiumService);
  private walletService = inject(WalletService);
  private feeService = inject(TransactionFeeService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  investForm: FormGroup;
  project: PremiumProject | null = null;
  wallet: Wallet | null = null;
  isPremium = false;
  isLoading = false;
  errorMessage = '';
  feeCalculation: any = null;

  constructor() {
    this.investForm = this.fb.group({
      amount: [0, [Validators.required]],
      paymentMethod: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.checkPremiumStatus();
    this.loadWallet();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadProject(params['id']);
      }
    });

    this.investForm.get('amount')?.valueChanges.subscribe(amount => {
      if (amount && this.project) {
        this.feeCalculation = this.feeService.calculateInvestmentFee(amount, 'GNF');
      }
    });
  }

  checkPremiumStatus(): void {
    this.premiumService.isPremiumUser().subscribe({
      next: (isPremium) => {
        this.isPremium = isPremium;
      }
    });
  }

  loadProject(id: string): void {
    this.premiumService.getPremiumProject(id).subscribe({
      next: (project) => {
        this.project = project;
        this.setupAmountValidators();
      },
      error: () => {
        this.router.navigate(['/premium/projects']);
      }
    });
  }

  loadWallet(): void {
    this.walletService.getWallet().subscribe({
      next: (wallet) => {
        this.wallet = wallet;
      }
    });
  }

  setupAmountValidators(): void {
    if (!this.project) return;

    const amountControl = this.investForm.get('amount');
    if (amountControl) {
      const validators = [Validators.required, Validators.min(this.project.minInvestment)];
      if (this.project.maxInvestment) {
        validators.push(Validators.max(this.project.maxInvestment));
      }
      amountControl.setValidators(validators);
      amountControl.updateValueAndValidity();
    }
  }

  onInvest(): void {
    if (this.investForm.invalid || !this.project) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.premiumService.investInPremiumProject(
      this.project.id,
      this.investForm.value.amount,
      this.investForm.value.paymentMethod
    ).subscribe({
      next: () => {
        this.router.navigate(['/premium/projects']);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Erreur lors de l\'investissement';
        this.isLoading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/premium/projects']);
  }

  formatCurrency(value: number, currency: string): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(value);
  }

  getCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      'luxury-real-estate': 'Immobilier de luxe',
      'commercial-real-estate': 'Immobilier commercial',
      'gold-bullion': 'Or physique',
      'gold-mining': 'Mines d\'or',
      'premium-fund': 'Fonds premium'
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


