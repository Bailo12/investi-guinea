import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ProductsService, Product, CreateMicroInvestment, CreateSavingsAccount, InvestInProject } from '../../../core/services/products.service';
import { WalletService, Wallet } from '../../../core/services/wallet.service';
import { TransactionFeeService, FeeCalculation } from '../../../core/services/transaction-fee.service';

@Component({
  selector: 'app-product-invest',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="invest-container">
      <header class="invest-header">
        <div class="header-content">
          <div>
            <a [routerLink]="['/products', product?.id]" class="back-link">← Retour au produit</a>
            <h1>Investir dans {{ product?.name }}</h1>
          </div>
        </div>
      </header>

      <main class="invest-main" *ngIf="product">
        <div class="invest-card">
          <div class="product-summary">
            <h3>{{ product.name }}</h3>
            <div class="summary-details">
              <div class="detail-row" *ngIf="product.minInvestment">
                <span>Investissement minimum:</span>
                <span class="value">{{ formatCurrency(product.minInvestment, product.currency) }}</span>
              </div>
              <div class="detail-row" *ngIf="product.maxInvestment">
                <span>Investissement maximum:</span>
                <span class="value">{{ formatCurrency(product.maxInvestment, product.currency) }}</span>
              </div>
              <div class="detail-row" *ngIf="product.expectedReturn">
                <span>Rendement attendu:</span>
                <span class="value highlight">{{ product.expectedReturn }}%</span>
              </div>
              <div class="detail-row" *ngIf="product.interestRate">
                <span>Taux d'intérêt:</span>
                <span class="value highlight">{{ product.interestRate }}%</span>
              </div>
            </div>
          </div>

          <form [formGroup]="investForm" (ngSubmit)="onSubmit()" class="invest-form">
            <div class="form-group">
              <label for="amount">Montant à investir</label>
              <div class="amount-input-wrapper">
                <span class="currency-symbol">{{ product.currency }}</span>
                <input
                  id="amount"
                  type="number"
                  formControlName="amount"
                  placeholder="0"
                  [min]="product.minInvestment || 50000"
                  [max]="product.maxInvestment"
                  [step]="1000"
                  [class.error]="investForm.get('amount')?.invalid && investForm.get('amount')?.touched"
                />
              </div>
              <div class="error-message" *ngIf="investForm.get('amount')?.invalid && investForm.get('amount')?.touched">
                <span *ngIf="investForm.get('amount')?.errors?.['required']">Montant requis</span>
                <span *ngIf="investForm.get('amount')?.errors?.['min']">
                  Minimum: {{ formatCurrency(product.minInvestment || 50000, product.currency) }}
                </span>
                <span *ngIf="investForm.get('amount')?.errors?.['max']">
                  Maximum: {{ formatCurrency(product.maxInvestment || 0, product.currency) }}
                </span>
              </div>
              <p class="help-text" *ngIf="product.type === 'micro-investment'">
                Investissement minimum: 50,000 GNF
              </p>
            </div>

            <div class="form-group">
              <label for="paymentMethod">Méthode de paiement</label>
              <select
                id="paymentMethod"
                formControlName="paymentMethod"
                [class.error]="investForm.get('paymentMethod')?.invalid && investForm.get('paymentMethod')?.touched"
              >
                <option value="">Sélectionner</option>
                <option value="wallet" *ngIf="wallet && wallet.balance >= (investForm.get('amount')?.value || 0)">
                  Portefeuille ({{ formatCurrency(wallet.balance, wallet.currency) }} disponible)
                </option>
                <option value="orange-money">Orange Money</option>
                <option value="mtn-mobile-money">MTN Mobile Money</option>
              </select>
              <div class="error-message" *ngIf="investForm.get('paymentMethod')?.invalid && investForm.get('paymentMethod')?.touched">
                Méthode de paiement requise
              </div>
            </div>

            <div class="summary-box">
              <div class="summary-item">
                <span>Montant investi:</span>
                <span class="summary-value">{{ formatCurrency(investForm.get('amount')?.value || 0, product.currency) }}</span>
              </div>
              <div class="summary-item" *ngIf="feeCalculation">
                <span>Frais de transaction ({{ feeCalculation.feePercentage }}%):</span>
                <span class="summary-value fee">{{ formatCurrency(feeCalculation.fee, feeCalculation.currency) }}</span>
              </div>
              <div class="summary-item" *ngIf="product.expectedReturn">
                <span>Rendement attendu:</span>
                <span class="summary-value">{{ product.expectedReturn }}%</span>
              </div>
              <div class="summary-item total">
                <span>Total à payer:</span>
                <span class="summary-value">{{ formatCurrency(feeCalculation?.total || investForm.get('amount')?.value || 0, product.currency) }}</span>
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
      </main>
    </div>
  `,
  styles: [`
    .invest-container {
      min-height: 100vh;
      background: var(--background);
    }

    .invest-header {
      background: white;
      border-bottom: 1px solid var(--border-color);
      padding: 1.5rem 2rem;

      .header-content {
        max-width: 800px;
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

    .invest-main {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    .invest-card {
      background: white;
      border-radius: 0.75rem;
      padding: 2rem;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border-color);
    }

    .product-summary {
      background: var(--background);
      border-radius: 0.5rem;
      padding: 1.5rem;
      margin-bottom: 2rem;
      border: 1px solid var(--border-color);

      h3 {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 1rem;
      }
    }

    .summary-details {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.875rem;

      .value {
        font-weight: 600;
        color: var(--text-primary);

        &.highlight {
          color: var(--primary-color);
          font-size: 1rem;
        }
      }
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

    .help-text {
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin-top: 0.5rem;
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
      align-items: center;
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

    @media (max-width: 768px) {
      .invest-header {
        padding: 1rem;
      }

      .invest-main {
        padding: 1rem;
      }

      .invest-card {
        padding: 1.5rem;
      }

      .form-actions {
        flex-direction: column-reverse;

        .btn {
          width: 100%;
        }
      }
    }
  `]
})
export class ProductInvestComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productsService = inject(ProductsService);
  private walletService = inject(WalletService);
  private feeService = inject(TransactionFeeService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  investForm: FormGroup;
  product: Product | null = null;
  wallet: Wallet | null = null;
  isLoading = false;
  errorMessage = '';
  feeCalculation: FeeCalculation | null = null;

  constructor() {
    this.investForm = this.fb.group({
      amount: [0, [Validators.required]],
      paymentMethod: ['', [Validators.required]]
    });

    // Calculate fees when amount changes
    this.investForm.get('amount')?.valueChanges.subscribe(amount => {
      if (amount && this.product) {
        this.feeCalculation = this.feeService.calculateInvestmentFee(amount, this.product.currency);
      } else {
        this.feeCalculation = null;
      }
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadProduct(params['id']);
      }
    });
    this.loadWallet();
  }

  loadProduct(id: string): void {
    this.productsService.getProduct(id).subscribe({
      next: (product) => {
        this.product = product;
        this.setupAmountValidators();
      },
      error: () => {
        this.router.navigate(['/products']);
      }
    });
  }

  loadWallet(): void {
    this.walletService.getWallet().subscribe({
      next: (wallet) => {
        this.wallet = wallet;
      },
      error: () => {
        // Handle error
      }
    });
  }

  setupAmountValidators(): void {
    if (!this.product) return;

    const amountControl = this.investForm.get('amount');
    if (amountControl) {
      const validators = [Validators.required];
      
      if (this.product.minInvestment) {
        validators.push(Validators.min(this.product.minInvestment));
      }
      
      if (this.product.maxInvestment) {
        validators.push(Validators.max(this.product.maxInvestment));
      }

      amountControl.setValidators(validators);
      amountControl.updateValueAndValidity();
    }
  }

  onSubmit(): void {
    if (this.investForm.invalid || !this.product) return;

    this.isLoading = true;
    this.errorMessage = '';

    const formValue = this.investForm.value;

    let request: any;
    if (this.product.type === 'micro-investment') {
      request = {
        productId: this.product.id,
        amount: formValue.amount,
        currency: this.product.currency,
        paymentMethod: formValue.paymentMethod
      } as CreateMicroInvestment;
      
      this.productsService.investInMicroInvestment(request).subscribe({
        next: () => {
          this.router.navigate(['/products']);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Erreur lors de l\'investissement. Veuillez réessayer.';
          this.isLoading = false;
        }
      });
    } else if (this.product.type === 'savings-account') {
      request = {
        productId: this.product.id,
        initialDeposit: formValue.amount,
        currency: this.product.currency,
        paymentMethod: formValue.paymentMethod
      } as CreateSavingsAccount;
      
      this.productsService.createSavingsAccount(request).subscribe({
        next: () => {
          this.router.navigate(['/products']);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Erreur lors de la création du compte. Veuillez réessayer.';
          this.isLoading = false;
        }
      });
    } else if (this.product.type === 'local-project') {
      request = {
        productId: this.product.id,
        amount: formValue.amount,
        currency: this.product.currency,
        paymentMethod: formValue.paymentMethod
      } as InvestInProject;
      
      this.productsService.investInProject(request).subscribe({
        next: () => {
          this.router.navigate(['/products']);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Erreur lors de l\'investissement. Veuillez réessayer.';
          this.isLoading = false;
        }
      });
    }
  }

  cancel(): void {
    if (this.product) {
      this.router.navigate(['/products', this.product.id]);
    } else {
      this.router.navigate(['/products']);
    }
  }

  formatCurrency(value: number, currency: string): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(value);
  }
}

