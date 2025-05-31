import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
  features = [
    {
      title: 'Real-time Tracking',
      description: 'Monitor your stocks in real-time with live updates and notifications',
      icon: 'trending_up'
    },
    {
      title: 'Portfolio Management',
      description: 'Easily manage and organize your stock portfolio in one place',
      icon: 'account_balance'
    },
    {
      title: 'Advanced Analytics',
      description: 'Get detailed insights and analytics about your investments',
      icon: 'analytics'
    }
  ];
} 