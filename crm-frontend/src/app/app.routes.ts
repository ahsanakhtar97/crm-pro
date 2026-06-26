import { Routes } from '@angular/router';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./components/auth/login.component').then(m => m.LoginComponent) },
  { path: 'dashboard', canActivate: [authGuard], loadComponent: () => import('./components/dashboard/dashboard').then(m => m.DashboardComponent) },
  { path: 'customers', canActivate: [authGuard], loadComponent: () => import('./components/customers/customers').then(m => m.CustomersComponent) },
  { path: 'deals', canActivate: [authGuard], loadComponent: () => import('./components/deals/deals').then(m => m.DealsComponent) },
  { path: 'tasks', canActivate: [authGuard], loadComponent: () => import('./components/tasks/tasks').then(m => m.TasksComponent) },
  { path: 'ai', canActivate: [authGuard], loadComponent: () => import('./components/ai-assistant/ai-assistant').then(m => m.AiAssistantComponent) },
  { path: 'calendar', canActivate: [authGuard], loadComponent: () => import('./components/shared/coming-soon').then(m => m.ComingSoonComponent) },
  { path: 'documents', canActivate: [authGuard], loadComponent: () => import('./components/shared/coming-soon').then(m => m.ComingSoonComponent) },
  { path: 'settings', canActivate: [authGuard], loadComponent: () => import('./components/shared/coming-soon').then(m => m.ComingSoonComponent) },
];
