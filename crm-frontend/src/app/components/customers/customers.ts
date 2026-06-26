import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Customer } from '../../services/api.service';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Customers</h1>
        <button class="btn btn-primary" (click)="openForm()">+ Add Customer</button>
      </div>

      <div class="filters">
        <input class="input" placeholder="Search..." [value]="search()" (input)="search.set($any($event.target).value); load()">
        <select class="input" [value]="statusFilter()" (change)="statusFilter.set($any($event.target).value); load()">
          <option value="">All Statuses</option>
          <option *ngFor="let s of statuses" [value]="s">{{s}}</option>
        </select>
      </div>

      <div class="card">
        <table class="table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Company</th><th>Phone</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of customers()">
              <td>{{c.firstName}} {{c.lastName}}</td>
              <td>{{c.email}}</td>
              <td>{{c.company}}</td>
              <td>{{c.phone}}</td>
              <td><span class="badge" [class]="'status-'+c.status.toLowerCase()">{{c.status}}</span></td>
              <td>
                <button class="btn btn-sm" (click)="edit(c)">Edit</button>
                <button class="btn btn-sm btn-danger" (click)="remove(c.id)">Del</button>
              </td>
            </tr>
            <tr *ngIf="customers().length === 0"><td colspan="6" class="empty">No customers found.</td></tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="showForm()" class="modal-overlay" (click)="closeForm()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h2>{{editing() ? 'Edit' : 'New'}} Customer</h2>
          <div class="form-grid">
            <label>First Name<input class="input" [value]="form().firstName ?? ''" (input)="patchForm('firstName', $any($event.target).value)"></label>
            <label>Last Name<input class="input" [value]="form().lastName ?? ''" (input)="patchForm('lastName', $any($event.target).value)"></label>
            <label>Email<input class="input" type="email" [value]="form().email ?? ''" (input)="patchForm('email', $any($event.target).value)"></label>
            <label>Phone<input class="input" [value]="form().phone ?? ''" (input)="patchForm('phone', $any($event.target).value)"></label>
            <label>Company<input class="input" [value]="form().company ?? ''" (input)="patchForm('company', $any($event.target).value)"></label>
            <label>Status
              <select class="input" [value]="form().status ?? 'Lead'" (change)="patchForm('status', $any($event.target).value)">
                <option *ngFor="let s of statuses" [value]="s">{{s}}</option>
              </select>
            </label>
            <label class="full">Notes<textarea class="input" [value]="form().notes ?? ''" (input)="patchForm('notes', $any($event.target).value)"></textarea></label>
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
export class CustomersComponent implements OnInit {
  customers = signal<Customer[]>([]);
  search = signal('');
  statusFilter = signal('');
  statuses = ['Lead', 'Prospect', 'Active', 'Inactive'];
  showForm = signal(false);
  editing = signal(false);
  form = signal<Partial<Customer>>({});

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.api.getCustomers(this.search() || undefined, this.statusFilter() || undefined)
      .subscribe(c => this.customers.set(c));
  }

  openForm() { this.editing.set(false); this.form.set({ status: 'Lead' }); this.showForm.set(true); }
  edit(c: Customer) { this.editing.set(true); this.form.set({ ...c }); this.showForm.set(true); }
  closeForm() { this.showForm.set(false); }
  patchForm(key: string, value: any) { this.form.update(f => ({ ...f, [key]: value })); }

  save() {
    const f = this.form();
    const req = this.editing() ? this.api.updateCustomer(f.id!, f) : this.api.createCustomer(f);
    req.subscribe(() => { this.closeForm(); this.load(); });
  }

  remove(id: number) {
    if (confirm('Delete this customer?')) this.api.deleteCustomer(id).subscribe(() => this.load());
  }
}
