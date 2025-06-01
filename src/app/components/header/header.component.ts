import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { User } from '@supabase/supabase-js';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="header">
      <nav class="nav-container">
        <div class="nav-left">
          <a routerLink="/" class="nav-brand">StockTracker</a>
          <a routerLink="/portfolio" routerLinkActive="active" class="nav-link">Portfolio</a>
          <a routerLink="/stocks" routerLinkActive="active" class="nav-link">Stocks</a>
        </div>
        <div class="nav-right">
          @if (currentUser) {
            <div class="user-menu">
              <span class="user-email">{{ currentUser.email }}</span>
              <button class="sign-out-button" (click)="signOut()">Sign Out</button>
            </div>
          } @else {
            <div class="auth-buttons">
              <a routerLink="/login" class="auth-button login">Sign In</a>
              <a routerLink="/register" class="auth-button register">Sign Up</a>
            </div>
          }
        </div>
      </nav>
    </header>
  `,
  styles: [`
    .header {
      background-color: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 1rem 2rem;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
    }

    .nav-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1200px;
      margin: 0 auto;
    }

    .nav-left {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .nav-brand {
      font-size: 1.5rem;
      font-weight: 700;
      color: #2c3e50;
      text-decoration: none;
    }

    .nav-link {
      color: #4a5568;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.3s;

      &:hover {
        color: #3498db;
      }

      &.active {
        color: #3498db;
      }
    }

    .nav-right {
      display: flex;
      align-items: center;
    }

    .auth-buttons {
      display: flex;
      gap: 1rem;
    }

    .auth-button {
      padding: 0.5rem 1rem;
      border-radius: 4px;
      font-weight: 500;
      text-decoration: none;
      transition: all 0.3s;

      &.login {
        color: #3498db;
        border: 1px solid #3498db;

        &:hover {
          background-color: #3498db;
          color: white;
        }
      }

      &.register {
        background-color: #3498db;
        color: white;

        &:hover {
          background-color: #2980b9;
        }
      }
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-email {
      color: #4a5568;
      font-weight: 500;
    }

    .sign-out-button {
      padding: 0.5rem 1rem;
      border: 1px solid #e74c3c;
      border-radius: 4px;
      background: none;
      color: #e74c3c;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background-color: #e74c3c;
        color: white;
      }
    }
  `]
})
export class HeaderComponent implements OnInit {
  currentUser: User | null = null;

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit() {
    this.supabaseService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  async signOut() {
    try {
      await this.supabaseService.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }
} 