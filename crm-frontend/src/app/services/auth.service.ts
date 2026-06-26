import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';
  
  isAuthenticated = signal(false);
  currentUser = signal<any>(null);

  constructor(private http: HttpClient, private router: Router) {
    this.checkAuthStatus();
  }

  checkAuthStatus() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        // check expiration
        if (decoded.exp * 1000 > Date.now()) {
          this.isAuthenticated.set(true);
          this.currentUser.set(decoded);
          return;
        }
      } catch (e) { }
    }
    this.logout();
  }

  login(credentials: any) {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => this.handleAuth(res))
    );
  }

  register(data: any) {
    return this.http.post(`${this.apiUrl}/register`, data).pipe(
      tap((res: any) => this.handleAuth(res))
    );
  }

  private handleAuth(res: any) {
    localStorage.setItem('token', res.token);
    this.checkAuthStatus();
    this.router.navigate(['/']);
  }

  logout() {
    localStorage.removeItem('token');
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }
}
