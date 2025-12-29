import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SecurityAuditService, SecurityCompliance } from '../../../core/services/security-audit.service';
import { KYCService } from '../../../core/services/kyc.service';

@Component({
  selector: 'app-compliance',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="compliance-container">
      <header class="compliance-header">
        <div class="header-content">
          <div>
            <a routerLink="/security" class="back-link">← Retour</a>
            <h1>Conformité KYC/AML</h1>
          </div>
        </div>
      </header>

      <main class="compliance-main">
        <!-- Compliance Overview -->
        <div class="compliance-overview" *ngIf="compliance">
          <div class="overview-card">
            <h2>Vue d'ensemble de la conformité</h2>
            <div class="compliance-score">
              <div class="score-circle" [class]="getScoreClass(compliance.securityScore)">
                <span class="score-value">{{ compliance.securityScore }}</span>
                <span class="score-label">/ 100</span>
              </div>
              <div class="score-details">
                <p class="score-status">{{ getScoreStatus(compliance.securityScore) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- KYC Compliance -->
        <div class="kyc-section" *ngIf="compliance">
          <h2>Conformité KYC</h2>
          <div class="compliance-grid">
            <div class="compliance-card">
              <h3>Utilisateurs</h3>
              <div class="stat-item">
                <span>Total:</span>
                <span class="value">{{ compliance.kycCompliance.totalUsers | number }}</span>
              </div>
              <div class="stat-item">
                <span>Vérifiés:</span>
                <span class="value positive">{{ compliance.kycCompliance.verifiedUsers | number }}</span>
              </div>
              <div class="stat-item">
                <span>En attente:</span>
                <span class="value warning">{{ compliance.kycCompliance.pendingVerification | number }}</span>
              </div>
              <div class="stat-item">
                <span>Rejetés:</span>
                <span class="value negative">{{ compliance.kycCompliance.rejectedUsers | number }}</span>
              </div>
              <div class="compliance-rate">
                <span>Taux de conformité:</span>
                <span class="rate-value">{{ compliance.kycCompliance.complianceRate.toFixed(1) }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- AML Compliance -->
        <div class="aml-section" *ngIf="compliance">
          <h2>Conformité AML</h2>
          <div class="compliance-grid">
            <div class="compliance-card">
              <h3>Transactions</h3>
              <div class="stat-item">
                <span>Total:</span>
                <span class="value">{{ compliance.amlCompliance.totalTransactions | number }}</span>
              </div>
              <div class="stat-item">
                <span>Vérifiées:</span>
                <span class="value positive">{{ compliance.amlCompliance.screenedTransactions | number }}</span>
              </div>
              <div class="stat-item">
                <span>Signalées:</span>
                <span class="value warning">{{ compliance.amlCompliance.flaggedTransactions | number }}</span>
              </div>
              <div class="compliance-rate">
                <span>Taux de conformité:</span>
                <span class="rate-value">{{ compliance.amlCompliance.complianceRate.toFixed(1) }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Data Protection -->
        <div class="data-protection-section" *ngIf="compliance">
          <h2>Protection des données</h2>
          <div class="compliance-grid">
            <div class="compliance-card">
              <h3>Chiffrement</h3>
              <div class="stat-item">
                <span>Données chiffrées:</span>
                <span class="value">{{ compliance.dataProtection.encryptedData | number }}</span>
              </div>
              <div class="stat-item">
                <span>Couverture:</span>
                <span class="value positive">{{ compliance.dataProtection.encryptionCoverage.toFixed(1) }}%</span>
              </div>
              <div class="stat-item">
                <span>Dernier audit:</span>
                <span class="value">{{ formatDate(compliance.dataProtection.lastAuditDate) }}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .compliance-container {
      min-height: 100vh;
      background: var(--background);
    }

    .compliance-header {
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
        }
      }
    }

    .compliance-main {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .compliance-overview {
      margin-bottom: 2rem;
    }

    .overview-card {
      background: white;
      border-radius: 0.75rem;
      padding: 2rem;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border-color);
    }

    .overview-card h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 1.5rem;
    }

    .compliance-score {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .score-circle {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-weight: 700;

      &.score-excellent {
        background: #dcfce7;
        color: #166534;
      }

      &.score-good {
        background: #dbeafe;
        color: #1e40af;
      }

      &.score-warning {
        background: #fef3c7;
        color: #92400e;
      }

      &.score-critical {
        background: #fee2e2;
        color: #991b1b;
      }
    }

    .score-value {
      font-size: 2.5rem;
      line-height: 1;
    }

    .score-label {
      font-size: 1rem;
      opacity: 0.7;
    }

    .score-status {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .kyc-section, .aml-section, .data-protection-section {
      margin-bottom: 2rem;
    }

    h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 1.5rem;
    }

    .compliance-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.5rem;
    }

    .compliance-card {
      background: white;
      border-radius: 0.75rem;
      padding: 1.5rem;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border-color);
    }

    .compliance-card h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 1rem;
    }

    .stat-item {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--border-color);
    }

    .stat-item:last-child {
      border-bottom: none;
    }

    .value {
      font-weight: 600;
      color: var(--text-primary);

      &.positive {
        color: var(--success-color);
      }

      &.warning {
        color: var(--warning-color);
      }

      &.negative {
        color: var(--danger-color);
      }
    }

    .compliance-rate {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 2px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
    }

    .rate-value {
      font-size: 1.25rem;
      color: var(--primary-color);
    }

    @media (max-width: 768px) {
      .compliance-header {
        padding: 1rem;
      }

      .compliance-main {
        padding: 1rem;
      }

      .compliance-grid {
        grid-template-columns: 1fr;
      }

      .compliance-score {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class ComplianceComponent implements OnInit {
  private auditService = inject(SecurityAuditService);

  compliance: SecurityCompliance | null = null;
  isLoading = true;

  ngOnInit(): void {
    this.loadCompliance();
  }

  loadCompliance(): void {
    this.isLoading = true;
    this.auditService.getComplianceStatus().subscribe({
      next: (compliance) => {
        this.compliance = compliance;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  getScoreClass(score: number): string {
    if (score >= 90) return 'score-excellent';
    if (score >= 70) return 'score-good';
    if (score >= 50) return 'score-warning';
    return 'score-critical';
  }

  getScoreStatus(score: number): string {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Bon';
    if (score >= 50) return 'À améliorer';
    return 'Critique';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}


