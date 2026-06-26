import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', loadComponent: () => import('./components/dashboard/dashboard').then(m => m.DashboardComponent) },
  { path: 'customers', loadComponent: () => import('./components/customers/customers').then(m => m.CustomersComponent) },
  { path: 'deals', loadComponent: () => import('./components/deals/deals').then(m => m.DealsComponent) },
  { path: 'tasks', loadComponent: () => import('./components/tasks/tasks').then(m => m.TasksComponent) },
  { path: 'ai', loadComponent: () => import('./components/ai-assistant/ai-assistant').then(m => m.AiAssistantComponent) },
];
