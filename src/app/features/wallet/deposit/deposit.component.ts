import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { WalletService, DepositRequest } from '../../../core/services/wallet.service';
import { Wallet } from '../../../core/services/wallet.service';
import { TransactionFeeService, FeeCalculation } from '../../../core/services/transaction-fee.service';

@Component({
  selector: 'app-deposit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="deposit-container">
      <header class="deposit-header">
        <div class="header-content">
          <div>
            <a routerLink="/wallet" class="back-link">← Retour au portefeuille</a>
            <h1>Déposer des fonds</h1>
          </div>
        </div>
      </header>

      <main class="deposit-main">
        <div class="deposit-card">
          <div class="method-tabs">
            <button
              class="tab-button"
              [class.active]="selectedMethod === 'orange-money'"
              (click)="selectMethod('orange-money')"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10"/>
              </svg>
              Orange Money
            </button>
            <button
              class="tab-button"
              [class.active]="selectedMethod === 'mtn-mobile-money'"
              (click)="selectMethod('mtn-mobile-money')"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10"/>
              </svg>
              MTN Mobile Money
            </button>
          </div>

          <form [formGroup]="depositForm" (ngSubmit)="onSubmit()" class="deposit-form">
            <div class="form-group">
              <label for="amount">Montant à déposer</label>
              <div class="amount-input-wrapper">
                <span class="currency-symbol">{{ wallet?.currency || 'GNF' }}</span>
                <input
                  id="amount"
                  type="number"
                  formControlName="amount"
                  placeholder="0"
                  min="1000"
                  step="1000"
                  [class.error]="depositForm.get('amount')?.invalid && depositForm.get('amount')?.touched"
                />
              </div>
              <div class="error-message" *ngIf="depositForm.get('amount')?.invalid && depositForm.get('amount')?.touched">
                Montant minimum: 1,000 {{ wallet?.currency || 'GNF' }}
              </div>
            </div>

            <div class="form-group">
              <label for="phoneNumber">Numéro de téléphone</label>
              <input
                id="phoneNumber"
                type="tel"
                formControlName="phoneNumber"
                [placeholder]="selectedMethod === 'orange-money' ? '+224 XXX XXX XXX' : '+224 XXX XXX XXX'"
                [class.error]="depositForm.get('phoneNumber')?.invalid && depositForm.get('phoneNumber')?.touched"
              />
              <div class="error-message" *ngIf="depositForm.get('phoneNumber')?.invalid && depositForm.get('phoneNumber')?.touched">
                Numéro de téléphone invalide
              </div>
              <p class="help-text">Le numéro doit être associé à votre compte {{ selectedMethod === 'orange-money' ? 'Orange Money' : 'MTN Mobile Money' }}</p>
            </div>

            <div class="form-group">
              <label for="pin">Code PIN (optionnel)</label>
              <input
                id="pin"
                type="password"
                formControlName="pin"
                placeholder="••••"
                maxlength="4"
              />
              <p class="help-text">Code PIN de votre compte mobile money (si requis)</p>
            </div>

            <div class="summary-box">
              <div class="summary-item">
                <span>Méthode:</span>
                <span class="summary-value">{{ getMethodLabel(selectedMethod) }}</span>
              </div>
              <div class="summary-item">
                <span>Montant à déposer:</span>
                <span class="summary-value">{{ formatCurrency(depositForm.get('amount')?.value || 0, wallet?.currency || 'GNF') }}</span>
              </div>
              <div class="summary-item" *ngIf="feeCalculation">
                <span>Frais de transaction ({{ feeCalculation.feePercentage }}%):</span>
                <span class="summary-value fee">{{ formatCurrency(feeCalculation.fee, feeCalculation.currency) }}</span>
              </div>
              <div class="summary-item total">
                <span>Total à débiter:</span>
                <span class="summary-value">{{ formatCurrency(feeCalculation?.total || depositForm.get('amount')?.value || 0, wallet?.currency || 'GNF') }}</span>
              </div>
            </div>

            <div class="error-message" *ngIf="errorMessage">
              {{ errorMessage }}
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-outline" (click)="cancel()">Annuler</button>
              <button type="submit" class="btn btn-primary" [disabled]="depositForm.invalid || isLoading">
                <span *ngIf="!isLoading">Confirmer le dépôt</span>
                <span *ngIf="isLoading">Traitement...</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .deposit-container {
      min-height: 100vh;
      background: var(--background);
    }

    .deposit-header {
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

    .deposit-main {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    .deposit-card {
      background: white;
      border-radius: 0.75rem;
      padding: 2rem;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border-color);
    }

    .method-tabs {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      border-bottom: 2px solid var(--border-color);
    }

    .tab-button {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 1rem;
      background: transparent;
      border: none;
      border-bottom: 3px solid transparent;
      cursor: pointer;
      font-weight: 500;
      color: var(--text-secondary);
      transition: all 0.2s;

      &:hover {
        color: var(--primary-color);
      }

      &.active {
        color: var(--primary-color);
        border-bottom-color: var(--primary-color);
      }

      svg {
        width: 24px;
        height: 24px;
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
      .deposit-header {
        padding: 1rem;
      }

      .deposit-main {
        padding: 1rem;
      }

      .deposit-card {
        padding: 1.5rem;
      }

      .method-tabs {
        flex-direction: column;
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
export class DepositComponent implements OnInit {
  private fb = inject(FormBuilder);
  private walletService = inject(WalletService);
  private feeService = inject(TransactionFeeService);
  private router = inject(Router);

  depositForm: FormGroup;
  wallet: Wallet | null = null;
  selectedMethod: 'orange-money' | 'mtn-mobile-money' = 'orange-money';
  isLoading = false;
  errorMessage = '';
  feeCalculation: FeeCalculation | null = null;

  constructor() {
    this.depositForm = this.fb.group({
      amount: [0, [Validators.required, Validators.min(1000)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+224\d{9}$/)]],
      pin: ['']
    });

    // Calculate fees when amount changes
    this.depositForm.get('amount')?.valueChanges.subscribe(amount => {
      if (amount && amount >= 1000 && this.wallet) {
        this.feeCalculation = this.feeService.calculateDepositFee(amount, this.wallet.currency);
      } else {
        this.feeCalculation = null;
      }
    });
  }

  ngOnInit(): void {
    this.loadWallet();
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

  selectMethod(method: 'orange-money' | 'mtn-mobile-money'): void {
    this.selectedMethod = method;
    this.depositForm.patchValue({ phoneNumber: '' });
  }

  onSubmit(): void {
    if (this.depositForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const request: DepositRequest = {
      amount: this.depositForm.value.amount,
      currency: this.wallet?.currency || 'GNF',
      method: this.selectedMethod,
      phoneNumber: this.depositForm.value.phoneNumber,
      pin: this.depositForm.value.pin || undefined
    };

    this.walletService.deposit(request).subscribe({
      next: () => {
        this.router.navigate(['/wallet']);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Erreur lors du dépôt. Veuillez réessayer.';
        this.isLoading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/wallet']);
  }

  formatCurrency(value: number, currency: string): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(value);
  }

  getMethodLabel(method: string): string {
    return method === 'orange-money' ? 'Orange Money' : 'MTN Mobile Money';
  }
}

