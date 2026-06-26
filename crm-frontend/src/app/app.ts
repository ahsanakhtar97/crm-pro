import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-layout">
      <nav class="sidebar">
        <div class="sidebar-brand">
          <span class="brand-icon">⚡</span>
          <span class="brand-name">CRM Pro</span>
        </div>
        <ul class="nav-links">
          <li><a routerLink="/dashboard" routerLinkActive="active">📊 Dashboard</a></li>
          <li><a routerLink="/customers" routerLinkActive="active">👥 Customers</a></li>
          <li><a routerLink="/deals" routerLinkActive="active">💼 Deals</a></li>
          <li><a routerLink="/tasks" routerLinkActive="active">✅ Tasks</a></li>
          <li><a routerLink="/ai" routerLinkActive="active">🤖 AI Assistant</a></li>
        </ul>
      </nav>
      <main class="main-content">
        <router-outlet />
      </main>
    </div>
  `
})
export class App {}
