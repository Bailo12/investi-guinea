import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  PremiumService,
  PremiumProject,
} from '../../../core/services/premium.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-premium-projects',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="projects-container">
      <header class="projects-header">
        <div class="header-content">
          <div>
            <a routerLink="/premium" class="back-link">← Retour</a>
            <h1>Projets Premium Exclusifs</h1>
            <p>Immobilier de luxe et investissements en or</p>
          </div>
          <a
            routerLink="/premium/plans"
            class="btn btn-primary"
            *ngIf="!isPremium"
          >
            Passer à Premium
          </a>
        </div>
      </header>

      <main class="projects-main">
        <!-- Premium Access Warning -->
        <div class="premium-warning" *ngIf="!isPremium">
          <div class="warning-icon">
            <svg
              width="48"
              height="48"
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
          <h2>Accès Premium requis</h2>
          <p>
            Ces projets exclusifs sont réservés aux membres Premium.
            Abonnez-vous pour y accéder.
          </p>
          <a routerLink="/premium/plans" class="btn btn-primary"
            >Voir les plans Premium</a
          >
        </div>

        <!-- Category Filter -->
        <div class="filters-section" *ngIf="isPremium">
          <select
            [(ngModel)]="selectedCategory"
            (change)="loadProjects()"
            class="filter-select"
          >
            <option value="">Toutes les catégories</option>
            <option value="luxury-real-estate">Immobilier de luxe</option>
            <option value="commercial-real-estate">
              Immobilier commercial
            </option>
            <option value="gold-bullion">Or physique</option>
            <option value="gold-mining">Mines d'or</option>
            <option value="premium-fund">Fonds premium</option>
          </select>
        </div>

        <!-- Projects Grid -->
        <div *ngIf="isLoading" class="loading-state">
          <p>Chargement des projets...</p>
        </div>

        <div
          *ngIf="!isLoading && isPremium && projects.length === 0"
          class="empty-state"
        >
          <p>Aucun projet premium disponible</p>
        </div>

        <div
          *ngIf="!isLoading && isPremium && projects?.length > 0"
          class="projects-grid"
        >
          <div
            class="project-card"
            *ngFor="let project of projects"
            [routerLink]="['/premium/projects', project?.id]"
          >
            <div class="project-badge premium">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
              </svg>
              Premium
            </div>

            <div class="project-image" *ngIf="project?.imageUrl">
              <img [src]="project?.imageUrl" [alt]="project?.name" />
            </div>
            <div class="project-image-placeholder" *ngIf="!project?.imageUrl">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              </svg>
            </div>

            <div class="project-content">
              <div class="project-header">
                <h3>{{ project.name }}</h3>
                <span class="project-category">{{
                  getCategoryLabel(project.category)
                }}</span>
              </div>

              <p class="project-description">{{ project.description }}</p>

              <div class="project-details">
                <div class="detail-item">
                  <span>Investissement min:</span>
                  <span class="value">{{
                    formatCurrency(project.minInvestment, 'GNF')
                  }}</span>
                </div>
                <div class="detail-item" *ngIf="project.maxInvestment">
                  <span>Investissement max:</span>
                  <span class="value">{{
                    formatCurrency(project.maxInvestment, 'GNF')
                  }}</span>
                </div>
                <div class="detail-item">
                  <span>Rendement attendu:</span>
                  <span class="value highlight"
                    >{{ project.expectedReturn }}%</span
                  >
                </div>
                <div class="detail-item" *ngIf="project.location">
                  <span>Localisation:</span>
                  <span class="value">{{ project.location }}</span>
                </div>
                <div class="detail-item">
                  <span>Risque:</span>
                  <span
                    class="risk-badge"
                    [class]="'risk-' + project.riskLevel"
                  >
                    {{ getRiskLabel(project.riskLevel) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [
    `
      .projects-container {
        min-height: 100vh;
        background: var(--background);
      }

      .projects-header {
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
        color: white;
        padding: 2rem;

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;

          .back-link {
            color: white;
            text-decoration: none;
            font-size: 0.875rem;
            margin-bottom: 0.5rem;
            display: inline-block;
            opacity: 0.9;

            &:hover {
              text-decoration: underline;
            }
          }

          h1 {
            font-size: 1.875rem;
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

      .projects-main {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }

      .premium-warning {
        background: white;
        border-radius: 0.75rem;
        padding: 3rem;
        text-align: center;
        box-shadow: var(--shadow-md);
        border: 1px solid var(--border-color);
        margin-bottom: 2rem;
      }

      .warning-icon {
        width: 80px;
        height: 80px;
        margin: 0 auto 1.5rem;
        color: #f59e0b;
      }

      .premium-warning h2 {
        font-size: 1.875rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 1rem;
      }

      .premium-warning p {
        color: var(--text-secondary);
        margin-bottom: 2rem;
      }

      .filters-section {
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

      .projects-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 1.5rem;
      }

      .project-card {
        background: white;
        border-radius: 0.75rem;
        overflow: hidden;
        box-shadow: var(--shadow-md);
        border: 1px solid var(--border-color);
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
        position: relative;
        display: flex;
        flex-direction: column;

        &:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }
      }

      .project-badge {
        position: absolute;
        top: 1rem;
        right: 1rem;
        z-index: 10;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        font-size: 0.75rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.5rem;

        &.premium {
          background: #f59e0b;
          color: white;
        }
      }

      .project-image {
        width: 100%;
        height: 200px;
        overflow: hidden;
        background: var(--background);

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .project-image-placeholder {
        width: 100%;
        height: 200px;
        background: var(--background);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-secondary);
      }

      .project-content {
        padding: 1.5rem;
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .project-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1rem;
      }

      .project-header h3 {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-primary);
        flex: 1;
      }

      .project-category {
        padding: 0.375rem 0.75rem;
        background: var(--background);
        border-radius: 0.375rem;
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--text-secondary);
      }

      .project-description {
        font-size: 0.875rem;
        color: var(--text-secondary);
        margin-bottom: 1rem;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .project-details {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-top: auto;
      }

      .detail-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.875rem;
      }

      .detail-item .value {
        font-weight: 600;
        color: var(--text-primary);

        &.highlight {
          color: var(--primary-color);
          font-size: 1rem;
        }
      }

      .risk-badge {
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.75rem;
        font-weight: 500;

        &.risk-low {
          background: #dcfce7;
          color: #166534;
        }

        &.risk-medium {
          background: #fef3c7;
          color: #92400e;
        }

        &.risk-high {
          background: #fee2e2;
          color: #991b1b;
        }
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
        .projects-header {
          padding: 1rem;

          .header-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
        }

        .projects-main {
          padding: 1rem;
        }

        .projects-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class PremiumProjectsComponent implements OnInit {
  private premiumService = inject(PremiumService);
  private authService = inject(AuthService);

  projects: PremiumProject[] = [];
  selectedCategory = '';
  isPremium = false;
  isLoading = true;

  ngOnInit(): void {
    this.checkPremiumStatus();
    this.loadProjects();
  }

  checkPremiumStatus(): void {
    this.premiumService.isPremiumUser().subscribe({
      next: (isPremium) => {
        this.isPremium = isPremium;
      },
    });
  }

  loadProjects(): void {
    this.isLoading = true;
    const category = this.selectedCategory || undefined;

    this.premiumService.getPremiumProjects(category).subscribe({
      next: (projects) => {
        this.projects = projects;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.projects = [];
      },
    });
  }

  formatCurrency(value: number, currency: string): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(value);
  }

  getCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      'luxury-real-estate': 'Immobilier de luxe',
      'commercial-real-estate': 'Immobilier commercial',
      'gold-bullion': 'Or physique',
      'gold-mining': "Mines d'or",
      'premium-fund': 'Fonds premium',
    };
    return labels[category] || category;
  }

  getRiskLabel(risk: string): string {
    const labels: { [key: string]: string } = {
      low: 'Faible',
      medium: 'Moyen',
      high: 'Élevé',
    };
    return labels[risk] || risk;
  }
}
