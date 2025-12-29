import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  CryptoService,
  CryptoWallet,
  CryptoBalance,
} from '../../../../core/services/crypto.service';

@Component({
  selector: 'app-crypto-wallets',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="wallets-container">
      <header class="wallets-header">
        <div class="header-content">
          <div>
            <a routerLink="/trading/crypto" class="back-link">← Retour</a>
            <h1>Portefeuilles Crypto</h1>
          </div>
          <button class="btn btn-primary" (click)="showCreateModal = true">
            Créer un portefeuille
          </button>
        </div>
      </header>

      <main class="wallets-main">
        <div *ngIf="isLoading" class="loading-state">
          <p>Chargement...</p>
        </div>

        <div *ngIf="!isLoading && wallets.length === 0" class="empty-state">
          <p>Aucun portefeuille crypto</p>
          <button class="btn btn-primary" (click)="showCreateModal = true">
            Créer votre premier portefeuille
          </button>
        </div>

        <div *ngIf="!isLoading && wallets.length > 0" class="wallets-grid">
          <div class="wallet-card" *ngFor="let wallet of wallets">
            <div class="wallet-header">
              <h3>{{ wallet.currency }}</h3>
              <span class="wallet-status" [class]="'status-active'">Actif</span>
            </div>
            <div class="wallet-balance">
              <p class="balance-label">Solde total</p>
              <p class="balance-value">
                {{ formatCrypto(wallet.balance, wallet.currency) }}
              </p>
            </div>
            <div class="wallet-details">
              <div class="detail-item">
                <span>Disponible:</span>
                <span>{{
                  formatCrypto(wallet.availableBalance, wallet.currency)
                }}</span>
              </div>
              <div class="detail-item" *ngIf="wallet.lockedBalance > 0">
                <span>Bloqué:</span>
                <span>{{
                  formatCrypto(wallet.lockedBalance, wallet.currency)
                }}</span>
              </div>
              <div class="detail-item" *ngIf="wallet.address">
                <span>Adresse:</span>
                <span class="address">{{ wallet.address }}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Create Wallet Modal -->
      <div
        class="modal-overlay"
        *ngIf="showCreateModal"
        (click)="showCreateModal = false"
      >
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Créer un portefeuille</h2>
            <button class="modal-close" (click)="showCreateModal = false">
              ×
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label for="currency">Cryptomonnaie</label>
              <select id="currency" [(ngModel)]="selectedCurrency">
                <option value="">Sélectionner</option>
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="ETH">Ethereum (ETH)</option>
                <option value="USDT">Tether (USDT)</option>
                <option value="BNB">Binance Coin (BNB)</option>
                <option value="ADA">Cardano (ADA)</option>
              </select>
            </div>
            <div class="modal-actions">
              <button class="btn btn-outline" (click)="showCreateModal = false">
                Annuler
              </button>
              <button
                class="btn btn-primary"
                (click)="createWallet()"
                [disabled]="!selectedCurrency || isCreating"
              >
                <span *ngIf="!isCreating">Créer</span>
                <span *ngIf="isCreating">Création...</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .wallets-container {
        min-height: 100vh;
        background: var(--background);
      }

      .wallets-header {
        background: white;
        border-bottom: 1px solid var(--border-color);
        padding: 1.5rem 2rem;

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;

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

      .wallets-main {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }

      .wallets-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 1.5rem;
      }

      .wallet-card {
        background: white;
        border-radius: 0.75rem;
        padding: 1.5rem;
        box-shadow: var(--shadow-md);
        border: 1px solid var(--border-color);
      }

      .wallet-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--border-color);
      }

      .wallet-header h3 {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-primary);
      }

      .wallet-status {
        padding: 0.375rem 0.75rem;
        border-radius: 0.375rem;
        font-size: 0.75rem;
        font-weight: 500;

        &.status-active {
          background: #dcfce7;
          color: #166534;
        }
      }

      .wallet-balance {
        margin-bottom: 1rem;
      }

      .balance-label {
        font-size: 0.875rem;
        color: var(--text-secondary);
        margin-bottom: 0.5rem;
      }

      .balance-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-primary);
      }

      .wallet-details {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .detail-item {
        display: flex;
        justify-content: space-between;
        font-size: 0.875rem;
        color: var(--text-secondary);
      }

      .address {
        font-family: monospace;
        font-size: 0.75rem;
        word-break: break-all;
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

      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 1.5rem;
      }

      .loading-state,
      .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        background: white;
        border-radius: 0.75rem;
        box-shadow: var(--shadow-md);
        border: 1px solid var(--border-color);
      }

      @media (max-width: 768px) {
        .wallets-header {
          padding: 1rem;

          .header-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
        }

        .wallets-main {
          padding: 1rem;
        }
      }
    `,
  ],
})
export class CryptoWalletsComponent implements OnInit {
  private cryptoService = inject(CryptoService);

  wallets: CryptoWallet[] = [];
  isLoading = true;
  showCreateModal = false;
  selectedCurrency = '';
  isCreating = false;

  ngOnInit(): void {
    this.loadWallets();
  }

  loadWallets(): void {
    this.isLoading = true;
    this.cryptoService.getWallets().subscribe({
      next: (wallets) => {
        this.wallets = wallets;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  createWallet(): void {
    if (!this.selectedCurrency) return;

    this.isCreating = true;
    this.cryptoService.createWallet(this.selectedCurrency).subscribe({
      next: () => {
        this.isCreating = false;
        this.showCreateModal = false;
        this.selectedCurrency = '';
        this.loadWallets();
      },
      error: () => {
        this.isCreating = false;
      },
    });
  }

  formatCrypto(value: number, currency: string): string {
    return `${value.toFixed(8)} ${currency}`;
  }
}
