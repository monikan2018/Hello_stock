import { Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { AuthCallbackComponent } from './components/auth/auth-callback/auth-callback.component';

export const routes: Routes = [
  { 
    path: '', 
    component: LandingComponent 
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'auth/callback',
    component: AuthCallbackComponent
  },
  { 
    path: '**', 
    redirectTo: '' 
  }
]; 