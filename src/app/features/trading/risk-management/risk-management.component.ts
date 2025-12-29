import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ForexService, ForexTrade, ForexAlert, CreateForexAlert } from '../../../core/services/forex.service';
import { CryptoService, CryptoTrade } from '../../../core/services/crypto.service';

@Component({
  selector: 'app-risk-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="risk-container">
      <header class="risk-header">
        <div class="header-content">
          <div>
            <a routerLink="/dashboard" class="back-link">← Retour</a>
            <h1>Gestion des risques</h1>
            <p>Configurez vos stop-loss et alertes</p>
          </div>
        </div>
      </header>

      <main class="risk-main">
        <!-- Active Trades with Risk Management -->
        <div class="trades-section">
          <h2>Positions ouvertes - Gestion des risques</h2>
          
          <!-- Forex Trades -->
          <div class="trades-list" *ngIf="forexTrades.length > 0">
            <div class="trade-card" *ngFor="let trade of forexTrades">
              <div class="trade-header">
                <div class="trade-info">
                  <h3>{{ trade.pair }}</h3>
                  <span class="trade-type" [class]="'type-' + trade.type">
                    {{ trade.type === 'buy' ? 'Achat' : 'Vente' }}
                  </span>
                </div>
                <div class="trade-profit" *ngIf="trade.profit !== undefined" [class.positive]="trade.profit >= 0" [class.negative]="trade.profit < 0">
                  {{ formatCurrency(trade.profit, 'USD') }}
                </div>
              </div>

              <div class="risk-controls">
                <div class="control-group">
                  <label>Stop-Loss</label>
                  <div class="control-input">
                    <input
                      type="number"
                      [value]="trade.stopLoss || 0"
                      (change)="updateStopLoss(trade.id, $event)"
                      step="0.00001"
                      placeholder="Prix stop-loss"
                    />
                    <button class="btn btn-outline" (click)="removeStopLoss(trade.id)" *ngIf="trade.stopLoss">
                      Supprimer
                    </button>
                  </div>
                </div>

                <div class="control-group">
                  <label>Take Profit</label>
                  <div class="control-input">
                    <input
                      type="number"
                      [value]="trade.takeProfit || 0"
                      (change)="updateTakeProfit(trade.id, $event)"
                      step="0.00001"
                      placeholder="Prix take profit"
                    />
                    <button class="btn btn-outline" (click)="removeTakeProfit(trade.id)" *ngIf="trade.takeProfit">
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="empty-state" *ngIf="forexTrades.length === 0 && cryptoTrades.length === 0">
            <p>Aucune position ouverte</p>
          </div>
        </div>

        <!-- Alerts -->
        <div class="alerts-section">
          <h2>Alertes de prix</h2>
          
          <form [formGroup]="alertForm" (ngSubmit)="createAlert()" class="alert-form">
            <div class="form-row">
              <div class="form-group">
                <label for="pair">Paire</label>
                <select id="pair" formControlName="pair">
                  <option value="">Sélectionner</option>
                  <option value="EUR/USD">EUR/USD</option>
                  <option value="GBP/USD">GBP/USD</option>
                  <option value="USD/JPY">USD/JPY</option>
                  <option value="BTC/USDT">BTC/USDT</option>
                  <option value="ETH/USDT">ETH/USDT</option>
                </select>
              </div>

              <div class="form-group">
                <label for="condition">Condition</label>
                <select id="condition" formControlName="condition">
                  <option value="above">Au-dessus de</option>
                  <option value="below">En-dessous de</option>
                  <option value="equals">Égal à</option>
                </select>
              </div>

              <div class="form-group">
                <label for="targetPrice">Prix cible</label>
                <input
                  id="targetPrice"
                  type="number"
                  formControlName="targetPrice"
                  step="0.00001"
                  placeholder="0.00000"
                />
              </div>

              <div class="form-group">
                <button type="submit" class="btn btn-primary">Créer l'alerte</button>
              </div>
            </div>
          </form>

          <div class="alerts-list" *ngIf="alerts.length > 0">
            <div class="alert-card" *ngFor="let alert of alerts">
              <div class="alert-info">
                <h3>{{ alert.pair }}</h3>
                <p>
                  {{ getConditionLabel(alert.condition) }} {{ formatPrice(alert.targetPrice) }}
                </p>
                <p class="alert-status" [class]="'status-' + alert.status">
                  {{ getStatusLabel(alert.status) }}
                </p>
              </div>
              <div class="alert-actions">
                <button class="btn btn-danger" (click)="deleteAlert(alert.id)">Supprimer</button>
              </div>
            </div>
          </div>

          <div class="empty-state" *ngIf="alerts.length === 0">
            <p>Aucune alerte configurée</p>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .risk-container {
      min-height: 100vh;
      background: var(--background);
    }

    .risk-header {
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

    .risk-main {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .trades-section, .alerts-section {
      margin-bottom: 3rem;
    }

    h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 1.5rem;
    }

    .trades-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .trade-card {
      background: white;
      border-radius: 0.75rem;
      padding: 2rem;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border-color);
    }

    .trade-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border-color);
    }

    .trade-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .trade-info h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .trade-type {
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;

      &.type-buy {
        background: #dcfce7;
        color: #166534;
      }

      &.type-sell {
        background: #fee2e2;
        color: #991b1b;
      }
    }

    .trade-profit {
      font-size: 1.25rem;
      font-weight: 700;

      &.positive {
        color: var(--success-color);
      }

      &.negative {
        color: var(--danger-color);
      }
    }

    .risk-controls {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .control-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .control-group label {
      font-weight: 600;
      color: var(--text-primary);
      font-size: 0.875rem;
    }

    .control-input {
      display: flex;
      gap: 0.5rem;
    }

    .control-input input {
      flex: 1;
      padding: 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 0.5rem;
    }

    .alert-form {
      background: white;
      border-radius: 0.75rem;
      padding: 1.5rem;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border-color);
      margin-bottom: 2rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 2fr 1.5fr 2fr auto;
      gap: 1rem;
      align-items: end;
    }

    .alerts-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .alert-card {
      background: white;
      border-radius: 0.75rem;
      padding: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border-color);
    }

    .alert-info h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .alert-info p {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-bottom: 0.25rem;
    }

    .alert-status {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-weight: 500;
      width: fit-content;

      &.status-active {
        background: #fef3c7;
        color: #92400e;
      }

      &.status-triggered {
        background: #dcfce7;
        color: #166534;
      }
    }

    .empty-state {
      text-align: center;
      padding: 3rem 2rem;
      background: white;
      border-radius: 0.75rem;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border-color);
    }

    @media (max-width: 968px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .risk-controls {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class RiskManagementComponent implements OnInit {
  private fb = inject(FormBuilder);
  private forexService = inject(ForexService);
  private cryptoService = inject(CryptoService);

  alertForm: FormGroup;
  forexTrades: ForexTrade[] = [];
  cryptoTrades: CryptoTrade[] = [];
  alerts: ForexAlert[] = [];

  constructor() {
    this.alertForm = this.fb.group({
      pair: ['', [Validators.required]],
      condition: ['above', [Validators.required]],
      targetPrice: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadTrades();
    this.loadAlerts();
  }

  loadTrades(): void {
    this.forexService.getTrades({ status: 'open' }).subscribe({
      next: (trades) => {
        this.forexTrades = trades;
      }
    });

    this.cryptoService.getTrades({ status: 'pending' }).subscribe({
      next: (trades) => {
        this.cryptoTrades = trades;
      }
    });
  }

  loadAlerts(): void {
    this.forexService.getAlerts().subscribe({
      next: (alerts) => {
        this.alerts = alerts;
      }
    });
  }

  updateStopLoss(tradeId: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const stopLoss = parseFloat(value);
    if (!isNaN(stopLoss) && stopLoss > 0) {
      this.forexService.updateStopLoss(tradeId, stopLoss).subscribe({
        next: () => {
          this.loadTrades();
        }
      });
    }
  }

  updateTakeProfit(tradeId: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const takeProfit = parseFloat(value);
    if (!isNaN(takeProfit) && takeProfit > 0) {
      this.forexService.updateTakeProfit(tradeId, takeProfit).subscribe({
        next: () => {
          this.loadTrades();
        }
      });
    }
  }

  removeStopLoss(tradeId: string): void {
    this.forexService.updateStopLoss(tradeId, 0).subscribe({
      next: () => {
        this.loadTrades();
      }
    });
  }

  removeTakeProfit(tradeId: string): void {
    this.forexService.updateTakeProfit(tradeId, 0).subscribe({
      next: () => {
        this.loadTrades();
      }
    });
  }

  createAlert(): void {
    if (this.alertForm.invalid) return;

    const alertData: CreateForexAlert = this.alertForm.value;
    this.forexService.createAlert(alertData).subscribe({
      next: () => {
        this.alertForm.reset({ condition: 'above' });
        this.loadAlerts();
      }
    });
  }

  deleteAlert(alertId: string): void {
    this.forexService.deleteAlert(alertId).subscribe({
      next: () => {
        this.loadAlerts();
      }
    });
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

  getConditionLabel(condition: string): string {
    const labels: { [key: string]: string } = {
      'above': 'Au-dessus de',
      'below': 'En-dessous de',
      'equals': 'Égal à'
    };
    return labels[condition] || condition;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'active': 'Active',
      'triggered': 'Déclenchée',
      'cancelled': 'Annulée'
    };
    return labels[status] || status;
  }
}


