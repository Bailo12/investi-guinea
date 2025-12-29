import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  PremiumService,
  PremiumAccount,
  PremiumBenefit,
} from '../../../core/services/premium.service';

@Component({
  selector: 'app-premium-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="premium-container">
      <header class="premium-header">
        <div class="header-content">
          <div>
            <h1>Compte Premium</h1>
            <p>Accédez à des projets exclusifs et des avantages privilégiés</p>
          </div>
          <a routerLink="/dashboard" class="btn btn-outline">Retour</a>
        </div>
      </header>

      <main class="premium-main">
        <!-- Account Status -->
        <div class="account-status-card" *ngIf="account">
          <div class="status-header">
            <div>
              <h2>Votre compte {{ getPlanLabel(account.plan) }}</h2>
              <span class="status-badge" [class]="'status-' + account.status">
                {{ getStatusLabel(account.status) }}
              </span>
            </div>
            <div class="account-dates">
              <p>Actif jusqu'au: {{ formatDate(account.endDate) }}</p>
              <p *ngIf="account.autoRenew" class="auto-renew">
                Renouvellement automatique activé
              </p>
            </div>
          </div>
        </div>

        <!-- No Premium Account -->
        <div class="no-premium-card" *ngIf="!account">
          <div class="premium-icon">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h2>Passez à Premium</h2>
          <p>Débloquez l'accès à des projets exclusifs d'immobilier et d'or</p>
          <a routerLink="/premium/plans" class="btn btn-primary"
            >Voir les plans</a
          >
        </div>

        <!-- Benefits -->
        <div class="benefits-section" *ngIf="account?.benefits?.length">
          <h2>Vos avantages Premium</h2>
          <div class="benefits-grid">
            <div
              class="benefit-card"
              *ngFor="let benefit of account?.benefits"
              [class.enabled]="benefit?.enabled"
            >
              <div class="benefit-icon">
                <svg
                  *ngIf="benefit?.enabled"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <svg
                  *ngIf="!benefit?.enabled"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h3>{{ benefit?.name }}</h3>
              <p>{{ benefit?.description }}</p>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="actions-section">
          <h2>Actions rapides</h2>
          <div class="actions-grid">
            <a routerLink="/premium/projects" class="action-card">
              <div class="action-icon" style="background: #fef3c7;">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                </svg>
              </div>
              <h3>Projets exclusifs</h3>
              <p>Immobilier et Or</p>
            </a>

            <a routerLink="/premium/plans" class="action-card" *ngIf="!account">
              <div class="action-icon" style="background: #dbeafe;">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                </svg>
              </div>
              <h3>Passer à Premium</h3>
              <p>Choisir un plan</p>
            </a>

            <div
              class="action-card"
              *ngIf="account && account.status === 'active'"
            >
              <div class="action-icon" style="background: #dcfce7;">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3>Gérer l'abonnement</h3>
              <p>Renouveler ou annuler</p>
              <div class="action-buttons">
                <button
                  class="btn btn-outline"
                  (click)="renewSubscription()"
                  [disabled]="isRenewing"
                >
                  {{ isRenewing ? 'Renouvellement...' : 'Renouveler' }}
                </button>
                <button
                  class="btn btn-danger"
                  (click)="cancelSubscription()"
                  [disabled]="isCancelling"
                >
                  {{ isCancelling ? 'Annulation...' : 'Annuler' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [
    `
      .premium-container {
        min-height: 100vh;
        background: var(--background);
      }

      .premium-header {
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
        color: white;
        padding: 2rem;

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;

          h1 {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 0.25rem;
          }

          p {
            opacity: 0.9;
            font-size: 0.875rem;
          }

          .btn {
            background: white;
            color: #f59e0b;

            &:hover {
              opacity: 0.9;
            }
          }
        }
      }

      .premium-main {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }

      .account-status-card {
        background: white;
        border-radius: 0.75rem;
        padding: 2rem;
        box-shadow: var(--shadow-md);
        border: 1px solid var(--border-color);
        margin-bottom: 2rem;
      }

      .status-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .status-header h2 {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 0.5rem;
      }

      .status-badge {
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        font-weight: 600;

        &.status-active {
          background: #dcfce7;
          color: #166534;
        }

        &.status-expired {
          background: #fee2e2;
          color: #991b1b;
        }
      }

      .account-dates {
        text-align: right;
        font-size: 0.875rem;
        color: var(--text-secondary);
      }

      .auto-renew {
        color: var(--success-color);
        font-weight: 500;
      }

      .no-premium-card {
        background: white;
        border-radius: 0.75rem;
        padding: 3rem;
        box-shadow: var(--shadow-md);
        border: 1px solid var(--border-color);
        text-align: center;
        margin-bottom: 2rem;
      }

      .premium-icon {
        width: 80px;
        height: 80px;
        margin: 0 auto 1.5rem;
        color: #f59e0b;
      }

      .no-premium-card h2 {
        font-size: 1.875rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 1rem;
      }

      .no-premium-card p {
        color: var(--text-secondary);
        margin-bottom: 2rem;
      }

      .benefits-section {
        margin-bottom: 2rem;
      }

      h2 {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 1.5rem;
      }

      .benefits-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.5rem;
      }

      .benefit-card {
        background: white;
        border-radius: 0.75rem;
        padding: 1.5rem;
        box-shadow: var(--shadow-md);
        border: 1px solid var(--border-color);
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;

        &.enabled {
          border-left: 4px solid var(--success-color);
        }
      }

      .benefit-icon {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: var(--background);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1rem;
        color: var(--primary-color);
      }

      .benefit-card h3 {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 0.5rem;
      }

      .benefit-card p {
        font-size: 0.875rem;
        color: var(--text-secondary);
      }

      .actions-section {
        margin-bottom: 2rem;
      }

      .actions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.5rem;
      }

      .action-card {
        background: white;
        border-radius: 0.75rem;
        padding: 2rem;
        text-decoration: none;
        color: inherit;
        box-shadow: var(--shadow-md);
        border: 1px solid var(--border-color);
        transition: transform 0.2s, box-shadow 0.2s;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;

        &:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }
      }

      .action-icon {
        width: 64px;
        height: 64px;
        border-radius: 0.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--primary-color);
        margin-bottom: 1rem;
      }

      .action-card h3 {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 0.5rem;
      }

      .action-card p {
        font-size: 0.875rem;
        color: var(--text-secondary);
        margin-bottom: 1rem;
      }

      .action-buttons {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        width: 100%;
        margin-top: 1rem;
      }

      @media (max-width: 768px) {
        .premium-header {
          padding: 1rem;

          .header-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
        }

        .premium-main {
          padding: 1rem;
        }

        .status-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
        }
      }
    `,
  ],
})
export class PremiumDashboardComponent implements OnInit {
  private premiumService = inject(PremiumService);

  account: PremiumAccount | null = null;
  isLoading = true;
  isRenewing = false;
  isCancelling = false;

  ngOnInit(): void {
    this.loadAccount();
  }

  loadAccount(): void {
    this.isLoading = true;
    this.premiumService.getAccount().subscribe({
      next: (account) => {
        this.account = account;
        this.isLoading = false;
      },
      error: () => {
        this.account = null;
        this.isLoading = false;
      },
    });
  }

  renewSubscription(): void {
    this.isRenewing = true;
    this.premiumService.renewSubscription().subscribe({
      next: (account) => {
        this.account = account;
        this.isRenewing = false;
      },
      error: () => {
        this.isRenewing = false;
      },
    });
  }

  cancelSubscription(): void {
    if (
      !confirm('Êtes-vous sûr de vouloir annuler votre abonnement premium ?')
    ) {
      return;
    }

    this.isCancelling = true;
    this.premiumService.cancelSubscription().subscribe({
      next: () => {
        this.account = null;
        this.isCancelling = false;
        this.loadAccount();
      },
      error: () => {
        this.isCancelling = false;
      },
    });
  }

  getPlanLabel(plan: string): string {
    const labels: { [key: string]: string } = {
      basic: 'Basic',
      premium: 'Premium',
      vip: 'VIP',
    };
    return labels[plan] || plan;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      active: 'Actif',
      expired: 'Expiré',
      cancelled: 'Annulé',
    };
    return labels[status] || status;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
