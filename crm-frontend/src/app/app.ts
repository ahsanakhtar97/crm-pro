import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { ThreeEnvironmentComponent } from './components/shared/three-environment';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, FormsModule, ThreeEnvironmentComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent implements OnInit {
  authService = inject(AuthService);
  http = inject(HttpClient);

  searchQuery = '';
  searchResults: any = null;
  searchTimeout: any;

  notifications: any[] = [];
  showNotifications = false;

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.loadNotifications();
      setInterval(() => {
        if (this.authService.isAuthenticated()) {
          this.loadNotifications();
        }
      }, 30000);
    }
  }

  loadNotifications() {
    this.http.get<any[]>(`${environment.apiUrl}/notifications`).subscribe(n => {
      this.notifications = n;
    });
  }

  logout() {
    this.authService.logout();
  }

  onSearch() {
    clearTimeout(this.searchTimeout);
    if (!this.searchQuery.trim()) {
      this.searchResults = null;
      return;
    }

    this.searchTimeout = setTimeout(() => {
      this.http.get(`${environment.apiUrl}/search?q=${this.searchQuery}`)
        .subscribe(res => {
          this.searchResults = res;
        });
    }, 300);
  }
}
