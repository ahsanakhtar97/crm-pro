import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <h1>Dashboard</h1>

      <div *ngIf="error()" style="color:red;padding:16px;background:#fee2e2;border-radius:8px;margin-bottom:16px">
        {{error()}}
      </div>

      <div class="grid-4">
        <div class="card stat">
          <div class="stat-value">{{data()?.totalCustomers ?? 0}}</div>
          <div class="stat-label">Total Customers</div>
        </div>
        <div class="card stat">
          <div class="stat-value">{{data()?.totalDeals ?? 0}}</div>
          <div class="stat-label">Total Deals</div>
        </div>
        <div class="card stat">
          <div class="stat-value">\${{(data()?.pipelineValue ?? 0) | number:'1.0-0'}}</div>
          <div class="stat-label">Pipeline Value</div>
        </div>
        <div class="card stat">
          <div class="stat-value">{{data()?.openTasks ?? 0}}</div>
          <div class="stat-label">Open Tasks</div>
        </div>
      </div>

      <div class="grid-2 mt">
        <div class="card">
          <h3>Deals by Stage</h3>
          <div *ngFor="let s of data()?.dealsByStage ?? []" class="bar-row">
            <span class="bar-label">{{s.stage}}</span>
            <div class="bar-bg">
              <div class="bar-fill" [style.width.%]="barWidth(s.count)"></div>
            </div>
            <span class="bar-count">{{s.count}} (\${{s.value | number:'1.0-0'}})</span>
          </div>
          <div *ngIf="!data()" class="empty">Loading...</div>
        </div>

        <div class="card">
          <h3>Top Deals</h3>
          <table class="table">
            <thead><tr><th>Deal</th><th>Stage</th><th>Value</th></tr></thead>
            <tbody>
              <tr *ngFor="let d of data()?.topDeals ?? []">
                <td>{{d.title}}</td>
                <td>{{d.stage}}</td>
                <td>\${{d.value | number:'1.0-0'}}</td>
              </tr>
              <tr *ngIf="!data()"><td colspan="3" class="empty">Loading...</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card mt">
        <h3>Recent Customers</h3>
        <table class="table">
          <thead><tr><th>Name</th><th>Company</th><th>Status</th><th>Added</th></tr></thead>
          <tbody>
            <tr *ngFor="let c of data()?.recentCustomers ?? []">
              <td>{{c.firstName}} {{c.lastName}}</td>
              <td>{{c.company}}</td>
              <td><span class="badge" [class]="'status-'+c.status.toLowerCase()">{{c.status}}</span></td>
              <td>{{c.createdAt | date}}</td>
            </tr>
            <tr *ngIf="!data()"><td colspan="4" class="empty">Loading...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  data = signal<any>(null);
  error = signal('');

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any>('http://localhost:5000/api/reports/dashboard').subscribe({
      next: d => this.data.set(d),
      error: err => this.error.set(`Cannot connect to API (${err.status || err.message}). Make sure dotnet run is running on port 5000.`)
    });
  }

  barWidth(count: number): number {
    const stages = this.data()?.dealsByStage ?? [];
    const max = Math.max(...stages.map((s: any) => s.count), 1);
    return (count / max) * 100;
  }
}
