import { Routes } from '@angular/router';
import { TestAuthComponent } from './components/auth/test-auth/test-auth.component';
import { LandingComponent } from './components/landing/landing.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { StockListComponent } from './components/stock-list/stock-list.component';
import { StockFormComponent } from './components/stock-form/stock-form.component';

export const routes: Routes = [
  { path: 'test-auth', component: TestAuthComponent },
  { path: '', redirectTo: '/test-auth', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'stocks', component: StockListComponent },
  { path: 'stocks/add', component: StockFormComponent },
  { path: 'stocks/edit/:id', component: StockFormComponent },
  { path: '**', redirectTo: '' }
]; 