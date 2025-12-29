import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ForexService, CreateForexTrade, ForexPair, ForexAccount } from '../../../../core/services/forex.service';

@Component({
  selector: 'app-forex-trade',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="trade-container">
      <header class="trade-header">
        <div class="header-content">
          <div>
            <a routerLink="/trading/forex" class="back-link">← Retour</a>
            <h1>Nouveau Trade Forex</h1>
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
              <label for="pair">Paire de devises</label>
              <select
                id="pair"
                formControlName="pair"
                (change)="onPairChange()"
                [class.error]="tradeForm.get('pair')?.invalid && tradeForm.get('pair')?.touched"
              >
                <option value="">Sélectionner une paire</option>
                <option value="EUR/USD">EUR/USD</option>
                <option value="GBP/USD">GBP/USD</option>
                <option value="USD/JPY">USD/JPY</option>
                <option value="USD/CHF">USD/CHF</option>
                <option value="AUD/USD">AUD/USD</option>
                <option value="USD/CAD">USD/CAD</option>
              </select>
              <div class="error-message" *ngIf="tradeForm.get('pair')?.invalid && tradeForm.get('pair')?.touched">
                Paire requise
              </div>
            </div>

            <!-- Current Rate -->
            <div class="rate-info" *ngIf="currentPair">
              <div class="rate-item">
                <span>Bid:</span>
                <span class="rate-value">{{ formatPrice(currentPair.bid) }}</span>
              </div>
              <div class="rate-item">
                <span>Ask:</span>
                <span class="rate-value">{{ formatPrice(currentPair.ask) }}</span>
              </div>
              <div class="rate-item">
                <span>Spread:</span>
                <span class="spread-value">{{ formatPrice(currentPair.spread) }}</span>
              </div>
            </div>

            <!-- Lot Size -->
            <div class="form-group">
              <label for="lotSize">Taille du lot</label>
              <input
                id="lotSize"
                type="number"
                formControlName="lotSize"
                placeholder="0.01"
                step="0.01"
                min="0.01"
                [class.error]="tradeForm.get('lotSize')?.invalid && tradeForm.get('lotSize')?.touched"
              />
              <div class="error-message" *ngIf="tradeForm.get('lotSize')?.invalid && tradeForm.get('lotSize')?.touched">
                Taille de lot invalide (minimum 0.01)
              </div>
              <p class="help-text">1 lot = 100,000 unités de la devise de base</p>
            </div>

            <!-- Leverage -->
            <div class="form-group">
              <label for="leverage">Effet de levier</label>
              <select
                id="leverage"
                formControlName="leverage"
                [class.error]="tradeForm.get('leverage')?.invalid && tradeForm.get('leverage')?.touched"
              >
                <option value="1">1:1</option>
                <option value="10">1:10</option>
                <option value="20">1:20</option>
                <option value="50">1:50</option>
                <option value="100">1:100</option>
                <option value="200">1:200</option>
              </select>
              <p class="help-text warning">⚠️ L'effet de levier augmente les risques</p>
            </div>

            <!-- Stop Loss -->
            <div class="form-group">
              <label for="stopLoss">Stop-Loss (optionnel)</label>
              <input
                id="stopLoss"
                type="number"
                formControlName="stopLoss"
                placeholder="0.00000"
                step="0.00001"
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
                placeholder="0.00000"
                step="0.00001"
                min="0"
              />
              <p class="help-text">Prix de sortie automatique en cas de gain</p>
            </div>

            <!-- Trade Summary -->
            <div class="trade-summary" *ngIf="tradeForm.get('lotSize')?.value && currentPair && account">
              <div class="summary-item">
                <span>Marge requise:</span>
                <span>{{ calculateMargin() | number:'1.2-2' }} {{ account.currency }}</span>
              </div>
              <div class="summary-item">
                <span>Marge disponible:</span>
                <span>{{ formatCurrency(account.freeMargin, account.currency) }}</span>
              </div>
              <div class="summary-item" [class.warning]="calculateMargin() > account.freeMargin">
                <span>Statut:</span>
                <span>{{ calculateMargin() > account.freeMargin ? 'Marge insuffisante' : 'Marge suffisante' }}</span>
              </div>
            </div>

            <div class="error-message" *ngIf="errorMessage">
              {{ errorMessage }}
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-outline" (click)="cancel()">Annuler</button>
              <button type="submit" class="btn btn-primary" [disabled]="tradeForm.invalid || isLoading || (account && calculateMargin() > account.freeMargin)">
                <span *ngIf="!isLoading">Ouvrir la position</span>
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

    .rate-info {
      background: var(--background);
      border-radius: 0.5rem;
      padding: 1rem;
      margin-bottom: 1.5rem;
      display: flex;
      gap: 2rem;
    }

    .rate-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .rate-value {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .spread-value {
      color: var(--text-secondary);
    }

    .help-text {
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin-top: 0.5rem;

      &.warning {
        color: var(--warning-color);
        font-weight: 500;
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

      &.warning {
        color: var(--warning-color);
        font-weight: 600;
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
export class ForexTradeComponent implements OnInit {
  private fb = inject(FormBuilder);
  private forexService = inject(ForexService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  tradeForm: FormGroup;
  currentPair: ForexPair | null = null;
  account: ForexAccount | null = null;
  useDemoAccount = false;
  isLoading = false;
  errorMessage = '';

  constructor() {
    this.tradeForm = this.fb.group({
      type: ['buy', [Validators.required]],
      pair: ['', [Validators.required]],
      lotSize: [0.01, [Validators.required, Validators.min(0.01)]],
      leverage: [1, [Validators.required]],
      stopLoss: [0],
      takeProfit: [0]
    });
  }

  ngOnInit(): void {
    this.loadAccount();
    const pairParam = this.route.snapshot.queryParams['pair'];
    if (pairParam) {
      this.tradeForm.patchValue({ pair: pairParam });
      this.onPairChange();
    }
  }

  switchAccount(isDemo: boolean): void {
    this.useDemoAccount = isDemo;
    this.loadAccount();
  }

  loadAccount(): void {
    const accountType = this.useDemoAccount ? 'demo' : 'real';
    this.forexService.getAccount(accountType).subscribe({
      next: (account) => {
        this.account = account;
      },
      error: () => {
        if (this.useDemoAccount) {
          // Create demo account if it doesn't exist
          this.forexService.createDemoAccount().subscribe({
            next: (account) => {
              this.account = account;
            }
          });
        }
      }
    });
  }

  onPairChange(): void {
    const pair = this.tradeForm.get('pair')?.value;
    if (pair) {
      this.forexService.getPair(pair).subscribe({
        next: (pairData) => {
          this.currentPair = pairData;
        }
      });
    }
  }

  calculateMargin(): number {
    const lotSize = this.tradeForm.get('lotSize')?.value || 0;
    const leverage = this.tradeForm.get('leverage')?.value || 1;
    // Simplified margin calculation: lotSize * 100,000 / leverage
    return (lotSize * 100000) / leverage;
  }

  onSubmit(): void {
    if (this.tradeForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const tradeData: CreateForexTrade = {
      ...this.tradeForm.value,
      useDemoAccount: this.useDemoAccount
    };

    const serviceCall = this.useDemoAccount
      ? this.forexService.createDemoTrade(tradeData)
      : this.forexService.createTrade(tradeData);

    serviceCall.subscribe({
      next: () => {
        this.router.navigate(['/trading/forex']);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Erreur lors de l\'ouverture de la position';
        this.isLoading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/trading/forex']);
  }

  formatCurrency(value: number, currency: string): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(value);
  }

  formatPrice(value: number): string {
    return value.toFixed(5);
  }
}


