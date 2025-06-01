import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="landing-container">
      <div class="hero-section">
        <h1>Welcome to Stock Tracker</h1>
        <p>Track your investments and monitor stock performance in real-time</p>
        <div class="cta-buttons">
          <a routerLink="/portfolio" class="cta-button primary">View Portfolio</a>
          <a routerLink="/stocks" class="cta-button secondary">Browse Stocks</a>
        </div>
      </div>
      <div class="features-section">
        <div class="feature-card">
          <h3>Real-time Tracking</h3>
          <p>Monitor your stocks with live market data updates</p>
        </div>
        <div class="feature-card">
          <h3>Portfolio Management</h3>
          <p>Manage and organize your investment portfolio efficiently</p>
        </div>
        <div class="feature-card">
          <h3>Market Analysis</h3>
          <p>Get detailed market analysis and stock performance metrics</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .landing-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .hero-section {
      text-align: center;
      margin-bottom: 4rem;

      h1 {
        font-size: 2.5rem;
        color: #2c3e50;
        margin-bottom: 1rem;
      }

      p {
        font-size: 1.2rem;
        color: #666;
        margin-bottom: 2rem;
      }
    }

    .cta-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    .cta-button {
      padding: 0.8rem 1.5rem;
      border-radius: 4px;
      text-decoration: none;
      font-weight: 600;
      transition: transform 0.2s;

      &:hover {
        transform: translateY(-2px);
      }

      &.primary {
        background-color: #2c3e50;
        color: white;
      }

      &.secondary {
        background-color: #ecf0f1;
        color: #2c3e50;
      }
    }

    .features-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      margin-top: 4rem;
    }

    .feature-card {
      background-color: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;

      h3 {
        color: #2c3e50;
        margin-bottom: 1rem;
      }

      p {
        color: #666;
        line-height: 1.5;
      }
    }
  `]
})
export class LandingComponent {} 