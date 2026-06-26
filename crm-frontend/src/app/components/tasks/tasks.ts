import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, TaskItem, Customer } from '../../services/api.service';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Tasks</h1>
        <button class="btn btn-primary" (click)="openForm()">+ Add Task</button>
      </div>

      <div class="filters">
        <select class="input" [value]="statusFilter()" (change)="statusFilter.set($any($event.target).value); load()">
          <option value="">All Statuses</option>
          <option *ngFor="let s of statuses" [value]="s">{{s}}</option>
        </select>
        <select class="input" [value]="priorityFilter()" (change)="priorityFilter.set($any($event.target).value); load()">
          <option value="">All Priorities</option>
          <option *ngFor="let p of priorities" [value]="p">{{p}}</option>
        </select>
      </div>

      <div class="card">
        <table class="table">
          <thead><tr><th>Title</th><th>Customer</th><th>Priority</th><th>Status</th><th>Due Date</th><th>Actions</th></tr></thead>
          <tbody>
            <tr *ngFor="let t of tasks()">
              <td>{{t.title}}</td>
              <td>{{t.customerName ?? '—'}}</td>
              <td><span class="badge" [class]="'priority-'+t.priority.toLowerCase()">{{t.priority}}</span></td>
              <td><span class="badge" [class]="'task-'+t.status.toLowerCase().replace(' ','-')">{{t.status}}</span></td>
              <td [class.red]="isOverdue(t)">{{t.dueDate | date}}</td>
              <td>
                <button *ngIf="t.status !== 'Completed'" class="btn btn-sm btn-success" (click)="complete(t)">Done</button>
                <button class="btn btn-sm" (click)="edit(t)">Edit</button>
                <button class="btn btn-sm btn-danger" (click)="remove(t.id)">Del</button>
              </td>
            </tr>
            <tr *ngIf="tasks().length===0"><td colspan="6" class="empty">No tasks found.</td></tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="showForm()" class="modal-overlay" (click)="closeForm()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h2>{{editing() ? 'Edit' : 'New'}} Task</h2>
          <div class="form-grid">
            <label class="full">Title<input class="input" [value]="form().title ?? ''" (input)="patchForm('title', $any($event.target).value)"></label>
            <label>Priority
              <select class="input" [value]="form().priority ?? 'Medium'" (change)="patchForm('priority', $any($event.target).value)">
                <option *ngFor="let p of priorities" [value]="p">{{p}}</option>
              </select>
            </label>
            <label>Status
              <select class="input" [value]="form().status ?? 'Pending'" (change)="patchForm('status', $any($event.target).value)">
                <option *ngFor="let s of statuses" [value]="s">{{s}}</option>
              </select>
            </label>
            <label>Due Date<input class="input" type="date" [value]="form().dueDate ?? ''" (input)="patchForm('dueDate', $any($event.target).value)"></label>
            <label>Customer
              <select class="input" [value]="form().customerId ?? ''" (change)="patchForm('customerId', $any($event.target).value ? +$any($event.target).value : null)">
                <option value="">None</option>
                <option *ngFor="let c of customers()" [value]="c.id">{{c.firstName}} {{c.lastName}}</option>
              </select>
            </label>
            <label class="full">Description<textarea class="input" [value]="form().description ?? ''" (input)="patchForm('description', $any($event.target).value)"></textarea></label>
          </div>
          <div class="modal-actions">
            <button class="btn" (click)="closeForm()">Cancel</button>
            <button class="btn btn-primary" (click)="save()">Save</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TasksComponent implements OnInit {
  tasks = signal<TaskItem[]>([]);
  customers = signal<Customer[]>([]);
  statuses = ['Pending', 'In Progress', 'Completed'];
  priorities = ['Low', 'Medium', 'High'];
  statusFilter = signal('');
  priorityFilter = signal('');
  showForm = signal(false);
  editing = signal(false);
  form = signal<Partial<TaskItem>>({});

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.load();
    this.api.getCustomers().subscribe(c => this.customers.set(c));
  }

  load() {
    this.api.getTasks(this.statusFilter() || undefined, this.priorityFilter() || undefined)
      .subscribe(t => this.tasks.set(t));
  }

  openForm() { this.editing.set(false); this.form.set({ priority: 'Medium', status: 'Pending' }); this.showForm.set(true); }
  edit(t: TaskItem) { this.editing.set(true); this.form.set({ ...t }); this.showForm.set(true); }
  closeForm() { this.showForm.set(false); }
  patchForm(key: string, value: any) { this.form.update(f => ({ ...f, [key]: value })); }

  complete(t: TaskItem) {
    this.api.updateTask(t.id, { ...t, status: 'Completed' }).subscribe(() => this.load());
  }

  save() {
    const f = this.form();
    const req = this.editing() ? this.api.updateTask(f.id!, f) : this.api.createTask(f);
    req.subscribe(() => { this.closeForm(); this.load(); });
  }

  remove(id: number) {
    if (confirm('Delete this task?')) this.api.deleteTask(id).subscribe(() => this.load());
  }

  isOverdue(t: TaskItem) {
    return t.status !== 'Completed' && !!t.dueDate && new Date(t.dueDate) < new Date();
  }
}
