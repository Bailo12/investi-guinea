import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { KYCService, KYCData, KYCSubmission } from '../../../core/services/kyc.service';
import { EncryptionService } from '../../../core/services/encryption.service';

@Component({
  selector: 'app-kyc-verification',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="kyc-container">
      <header class="kyc-header">
        <div class="header-content">
          <div>
            <a routerLink="/dashboard" class="back-link">← Retour au tableau de bord</a>
            <h1>Vérification KYC/AML</h1>
            <p>Vérifiez votre identité pour accéder à toutes les fonctionnalités</p>
          </div>
        </div>
      </header>

      <main class="kyc-main">
        <!-- Status Display -->
        <div *ngIf="kycData" class="status-card" [class]="'status-' + kycData.status">
          <div class="status-header">
            <div class="status-icon">
              <svg *ngIf="kycData.status === 'approved'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <svg *ngIf="kycData.status === 'rejected'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <svg *ngIf="kycData.status === 'under-review'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <svg *ngIf="kycData.status === 'pending'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div class="status-info">
              <h2>{{ getStatusLabel(kycData.status) }}</h2>
              <p *ngIf="kycData.status === 'rejected' && kycData.rejectionReason">
                Raison: {{ kycData.rejectionReason }}
              </p>
              <p *ngIf="kycData.verifiedAt">
                Vérifié le: {{ formatDate(kycData.verifiedAt) }}
              </p>
            </div>
          </div>
        </div>

        <!-- KYC Form -->
        <div class="kyc-card" *ngIf="!kycData || kycData.status === 'pending' || kycData.status === 'rejected'">
          <h2>Informations personnelles</h2>
          <form [formGroup]="kycForm" (ngSubmit)="onSubmit()" class="kyc-form">
            <!-- Personal Information -->
            <div class="form-section">
              <h3>Informations d'identité</h3>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="dateOfBirth">Date de naissance *</label>
                  <input
                    id="dateOfBirth"
                    type="date"
                    formControlName="dateOfBirth"
                    [class.error]="kycForm.get('dateOfBirth')?.invalid && kycForm.get('dateOfBirth')?.touched"
                  />
                  <div class="error-message" *ngIf="kycForm.get('dateOfBirth')?.invalid && kycForm.get('dateOfBirth')?.touched">
                    Date de naissance requise
                  </div>
                </div>

                <div class="form-group">
                  <label for="nationality">Nationalité *</label>
                  <input
                    id="nationality"
                    type="text"
                    formControlName="nationality"
                    placeholder="Guinéenne"
                    [class.error]="kycForm.get('nationality')?.invalid && kycForm.get('nationality')?.touched"
                  />
                  <div class="error-message" *ngIf="kycForm.get('nationality')?.invalid && kycForm.get('nationality')?.touched">
                    Nationalité requise
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label for="address">Adresse complète *</label>
                <input
                  id="address"
                  type="text"
                  formControlName="address"
                  placeholder="Rue, quartier"
                  [class.error]="kycForm.get('address')?.invalid && kycForm.get('address')?.touched"
                />
                <div class="error-message" *ngIf="kycForm.get('address')?.invalid && kycForm.get('address')?.touched">
                  Adresse requise
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="city">Ville *</label>
                  <input
                    id="city"
                    type="text"
                    formControlName="city"
                    placeholder="Conakry"
                    [class.error]="kycForm.get('city')?.invalid && kycForm.get('city')?.touched"
                  />
                  <div class="error-message" *ngIf="kycForm.get('city')?.invalid && kycForm.get('city')?.touched">
                    Ville requise
                  </div>
                </div>

                <div class="form-group">
                  <label for="country">Pays *</label>
                  <input
                    id="country"
                    type="text"
                    formControlName="country"
                    placeholder="Guinée"
                    [class.error]="kycForm.get('country')?.invalid && kycForm.get('country')?.touched"
                  />
                  <div class="error-message" *ngIf="kycForm.get('country')?.invalid && kycForm.get('country')?.touched">
                    Pays requis
                  </div>
                </div>
              </div>
            </div>

            <!-- Identity Documents -->
            <div class="form-section">
              <h3>Documents d'identité</h3>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="idType">Type de pièce d'identité *</label>
                  <select
                    id="idType"
                    formControlName="idType"
                    [class.error]="kycForm.get('idType')?.invalid && kycForm.get('idType')?.touched"
                  >
                    <option value="">Sélectionner</option>
                    <option value="passport">Passeport</option>
                    <option value="national-id">Carte nationale d'identité</option>
                    <option value="drivers-license">Permis de conduire</option>
                  </select>
                  <div class="error-message" *ngIf="kycForm.get('idType')?.invalid && kycForm.get('idType')?.touched">
                    Type de pièce requis
                  </div>
                </div>

                <div class="form-group">
                  <label for="idNumber">Numéro de pièce d'identité *</label>
                  <input
                    id="idNumber"
                    type="text"
                    formControlName="idNumber"
                    placeholder="Numéro de la pièce"
                    [class.error]="kycForm.get('idNumber')?.invalid && kycForm.get('idNumber')?.touched"
                  />
                  <div class="error-message" *ngIf="kycForm.get('idNumber')?.invalid && kycForm.get('idNumber')?.touched">
                    Numéro requis
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label for="idDocumentFront">Recto de la pièce d'identité *</label>
                <input
                  id="idDocumentFront"
                  type="file"
                  accept="image/*,.pdf"
                  (change)="onFileSelected($event, 'idDocumentFront')"
                  [class.error]="!idDocumentFront && kycForm.get('idDocumentFront')?.touched"
                />
                <p class="help-text">Format: JPG, PNG ou PDF (max 5MB)</p>
                <button 
                  type="button" 
                  class="btn btn-outline" 
                  (click)="verifyIDDocument()" 
                  *ngIf="idDocumentFront && idDocumentBack"
                  [disabled]="isVerifying"
                  style="margin-top: 0.5rem;"
                >
                  <span *ngIf="!isVerifying">Vérifier automatiquement</span>
                  <span *ngIf="isVerifying">Vérification...</span>
                </button>
                <div class="verification-result" *ngIf="verificationResult">
                  <p class="verification-status" [class]="'status-' + (verificationResult.verified ? 'verified' : 'failed')">
                    {{ verificationResult.verified ? '✓ Vérifié' : '✗ Échec de la vérification' }}
                  </p>
                  <p class="verification-score">Score: {{ verificationResult.score }}/100</p>
                </div>
              </div>

              <div class="form-group">
                <label for="idDocumentBack">Verso de la pièce d'identité</label>
                <input
                  id="idDocumentBack"
                  type="file"
                  accept="image/*,.pdf"
                  (change)="onFileSelected($event, 'idDocumentBack')"
                />
                <p class="help-text">Format: JPG, PNG ou PDF (max 5MB)</p>
              </div>
            </div>

            <!-- Additional Documents -->
            <div class="form-section">
              <h3>Documents supplémentaires</h3>
              
              <div class="form-group">
                <label for="proofOfAddress">Justificatif de domicile</label>
                <input
                  id="proofOfAddress"
                  type="file"
                  accept="image/*,.pdf"
                  (change)="onFileSelected($event, 'proofOfAddress')"
                />
                <p class="help-text">Facture d'électricité, eau ou quittance de loyer (max 5MB)</p>
              </div>

              <div class="form-group">
                <label for="selfie">Photo selfie avec pièce d'identité</label>
                <input
                  id="selfie"
                  type="file"
                  accept="image/*"
                  (change)="onFileSelected($event, 'selfie')"
                />
                <p class="help-text">Photo de vous tenant votre pièce d'identité (max 5MB)</p>
              </div>
            </div>

            <!-- AML Information -->
            <div class="form-section">
              <h3>Informations AML (Anti-Blanchiment)</h3>
              
              <div class="form-group">
                <label for="occupation">Profession</label>
                <input
                  id="occupation"
                  type="text"
                  formControlName="occupation"
                  placeholder="Votre profession"
                />
              </div>

              <div class="form-group">
                <label for="sourceOfFunds">Source des fonds</label>
                <textarea
                  id="sourceOfFunds"
                  formControlName="sourceOfFunds"
                  rows="3"
                  placeholder="Décrivez la source de vos fonds (salaire, commerce, héritage, etc.)"
                ></textarea>
              </div>

              <div class="form-group">
                <label class="checkbox-label">
                  <input type="checkbox" formControlName="pepStatus" />
                  <span>Je suis une personne politiquement exposée (PEP)</span>
                </label>
              </div>
            </div>

            <div class="error-message" *ngIf="errorMessage">
              {{ errorMessage }}
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-outline" (click)="cancel()">Annuler</button>
              <button type="submit" class="btn btn-primary" [disabled]="kycForm.invalid || isLoading || !idDocumentFront">
                <span *ngIf="!isLoading">Soumettre la vérification</span>
                <span *ngIf="isLoading">Soumission...</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .kyc-container {
      min-height: 100vh;
      background: var(--background);
    }

    .kyc-header {
      background: white;
      border-bottom: 1px solid var(--border-color);
      padding: 1.5rem 2rem;

      .header-content {
        max-width: 1000px;
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
          margin-bottom: 0.5rem;
        }

        p {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }
      }
    }

    .kyc-main {
      max-width: 1000px;
      margin: 0 auto;
      padding: 2rem;
    }

    .status-card {
      border-radius: 0.75rem;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border-color);

      &.status-approved {
        background: #dcfce7;
        border-color: #166534;
      }

      &.status-rejected {
        background: #fee2e2;
        border-color: #991b1b;
      }

      &.status-under-review, &.status-pending {
        background: #fef3c7;
        border-color: #92400e;
      }
    }

    .status-header {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .status-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .status-info {
      h2 {
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
      }

      p {
        color: var(--text-secondary);
        font-size: 0.875rem;
      }
    }

    .kyc-card {
      background: white;
      border-radius: 0.75rem;
      padding: 2rem;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border-color);
    }

    .form-section {
      margin-bottom: 2rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid var(--border-color);

      &:last-child {
        border-bottom: none;
      }

      h3 {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 1.5rem;
      }
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;

      input[type="checkbox"] {
        width: 18px;
        height: 18px;
        cursor: pointer;
      }
    }

    .help-text {
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin-top: 0.5rem;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
    }

    .verification-result {
      margin-top: 1rem;
      padding: 1rem;
      background: var(--background);
      border-radius: 0.5rem;
      border: 1px solid var(--border-color);
    }

    .verification-status {
      font-weight: 600;
      margin-bottom: 0.5rem;

      &.status-verified {
        color: var(--success-color);
      }

      &.status-failed {
        color: var(--danger-color);
      }
    }

    .verification-score {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    @media (max-width: 768px) {
      .kyc-header {
        padding: 1rem;
      }

      .kyc-main {
        padding: 1rem;
      }

      .kyc-card {
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
export class KYCVerificationComponent implements OnInit {
  private fb = inject(FormBuilder);
  private kycService = inject(KYCService);
  private encryptionService = inject(EncryptionService);
  private router = inject(Router);

  kycForm: FormGroup;
  kycData: KYCData | null = null;
  idDocumentFront: File | null = null;
  idDocumentBack: File | null = null;
  proofOfAddress: File | null = null;
  selfie: File | null = null;
  isLoading = false;
  isVerifying = false;
  errorMessage = '';
  verificationResult: { verified: boolean; score: number; details: any } | null = null;

  constructor() {
    this.kycForm = this.fb.group({
      dateOfBirth: ['', [Validators.required]],
      nationality: ['', [Validators.required]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      country: ['Guinée', [Validators.required]],
      postalCode: [''],
      idType: ['', [Validators.required]],
      idNumber: ['', [Validators.required]],
      occupation: [''],
      sourceOfFunds: [''],
      pepStatus: [false]
    });
  }

  ngOnInit(): void {
    this.loadKYCStatus();
  }

  loadKYCStatus(): void {
    this.kycService.getKYCStatus().subscribe({
      next: (data) => {
        this.kycData = data;
        if (data && (data.status === 'pending' || data.status === 'rejected')) {
          this.kycForm.patchValue({
            dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
            nationality: data.nationality || '',
            address: data.address || '',
            city: data.city || '',
            country: data.country || 'Guinée',
            postalCode: data.postalCode || '',
            idType: data.idType || '',
            idNumber: data.idNumber || '',
            occupation: data.occupation || '',
            sourceOfFunds: data.sourceOfFunds || '',
            pepStatus: data.pepStatus || false
          });
        }
      },
      error: () => {
        // Handle error - user might not have submitted KYC yet
      }
    });
  }

  onFileSelected(event: Event, field: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'Le fichier est trop volumineux (max 5MB)';
        return;
      }
      
      switch (field) {
        case 'idDocumentFront':
          this.idDocumentFront = file;
          break;
        case 'idDocumentBack':
          this.idDocumentBack = file;
          break;
        case 'proofOfAddress':
          this.proofOfAddress = file;
          break;
        case 'selfie':
          this.selfie = file;
          break;
      }
    }
  }

  verifyIDDocument(): void {
    if (!this.idDocumentFront) return;

    this.isVerifying = true;
    this.verificationResult = null;

    this.kycService.verifyIDDocument({
      documentFront: this.idDocumentFront,
      documentBack: this.idDocumentBack || undefined,
      selfie: this.selfie || undefined
    }).subscribe({
      next: (result) => {
        this.verificationResult = result;
        this.isVerifying = false;
      },
      error: () => {
        this.isVerifying = false;
        this.verificationResult = {
          verified: false,
          score: 0,
          details: {}
        };
      }
    });
  }

  onSubmit(): void {
    if (this.kycForm.invalid || !this.idDocumentFront) return;

    this.isLoading = true;
    this.errorMessage = '';

    const formValue = this.kycForm.value;
    
    // Encrypt sensitive data before submission
    const userKey = this.encryptionService.generateSecureToken();
    const encryptedIdNumber = this.encryptionService.encrypt(formValue.idNumber, userKey);

    const submission: KYCSubmission = {
      ...formValue,
      idNumber: encryptedIdNumber.data, // Store encrypted
      idDocumentFront: this.idDocumentFront,
      idDocumentBack: this.idDocumentBack || undefined,
      proofOfAddress: this.proofOfAddress || undefined,
      selfie: this.selfie || undefined
    };

    this.kycService.submitKYC(submission).subscribe({
      next: (data) => {
        this.kycData = data;
        this.isLoading = false;
        // Run AML checks after KYC submission
        this.runAMLChecks();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Erreur lors de la soumission. Veuillez réessayer.';
        this.isLoading = false;
      }
    });
  }

  runAMLChecks(): void {
    if (this.kycData?.userId) {
      this.kycService.runAMLChecks(this.kycData.userId).subscribe({
        next: (amlResult) => {
          console.log('AML checks completed', amlResult);
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/dashboard']);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'En attente de soumission',
      'under-review': 'En cours de vérification',
      'approved': 'Vérification approuvée',
      'rejected': 'Vérification rejetée'
    };
    return labels[status] || status;
  }
}

