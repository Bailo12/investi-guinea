import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { InvestmentService, CreateInvestmentDto } from '../../../core/services/investment.service';

@Component({
  selector: 'app-investment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="form-container">
      <header class="form-header">
        <div class="header-content">
          <h1>{{ isEditMode ? 'Modifier l\'investissement' : 'Nouvel investissement' }}</h1>
          <a routerLink="/investments" class="btn btn-outline">Retour</a>
        </div>
      </header>

      <main class="form-main">
        <div class="form-card">
          <form [formGroup]="investmentForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label for="type">Type d'investissement</label>
              <select id="type" formControlName="type" [class.error]="investmentForm.get('type')?.invalid && investmentForm.get('type')?.touched">
                <option value="">Sélectionner un type</option>
                <option value="stocks">Actions</option>
                <option value="bonds">Obligations</option>
                <option value="real-estate">Immobilier</option>
                <option value="crypto">Cryptomonnaie</option>
                <option value="mutual-funds">Fonds mutuels</option>
                <option value="other">Autre</option>
              </select>
              <div class="error-message" *ngIf="investmentForm.get('type')?.invalid && investmentForm.get('type')?.touched">
                Type d'investissement requis
              </div>
            </div>

            <div class="form-group">
              <label for="name">Nom de l'investissement</label>
              <input
                id="name"
                type="text"
                formControlName="name"
                placeholder="Ex: Actions Orange Guinée"
                [class.error]="investmentForm.get('name')?.invalid && investmentForm.get('name')?.touched"
              />
              <div class="error-message" *ngIf="investmentForm.get('name')?.invalid && investmentForm.get('name')?.touched">
                Nom requis
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="amount">Montant investi</label>
                <input
                  id="amount"
                  type="number"
                  formControlName="amount"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  [class.error]="investmentForm.get('amount')?.invalid && investmentForm.get('amount')?.touched"
                />
                <div class="error-message" *ngIf="investmentForm.get('amount')?.invalid && investmentForm.get('amount')?.touched">
                  Montant invalide
                </div>
              </div>

              <div class="form-group">
                <label for="currency">Devise</label>
                <select id="currency" formControlName="currency" [class.error]="investmentForm.get('currency')?.invalid && investmentForm.get('currency')?.touched">
                  <option value="GNF">GNF (Franc guinéen)</option>
                  <option value="USD">USD (Dollar américain)</option>
                  <option value="EUR">EUR (Euro)</option>
                </select>
                <div class="error-message" *ngIf="investmentForm.get('currency')?.invalid && investmentForm.get('currency')?.touched">
                  Devise requise
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="purchaseDate">Date d'achat</label>
              <input
                id="purchaseDate"
                type="date"
                formControlName="purchaseDate"
                [class.error]="investmentForm.get('purchaseDate')?.invalid && investmentForm.get('purchaseDate')?.touched"
              />
              <div class="error-message" *ngIf="investmentForm.get('purchaseDate')?.invalid && investmentForm.get('purchaseDate')?.touched">
                Date d'achat requise
              </div>
            </div>

            <div class="form-group">
              <label for="description">Description (optionnel)</label>
              <textarea
                id="description"
                formControlName="description"
                rows="4"
                placeholder="Notes supplémentaires sur cet investissement..."
              ></textarea>
            </div>

            <div class="error-message" *ngIf="errorMessage">
              {{ errorMessage }}
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-outline" (click)="cancel()">Annuler</button>
              <button type="submit" class="btn btn-primary" [disabled]="investmentForm.invalid || isLoading">
                <span *ngIf="!isLoading">{{ isEditMode ? 'Enregistrer' : 'Créer' }}</span>
                <span *ngIf="isLoading">Enregistrement...</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .form-container {
      min-height: 100vh;
      background: var(--background);
    }

    .form-header {
      background: white;
      border-bottom: 1px solid var(--border-color);
      padding: 1.5rem 2rem;

      .header-content {
        max-width: 800px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;

        h1 {
          font-size: 1.875rem;
          font-weight: 700;
          color: var(--text-primary);
        }
      }
    }

    .form-main {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    .form-card {
      background: white;
      border-radius: 0.75rem;
      padding: 2rem;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border-color);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
    }

    @media (max-width: 768px) {
      .form-header {
        padding: 1rem;

        .header-content {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
        }
      }

      .form-main {
        padding: 1rem;
      }

      .form-card {
        padding: 1.5rem;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column-reverse;

        .btn {
          width: 100%;
        }
      }
    }
  `]
})
export class InvestmentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private investmentService = inject(InvestmentService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  investmentForm: FormGroup;
  isEditMode = false;
  investmentId: string | null = null;
  isLoading = false;
  errorMessage = '';

  constructor() {
    this.investmentForm = this.fb.group({
      type: ['', [Validators.required]],
      name: ['', [Validators.required]],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      currency: ['GNF', [Validators.required]],
      purchaseDate: ['', [Validators.required]],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.investmentId = params['id'];
        this.isEditMode = this.route.snapshot.url[this.route.snapshot.url.length - 1].path === 'edit';
        
        if (this.isEditMode) {
          this.loadInvestment();
        }
      }
    });
  }

  loadInvestment(): void {
    if (!this.investmentId) return;

    this.investmentService.getInvestment(this.investmentId).subscribe({
      next: (investment) => {
        this.investmentForm.patchValue({
          type: investment.type,
          name: investment.name,
          amount: investment.amount,
          currency: investment.currency,
          purchaseDate: investment.purchaseDate.split('T')[0],
          description: investment.description || ''
        });
      },
      error: () => {
        this.errorMessage = 'Erreur lors du chargement de l\'investissement';
      }
    });
  }

  onSubmit(): void {
    if (this.investmentForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const formData: CreateInvestmentDto = this.investmentForm.value;

    if (this.isEditMode && this.investmentId) {
      this.investmentService.updateInvestment(this.investmentId, formData).subscribe({
        next: () => {
          this.router.navigate(['/investments']);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Erreur lors de la mise à jour';
          this.isLoading = false;
        }
      });
    } else {
      this.investmentService.createInvestment(formData).subscribe({
        next: () => {
          this.router.navigate(['/investments']);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Erreur lors de la création';
          this.isLoading = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/investments']);
  }
}

