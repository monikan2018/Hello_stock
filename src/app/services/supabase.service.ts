import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User, AuthResponse, AuthError, AuthApiError, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private _currentUser = new BehaviorSubject<User | null>(null);
  currentUser$ = this._currentUser.asObservable();
  private readonly LOCK_RETRY_ATTEMPTS = 3;
  private readonly LOCK_RETRY_DELAY = 1000; // 1 second

  constructor() {
    console.log('Initializing Supabase with URL:', environment.supabase.supabaseUrl);
    this.supabase = createClient(
      environment.supabase.supabaseUrl,
      environment.supabase.supabaseAnonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
          flowType: 'pkce'
        },
        global: {
          headers: {
            'X-Client-Info': 'stock-tracker@1.0.0'
          }
        }
      }
    );
    this.initializeSupabase();
  }

  private async initializeSupabase() {
    // Clear any existing locks before initialization
    await this.clearAuthLocks();
    
    // Log the configuration for debugging
    console.log('Supabase Configuration:', {
      url: environment.supabase.supabaseUrl,
      keyValid: !!environment.supabase.supabaseAnonKey,
      keyLength: environment.supabase.supabaseAnonKey.length
    });

    // Set up auth state change listener
    this.supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      if (event === 'SIGNED_OUT') {
        await this.clearAuthLocks();
      }
      this._currentUser.next(session?.user ?? null);
    });

    // Try to recover existing session
    this.supabase.auth.getSession().then(({ data: { session } }) => {
      this._currentUser.next(session?.user ?? null);
    });
  }

  private async clearAuthLocks() {
    try {
      // Clear any existing auth locks
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith('lock:sb-') && key.endsWith('-auth-token')) {
          localStorage.removeItem(key);
          // Add a small delay between lock removals
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      // Add a small delay after clearing all locks
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error clearing auth locks:', error);
    }
  }

  private async retryOperation<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt < this.LOCK_RETRY_ATTEMPTS; attempt++) {
      try {
        if (attempt > 0) {
          // Clear locks and wait before retrying
          await this.clearAuthLocks();
          await new Promise(resolve => setTimeout(resolve, this.LOCK_RETRY_DELAY));
        }
        return await operation();
      } catch (error: any) {
        lastError = error;
        console.warn(`Attempt ${attempt + 1} failed:`, error);
        
        // If it's not a lock error, throw immediately
        if (!error.message?.includes('lock')) {
          throw error;
        }
      }
    }
    
    throw lastError;
  }

  private handleError(error: unknown): AuthError {
    console.error('Supabase error details:', {
      error,
      isAuthError: error instanceof AuthError,
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    if (error instanceof AuthError) {
      return error;
    }
    return new AuthApiError('Unknown error occurred', 500, 'UNEXPECTED_ERROR');
  }

  async getSession(): Promise<{ data: { session: Session | null }, error: AuthError | null }> {
    try {
      const result = await this.retryOperation(async () => {
        const { data, error } = await this.supabase.auth.getSession();
        if (error) throw error;
        return { data, error: null };
      });
      console.log('Session data:', result.data);
      return result;
    } catch (error) {
      console.error('Get session error:', error);
      return { data: { session: null }, error: this.handleError(error) };
    }
  }

  async signUp(email: string, password: string, fullName: string): Promise<AuthResponse> {
    try {
      console.log('Attempting signup with:', { email, fullName });
      const result = await this.retryOperation(async () => {
        const names = fullName.trim().split(' ');
        const firstName = names[0];
        const lastName = names.length > 1 ? names.slice(1).join(' ') : '';
        
        const { data, error } = await this.supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              firstName,
              lastName
            },
            emailRedirectTo: window.location.origin + '/auth/callback'
          }
        });
        if (error) throw error;
        return { data, error: null };
      });
      console.log('Signup response:', result.data);
      return result;
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: { user: null, session: null }, error: this.handleError(error) };
    }
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log('Attempting signin with email:', email);
      const result = await this.retryOperation(async () => {
        const { data, error } = await this.supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        return { data, error: null };
      });
      console.log('Signin response:', result.data);
      return result;
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: { user: null, session: null }, error: this.handleError(error) };
    }
  }

  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      await this.clearAuthLocks();
      const result = await this.retryOperation(async () => {
        const { error } = await this.supabase.auth.signOut();
        if (error) throw error;
        return { error: null };
      });
      return result;
    } catch (error) {
      console.error('Sign out error:', error);
      return { error: this.handleError(error) };
    }
  }

  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  async getPortfolio() {
    const { data, error } = await this.supabase
      .from('stocks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async addStock(symbol: string, shares: number, purchasePrice: number) {
    const { data, error } = await this.supabase
      .from('stocks')
      .insert([
        {
          symbol: symbol.toUpperCase(),
          shares,
          purchase_price: purchasePrice
        }
      ])
      .select();
    
    if (error) throw error;
    return data;
  }
} 