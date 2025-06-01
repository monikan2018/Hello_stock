import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>Create Account</h2>
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              formControlName="fullName"
              class="form-control"
              placeholder="Enter your full name"
            />
            <div *ngIf="registerForm.get('fullName')?.touched && registerForm.get('fullName')?.errors" class="error-message">
              <div *ngIf="registerForm.get('fullName')?.errors?.['required']">Full name is required</div>
              <div *ngIf="registerForm.get('fullName')?.errors?.['minlength']">Full name must be at least 3 characters</div>
            </div>
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              class="form-control"
              placeholder="Enter your email"
            />
            <div *ngIf="registerForm.get('email')?.touched && registerForm.get('email')?.errors" class="error-message">
              <div *ngIf="registerForm.get('email')?.errors?.['required']">Email is required</div>
              <div *ngIf="registerForm.get('email')?.errors?.['email']">Please enter a valid email</div>
            </div>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              formControlName="password"
              class="form-control"
              placeholder="Enter your password"
            />
            <div *ngIf="registerForm.get('password')?.touched && registerForm.get('password')?.errors" class="error-message">
              <div *ngIf="registerForm.get('password')?.errors?.['required']">Password is required</div>
              <div *ngIf="registerForm.get('password')?.errors?.['minlength']">Password must be at least 6 characters</div>
            </div>
          </div>
          <div *ngIf="error" class="error-message">
            {{ error }}
          </div>
          <button type="submit" class="submit-button" [disabled]="!registerForm.valid || isLoading">
            {{ isLoading ? 'Creating account...' : 'Create Account' }}
          </button>
        </form>
        <p class="auth-footer">
          Already have an account? 
          <a routerLink="/login">Sign in here</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 64px);
      padding: 2rem;
      background-color: #f8f9fa;
    }

    .auth-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;

      h2 {
        text-align: center;
        color: #2c3e50;
        margin-bottom: 2rem;
      }
    }

    .form-group {
      margin-bottom: 1.5rem;

      label {
        display: block;
        margin-bottom: 0.5rem;
        color: #4a5568;
        font-weight: 500;
      }

      input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        font-size: 1rem;
        transition: border-color 0.3s;

        &:focus {
          outline: none;
          border-color: #3498db;
        }

        &.ng-touched.ng-invalid {
          border-color: #e74c3c;
        }
      }
    }

    .error-message {
      color: #e74c3c;
      font-size: 0.875rem;
      margin-top: 0.5rem;
      margin-bottom: 1rem;
    }

    .submit-button {
      width: 100%;
      padding: 0.75rem;
      background-color: #3498db;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.3s;

      &:hover {
        background-color: #2980b9;
      }

      &:disabled {
        background-color: #a0aec0;
        cursor: not-allowed;
      }
    }

    .auth-footer {
      text-align: center;
      margin-top: 1.5rem;
      color: #4a5568;

      a {
        color: #3498db;
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
  registerForm: FormGroup;
  isLoading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.error = null;

      try {
        const { fullName, email, password } = this.registerForm.value;
        const { error } = await this.supabaseService.signUp(email, password, fullName);

        if (error) {
          console.error('Registration error:', error);
          this.error = error.message || 'An error occurred during registration';
        } else {
          // Successful registration
          this.router.navigate(['/login'], {
            queryParams: { message: 'Please check your email to confirm your account' }
          });
        }
      } catch (err: any) {
        console.error('Registration error:', err);
        this.error = err.message || 'An error occurred during registration';
      } finally {
        this.isLoading = false;
      }
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        control?.markAsTouched();
      });
    }
  }
} 