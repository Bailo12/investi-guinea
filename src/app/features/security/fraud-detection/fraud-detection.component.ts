import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FraudDetectionService, FraudAlert, FraudStats } from '../../../core/services/fraud-detection.service';

@Component({
  selector: 'app-fraud-detection',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="fraud-container">
      <header class="fraud-header">
        <div class="header-content">
          <div>
            <a routerLink="/security" class="back-link">← Retour</a>
            <h1>Détection de fraude</h1>
          </div>
        </div>
      </header>

      <main class="fraud-main">
        <!-- Stats Summary -->
        <div class="stats-section" *ngIf="stats">
          <div class="stats-grid">
            <div class="stat-card">
              <h3>Alertes totales</h3>
              <p class="stat-value">{{ stats.totalAlerts | number }}</p>
            </div>
            <div class="stat-card critical">
              <h3>Alertes critiques</h3>
              <p class="stat-value">{{ stats.criticalAlerts | number }}</p>
            </div>
            <div class="stat-card">
              <h3>Résolues</h3>
              <p class="stat-value">{{ stats.resolvedAlerts | number }}</p>
            </div>
            <div class="stat-card">
              <h3>Score de risque moyen</h3>
              <p class="stat-value">{{ stats.averageRiskScore.toFixed(1) }}</p>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="filters-section">
          <select [(ngModel)]="selectedStatus" (change)="loadAlerts()" class="filter-select">
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="reviewed">Examinées</option>
            <option value="resolved">Résolues</option>
            <option value="false-positive">Faux positifs</option>
          </select>
          <select [(ngModel)]="selectedSeverity" (change)="loadAlerts()" class="filter-select">
            <option value="">Toutes les sévérités</option>
            <option value="low">Faible</option>
            <option value="medium">Moyenne</option>
            <option value="high">Élevée</option>
            <option value="critical">Critique</option>
          </select>
        </div>

        <!-- Alerts List -->
        <div class="alerts-section">
          <h2>Alertes de fraude</h2>
          <div *ngIf="isLoading" class="loading-state">
            <p>Chargement...</p>
          </div>
          <div *ngIf="!isLoading && alerts.length === 0" class="empty-state">
            <p>Aucune alerte</p>
          </div>
          <div *ngIf="!isLoading && alerts.length > 0" class="alerts-list">
            <div class="alert-card" *ngFor="let alert of alerts" [class]="'severity-' + alert.severity">
              <div class="alert-header">
                <div class="alert-type">
                  <h3>{{ getTypeLabel(alert.type) }}</h3>
                  <span class="severity-badge" [class]="'severity-' + alert.severity">
                    {{ getSeverityLabel(alert.severity) }}
                  </span>
                </div>
                <div class="alert-score">
                  <span class="score-label">Score de risque</span>
                  <span class="score-value" [class]="getRiskClass(alert.riskScore)">
                    {{ alert.riskScore }}
                  </span>
                </div>
              </div>
              <p class="alert-description">{{ alert.description }}</p>
              <div class="alert-details">
                <div class="detail-item">
                  <span>Date:</span>
                  <span>{{ formatDateTime(alert.createdAt) }}</span>
                </div>
                <div class="detail-item" *ngIf="alert.transactionId">
                  <span>Transaction:</span>
                  <span>{{ alert.transactionId }}</span>
                </div>
                <div class="detail-item">
                  <span>Statut:</span>
                  <span class="status-badge" [class]="'status-' + alert.status">
                    {{ getStatusLabel(alert.status) }}
                  </span>
                </div>
              </div>
              <div class="alert-actions" *ngIf="alert.status === 'pending'">
                <button class="btn btn-outline" (click)="reviewAlert(alert.id, 'false-positive')">
                  Marquer comme faux positif
                </button>
                <button class="btn btn-primary" (click)="reviewAlert(alert.id, 'resolved')">
                  Résoudre
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .fraud-container {
      min-height: 100vh;
      background: var(--background);
    }

    .fraud-header {
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

    .fraud-main {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .stats-section {
      margin-bottom: 2rem;
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
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border-color);
      text-align: center;

      &.critical {
        border-left: 4px solid var(--danger-color);
      }
    }

    .stat-card h3 {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-secondary);
      margin-bottom: 0.75rem;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .filters-section {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .filter-select {
      padding: 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 0.5rem;
      background: white;
      font-size: 0.875rem;
      cursor: pointer;
    }

    .alerts-section h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 1.5rem;
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
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border-color);

      &.severity-critical {
        border-left: 4px solid var(--danger-color);
      }

      &.severity-high {
        border-left: 4px solid var(--warning-color);
      }
    }

    .alert-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .alert-type {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .alert-type h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .severity-badge {
      padding: 0.375rem 0.75rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 500;

      &.severity-critical {
        background: #fee2e2;
        color: #991b1b;
      }

      &.severity-high {
        background: #fef3c7;
        color: #92400e;
      }

      &.severity-medium {
        background: #dbeafe;
        color: #1e40af;
      }

      &.severity-low {
        background: #dcfce7;
        color: #166534;
      }
    }

    .alert-score {
      text-align: right;
    }

    .score-label {
      font-size: 0.75rem;
      color: var(--text-secondary);
      display: block;
      margin-bottom: 0.25rem;
    }

    .score-value {
      font-size: 1.5rem;
      font-weight: 700;

      &.risk-high {
        color: var(--danger-color);
      }

      &.risk-medium {
        color: var(--warning-color);
      }

      &.risk-low {
        color: var(--success-color);
      }
    }

    .alert-description {
      color: var(--text-secondary);
      margin-bottom: 1rem;
    }

    .alert-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.75rem;
      margin-bottom: 1rem;
      padding: 1rem;
      background: var(--background);
      border-radius: 0.5rem;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .status-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      font-weight: 500;

      &.status-pending {
        background: #fef3c7;
        color: #92400e;
      }

      &.status-reviewed {
        background: #dbeafe;
        color: #1e40af;
      }

      &.status-resolved {
        background: #dcfce7;
        color: #166534;
      }
    }

    .alert-actions {
      display: flex;
      gap: 0.75rem;
      margin-top: 1rem;
    }

    .loading-state, .empty-state {
      text-align: center;
      padding: 3rem 2rem;
      background: white;
      border-radius: 0.75rem;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border-color);
    }

    @media (max-width: 768px) {
      .fraud-header {
        padding: 1rem;
      }

      .fraud-main {
        padding: 1rem;
      }

      .filters-section {
        flex-direction: column;
      }

      .alert-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }
    }
  `]
})
export class FraudDetectionComponent implements OnInit {
  private fraudService = inject(FraudDetectionService);

  alerts: FraudAlert[] = [];
  stats: FraudStats | null = null;
  selectedStatus = '';
  selectedSeverity = '';
  isLoading = true;

  ngOnInit(): void {
    this.loadStats();
    this.loadAlerts();
  }

  loadStats(): void {
    this.fraudService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      }
    });
  }

  loadAlerts(): void {
    this.isLoading = true;
    const params: any = {};
    if (this.selectedStatus) params.status = this.selectedStatus;
    if (this.selectedSeverity) params.severity = this.selectedSeverity;

    this.fraudService.getAlerts(params).subscribe({
      next: (alerts) => {
        this.alerts = alerts;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  reviewAlert(alertId: string, decision: 'resolved' | 'false-positive'): void {
    this.fraudService.reviewAlert(alertId, decision).subscribe({
      next: () => {
        this.loadAlerts();
      }
    });
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'suspicious-transaction': 'Transaction suspecte',
      'unusual-activity': 'Activité inhabituelle',
      'multiple-failed-attempts': 'Tentatives échouées multiples',
      'anomaly-detected': 'Anomalie détectée'
    };
    return labels[type] || type;
  }

  getSeverityLabel(severity: string): string {
    const labels: { [key: string]: string } = {
      'low': 'Faible',
      'medium': 'Moyenne',
      'high': 'Élevée',
      'critical': 'Critique'
    };
    return labels[severity] || severity;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'En attente',
      'reviewed': 'Examinée',
      'resolved': 'Résolue',
      'false-positive': 'Faux positif'
    };
    return labels[status] || status;
  }

  getRiskClass(score: number): string {
    if (score >= 70) return 'risk-high';
    if (score >= 40) return 'risk-medium';
    return 'risk-low';
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}


