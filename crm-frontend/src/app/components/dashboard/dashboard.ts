import { Component, OnInit, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);
import { ThreeGlobeComponent } from '../shared/three-globe';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ThreeGlobeComponent],
  template: `
    <div class="space-y-6 pb-12 relative z-10">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-white tracking-wide">Dashboard Overview</h1>
          <p class="text-sm text-gray-400 mt-1">Welcome back. Here's what's happening with your business today.</p>
        </div>
        <div class="flex space-x-3">
          <button class="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/20 transition-all shadow-lg">
            Export Report
          </button>
          <button class="bg-indigo-600/80 backdrop-blur-md border border-indigo-500/50 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-500 transition-all shadow-[0_0_15px_rgba(79,70,229,0.5)]">
            New Campaign
          </button>
        </div>
      </div>

      <div *ngIf="error()" class="bg-red-500/20 backdrop-blur-md border-l-4 border-red-500 text-red-200 p-4 rounded-r-lg shadow-lg">
        <div class="flex">
          <svg class="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>
          <p>{{error()}}</p>
        </div>
      </div>

      <!-- Key Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Customers Card -->
        <div class="bg-white/5 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-white/10 flex flex-col relative overflow-hidden group hover:bg-white/10 transition-all">
          <div class="absolute right-0 top-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
            <svg class="w-16 h-16 text-indigo-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          </div>
          <span class="text-sm font-semibold text-gray-400 uppercase tracking-wider">Total Customers</span>
          <div class="flex items-baseline mt-2 space-x-2">
            <span class="text-4xl font-extrabold text-white">{{data()?.totalCustomers ?? 0}}</span>
            <span class="text-sm font-medium text-green-400 flex items-center bg-green-500/20 px-2 py-0.5 rounded-full border border-green-500/30">
              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
              12%
            </span>
          </div>
          <span class="text-xs text-gray-500 mt-2">vs last 30 days</span>
        </div>

        <!-- Deals Card -->
        <div class="bg-white/5 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-white/10 flex flex-col relative overflow-hidden group hover:bg-white/10 transition-all">
          <div class="absolute right-0 top-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
            <svg class="w-16 h-16 text-emerald-400" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9h-2V7h-2v5H6v2h2v5h2v-5h2v-2z"/></svg>
          </div>
          <span class="text-sm font-semibold text-gray-400 uppercase tracking-wider">Active Deals</span>
          <div class="flex items-baseline mt-2 space-x-2">
            <span class="text-4xl font-extrabold text-white">{{data()?.totalDeals ?? 0}}</span>
            <span class="text-sm font-medium text-green-400 flex items-center bg-green-500/20 px-2 py-0.5 rounded-full border border-green-500/30">
              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
              8.5%
            </span>
          </div>
          <span class="text-xs text-gray-500 mt-2">vs last 30 days</span>
        </div>

        <!-- Revenue Card -->
        <div class="bg-white/5 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-white/10 flex flex-col relative overflow-hidden group hover:bg-white/10 transition-all">
          <div class="absolute right-0 top-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
            <svg class="w-16 h-16 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
          </div>
          <span class="text-sm font-semibold text-gray-400 uppercase tracking-wider">Forecasted Revenue</span>
          <div class="flex items-baseline mt-2 space-x-2">
            <span class="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]">\${{(forecast()?.forecast ?? 0) | number:'1.0-0'}}</span>
          </div>
          <span class="text-xs text-gray-500 mt-2">Expected by end of Q3</span>
        </div>

        <!-- Tasks Card -->
        <div class="bg-white/5 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-white/10 flex flex-col relative overflow-hidden group hover:bg-white/10 transition-all">
          <div class="absolute right-0 top-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
            <svg class="w-16 h-16 text-orange-400" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9h-2V7h-2v5H6v2h2v5h2v-5h2v-2z"/></svg>
          </div>
          <span class="text-sm font-semibold text-gray-400 uppercase tracking-wider">Open Tasks</span>
          <div class="flex items-baseline mt-2 space-x-2">
            <span class="text-4xl font-extrabold text-white">{{data()?.openTasks ?? 0}}</span>
            <span class="text-sm font-medium text-red-300 flex items-center bg-red-500/20 px-2 py-0.5 rounded-full border border-red-500/30">
              High Priority
            </span>
          </div>
          <span class="text-xs text-gray-500 mt-2">Requires immediate attention</span>
        </div>
      </div>

      <!-- Global Reach 3D -->
      <div class="bg-white/5 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 overflow-hidden relative">
        <div class="absolute top-0 left-0 p-6 z-10 pointer-events-none">
          <h3 class="text-xl font-bold text-white">Global Reach</h3>
          <p class="text-indigo-300 text-sm mt-1">Interactive real-time map</p>
        </div>
        <div class="h-[400px] w-full">
          <app-three-globe></app-three-globe>
        </div>
      </div>

      <!-- Main Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Revenue Line Chart -->
        <div class="bg-white/5 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-white/10 lg:col-span-2">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-white">Revenue Growth</h3>
            <select class="text-sm bg-slate-900/50 border-white/20 rounded-lg text-gray-300 focus:ring-indigo-500 focus:border-indigo-500">
              <option>This Year</option>
              <option>Last 6 Months</option>
              <option>This Quarter</option>
            </select>
          </div>
          <div class="h-72">
            <canvas #revenueChart></canvas>
          </div>
        </div>
        
        <!-- Win/Loss Doughnut & Goal Tracker -->
        <div class="flex flex-col space-y-6">
          <div class="bg-white/5 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-white/10 flex-1">
            <h3 class="text-lg font-bold text-white mb-4">Win/Loss Ratio</h3>
            <div class="h-48 flex justify-center relative">
              <canvas #winLossChart></canvas>
              <div class="absolute inset-0 flex items-center justify-center flex-col pointer-events-none pb-8">
                <span class="text-sm text-gray-400">Win Rate</span>
                <span class="text-2xl font-bold text-white">68%</span>
              </div>
            </div>
          </div>
          
          <div class="bg-indigo-600/30 backdrop-blur-xl border border-indigo-400/30 p-6 rounded-2xl shadow-[0_0_30px_rgba(79,70,229,0.2)] text-white relative overflow-hidden">
            <div class="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-indigo-500/20 blur-2xl"></div>
            <h3 class="text-sm font-semibold uppercase tracking-wider opacity-90 mb-1 relative z-10">Monthly Target</h3>
            <div class="flex justify-between items-end mb-2 relative z-10">
              <span class="text-3xl font-extrabold">$84,000</span>
              <span class="text-sm opacity-90 mb-1">of $100k</span>
            </div>
            <div class="w-full bg-black/20 rounded-full h-2 mb-2 relative z-10">
              <div class="bg-gradient-to-r from-indigo-400 to-purple-400 h-2 rounded-full shadow-[0_0_10px_rgba(167,139,250,0.8)]" style="width: 84%"></div>
            </div>
            <p class="text-xs opacity-80 text-right relative z-10">84% completed. 6 days left.</p>
          </div>
        </div>
      </div>

      <!-- Bottom Row: Activity & Top Deals -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Top Performing Deals -->
        <div class="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
          <div class="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-white/5">
            <h3 class="text-lg font-bold text-white">Top Performing Deals</h3>
            <a routerLink="/deals" class="text-sm font-medium text-indigo-400 hover:text-indigo-300">View all</a>
          </div>
          <ul class="divide-y divide-white/5">
            <li *ngFor="let deal of data()?.topDeals?.slice(0, 5)" class="px-6 py-4 hover:bg-white/5 transition-colors">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold border border-indigo-500/30">
                    {{deal.customerName?.charAt(0) || 'C'}}
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-200">{{deal.title}}</p>
                    <p class="text-xs text-gray-400">{{deal.customerName}} • {{deal.stage}}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm font-bold text-gray-200">\${{deal.value | number}}</p>
                  <p class="text-xs" [ngClass]="{'text-green-400': deal.probability > 70, 'text-yellow-400': deal.probability <= 70 && deal.probability > 40, 'text-red-400': deal.probability <= 40}">
                    {{deal.probability}}% probability
                  </p>
                </div>
              </div>
            </li>
            <li *ngIf="!data()?.topDeals?.length" class="px-6 py-8 text-center text-gray-400 text-sm">
              No active deals found.
            </li>
          </ul>
        </div>

        <!-- Recent Activity Timeline -->
        <div class="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
          <div class="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-white/5">
            <h3 class="text-lg font-bold text-white">Recent Customer Activity</h3>
            <a routerLink="/customers" class="text-sm font-medium text-indigo-400 hover:text-indigo-300">View directory</a>
          </div>
          <div class="p-6">
            <div class="flow-root">
              <ul class="-mb-8">
                <li *ngFor="let cust of data()?.recentCustomers?.slice(0, 5); let last = last">
                  <div class="relative pb-8">
                    <span *ngIf="!last" class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-white/10" aria-hidden="true"></span>
                    <div class="relative flex space-x-3">
                      <div>
                        <span class="h-8 w-8 rounded-full bg-green-500/80 backdrop-blur-sm flex items-center justify-center ring-8 ring-slate-900 border border-green-400 shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                        </span>
                      </div>
                      <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p class="text-sm text-gray-400">
                            New customer <span class="font-medium text-white">{{cust.firstName}} {{cust.lastName}}</span> was added.
                          </p>
                          <p class="text-xs text-indigo-300 font-medium mt-0.5" *ngIf="cust.company">{{cust.company}}</p>
                        </div>
                        <div class="text-right text-xs whitespace-nowrap text-gray-500">
                          {{cust.createdAt | date:'shortDate'}}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
                <li *ngIf="!data()?.recentCustomers?.length">
                  <div class="text-center text-gray-500 text-sm py-4">No recent activity.</div>
                </li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  @ViewChild('revenueChart') revenueChartRef!: ElementRef;
  @ViewChild('winLossChart') winLossChartRef!: ElementRef;

  http = inject(HttpClient);

  data = signal<any>(null);
  forecast = signal<any>(null);
  error = signal('');

  ngOnInit() {
    Chart.defaults.color = 'rgba(255, 255, 255, 0.7)';
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';

    // 1. Get standard dashboard data
    this.http.get<any>(`${environment.apiUrl}/reports/dashboard`).subscribe({
      next: d => this.data.set(d),
      error: err => this.error.set(`Cannot connect to API (${err.status || err.message}).`)
    });

    // 2. Get Forecast
    this.http.get<any>(`${environment.apiUrl}/dashboard/forecast`).subscribe({
      next: d => this.forecast.set(d)
    });

    // 3. Get Revenue Chart Data
    this.http.get<any[]>(`${environment.apiUrl}/dashboard/revenue-chart`).subscribe({
      next: d => this.renderRevenueChart(d)
    });

    // 4. Get Win/Loss Chart Data
    this.http.get<any[]>(`${environment.apiUrl}/dashboard/win-loss`).subscribe({
      next: d => this.renderWinLossChart(d)
    });
  }

  renderRevenueChart(data: any[]) {
    if (!this.revenueChartRef) return;
    new Chart(this.revenueChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: data.map(d => d.name),
        datasets: [{
          label: 'Revenue ($)',
          data: data.map(d => d.value),
          borderColor: '#818cf8',
          backgroundColor: 'rgba(129, 140, 248, 0.2)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' } }
        }
      }
    });
  }

  renderWinLossChart(data: any[]) {
    if (!this.winLossChartRef) return;
    new Chart(this.winLossChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: data.map(d => d.name),
        datasets: [{
          data: data.map(d => d.value),
          backgroundColor: ['#22c55e', '#ef4444'],
          borderColor: 'transparent',
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }
}
