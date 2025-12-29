import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SecurityAuditService, SecurityCompliance } from '../../../core/services/security-audit.service';
import { FraudDetectionService, FraudStats } from '../../../core/services/fraud-detection.service';

@Component({
  selector: 'app-security-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="security-container">
      <header class="security-header">
        <div class="header-content">
          <div>
            <h1>Centre de sécurité</h1>
            <p>Surveillance et conformité de la plateforme</p>
          </div>
          <a routerLink="/dashboard" class="btn btn-outline">Retour</a>
        </div>
      </header>

      <main class="security-main">
        <!-- Security Score -->
        <div class="security-score-card">
          <h2>Score de sécurité</h2>
          <div class="score-display">
            <div class="score-circle" [class]="getScoreClass(compliance?.securityScore || 0)">
              <span class="score-value">{{ compliance?.securityScore || 0 }}</span>
              <span class="score-label">/ 100</span>
            </div>
            <div class="score-details">
              <p class="score-status">{{ getScoreStatus(compliance?.securityScore || 0) }}</p>
              <p class="score-description">Basé sur la conformité KYC/AML, le chiffrement et les audits</p>
            </div>
          </div>
        </div>

        <!-- Compliance Overview -->
        <div class="compliance-section" *ngIf="compliance">
          <h2>Conformité</h2>
          <div class="compliance-grid">
            <div class="compliance-card">
              <h3>KYC</h3>
              <div class="compliance-stats">
                <div class="stat">
                  <span class="stat-label">Taux de conformité</span>
                  <span class="stat-value">{{ compliance.kycCompliance.complianceRate.toFixed(1) }}%</span>
                </div>
                <div class="stat">
                  <span class="stat-label">Utilisateurs vérifiés</span>
                  <span class="stat-value">{{ compliance.kycCompliance.verifiedUsers | number }} / {{ compliance.kycCompliance.totalUsers | number }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">En attente</span>
                  <span class="stat-value warning">{{ compliance.kycCompliance.pendingVerification | number }}</span>
                </div>
              </div>
            </div>

            <div class="compliance-card">
              <h3>AML</h3>
              <div class="compliance-stats">
                <div class="stat">
                  <span class="stat-label">Taux de conformité</span>
                  <span class="stat-value">{{ compliance.amlCompliance.complianceRate.toFixed(1) }}%</span>
                </div>
                <div class="stat">
                  <span class="stat-label">Transactions vérifiées</span>
                  <span class="stat-value">{{ compliance.amlCompliance.screenedTransactions | number }} / {{ compliance.amlCompliance.totalTransactions | number }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">Signalées</span>
                  <span class="stat-value warning">{{ compliance.amlCompliance.flaggedTransactions | number }}</span>
                </div>
              </div>
            </div>

            <div class="compliance-card">
              <h3>Protection des données</h3>
              <div class="compliance-stats">
                <div class="stat">
                  <span class="stat-label">Couverture de chiffrement</span>
                  <span class="stat-value">{{ compliance.dataProtection.encryptionCoverage.toFixed(1) }}%</span>
                </div>
                <div class="stat">
                  <span class="stat-label">Données chiffrées</span>
                  <span class="stat-value">{{ compliance.dataProtection.encryptedData | number }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">Dernier audit</span>
                  <span class="stat-value">{{ formatDate(compliance.dataProtection.lastAuditDate) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Fraud Detection Summary -->
        <div class="fraud-section" *ngIf="fraudStats">
          <h2>Détection de fraude</h2>
          <div class="fraud-stats-grid">
            <div class="fraud-stat-card">
              <div class="stat-icon" style="background: #fee2e2;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <div class="stat-content">
                <p class="stat-label">Alertes totales</p>
                <p class="stat-value">{{ fraudStats.totalAlerts | number }}</p>
              </div>
            </div>

            <div class="fraud-stat-card critical">
              <div class="stat-icon" style="background: #fee2e2;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <div class="stat-content">
                <p class="stat-label">Alertes critiques</p>
                <p class="stat-value">{{ fraudStats.criticalAlerts | number }}</p>
              </div>
            </div>

            <div class="fraud-stat-card">
              <div class="stat-icon" style="background: #dcfce7;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div class="stat-content">
                <p class="stat-label">Résolues</p>
                <p class="stat-value">{{ fraudStats.resolvedAlerts | number }}</p>
              </div>
            </div>

            <div class="fraud-stat-card">
              <div class="stat-icon" style="background: #fef3c7;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </div>
              <div class="stat-content">
                <p class="stat-label">Faux positifs</p>
                <p class="stat-value">{{ fraudStats.falsePositives | number }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="actions-section">
          <h2>Actions rapides</h2>
          <div class="actions-grid">
            <a routerLink="/security/fraud-detection" class="action-card">
              <div class="action-icon" style="background: #fee2e2;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                </svg>
              </div>
              <h3>Détection de fraude</h3>
              <p>Surveiller et gérer les alertes</p>
            </a>

            <a routerLink="/security/audit-logs" class="action-card">
              <div class="action-icon" style="background: #dbeafe;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <h3>Journaux d'audit</h3>
              <p>Consulter l'historique de sécurité</p>
            </a>

            <a routerLink="/security/compliance" class="action-card">
              <div class="action-icon" style="background: #dcfce7;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h3>Conformité</h3>
              <p>Rapports KYC/AML</p>
            </a>

            <a routerLink="/security/penetration-tests" class="action-card">
              <div class="action-icon" style="background: #fef3c7;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <h3>Tests de pénétration</h3>
              <p>Audits de sécurité</p>
            </a>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .security-container {
      min-height: 100vh;
      background: var(--background);
    }

    .security-header {
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

    .security-main {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .security-score-card {
      background: white;
      border-radius: 0.75rem;
      padding: 2rem;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border-color);
      margin-bottom: 2rem;
    }

    .security-score-card h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 1.5rem;
    }

    .score-display {
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

    .score-details {
      flex: 1;
    }

    .score-status {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .score-description {
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .compliance-section, .fraud-section, .actions-section {
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
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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

    .compliance-stats {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .stat {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .stat-label {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .stat-value {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);

      &.warning {
        color: var(--warning-color);
      }
    }

    .fraud-stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .fraud-stat-card {
      background: white;
      border-radius: 0.75rem;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border-color);

      &.critical {
        border-left: 4px solid var(--danger-color);
      }
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

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
    }

    @media (max-width: 768px) {
      .security-header {
        padding: 1rem;

        .header-content {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
        }
      }

      .security-main {
        padding: 1rem;
      }

      .score-display {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class SecurityDashboardComponent implements OnInit {
  private securityAuditService = inject(SecurityAuditService);
  private fraudDetectionService = inject(FraudDetectionService);

  compliance: SecurityCompliance | null = null;
  fraudStats: FraudStats | null = null;
  isLoading = true;

  ngOnInit(): void {
    this.loadCompliance();
    this.loadFraudStats();
  }

  loadCompliance(): void {
    this.securityAuditService.getComplianceStatus().subscribe({
      next: (compliance) => {
        this.compliance = compliance;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  loadFraudStats(): void {
    this.fraudDetectionService.getStats().subscribe({
      next: (stats) => {
        this.fraudStats = stats;
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


