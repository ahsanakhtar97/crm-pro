import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Customer } from '../../services/api.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">Customers</h1>
        <div class="flex space-x-3">
          <button (click)="exportCSV()" class="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            Export CSV
          </button>
          <button (click)="openForm()" class="px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors">
            + Add Customer
          </button>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <!-- Filters -->
        <div class="p-4 border-b border-gray-100 flex gap-4 bg-gray-50/50">
          <div class="flex-1 relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </span>
            <input type="text" [value]="search()" (input)="search.set($any($event.target).value); load()" class="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Search customers...">
          </div>
          <div class="w-48">
            <select [value]="statusFilter()" (change)="statusFilter.set($any($event.target).value); load()" class="block w-full pl-3 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <option value="">All Statuses</option>
              <option *ngFor="let s of statuses" [value]="s">{{s}}</option>
            </select>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let c of customers()" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                      {{c.firstName.charAt(0)}}{{c.lastName.charAt(0)}}
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{c.firstName}} {{c.lastName}}</div>
                      <div class="text-sm text-gray-500">{{c.company}}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{c.email}}</div>
                  <div class="text-sm text-gray-500">{{c.phone}}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" 
                    [ngClass]="{
                      'bg-yellow-100 text-yellow-800': c.status === 'Lead',
                      'bg-blue-100 text-blue-800': c.status === 'Prospect',
                      'bg-green-100 text-green-800': c.status === 'Active',
                      'bg-gray-100 text-gray-800': c.status === 'Inactive'
                    }">
                    {{c.status}}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button (click)="viewDetails(c)" class="text-indigo-600 hover:text-indigo-900">Details</button>
                  <button (click)="edit(c)" class="text-gray-600 hover:text-gray-900">Edit</button>
                  <button (click)="remove(c.id!)" class="text-red-600 hover:text-red-900">Del</button>
                </td>
              </tr>
              <tr *ngIf="customers().length === 0">
                <td colspan="4" class="px-6 py-12 text-center text-gray-500">
                  <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p class="text-lg font-medium text-gray-900">No customers found</p>
                  <p class="text-sm text-gray-500">Get started by creating a new customer.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <div *ngIf="showForm()" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" (click)="closeForm()"></div>
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                {{editing() ? 'Edit' : 'New'}} Customer
              </h3>
              <div *ngIf="errorMessage()" class="mt-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative text-sm">
                {{ errorMessage() }}
              </div>
              <div class="mt-4 grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                <div>
                  <label class="block text-sm font-medium text-gray-700">First Name</label>
                  <input type="text" [value]="form().firstName ?? ''" (input)="patchForm('firstName', $any($event.target).value)" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Last Name</label>
                  <input type="text" [value]="form().lastName ?? ''" (input)="patchForm('lastName', $any($event.target).value)" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" [value]="form().email ?? ''" (input)="patchForm('email', $any($event.target).value)" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Phone</label>
                  <input type="text" [value]="form().phone ?? ''" (input)="patchForm('phone', $any($event.target).value)" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Company</label>
                  <input type="text" [value]="form().company ?? ''" (input)="patchForm('company', $any($event.target).value)" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-gray-700">Status</label>
                  <select [value]="form().status ?? 'Lead'" (change)="patchForm('status', $any($event.target).value)" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option *ngFor="let s of statuses" [value]="s">{{s}}</option>
                  </select>
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea rows="3" [value]="form().notes ?? ''" (input)="patchForm('notes', $any($event.target).value)" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button type="button" (click)="save()" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">
                Save
              </button>
              <button type="button" (click)="closeForm()" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Details Slide-over -->
      <div *ngIf="selectedCustomer()" class="fixed inset-0 overflow-hidden z-50">
        <div class="absolute inset-0 overflow-hidden">
          <div class="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" (click)="closeDetails()"></div>
          <div class="fixed inset-y-0 right-0 pl-10 max-w-full flex">
            <div class="w-screen max-w-md">
              <div class="h-full flex flex-col bg-white shadow-xl overflow-y-scroll">
                <div class="px-4 py-6 bg-indigo-700 sm:px-6">
                  <div class="flex items-center justify-between">
                    <h2 class="text-lg font-medium text-white">{{selectedCustomer()?.firstName}} {{selectedCustomer()?.lastName}}</h2>
                    <button (click)="closeDetails()" class="text-indigo-200 hover:text-white">
                      <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  <div class="mt-1 text-sm text-indigo-200">{{selectedCustomer()?.company}} • {{selectedCustomer()?.status}}</div>
                </div>
                
                <div class="p-6 space-y-6">
                  <!-- Contact Info -->
                  <div>
                    <h3 class="text-sm font-medium text-gray-900">Contact Information</h3>
                    <div class="mt-2 space-y-2 text-sm text-gray-500">
                      <p>Email: {{selectedCustomer()?.email}}</p>
                      <p>Phone: {{selectedCustomer()?.phone}}</p>
                    </div>
                  </div>

                  <!-- General Notes -->
                  <div>
                    <h3 class="text-sm font-medium text-gray-900">Notes</h3>
                    <p class="mt-2 text-sm text-gray-500 whitespace-pre-wrap">{{selectedCustomer()?.notes || 'No notes.'}}</p>
                  </div>

                  <hr>

                  <!-- Activity Log -->
                  <div>
                    <div class="flex justify-between items-center mb-4">
                      <h3 class="text-sm font-medium text-gray-900">Activity Log</h3>
                      <button (click)="addNote()" class="text-xs text-indigo-600 font-medium">+ Add Note</button>
                    </div>
                    
                    <div *ngIf="showNoteInput()" class="mb-4">
                      <textarea [(ngModel)]="newNoteText" rows="2" class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                      <div class="mt-2 flex justify-end space-x-2">
                        <button (click)="showNoteInput.set(false)" class="text-xs text-gray-500">Cancel</button>
                        <button (click)="saveNote()" class="text-xs bg-indigo-600 text-white px-2 py-1 rounded">Save</button>
                      </div>
                    </div>

                    <div class="space-y-4">
                      <div *ngFor="let act of activities()" class="flex space-x-3 text-sm">
                        <div class="flex-shrink-0">
                          <span class="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <svg class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </span>
                        </div>
                        <div>
                          <div class="text-gray-900 font-medium">{{act.type}}</div>
                          <div class="text-gray-500 mt-1">{{act.content}}</div>
                          <div class="text-xs text-gray-400 mt-1">{{act.createdAt | date:'short'}}</div>
                        </div>
                      </div>
                      <div *ngIf="!activities().length" class="text-sm text-gray-500">No activity recorded.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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

  errorMessage = signal('');

  selectedCustomer = signal<Customer | null>(null);
  activities = signal<any[]>([]);
  showNoteInput = signal(false);
  newNoteText = '';

  api = inject(ApiService);
  http = inject(HttpClient);

  ngOnInit() { this.load(); }

  load() {
    this.api.getCustomers(this.search() || undefined, this.statusFilter() || undefined)
      .subscribe(c => this.customers.set(c));
  }

  openForm() { this.errorMessage.set(''); this.editing.set(false); this.form.set({ status: 'Lead' }); this.showForm.set(true); }
  edit(c: Customer) { this.errorMessage.set(''); this.editing.set(true); this.form.set({ ...c }); this.showForm.set(true); }
  closeForm() { this.showForm.set(false); }
  patchForm(key: string, value: any) { this.form.update(f => ({ ...f, [key]: value })); }

  save() {
    this.errorMessage.set('');
    const f = this.form();
    const req = this.editing() ? this.api.updateCustomer(f.id!, f) : this.api.createCustomer(f);
    req.subscribe({
      next: () => { this.closeForm(); this.load(); },
      error: (err) => {
        console.error(err);
        this.errorMessage.set('Failed to save customer. Make sure all required fields are filled out or the backend is running.');
      }
    });
  }

  remove(id: number) {
    if (confirm('Delete this customer?')) this.api.deleteCustomer(id).subscribe(() => this.load());
  }

  exportCSV() {
    this.http.get('http://localhost:5000/api/export/customers', { responseType: 'blob' })
      .subscribe(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'customers.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }

  viewDetails(c: Customer) {
    this.selectedCustomer.set(c);
    this.loadActivities(c.id!);
  }

  closeDetails() {
    this.selectedCustomer.set(null);
  }

  loadActivities(customerId: number) {
    this.http.get<any[]>(`http://localhost:5000/api/customers/${customerId}/activities`).subscribe(a => {
      this.activities.set(a);
    });
  }

  addNote() {
    this.showNoteInput.set(true);
    this.newNoteText = '';
  }

  saveNote() {
    if (!this.newNoteText.trim()) return;
    const customerId = this.selectedCustomer()?.id;
    if (!customerId) return;

    this.http.post(`http://localhost:5000/api/customers/${customerId}/activities`, {
      type: 'Note',
      content: this.newNoteText
    }).subscribe(() => {
      this.showNoteInput.set(false);
      this.loadActivities(customerId);
    });
  }
}
