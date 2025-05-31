import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, throwError, timer } from 'rxjs';
import { catchError, map, retryWhen, tap, delayWhen } from 'rxjs/operators';
import { User } from '../interfaces/user.interface';
import { TokenService } from './token.service';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser = this.currentUserSubject.asObservable();
  private retryAttempts = 3;
  private retryDelay = 1000; // 1 second

  constructor(
    private tokenService: TokenService,
    private supabaseService: SupabaseService
  ) {
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      const { data, error } = await this.supabaseService.getSession();
      if (error) throw error;
      if (data.session?.user) {
        this.currentUserSubject.next(this.mapSupabaseUser(data.session.user));
        this.tokenService.setToken(data.session.access_token);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      this.currentUserSubject.next(null);
      this.tokenService.removeToken();
    }
  }

  private mapSupabaseUser(supabaseUser: any): User {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      firstName: supabaseUser.user_metadata?.firstName || '',
      lastName: supabaseUser.user_metadata?.lastName || ''
    };
  }

  private handleAuthError(error: any) {
    if (error.message?.includes('lock')) {
      console.warn('Lock acquisition failed, retrying...', error);
      throw error; // Allow retry
    }
    console.error('Authentication error:', error);
    this.currentUserSubject.next(null);
    this.tokenService.removeToken();
    return throwError(() => error);
  }

  login(email: string, password: string): Observable<User> {
    return from(this.supabaseService.signIn(email, password)).pipe(
      retryWhen(errors => 
        errors.pipe(
          delayWhen(() => timer(this.retryDelay)),
          map((error, index) => {
            if (index === this.retryAttempts) {
              throw error;
            }
            return error;
          })
        )
      ),
      map(response => {
        if (response.error) throw response.error;
        if (!response.data?.user) throw new Error('No user data received');
        
        const user = this.mapSupabaseUser(response.data.user);
        if (response.data.session?.access_token) {
          this.tokenService.setToken(response.data.session.access_token);
        }
        this.currentUserSubject.next(user);
        return user;
      }),
      catchError(error => this.handleAuthError(error))
    );
  }

  register(userData: any): Observable<any> {
    return from(this.supabaseService.signUp(
      userData.email,
      userData.password,
      {
        firstName: userData.firstName,
        lastName: userData.lastName
      }
    )).pipe(
      retryWhen(errors => 
        errors.pipe(
          delayWhen(() => timer(this.retryDelay)),
          map((error, index) => {
            if (index === this.retryAttempts) {
              throw error;
            }
            return error;
          })
        )
      ),
      map(response => {
        if (response.error) throw response.error;
        
        const needsEmailVerification = !response.data?.session;
        if (needsEmailVerification) {
          return {
            user: null,
            needsEmailVerification: true
          };
        }

        const user = response.data.user ? this.mapSupabaseUser(response.data.user) : null;
        if (user && response.data.session?.access_token) {
          this.tokenService.setToken(response.data.session.access_token);
          this.currentUserSubject.next(user);
        }

        return {
          user,
          needsEmailVerification: false
        };
      }),
      catchError(error => this.handleAuthError(error))
    );
  }

  logout(): Observable<void> {
    return from(this.supabaseService.signOut()).pipe(
      map(response => {
        if (response.error) throw response.error;
        this.currentUserSubject.next(null);
        this.tokenService.removeToken();
      }),
      catchError(error => this.handleAuthError(error))
    );
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value && !!this.tokenService.getToken();
  }
} 