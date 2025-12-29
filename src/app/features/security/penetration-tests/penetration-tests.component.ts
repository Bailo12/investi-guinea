import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  SecurityAuditService,
  PenetrationTest,
} from '../../../core/services/security-audit.service';

@Component({
  selector: 'app-penetration-tests',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="pentest-container">
      <header class="pentest-header">
        <div class="header-content">
          <div>
            <a routerLink="/security" class="back-link">← Retour</a>
            <h1>Tests de pénétration</h1>
          </div>
          <button
            class="btn btn-primary"
            (click)="runTest()"
            [disabled]="isRunning"
          >
            <span *ngIf="!isRunning">Lancer un test</span>
            <span *ngIf="isRunning">Test en cours...</span>
          </button>
        </div>
      </header>

      <main class="pentest-main">
        <!-- Tests List -->
        <div class="tests-section">
          <h2>Tests effectués</h2>
          <div *ngIf="isLoading" class="loading-state">
            <p>Chargement...</p>
          </div>
          <div *ngIf="!isLoading && tests.length === 0" class="empty-state">
            <p>Aucun test effectué</p>
          </div>
          <div *ngIf="!isLoading && tests.length > 0" class="tests-list">
            <div
              class="test-card"
              *ngFor="let test of tests"
              [class]="'status-' + test.status"
            >
              <div class="test-header">
                <div class="test-info">
                  <h3>{{ getTestTypeLabel(test.testType) }}</h3>
                  <span class="test-status" [class]="'status-' + test.status">
                    {{ getStatusLabel(test.status) }}
                  </span>
                </div>
                <div class="test-dates">
                  <p *ngIf="test.startedAt">
                    Démarré: {{ formatDate(test.startedAt) }}
                  </p>
                  <p *ngIf="test.completedAt">
                    Terminé: {{ formatDate(test.completedAt) }}
                  </p>
                </div>
              </div>

              <div class="test-scope">
                <h4>Portée:</h4>
                <div class="scope-tags">
                  <span class="scope-tag" *ngFor="let item of test?.scope">{{
                    item
                  }}</span>
                </div>
              </div>

              <div class="test-findings" *ngIf="test?.findings?.length">
                <h4>Résultats ({{ test?.findings?.length }})</h4>
                <div class="findings-list">
                  <div
                    class="finding-item"
                    *ngFor="let finding of test?.findings"
                    [class]="'severity-' + finding?.severity"
                  >
                    <div class="finding-header">
                      <span
                        class="severity-badge"
                        [class]="'severity-' + finding?.severity"
                      >
                        {{ getSeverityLabel(finding?.severity || '') }}
                      </span>
                      <span
                        class="finding-status"
                        [class]="'status-' + finding?.status"
                      >
                        {{ getFindingStatusLabel(finding?.status || '') }}
                      </span>
                    </div>
                    <p class="finding-description">
                      {{ finding?.description }}
                    </p>
                    <p class="finding-recommendation">
                      <strong>Recommandation:</strong>
                      {{ finding?.recommendation }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="test-actions" *ngIf="test?.reportUrl">
                <a
                  [href]="test?.reportUrl"
                  target="_blank"
                  class="btn btn-outline"
                >
                  Télécharger le rapport
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [
    `
      .pentest-container {
        min-height: 100vh;
        background: var(--background);
      }

      .pentest-header {
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

      .pentest-main {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }

      .tests-section h2 {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 1.5rem;
      }

      .tests-list {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .test-card {
        background: white;
        border-radius: 0.75rem;
        padding: 2rem;
        box-shadow: var(--shadow-md);
        border: 1px solid var(--border-color);

        &.status-completed {
          border-left: 4px solid var(--success-color);
        }

        &.status-running {
          border-left: 4px solid var(--primary-color);
        }

        &.status-failed {
          border-left: 4px solid var(--danger-color);
        }
      }

      .test-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--border-color);
      }

      .test-info {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .test-info h3 {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-primary);
      }

      .test-status {
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        font-weight: 500;

        &.status-pending {
          background: #fef3c7;
          color: #92400e;
        }

        &.status-running {
          background: #dbeafe;
          color: #1e40af;
        }

        &.status-completed {
          background: #dcfce7;
          color: #166534;
        }

        &.status-failed {
          background: #fee2e2;
          color: #991b1b;
        }
      }

      .test-dates {
        text-align: right;
        font-size: 0.875rem;
        color: var(--text-secondary);
      }

      .test-scope {
        margin-bottom: 1.5rem;
      }

      .test-scope h4 {
        font-size: 1rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 0.75rem;
      }

      .scope-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .scope-tag {
        padding: 0.375rem 0.75rem;
        background: var(--background);
        border-radius: 0.375rem;
        font-size: 0.875rem;
        color: var(--text-primary);
      }

      .test-findings {
        margin-bottom: 1.5rem;
      }

      .test-findings h4 {
        font-size: 1rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 1rem;
      }

      .findings-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .finding-item {
        background: var(--background);
        border-radius: 0.5rem;
        padding: 1rem;
        border-left: 4px solid var(--border-color);

        &.severity-critical {
          border-left-color: var(--danger-color);
        }

        &.severity-high {
          border-left-color: var(--warning-color);
        }

        &.severity-medium {
          border-left-color: var(--primary-color);
        }

        &.severity-low {
          border-left-color: var(--success-color);
        }
      }

      .finding-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 0.75rem;
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

      .finding-status {
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.75rem;
        font-weight: 500;

        &.status-open {
          background: #fee2e2;
          color: #991b1b;
        }

        &.status-in-progress {
          background: #fef3c7;
          color: #92400e;
        }

        &.status-resolved {
          background: #dcfce7;
          color: #166534;
        }
      }

      .finding-description {
        color: var(--text-primary);
        margin-bottom: 0.5rem;
      }

      .finding-recommendation {
        font-size: 0.875rem;
        color: var(--text-secondary);
      }

      .test-actions {
        margin-top: 1.5rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--border-color);
      }

      .loading-state,
      .empty-state {
        text-align: center;
        padding: 3rem 2rem;
        background: white;
        border-radius: 0.75rem;
        box-shadow: var(--shadow-md);
        border: 1px solid var(--border-color);
      }

      @media (max-width: 768px) {
        .pentest-header {
          padding: 1rem;

          .header-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
        }

        .pentest-main {
          padding: 1rem;
        }

        .test-header {
          flex-direction: column;
          gap: 1rem;
        }
      }
    `,
  ],
})
export class PenetrationTestsComponent implements OnInit {
  private auditService = inject(SecurityAuditService);

  tests: PenetrationTest[] = [];
  isLoading = true;
  isRunning = false;

  ngOnInit(): void {
    this.loadTests();
  }

  loadTests(): void {
    this.isLoading = true;
    this.auditService.getPenetrationTests().subscribe({
      next: (tests) => {
        this.tests = tests;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  runTest(): void {
    this.isRunning = true;
    this.auditService
      .runPenetrationTest('automated', [
        'authentication',
        'authorization',
        'data-encryption',
        'api-security',
        'input-validation',
      ])
      .subscribe({
        next: () => {
          this.isRunning = false;
          this.loadTests();
        },
        error: () => {
          this.isRunning = false;
        },
      });
  }

  getTestTypeLabel(type: string): string {
    return type === 'automated' ? 'Test automatisé' : 'Test manuel';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      pending: 'En attente',
      running: 'En cours',
      completed: 'Terminé',
      failed: 'Échoué',
    };
    return labels[status] || status;
  }

  getSeverityLabel(severity: string): string {
    const labels: { [key: string]: string } = {
      critical: 'Critique',
      high: 'Élevée',
      medium: 'Moyenne',
      low: 'Faible',
    };
    return labels[severity] || severity;
  }

  getFindingStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      open: 'Ouvert',
      'in-progress': 'En cours',
      resolved: 'Résolu',
    };
    return labels[status] || status;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
