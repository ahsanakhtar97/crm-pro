import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="max-w-md w-full space-y-8 bg-slate-900/40 backdrop-blur-2xl p-10 rounded-xl shadow-2xl border border-white/10">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-white">
            {{ isRegistering ? 'Create your account' : 'Sign in to your CRM' }}
          </h2>
        </div>
        
        <div *ngIf="errorMessage" class="mt-4 bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded relative text-sm shadow-lg" role="alert">
          <span class="block sm:inline">{{ errorMessage }}</span>
        </div>

        <form class="mt-8 space-y-6" (ngSubmit)="onSubmit()">
          <div class="rounded-md shadow-sm space-y-4">
            <div *ngIf="isRegistering" class="flex gap-4">
              <div>
                <label for="firstName" class="sr-only">First Name</label>
                <input id="firstName" name="firstName" type="text" [(ngModel)]="firstName" required class="appearance-none rounded relative block w-full px-3 py-2 bg-white/5 border border-white/10 placeholder-gray-400 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all" placeholder="First Name">
              </div>
              <div>
                <label for="lastName" class="sr-only">Last Name</label>
                <input id="lastName" name="lastName" type="text" [(ngModel)]="lastName" required class="appearance-none rounded relative block w-full px-3 py-2 bg-white/5 border border-white/10 placeholder-gray-400 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all" placeholder="Last Name">
              </div>
            </div>
            <div>
              <label for="email-address" class="sr-only">Email address</label>
              <input id="email-address" name="email" type="email" autocomplete="email" required [(ngModel)]="email" class="appearance-none rounded relative block w-full px-3 py-2 bg-white/5 border border-white/10 placeholder-gray-400 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all" placeholder="Email address">
            </div>
            <div>
              <label for="password" class="sr-only">Password</label>
              <input id="password" name="password" type="password" autocomplete="current-password" required [(ngModel)]="password" class="appearance-none rounded relative block w-full px-3 py-2 bg-white/5 border border-white/10 placeholder-gray-400 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all" placeholder="Password">
              <p *ngIf="isRegistering" class="mt-2 text-xs text-gray-400">
                Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.
              </p>
            </div>
          </div>

          <div>
            <button type="submit" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600/80 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-[0_0_15px_rgba(79,70,229,0.5)]">
              {{ isRegistering ? 'Sign up' : 'Sign in' }}
            </button>
          </div>
          
          <div class="text-sm text-center">
            <a href="#" (click)="toggleMode($event)" class="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
              {{ isRegistering ? 'Already have an account? Sign in' : 'Need an account? Sign up' }}
            </a>
          </div>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  authService = inject(AuthService);
  
  isRegistering = false;
  email = '';
  password = '';
  firstName = '';
  lastName = '';
  errorMessage = '';

  toggleMode(event: Event) {
    event.preventDefault();
    this.isRegistering = !this.isRegistering;
    this.errorMessage = '';
  }

  onSubmit() {
    this.errorMessage = '';
    
    if (this.isRegistering) {
      this.authService.register({
        email: this.email,
        password: this.password,
        firstName: this.firstName,
        lastName: this.lastName
      }).subscribe({
        error: (err) => {
          if (Array.isArray(err.error)) {
            this.errorMessage = err.error.map((e: any) => e.description).join(' ');
          } else {
            this.errorMessage = err.error?.message || 'Registration failed due to invalid input.';
          }
        }
      });
    } else {
      this.authService.login({
        email: this.email,
        password: this.password
      }).subscribe({
        error: (err) => {
          this.errorMessage = err.error?.message || 'Login failed. Please try again.';
        }
      });
    }
  }
}
