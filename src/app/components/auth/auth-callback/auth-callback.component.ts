import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  template: `
    <div class="callback-container">
      <p>Processing authentication...</p>
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      font-size: 1.2rem;
      color: #4a5568;
    }
  `]
})
export class AuthCallbackComponent implements OnInit {
  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  async ngOnInit() {
    try {
      const { data: { session }, error } = await this.supabaseService.getSession();
      if (error) throw error;

      if (session) {
        await this.router.navigate(['/portfolio']);
      } else {
        await this.router.navigate(['/login']);
      }
    } catch (error) {
      console.error('Error in auth callback:', error);
      await this.router.navigate(['/login']);
    }
  }
} 