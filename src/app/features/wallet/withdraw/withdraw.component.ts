import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { WalletService, WithdrawalRequest, Wallet } from '../../../core/services/wallet.service';
import { TransactionFeeService, FeeCalculation } from '../../../core/services/transaction-fee.service';

@Component({
  selector: 'app-withdraw',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="withdraw-container">
      <header class="withdraw-header">
        <div class="header-content">
          <div>
            <a routerLink="/wallet" class="back-link">← Retour au portefeuille</a>
            <h1>Retirer des fonds</h1>
          </div>
        </div>
      </header>

      <main class="withdraw-main">
        <div class="withdraw-card">
          <div *ngIf="wallet" class="balance-info">
            <p>Solde disponible</p>
            <p class="balance-amount">{{ formatCurrency(wallet.balance, wallet.currency) }}</p>
          </div>

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

          <form [formGroup]="withdrawForm" (ngSubmit)="onSubmit()" class="withdraw-form">
            <div class="form-group">
              <label for="amount">Montant à retirer</label>
              <div class="amount-input-wrapper">
                <span class="currency-symbol">{{ wallet?.currency || 'GNF' }}</span>
                <input
                  id="amount"
                  type="number"
                  formControlName="amount"
                  placeholder="0"
                  min="1000"
                  step="1000"
                  [class.error]="withdrawForm.get('amount')?.invalid && withdrawForm.get('amount')?.touched"
                />
              </div>
              <div class="error-message" *ngIf="withdrawForm.get('amount')?.invalid && withdrawForm.get('amount')?.touched">
                <span *ngIf="withdrawForm.get('amount')?.errors?.['required']">Montant requis</span>
                <span *ngIf="withdrawForm.get('amount')?.errors?.['min']">Montant minimum: 1,000 {{ wallet?.currency || 'GNF' }}</span>
                <span *ngIf="withdrawForm.get('amount')?.errors?.['max']">Montant supérieur au solde disponible</span>
              </div>
            </div>

            <div class="form-group">
              <label for="phoneNumber">Numéro de téléphone</label>
              <input
                id="phoneNumber"
                type="tel"
                formControlName="phoneNumber"
                placeholder="+224 XXX XXX XXX"
                [class.error]="withdrawForm.get('phoneNumber')?.invalid && withdrawForm.get('phoneNumber')?.touched"
              />
              <div class="error-message" *ngIf="withdrawForm.get('phoneNumber')?.invalid && withdrawForm.get('phoneNumber')?.touched">
                Numéro de téléphone invalide
              </div>
              <p class="help-text">Le numéro doit être associé à votre compte {{ selectedMethod === 'orange-money' ? 'Orange Money' : 'MTN Mobile Money' }}</p>
            </div>

            <div class="form-group">
              <label for="pin">Code PIN</label>
              <input
                id="pin"
                type="password"
                formControlName="pin"
                placeholder="••••"
                maxlength="4"
                [class.error]="withdrawForm.get('pin')?.invalid && withdrawForm.get('pin')?.touched"
              />
              <div class="error-message" *ngIf="withdrawForm.get('pin')?.invalid && withdrawForm.get('pin')?.touched">
                Code PIN requis
              </div>
              <p class="help-text">Code PIN de votre compte mobile money</p>
            </div>

            <div class="summary-box">
              <div class="summary-item">
                <span>Méthode:</span>
                <span class="summary-value">{{ getMethodLabel(selectedMethod) }}</span>
              </div>
              <div class="summary-item">
                <span>Montant à retirer:</span>
                <span class="summary-value">{{ formatCurrency(withdrawForm.get('amount')?.value || 0, wallet?.currency || 'GNF') }}</span>
              </div>
              <div class="summary-item" *ngIf="feeCalculation">
                <span>Frais de transaction ({{ feeCalculation.feePercentage }}%):</span>
                <span class="summary-value fee">{{ formatCurrency(feeCalculation.fee, feeCalculation.currency) }}</span>
              </div>
              <div class="summary-item total">
                <span>Total à recevoir:</span>
                <span class="summary-value">{{ formatCurrency((withdrawForm.get('amount')?.value || 0) - (feeCalculation?.fee || 0), wallet?.currency || 'GNF') }}</span>
              </div>
            </div>

            <div class="error-message" *ngIf="errorMessage">
              {{ errorMessage }}
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-outline" (click)="cancel()">Annuler</button>
              <button type="submit" class="btn btn-primary" [disabled]="withdrawForm.invalid || isLoading">
                <span *ngIf="!isLoading">Confirmer le retrait</span>
                <span *ngIf="isLoading">Traitement...</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .withdraw-container {
      min-height: 100vh;
      background: var(--background);
    }

    .withdraw-header {
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

    .withdraw-main {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    .withdraw-card {
      background: white;
      border-radius: 0.75rem;
      padding: 2rem;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border-color);
    }

    .balance-info {
      background: var(--background);
      border-radius: 0.5rem;
      padding: 1rem 1.5rem;
      margin-bottom: 2rem;
      text-align: center;

      p {
        margin: 0;
        font-size: 0.875rem;
        color: var(--text-secondary);
      }

      .balance-amount {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-top: 0.5rem;
      }
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
      .withdraw-header {
        padding: 1rem;
      }

      .withdraw-main {
        padding: 1rem;
      }

      .withdraw-card {
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
export class WithdrawComponent implements OnInit {
  private fb = inject(FormBuilder);
  private walletService = inject(WalletService);
  private feeService = inject(TransactionFeeService);
  private router = inject(Router);

  withdrawForm: FormGroup;
  wallet: Wallet | null = null;
  selectedMethod: 'orange-money' | 'mtn-mobile-money' = 'orange-money';
  isLoading = false;
  errorMessage = '';
  feeCalculation: FeeCalculation | null = null;

  constructor() {
    this.withdrawForm = this.fb.group({
      amount: [0, [Validators.required, Validators.min(1000)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+224\d{9}$/)]],
      pin: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4)]]
    });

    // Calculate fees when amount changes
    this.withdrawForm.get('amount')?.valueChanges.subscribe(amount => {
      if (amount && amount >= 1000 && this.wallet) {
        this.feeCalculation = this.feeService.calculateWithdrawalFee(amount, this.wallet.currency);
      } else {
        this.feeCalculation = null;
      }
    });
  }

  ngOnInit(): void {
    this.loadWallet();
    this.setupAmountValidator();
  }

  loadWallet(): void {
    this.walletService.getWallet().subscribe({
      next: (wallet) => {
        this.wallet = wallet;
        this.setupAmountValidator();
      },
      error: () => {
        // Handle error
      }
    });
  }

  setupAmountValidator(): void {
    const amountControl = this.withdrawForm.get('amount');
    if (amountControl && this.wallet) {
      amountControl.setValidators([
        Validators.required,
        Validators.min(1000),
        (control: AbstractControl) => {
          const value = control.value;
          if (value) {
            const feeCalc = this.feeService.calculateWithdrawalFee(value, this.wallet!.currency);
            if (feeCalc.total > this.wallet!.balance) {
              return { max: true };
            }
          }
          return null;
        }
      ]);
      amountControl.updateValueAndValidity();
    }
  }

  selectMethod(method: 'orange-money' | 'mtn-mobile-money'): void {
    this.selectedMethod = method;
    this.withdrawForm.patchValue({ phoneNumber: '' });
  }


  onSubmit(): void {
    if (this.withdrawForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const request: WithdrawalRequest = {
      amount: this.withdrawForm.value.amount,
      currency: this.wallet?.currency || 'GNF',
      method: this.selectedMethod,
      phoneNumber: this.withdrawForm.value.phoneNumber,
      pin: this.withdrawForm.value.pin
    };

    this.walletService.withdraw(request).subscribe({
      next: () => {
        this.router.navigate(['/wallet']);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Erreur lors du retrait. Veuillez réessayer.';
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

