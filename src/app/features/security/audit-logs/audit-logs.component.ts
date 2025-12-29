import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SecurityAuditService, AuditLog, SecurityEvent } from '../../../core/services/security-audit.service';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="audit-container">
      <header class="audit-header">
        <div class="header-content">
          <div>
            <a routerLink="/security" class="back-link">← Retour</a>
            <h1>Journaux d'audit</h1>
          </div>
        </div>
      </header>

      <main class="audit-main">
        <!-- Filters -->
        <div class="filters-section">
          <select [(ngModel)]="selectedAction" (change)="loadLogs()" class="filter-select">
            <option value="">Toutes les actions</option>
            <option value="login">Connexion</option>
            <option value="transaction">Transaction</option>
            <option value="data-access">Accès aux données</option>
            <option value="configuration-change">Changement de configuration</option>
          </select>
          <select [(ngModel)]="selectedStatus" (change)="loadLogs()" class="filter-select">
            <option value="">Tous les statuts</option>
            <option value="success">Succès</option>
            <option value="failure">Échec</option>
            <option value="blocked">Bloqué</option>
          </select>
          <input
            type="date"
            [(ngModel)]="startDate"
            (change)="loadLogs()"
            class="filter-select"
            placeholder="Date de début"
          />
          <input
            type="date"
            [(ngModel)]="endDate"
            (change)="loadLogs()"
            class="filter-select"
            placeholder="Date de fin"
          />
        </div>

        <!-- Logs List -->
        <div class="logs-section">
          <div class="logs-header">
            <h2>Journaux d'audit</h2>
            <button class="btn btn-outline" (click)="exportLogs()">Exporter</button>
          </div>
          <div *ngIf="isLoading" class="loading-state">
            <p>Chargement...</p>
          </div>
          <div *ngIf="!isLoading && logs.length === 0" class="empty-state">
            <p>Aucun journal trouvé</p>
          </div>
          <div *ngIf="!isLoading && logs.length > 0" class="logs-list">
            <div class="log-item" *ngFor="let log of logs" [class]="'status-' + log.status">
              <div class="log-header">
                <div class="log-action">
                  <h3>{{ log.action }}</h3>
                  <span class="resource-badge">{{ log.resource }}</span>
                </div>
                <div class="log-status" [class]="'status-' + log.status">
                  {{ getStatusLabel(log.status) }}
                </div>
              </div>
              <div class="log-details">
                <div class="detail-item">
                  <span>Utilisateur:</span>
                  <span>{{ log.userId || 'Système' }}</span>
                </div>
                <div class="detail-item">
                  <span>Adresse IP:</span>
                  <span>{{ log.ipAddress }}</span>
                </div>
                <div class="detail-item">
                  <span>Date:</span>
                  <span>{{ formatDateTime(log.timestamp) }}</span>
                </div>
                <div class="detail-item" *ngIf="log.resourceId">
                  <span>Ressource ID:</span>
                  <span>{{ log.resourceId }}</span>
                </div>
              </div>
              <div class="log-risk" *ngIf="log.riskLevel !== 'low'">
                <span class="risk-badge" [class]="'risk-' + log.riskLevel">
                  Risque: {{ getRiskLabel(log.riskLevel) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .audit-container {
      min-height: 100vh;
      background: var(--background);
    }

    .audit-header {
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

    .audit-main {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .filters-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .filter-select {
      padding: 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 0.5rem;
      background: white;
      font-size: 0.875rem;
    }

    .logs-section {
      background: white;
      border-radius: 0.75rem;
      padding: 2rem;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border-color);
    }

    .logs-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .logs-header h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .logs-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .log-item {
      background: var(--background);
      border-radius: 0.5rem;
      padding: 1.5rem;
      border: 1px solid var(--border-color);

      &.status-failure {
        border-left: 4px solid var(--danger-color);
      }

      &.status-blocked {
        border-left: 4px solid var(--warning-color);
      }
    }

    .log-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .log-action {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .log-action h3 {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .resource-badge {
      padding: 0.25rem 0.5rem;
      background: var(--primary-color);
      color: white;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .log-status {
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;

      &.status-success {
        background: #dcfce7;
        color: #166534;
      }

      &.status-failure {
        background: #fee2e2;
        color: #991b1b;
      }

      &.status-blocked {
        background: #fef3c7;
        color: #92400e;
      }
    }

    .log-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .log-risk {
      margin-top: 1rem;
    }

    .risk-badge {
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;

      &.risk-high {
        background: #fee2e2;
        color: #991b1b;
      }

      &.risk-medium {
        background: #fef3c7;
        color: #92400e;
      }
    }

    .loading-state, .empty-state {
      text-align: center;
      padding: 3rem 2rem;
    }

    @media (max-width: 768px) {
      .audit-header {
        padding: 1rem;
      }

      .audit-main {
        padding: 1rem;
      }

      .filters-section {
        grid-template-columns: 1fr;
      }

      .logs-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }
    }
  `]
})
export class AuditLogsComponent implements OnInit {
  private auditService = inject(SecurityAuditService);

  logs: AuditLog[] = [];
  selectedAction = '';
  selectedStatus = '';
  startDate = '';
  endDate = '';
  isLoading = true;

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.isLoading = true;
    const params: any = {};
    if (this.selectedAction) params.action = this.selectedAction;
    if (this.selectedStatus) params.status = this.selectedStatus;
    if (this.startDate) params.startDate = this.startDate;
    if (this.endDate) params.endDate = this.endDate;

    this.auditService.getAuditLogs(params).subscribe({
      next: (logs) => {
        this.logs = logs;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  exportLogs(): void {
    this.auditService.exportAuditLogs('csv').subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString()}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    });
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'success': 'Succès',
      'failure': 'Échec',
      'blocked': 'Bloqué'
    };
    return labels[status] || status;
  }

  getRiskLabel(risk: string): string {
    const labels: { [key: string]: string } = {
      'low': 'Faible',
      'medium': 'Moyen',
      'high': 'Élevé'
    };
    return labels[risk] || risk;
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


