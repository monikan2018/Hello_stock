import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-test-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="auth-test-container">
      <div class="status-section">
        <h3>Auth Status</h3>
        <p>Is Authenticated: {{ authService.isAuthenticated() }}</p>
        <p>Current User: {{ currentUser | json }}</p>
      </div>

      <div class="test-section">
        <h3>Test Registration</h3>
        <form [formGroup]="registerForm" (ngSubmit)="onRegister()">
          <input formControlName="firstName" placeholder="First Name">
          <input formControlName="lastName" placeholder="Last Name">
          <input formControlName="email" placeholder="Email">
          <input type="password" formControlName="password" placeholder="Password">
          <button type="submit" [disabled]="registerForm.invalid">Register</button>
        </form>
        <p *ngIf="registerError" class="error">{{ registerError }}</p>

        <h3>Test Login</h3>
        <form [formGroup]="loginForm" (ngSubmit)="onLogin()">
          <input formControlName="email" placeholder="Email">
          <input type="password" formControlName="password" placeholder="Password">
          <button type="submit" [disabled]="loginForm.invalid">Login</button>
        </form>
        <p *ngIf="loginError" class="error">{{ loginError }}</p>

        <button (click)="onLogout()">Logout</button>
      </div>
    </div>
  `,
  styles: [`
    .auth-test-container {
      padding: 20px;
      max-width: 500px;
      margin: 0 auto;
    }
    .status-section {
      margin-bottom: 20px;
      padding: 10px;
      background: #f5f5f5;
    }
    .test-section form {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 20px;
    }
    .error {
      color: red;
    }
    button {
      padding: 8px;
      cursor: pointer;
    }
    input {
      padding: 8px;
    }
  `]
})
export class TestAuthComponent implements OnInit {
  registerForm: FormGroup;
  loginForm: FormGroup;
  registerError: string = '';
  loginError: string = '';
  currentUser: any = null;

  constructor(
    public authService: AuthService,
    private fb: FormBuilder
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.authService.currentUser.subscribe(
      user => this.currentUser = user
    );
  }

  onRegister() {
    if (this.registerForm.valid) {
      this.registerError = '';
      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          console.log('Registration successful', response);
        },
        error: (error) => {
          console.error('Registration failed', error);
          this.registerError = error.message || 'Registration failed';
        }
      });
    }
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.loginError = '';
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).subscribe({
        next: (response) => {
          console.log('Login successful', response);
        },
        error: (error) => {
          console.error('Login failed', error);
          this.loginError = error.message || 'Login failed';
        }
      });
    }
  }

  onLogout() {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Logout successful');
      },
      error: (error) => {
        console.error('Logout failed', error);
      }
    });
  }
} 