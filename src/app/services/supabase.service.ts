import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User, AuthResponse, AuthError, AuthApiError, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private readonly LOCK_RETRY_ATTEMPTS = 3;
  private readonly LOCK_RETRY_DELAY = 1000; // 1 second

  constructor() {
    console.log('Initializing Supabase with URL:', environment.supabase.supabaseUrl);
    this.initializeSupabase();
  }

  private async initializeSupabase() {
    // Clear any existing locks before initialization
    await this.clearAuthLocks();
    
    this.supabase = createClient(
      environment.supabase.supabaseUrl,
      environment.supabase.supabaseAnonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false
        }
      }
    );

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
    });
  }

  private createCustomStorage() {
    return {
      getItem: (key: string): string | null => {
        try {
          return localStorage.getItem(key);
        } catch (error) {
          console.error('Error reading from localStorage:', error);
          return null;
        }
      },
      setItem: (key: string, value: string): void => {
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          console.error('Error writing to localStorage:', error);
        }
      },
      removeItem: (key: string): void => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error('Error removing from localStorage:', error);
        }
      }
    };
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
    return new AuthApiError('Unknown error occurred', 500);
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

  async signUp(email: string, password: string, userData: any): Promise<AuthResponse> {
    try {
      console.log('Attempting signup with:', { email, userData });
      const result = await this.retryOperation(async () => {
        const { data, error } = await this.supabase.auth.signUp({
          email,
          password,
          options: {
            data: userData,
            emailRedirectTo: `${window.location.origin}/auth/callback`
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
} 