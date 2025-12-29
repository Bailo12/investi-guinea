import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ForexService, ForexAccount } from '../../../../core/services/forex.service';

@Component({
  selector: 'app-forex-demo',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="demo-container">
      <header class="demo-header">
        <div class="header-content">
          <div>
            <a routerLink="/trading/forex" class="back-link">← Retour</a>
            <h1>Compte de démonstration Forex</h1>
            <p>Entraînez-vous au trading sans risque</p>
          </div>
        </div>
      </header>

      <main class="demo-main">
        <div class="demo-card" *ngIf="!demoAccount">
          <h2>Créer un compte de démonstration</h2>
          <p>Un compte démo vous permet de pratiquer le trading Forex avec de l'argent virtuel.</p>
          
          <div class="demo-features">
            <h3>Fonctionnalités du compte démo:</h3>
            <ul>
              <li>Solde initial de 10,000 USD virtuel</li>
              <li>Accès aux mêmes outils que le compte réel</li>
              <li>Cours de marché en temps réel</li>
              <li>Pas de risque financier</li>
              <li>Parfait pour apprendre et tester des stratégies</li>
            </ul>
          </div>

          <div class="demo-actions">
            <button class="btn btn-primary" (click)="createDemoAccount()" [disabled]="isCreating">
              <span *ngIf="!isCreating">Créer un compte démo</span>
              <span *ngIf="isCreating">Création...</span>
            </button>
          </div>
        </div>

        <div class="demo-card" *ngIf="demoAccount">
          <div class="account-info">
            <h2>Votre compte de démonstration</h2>
            <div class="account-stats">
              <div class="stat-item">
                <span class="stat-label">Solde</span>
                <span class="stat-value">{{ formatCurrency(demoAccount.balance, demoAccount.currency) }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Équité</span>
                <span class="stat-value">{{ formatCurrency(demoAccount.equity, demoAccount.currency) }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Marge libre</span>
                <span class="stat-value">{{ formatCurrency(demoAccount.freeMargin, demoAccount.currency) }}</span>
              </div>
            </div>
          </div>

          <div class="demo-actions">
            <a routerLink="/trading/forex/trade" [queryParams]="{demo: true}" class="btn btn-primary">
              Commencer à trader
            </a>
            <button class="btn btn-outline" (click)="resetDemoAccount()" [disabled]="isResetting">
              <span *ngIf="!isResetting">Réinitialiser le compte</span>
              <span *ngIf="isResetting">Réinitialisation...</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .demo-container {
      min-height: 100vh;
      background: var(--background);
    }

    .demo-header {
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
          margin-bottom: 0.25rem;
        }

        p {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }
      }
    }

    .demo-main {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    .demo-card {
      background: white;
      border-radius: 0.75rem;
      padding: 2rem;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border-color);
    }

    .demo-card h2 {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 1rem;
    }

    .demo-card p {
      color: var(--text-secondary);
      margin-bottom: 2rem;
    }

    .demo-features {
      background: var(--background);
      border-radius: 0.5rem;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .demo-features h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 1rem;
    }

    .demo-features ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .demo-features li {
      padding: 0.5rem 0;
      padding-left: 1.5rem;
      position: relative;
      color: var(--text-secondary);

      &:before {
        content: '✓';
        position: absolute;
        left: 0;
        color: var(--success-color);
        font-weight: 600;
      }
    }

    .account-info {
      margin-bottom: 2rem;
    }

    .account-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-top: 1.5rem;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .stat-label {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .demo-actions {
      display: flex;
      gap: 1rem;
    }

    @media (max-width: 768px) {
      .demo-header {
        padding: 1rem;
      }

      .demo-main {
        padding: 1rem;
      }

      .demo-card {
        padding: 1.5rem;
      }

      .demo-actions {
        flex-direction: column;

        .btn {
          width: 100%;
        }
      }
    }
  `]
})
export class ForexDemoComponent implements OnInit {
  private forexService = inject(ForexService);
  private router = inject(Router);

  demoAccount: ForexAccount | null = null;
  isCreating = false;
  isResetting = false;

  ngOnInit(): void {
    this.loadDemoAccount();
  }

  loadDemoAccount(): void {
    this.forexService.getAccount('demo').subscribe({
      next: (account) => {
        this.demoAccount = account;
      },
      error: () => {
        // Demo account doesn't exist yet
      }
    });
  }

  createDemoAccount(): void {
    this.isCreating = true;
    this.forexService.createDemoAccount(10000).subscribe({
      next: (account) => {
        this.demoAccount = account;
        this.isCreating = false;
      },
      error: () => {
        this.isCreating = false;
      }
    });
  }

  resetDemoAccount(): void {
    if (!confirm('Êtes-vous sûr de vouloir réinitialiser votre compte démo ? Toutes les positions seront fermées.')) {
      return;
    }

    this.isResetting = true;
    this.forexService.createDemoAccount(10000).subscribe({
      next: (account) => {
        this.demoAccount = account;
        this.isResetting = false;
      },
      error: () => {
        this.isResetting = false;
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
}


