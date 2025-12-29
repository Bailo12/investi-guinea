import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  
  if (!password || !confirmPassword) return null;
  
  return password.value === confirmPassword.value ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1>Créer un compte</h1>
          <p>Rejoignez Neo Tech Investment</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label for="firstName">Prénom</label>
            <input
              id="firstName"
              type="text"
              formControlName="firstName"
              placeholder="Votre prénom"
              [class.error]="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched"
            />
            <div class="error-message" *ngIf="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched">
              Prénom requis
            </div>
          </div>

          <div class="form-group">
            <label for="lastName">Nom</label>
            <input
              id="lastName"
              type="text"
              formControlName="lastName"
              placeholder="Votre nom"
              [class.error]="registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched"
            />
            <div class="error-message" *ngIf="registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched">
              Nom requis
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="votre@email.com"
              [class.error]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
            />
            <div class="error-message" *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
              Email invalide
            </div>
          </div>

          <div class="form-group">
            <label for="phone">Téléphone (optionnel)</label>
            <input
              id="phone"
              type="tel"
              formControlName="phone"
              placeholder="+224 XXX XXX XXX"
            />
          </div>

          <div class="form-group">
            <label for="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="••••••••"
              [class.error]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
            />
            <div class="error-message" *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
              Le mot de passe doit contenir au moins 6 caractères
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirmer le mot de passe</label>
            <input
              id="confirmPassword"
              type="password"
              formControlName="confirmPassword"
              placeholder="••••••••"
              [class.error]="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched"
            />
            <div class="error-message" *ngIf="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched">
              Les mots de passe ne correspondent pas
            </div>
          </div>

          <div class="error-message" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <button type="submit" class="btn btn-primary" [disabled]="registerForm.invalid || isLoading">
            <span *ngIf="!isLoading">Créer un compte</span>
            <span *ngIf="isLoading">Création...</span>
          </button>
        </form>

        <div class="auth-footer">
          <p>Déjà un compte ? <a routerLink="/auth/login">Se connecter</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .auth-card {
      background: white;
      border-radius: 1rem;
      padding: 2.5rem;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;

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

    .auth-form {
      .btn {
        width: 100%;
        margin-top: 0.5rem;
      }
    }

    .auth-footer {
      margin-top: 1.5rem;
      text-align: center;
      font-size: 0.875rem;
      color: var(--text-secondary);

      a {
        color: var(--primary-color);
        text-decoration: none;
        font-weight: 500;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor() {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: passwordMatchValidator });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { confirmPassword, ...registerData } = this.registerForm.value;

    this.authService.register(registerData).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Erreur lors de la création du compte. Veuillez réessayer.';
        this.isLoading = false;
      }
    });
  }
}


