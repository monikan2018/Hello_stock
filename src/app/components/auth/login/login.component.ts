import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>Sign In</h2>
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              class="form-control"
              placeholder="Enter your email"
            />
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
          </div>
          <div *ngIf="error" class="error-message">
            {{ error }}
          </div>
          <button type="submit" class="submit-button" [disabled]="!loginForm.valid || isLoading">
            {{ isLoading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
        <p class="auth-footer">
          Don't have an account? 
          <a routerLink="/register">Sign up here</a>
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
      }
    }

    .error-message {
      color: #e74c3c;
      margin-bottom: 1rem;
      text-align: center;
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
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const { email, password } = this.loginForm.value;
        const { error } = await this.supabaseService.signIn(email, password);
        
        if (error) {
          this.error = error.message;
        } else {
          // Successful login
          this.router.navigate(['/portfolio']);
        }
      } catch (err: any) {
        this.error = err.message || 'An error occurred during sign in';
      } finally {
        this.isLoading = false;
      }
    }
  }
} 