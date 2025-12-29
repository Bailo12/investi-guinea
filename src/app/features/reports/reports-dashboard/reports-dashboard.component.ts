import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReportingService, PlatformStats, TransactionReport, FeeReport } from '../../../core/services/reporting.service';

@Component({
  selector: 'app-reports-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="reports-container">
      <header class="reports-header">
        <div class="header-content">
          <div>
            <h1>Rapports et Transparence</h1>
            <p>Vue d'ensemble des statistiques et de la transparence de la plateforme</p>
          </div>
          <a routerLink="/dashboard" class="btn btn-outline">Retour</a>
        </div>
      </header>

      <main class="reports-main">
        <!-- Platform Stats -->
        <div class="stats-section" *ngIf="platformStats">
          <h2>Statistiques de la plateforme</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon" style="background: #dbeafe;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div class="stat-content">
                <p class="stat-label">Utilisateurs totaux</p>
                <p class="stat-value">{{ platformStats.totalUsers | number }}</p>
                <p class="stat-subtext">{{ platformStats.activeUsers | number }} actifs</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon" style="background: #dcfce7;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <line x1="9" y1="3" x2="9" y2="21"/>
                </svg>
              </div>
              <div class="stat-content">
                <p class="stat-label">Transactions totales</p>
                <p class="stat-value">{{ platformStats.totalTransactions | number }}</p>
                <p class="stat-subtext">Volume: {{ formatCurrency(platformStats.totalVolume) }}</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon" style="background: #fef3c7;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div class="stat-content">
                <p class="stat-label">Frais totaux collectés</p>
                <p class="stat-value">{{ formatCurrency(platformStats.totalFees) }}</p>
                <p class="stat-subtext">Transparence totale</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon" style="background: #e0e7ff;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div class="stat-content">
                <p class="stat-label">Transaction moyenne</p>
                <p class="stat-value">{{ formatCurrency(platformStats.averageTransactionAmount) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Reports -->
        <div class="reports-section">
          <h2>Rapports disponibles</h2>
          <div class="reports-grid">
            <a routerLink="/reports/transactions" class="report-card">
              <div class="report-icon" style="background: #dbeafe;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <line x1="9" y1="3" x2="9" y2="21"/>
                </svg>
              </div>
              <h3>Rapport des transactions</h3>
              <p>Détails complets de toutes les transactions</p>
            </a>

            <a routerLink="/reports/fees" class="report-card">
              <div class="report-icon" style="background: #fef3c7;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <h3>Rapport des frais</h3>
              <p>Analyse détaillée des frais de transaction</p>
            </a>

            <a routerLink="/reports/user" class="report-card">
              <div class="report-icon" style="background: #dcfce7;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <h3>Mon rapport personnel</h3>
              <p>Vos statistiques et performances</p>
            </a>
          </div>
        </div>

        <!-- Fee Transparency -->
        <div class="transparency-section">
          <h2>Transparence des frais</h2>
          <div class="transparency-card">
            <h3>Structure des frais</h3>
            <div class="fee-structure">
              <div class="fee-item">
                <span class="fee-type">Dépôts</span>
                <span class="fee-range">3% - 7%</span>
                <span class="fee-note">Frais réduits pour encourager les dépôts</span>
              </div>
              <div class="fee-item">
                <span class="fee-type">Retraits</span>
                <span class="fee-range">5% - 10%</span>
                <span class="fee-note">Frais standard pour les retraits</span>
              </div>
              <div class="fee-item">
                <span class="fee-type">Investissements</span>
                <span class="fee-range">5% - 8%</span>
                <span class="fee-note">Frais modérés pour les investissements</span>
              </div>
            </div>
            <p class="transparency-note">
              <strong>Note:</strong> Les frais sont calculés dynamiquement selon le montant de la transaction.
              Les montants plus élevés bénéficient de frais réduits. Frais minimum: 500 GNF.
            </p>
          </div>
        </div>

        <!-- Top Products -->
        <div class="top-products-section" *ngIf="platformStats && platformStats.topProducts.length > 0">
          <h2>Produits les plus populaires</h2>
          <div class="products-list">
            <div class="product-item" *ngFor="let product of platformStats.topProducts">
              <div class="product-info">
                <h4>{{ product.productName }}</h4>
                <p>{{ product.investments }} investissement(s)</p>
              </div>
              <div class="product-amount">
                {{ formatCurrency(product.totalAmount) }}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .reports-container {
      min-height: 100vh;
      background: var(--background);
    }

    .reports-header {
      background: white;
      border-bottom: 1px solid var(--border-color);
      padding: 1.5rem 2rem;

      .header-content {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;

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

    .reports-main {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .stats-section, .reports-section, .transparency-section, .top-products-section {
      margin-bottom: 3rem;
    }

    h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 1.5rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .stat-card {
      background: white;
      border-radius: 0.75rem;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border-color);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary-color);
    }

    .stat-content {
      flex: 1;
    }

    .stat-label {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-bottom: 0.25rem;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .stat-subtext {
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin-top: 0.25rem;
    }

    .reports-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .report-card {
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

    .report-icon {
      width: 64px;
      height: 64px;
      border-radius: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary-color);
      margin-bottom: 1rem;
    }

    .report-card h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .report-card p {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .transparency-card {
      background: white;
      border-radius: 0.75rem;
      padding: 2rem;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border-color);
    }

    .transparency-card h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 1.5rem;
    }

    .fee-structure {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .fee-item {
      display: grid;
      grid-template-columns: 1fr 1fr 2fr;
      gap: 1rem;
      padding: 1rem;
      background: var(--background);
      border-radius: 0.5rem;
      align-items: center;
    }

    .fee-type {
      font-weight: 600;
      color: var(--text-primary);
    }

    .fee-range {
      font-weight: 600;
      color: var(--primary-color);
    }

    .fee-note {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .transparency-note {
      font-size: 0.875rem;
      color: var(--text-secondary);
      padding: 1rem;
      background: var(--background);
      border-radius: 0.5rem;
      border-left: 3px solid var(--primary-color);
    }

    .products-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .product-item {
      background: white;
      border-radius: 0.75rem;
      padding: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border-color);
    }

    .product-info h4 {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.25rem;
    }

    .product-info p {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .product-amount {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--primary-color);
    }

    @media (max-width: 768px) {
      .reports-header {
        padding: 1rem;

        .header-content {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
        }
      }

      .reports-main {
        padding: 1rem;
      }

      .fee-item {
        grid-template-columns: 1fr;
        gap: 0.5rem;
      }
    }
  `]
})
export class ReportsDashboardComponent implements OnInit {
  private reportingService = inject(ReportingService);

  platformStats: PlatformStats | null = null;
  isLoading = true;

  ngOnInit(): void {
    this.loadPlatformStats();
  }

  loadPlatformStats(): void {
    this.isLoading = true;
    this.reportingService.getPlatformStats().subscribe({
      next: (stats) => {
        this.platformStats = stats;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        // In a real app, handle error appropriately
      }
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0
    }).format(value);
  }
}


