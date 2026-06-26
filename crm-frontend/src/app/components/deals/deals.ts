import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Deal, Customer } from '../../services/api.service';

@Component({
  selector: 'app-deals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Deals</h1>
        <div class="view-toggle">
          <button class="btn" [class.active]="view()==='list'" (click)="view.set('list')">List</button>
          <button class="btn" [class.active]="view()==='kanban'" (click)="view.set('kanban')">Kanban</button>
        </div>
        <button class="btn btn-primary" (click)="openForm()">+ Add Deal</button>
      </div>

      <ng-container *ngIf="view()==='list'">
        <div class="filters">
          <select class="input" [value]="stageFilter()" (change)="stageFilter.set($any($event.target).value); load()">
            <option value="">All Stages</option>
            <option *ngFor="let s of stages" [value]="s">{{s}}</option>
          </select>
        </div>
        <div class="card">
          <table class="table">
            <thead><tr><th>Title</th><th>Customer</th><th>Stage</th><th>Value</th><th>Probability</th><th>Close Date</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let d of deals()">
                <td>{{d.title}}</td>
                <td>{{d.customerName}}</td>
                <td><span class="badge" [class]="stageClass(d.stage)">{{d.stage}}</span></td>
                <td>\${{d.value | number:'1.0-0'}}</td>
                <td>{{d.probability}}%</td>
                <td>{{d.expectedCloseDate | date}}</td>
                <td>
                  <button class="btn btn-sm" (click)="edit(d)">Edit</button>
                  <button class="btn btn-sm btn-danger" (click)="remove(d.id)">Del</button>
                </td>
              </tr>
              <tr *ngIf="deals().length===0"><td colspan="7" class="empty">No deals found.</td></tr>
            </tbody>
          </table>
        </div>
      </ng-container>

      <div *ngIf="view()==='kanban'" class="kanban">
        <div *ngFor="let stage of stages" class="kanban-col">
          <div class="kanban-header">{{stage}}</div>
          <div class="kanban-body">
            <div *ngFor="let d of dealsForStage(stage)" class="kanban-card" (click)="edit(d)">
              <div class="kc-title">{{d.title}}</div>
              <div class="kc-customer">{{d.customerName}}</div>
              <div class="kc-value">\${{d.value | number:'1.0-0'}}</div>
              <div class="kc-prob">{{d.probability}}% probability</div>
            </div>
          </div>
          <div class="kanban-footer">{{dealsForStage(stage).length}} deals · \${{stageValue(stage) | number:'1.0-0'}}</div>
        </div>
      </div>

      <div *ngIf="showForm()" class="modal-overlay" (click)="closeForm()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h2>{{editing() ? 'Edit' : 'New'}} Deal</h2>
          <div class="form-grid">
            <label class="full">Title<input class="input" [value]="form().title ?? ''" (input)="patchForm('title', $any($event.target).value)"></label>
            <label>Customer
              <select class="input" [value]="form().customerId ?? ''" (change)="patchForm('customerId', +$any($event.target).value)">
                <option value="">Select customer</option>
                <option *ngFor="let c of customers()" [value]="c.id">{{c.firstName}} {{c.lastName}}</option>
              </select>
            </label>
            <label>Stage
              <select class="input" [value]="form().stage ?? 'Prospecting'" (change)="patchForm('stage', $any($event.target).value)">
                <option *ngFor="let s of stages" [value]="s">{{s}}</option>
              </select>
            </label>
            <label>Value<input class="input" type="number" [value]="form().value ?? ''" (input)="patchForm('value', +$any($event.target).value)"></label>
            <label>Probability (%)<input class="input" type="number" [value]="form().probability ?? 10" (input)="patchForm('probability', +$any($event.target).value)"></label>
            <label>Expected Close<input class="input" type="date" [value]="form().expectedCloseDate ?? ''" (input)="patchForm('expectedCloseDate', $any($event.target).value)"></label>
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
export class DealsComponent implements OnInit {
  deals = signal<Deal[]>([]);
  customers = signal<Customer[]>([]);
  stages = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
  stageFilter = signal('');
  view = signal<'list' | 'kanban'>('kanban');
  showForm = signal(false);
  editing = signal(false);
  form = signal<Partial<Deal>>({});

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.load();
    this.api.getCustomers().subscribe(c => this.customers.set(c));
  }

  load() {
    this.api.getDeals(this.stageFilter() || undefined).subscribe(d => this.deals.set(d));
  }

  openForm() { this.editing.set(false); this.form.set({ stage: 'Prospecting', probability: 10 }); this.showForm.set(true); }
  edit(d: Deal) { this.editing.set(true); this.form.set({ ...d }); this.showForm.set(true); }
  closeForm() { this.showForm.set(false); }
  patchForm(key: string, value: any) { this.form.update(f => ({ ...f, [key]: value })); }

  save() {
    const f = this.form();
    const req = this.editing() ? this.api.updateDeal(f.id!, f) : this.api.createDeal(f);
    req.subscribe(() => { this.closeForm(); this.load(); });
  }

  remove(id: number) {
    if (confirm('Delete this deal?')) this.api.deleteDeal(id).subscribe(() => this.load());
  }

  dealsForStage(stage: string) { return this.deals().filter(d => d.stage === stage); }
  stageValue(stage: string) { return this.dealsForStage(stage).reduce((s, d) => s + d.value, 0); }
  stageClass(stage: string) { return 'stage-' + stage.toLowerCase().replace(/ /g, '-'); }
}
