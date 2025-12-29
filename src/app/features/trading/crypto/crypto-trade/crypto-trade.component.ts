import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CryptoService, CreateCryptoTrade, CryptoPrice, CryptoBalance } from '../../../../core/services/crypto.service';

@Component({
  selector: 'app-crypto-trade',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="trade-container">
      <header class="trade-header">
        <div class="header-content">
          <div>
            <a routerLink="/trading/crypto" class="back-link">← Retour</a>
            <h1>Nouveau Trade Crypto</h1>
          </div>
        </div>
      </header>

      <main class="trade-main">
        <div class="trade-card">
          <!-- Account Type -->
          <div class="account-toggle">
            <button
              class="toggle-btn"
              [class.active]="!useDemoAccount"
              (click)="switchAccount(false)"
            >
              Compte réel
            </button>
            <button
              class="toggle-btn"
              [class.active]="useDemoAccount"
              (click)="switchAccount(true)"
            >
              Compte démo
            </button>
          </div>

          <form [formGroup]="tradeForm" (ngSubmit)="onSubmit()">
            <!-- Trade Type -->
            <div class="form-group">
              <label>Type de trade</label>
              <div class="trade-type-buttons">
                <button
                  type="button"
                  class="type-btn"
                  [class.active]="tradeForm.get('type')?.value === 'buy'"
                  (click)="tradeForm.patchValue({ type: 'buy' })"
                >
                  Achat
                </button>
                <button
                  type="button"
                  class="type-btn"
                  [class.active]="tradeForm.get('type')?.value === 'sell'"
                  (click)="tradeForm.patchValue({ type: 'sell' })"
                >
                  Vente
                </button>
              </div>
            </div>

            <!-- Pair Selection -->
            <div class="form-group">
              <label for="pair">Paire de trading</label>
              <select
                id="pair"
                formControlName="pair"
                (change)="onPairChange()"
                [class.error]="tradeForm.get('pair')?.invalid && tradeForm.get('pair')?.touched"
              >
                <option value="">Sélectionner une paire</option>
                <option value="BTC/USDT">BTC/USDT</option>
                <option value="ETH/USDT">ETH/USDT</option>
                <option value="BNB/USDT">BNB/USDT</option>
                <option value="ADA/USDT">ADA/USDT</option>
              </select>
              <div class="error-message" *ngIf="tradeForm.get('pair')?.invalid && tradeForm.get('pair')?.touched">
                Paire requise
              </div>
            </div>

            <!-- Current Price -->
            <div class="price-info" *ngIf="currentPrice">
              <div class="price-item">
                <span>Prix actuel:</span>
                <span class="price-value">{{ formatPrice(currentPrice.price) }}</span>
              </div>
              <div class="price-item">
                <span>Variation 24h:</span>
                <span class="price-change" [class.positive]="currentPrice.changePercent24h >= 0" [class.negative]="currentPrice.changePercent24h < 0">
                  {{ currentPrice.changePercent24h >= 0 ? '+' : '' }}{{ currentPrice.changePercent24h.toFixed(2) }}%
                </span>
              </div>
            </div>

            <!-- Order Type -->
            <div class="form-group">
              <label for="orderType">Type d'ordre</label>
              <select
                id="orderType"
                formControlName="orderType"
                (change)="onOrderTypeChange()"
              >
                <option value="market">Marché</option>
                <option value="limit">Limite</option>
                <option value="stop-loss">Stop-Loss</option>
              </select>
            </div>

            <!-- Amount -->
            <div class="form-group">
              <label for="amount">Montant</label>
              <input
                id="amount"
                type="number"
                formControlName="amount"
                placeholder="0.00"
                step="0.00000001"
                min="0.00000001"
                [class.error]="tradeForm.get('amount')?.invalid && tradeForm.get('amount')?.touched"
              />
              <div class="error-message" *ngIf="tradeForm.get('amount')?.invalid && tradeForm.get('amount')?.touched">
                Montant invalide
              </div>
              <p class="help-text" *ngIf="selectedBalance">
                Disponible: {{ formatCrypto(selectedBalance.available, selectedBalance.currency) }}
              </p>
            </div>

            <!-- Price (for limit orders) -->
            <div class="form-group" *ngIf="tradeForm.get('orderType')?.value === 'limit'">
              <label for="price">Prix limite</label>
              <input
                id="price"
                type="number"
                formControlName="price"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>

            <!-- Stop Loss -->
            <div class="form-group">
              <label for="stopLoss">Stop-Loss (optionnel)</label>
              <input
                id="stopLoss"
                type="number"
                formControlName="stopLoss"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              <p class="help-text">Prix de sortie automatique en cas de perte</p>
            </div>

            <!-- Take Profit -->
            <div class="form-group">
              <label for="takeProfit">Take Profit (optionnel)</label>
              <input
                id="takeProfit"
                type="number"
                formControlName="takeProfit"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              <p class="help-text">Prix de sortie automatique en cas de gain</p>
            </div>

            <!-- Summary -->
            <div class="trade-summary" *ngIf="tradeForm.get('amount')?.value && currentPrice">
              <div class="summary-item">
                <span>Montant:</span>
                <span>{{ formatCrypto(tradeForm.get('amount')?.value, tradeForm.get('pair')?.value?.split('/')[0] || '') }}</span>
              </div>
              <div class="summary-item">
                <span>Prix:</span>
                <span>{{ formatPrice(tradeForm.get('price')?.value || currentPrice.price) }}</span>
              </div>
              <div class="summary-item total">
                <span>Total estimé:</span>
                <span>{{ formatPrice((tradeForm.get('amount')?.value || 0) * (tradeForm.get('price')?.value || currentPrice.price)) }}</span>
              </div>
            </div>

            <div class="error-message" *ngIf="errorMessage">
              {{ errorMessage }}
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-outline" (click)="cancel()">Annuler</button>
              <button type="submit" class="btn btn-primary" [disabled]="tradeForm.invalid || isLoading">
                <span *ngIf="!isLoading">Placer l'ordre</span>
                <span *ngIf="isLoading">Traitement...</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .trade-container {
      min-height: 100vh;
      background: var(--background);
    }

    .trade-header {
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

    .trade-main {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    .trade-card {
      background: white;
      border-radius: 0.75rem;
      padding: 2rem;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border-color);
    }

    .account-toggle {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 2rem;
      background: var(--background);
      padding: 0.5rem;
      border-radius: 0.5rem;
    }

    .toggle-btn {
      flex: 1;
      padding: 0.75rem;
      border: none;
      background: transparent;
      border-radius: 0.375rem;
      cursor: pointer;
      font-weight: 500;
      color: var(--text-secondary);
      transition: all 0.2s;

      &.active {
        background: var(--primary-color);
        color: white;
      }
    }

    .trade-type-buttons {
      display: flex;
      gap: 1rem;
    }

    .type-btn {
      flex: 1;
      padding: 1rem;
      border: 2px solid var(--border-color);
      border-radius: 0.5rem;
      background: white;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;

      &.active {
        border-color: var(--primary-color);
        background: var(--primary-color);
        color: white;
      }
    }

    .price-info {
      background: var(--background);
      border-radius: 0.5rem;
      padding: 1rem;
      margin-bottom: 1.5rem;
      display: flex;
      justify-content: space-between;
    }

    .price-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .price-value {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .price-change {
      font-size: 0.875rem;
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;

      &.positive {
        background: #dcfce7;
        color: #166534;
      }

      &.negative {
        background: #fee2e2;
        color: #991b1b;
      }
    }

    .trade-summary {
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

      &.total {
        border-top: 1px solid var(--border-color);
        margin-top: 0.75rem;
        padding-top: 1rem;
        font-weight: 600;
        font-size: 1.125rem;
        color: var(--text-primary);
      }
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
    }

    @media (max-width: 768px) {
      .trade-header {
        padding: 1rem;
      }

      .trade-main {
        padding: 1rem;
      }

      .trade-card {
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
export class CryptoTradeComponent implements OnInit {
  private fb = inject(FormBuilder);
  private cryptoService = inject(CryptoService);
  private router = inject(Router);

  tradeForm: FormGroup;
  currentPrice: CryptoPrice | null = null;
  selectedBalance: CryptoBalance | null = null;
  useDemoAccount = false;
  isLoading = false;
  errorMessage = '';

  constructor() {
    this.tradeForm = this.fb.group({
      type: ['buy', [Validators.required]],
      pair: ['', [Validators.required]],
      orderType: ['market', [Validators.required]],
      amount: [0, [Validators.required, Validators.min(0.00000001)]],
      price: [0],
      stopLoss: [0],
      takeProfit: [0]
    });
  }

  ngOnInit(): void {
    this.loadBalances();
  }

  switchAccount(isDemo: boolean): void {
    this.useDemoAccount = isDemo;
    this.loadBalances();
  }

  loadBalances(): void {
    if (this.useDemoAccount) {
      this.cryptoService.getDemoBalance().subscribe({
        next: (balances) => {
          if (balances.length > 0) {
            this.selectedBalance = balances[0];
          }
        }
      });
    } else {
      this.cryptoService.getBalances().subscribe({
        next: (balances) => {
          if (balances.length > 0) {
            this.selectedBalance = balances[0];
          }
        }
      });
    }
  }

  onPairChange(): void {
    const pair = this.tradeForm.get('pair')?.value;
    if (pair) {
      this.cryptoService.getPrice(pair).subscribe({
        next: (price) => {
          this.currentPrice = price;
          if (this.tradeForm.get('orderType')?.value === 'market') {
            this.tradeForm.patchValue({ price: price.price });
          }
        }
      });
    }
  }

  onOrderTypeChange(): void {
    const orderType = this.tradeForm.get('orderType')?.value;
    if (orderType === 'market' && this.currentPrice) {
      this.tradeForm.patchValue({ price: this.currentPrice.price });
    }
  }

  onSubmit(): void {
    if (this.tradeForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const tradeData: CreateCryptoTrade = {
      ...this.tradeForm.value,
      useDemoAccount: this.useDemoAccount
    };

    const serviceCall = this.useDemoAccount
      ? this.cryptoService.createDemoTrade(tradeData)
      : this.cryptoService.createTrade(tradeData);

    serviceCall.subscribe({
      next: () => {
        this.router.navigate(['/trading/crypto']);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Erreur lors du placement de l\'ordre';
        this.isLoading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/trading/crypto']);
  }

  formatPrice(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    }).format(value);
  }

  formatCrypto(value: number, currency: string): string {
    return `${value.toFixed(8)} ${currency}`;
  }
}


