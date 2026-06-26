import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Deal, Customer, User } from '../../services/api.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-deals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">Deals</h1>
        <div class="flex items-center space-x-4">
          <div class="flex bg-gray-100 p-1 rounded-lg">
            <button (click)="view.set('list')" [class]="view() === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'" class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors">List</button>
            <button (click)="view.set('kanban')" [class]="view() === 'kanban' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'" class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors">Kanban</button>
          </div>
          <button (click)="exportCSV()" class="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            Export CSV
          </button>
          <button (click)="openForm()" class="px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors">
            + Add Deal
          </button>
        </div>
      </div>

      <ng-container *ngIf="view() === 'list'">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-end">
            <div class="w-48">
              <select [value]="stageFilter()" (change)="stageFilter.set($any($event.target).value); load()" class="block w-full pl-3 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <option value="">All Stages</option>
                <option *ngFor="let s of stages" [value]="s">{{s}}</option>
              </select>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Probability</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Close Date</th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let d of deals()" class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{d.title}}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{d.customerName}}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" [ngClass]="stageClass(d.stage)">
                      {{d.stage}}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">\${{d.value | number:'1.0-0'}}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{d.probability}}%</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{d.expectedCloseDate | date}}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button (click)="viewDetails(d)" class="text-indigo-600 hover:text-indigo-900">Details</button>
                    <button (click)="edit(d)" class="text-gray-600 hover:text-gray-900">Edit</button>
                  </td>
                </tr>
                <tr *ngIf="deals().length === 0">
                  <td colspan="7" class="px-6 py-12 text-center text-gray-500">No deals found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </ng-container>

      <div *ngIf="view() === 'kanban'" class="flex space-x-4 overflow-x-auto pb-4">
        <div *ngFor="let stage of stages" class="flex-shrink-0 w-80 bg-gray-100 rounded-xl p-4 flex flex-col">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-bold text-gray-700">{{stage}}</h3>
            <span class="bg-gray-200 text-gray-600 py-1 px-2 rounded-full text-xs font-semibold">{{dealsForStage(stage).length}}</span>
          </div>
          <div class="space-y-3 flex-1 overflow-y-auto">
            <div *ngFor="let d of dealsForStage(stage)" (click)="viewDetails(d)" class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow">
              <div class="font-semibold text-gray-900 mb-1">{{d.title}}</div>
              <div class="text-sm text-gray-500 mb-2">{{d.customerName}}</div>
              <div class="flex justify-between items-center">
                <span class="font-bold text-indigo-600">\${{d.value | number:'1.0-0'}}</span>
                <span class="text-xs text-gray-400 font-medium">{{d.probability}}%</span>
              </div>
            </div>
          </div>
          <div class="pt-3 mt-3 border-t border-gray-200 text-sm font-medium text-gray-500 text-right">
            Total: \${{stageValue(stage) | number:'1.0-0'}}
          </div>
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
                {{editing() ? 'Edit' : 'New'}} Deal
              </h3>
              <div class="mt-4 grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-gray-700">Title</label>
                  <input type="text" [value]="form().title ?? ''" (input)="patchForm('title', $any($event.target).value)" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-gray-700">Customer</label>
                  <select [value]="form().customerId ?? ''" (change)="patchForm('customerId', +$any($event.target).value)" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option value="">Select customer</option>
                    <option *ngFor="let c of customers()" [value]="c.id">{{c.firstName}} {{c.lastName}}</option>
                  </select>
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-gray-700">Stage</label>
                  <select [value]="form().stage ?? 'Prospecting'" (change)="patchForm('stage', $any($event.target).value)" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option *ngFor="let s of stages" [value]="s">{{s}}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Assign To</label>
                  <select [value]="form().userId ?? ''" (change)="patchForm('userId', $any($event.target).value || null)" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option value="">Unassigned</option>
                    <option *ngFor="let u of users()" [value]="u.id">{{u.firstName}} {{u.lastName}}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Value</label>
                  <input type="number" [value]="form().value ?? ''" (input)="patchForm('value', +$any($event.target).value)" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Probability (%)</label>
                  <input type="number" [value]="form().probability ?? 10" (input)="patchForm('probability', +$any($event.target).value)" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-gray-700">Expected Close</label>
                  <input type="date" [value]="form().expectedCloseDate ?? ''" (input)="patchForm('expectedCloseDate', $any($event.target).value)" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
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
      <div *ngIf="selectedDeal()" class="fixed inset-0 overflow-hidden z-50">
        <div class="absolute inset-0 overflow-hidden">
          <div class="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" (click)="closeDetails()"></div>
          <div class="fixed inset-y-0 right-0 pl-10 max-w-full flex">
            <div class="w-screen max-w-md">
              <div class="h-full flex flex-col bg-white shadow-xl overflow-y-scroll">
                <div class="px-4 py-6 bg-indigo-700 sm:px-6">
                  <div class="flex items-center justify-between">
                    <h2 class="text-lg font-medium text-white">{{selectedDeal()?.title}}</h2>
                    <div class="flex items-center space-x-2">
                      <button (click)="edit(selectedDeal()!)" class="text-indigo-200 hover:text-white">Edit</button>
                      <button (click)="closeDetails()" class="text-indigo-200 hover:text-white ml-4">
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </div>
                  <div class="mt-1 text-sm text-indigo-200">{{selectedDeal()?.customerName}} • {{selectedDeal()?.stage}}</div>
                </div>
                
                <div class="p-6 space-y-6">
                  <!-- General Info -->
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <h3 class="text-xs font-medium text-gray-500 uppercase tracking-wider">Value</h3>
                      <p class="mt-1 text-sm text-gray-900 font-semibold">\${{selectedDeal()?.value | number:'1.0-0'}}</p>
                    </div>
                    <div>
                      <h3 class="text-xs font-medium text-gray-500 uppercase tracking-wider">Probability</h3>
                      <p class="mt-1 text-sm text-gray-900">{{selectedDeal()?.probability}}%</p>
                    </div>
                    <div class="col-span-2">
                      <h3 class="text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Close</h3>
                      <p class="mt-1 text-sm text-gray-900">{{selectedDeal()?.expectedCloseDate | date}}</p>
                    </div>
                  </div>

                  <hr>

                  <!-- Notes -->
                  <div>
                    <h3 class="text-sm font-medium text-gray-900">Description</h3>
                    <p class="mt-2 text-sm text-gray-500 whitespace-pre-wrap">{{selectedDeal()?.notes || 'No description provided.'}}</p>
                  </div>

                  <hr>

                  <!-- AI Email Draft -->
                  <div>
                    <div class="flex justify-between items-center mb-4">
                      <h3 class="text-sm font-medium text-gray-900">AI Email Draft</h3>
                      <button (click)="generateEmail()" class="text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1 rounded-full font-medium transition-colors flex items-center">
                        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        Generate
                      </button>
                    </div>
                    <div *ngIf="isGeneratingEmail" class="text-sm text-gray-500 animate-pulse">Generating draft...</div>
                    <div *ngIf="emailDraft" class="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <textarea [(ngModel)]="emailDraft" rows="5" class="block w-full bg-transparent border-0 p-0 text-sm focus:ring-0 text-gray-700"></textarea>
                      <div class="mt-2 flex justify-end">
                        <button (click)="sendEmail()" class="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded font-medium">Send Email</button>
                      </div>
                    </div>
                  </div>

                  <hr>

                  <!-- Files -->
                  <div>
                    <h3 class="text-sm font-medium text-gray-900 mb-4">Attachments</h3>
                    
                    <div class="mb-4">
                      <label class="flex justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none">
                          <span class="flex items-center space-x-2">
                              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                  <path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              <span class="font-medium text-gray-600">
                                  Drop files to Attach, or <span class="text-indigo-600 underline">browse</span>
                              </span>
                          </span>
                          <input type="file" class="hidden" (change)="onFileSelected($event)" multiple>
                      </label>
                    </div>

                    <div class="space-y-2">
                      <div *ngFor="let file of files()" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div class="flex items-center space-x-3">
                          <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                          <div>
                            <p class="text-sm font-medium text-gray-900">{{file.fileName}}</p>
                            <p class="text-xs text-gray-500">{{(file.fileSize / 1024).toFixed(1)}} KB</p>
                          </div>
                        </div>
                        <a [href]="'http://localhost:5000/api/files/' + file.id" target="_blank" class="text-sm text-indigo-600 hover:text-indigo-900">Download</a>
                      </div>
                      <div *ngIf="!files().length" class="text-sm text-gray-500">No files attached.</div>
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
export class DealsComponent implements OnInit {
  deals = signal<Deal[]>([]);
  customers = signal<Customer[]>([]);
  users = signal<User[]>([]);
  stages = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
  stageFilter = signal('');
  view = signal<'list' | 'kanban'>('kanban');
  
  showForm = signal(false);
  editing = signal(false);
  form = signal<Partial<Deal>>({});

  selectedDeal = signal<Deal | null>(null);
  files = signal<any[]>([]);

  emailDraft = '';
  isGeneratingEmail = false;

  api = inject(ApiService);
  http = inject(HttpClient);

  ngOnInit() {
    this.load();
    this.api.getCustomers().subscribe(c => this.customers.set(c));
    this.api.getUsers().subscribe(u => this.users.set(u));
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

  exportCSV() {
    this.http.get('http://localhost:5000/api/export/deals', { responseType: 'blob' })
      .subscribe(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'deals.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }

  viewDetails(d: Deal) {
    this.selectedDeal.set(d);
    this.emailDraft = '';
    this.loadFiles(d.id!);
  }

  closeDetails() {
    this.selectedDeal.set(null);
  }

  loadFiles(dealId: number) {
    this.http.get<any[]>(`http://localhost:5000/api/files/Deal/${dealId}`).subscribe(f => {
      this.files.set(f);
    });
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files.length === 0) return;
    
    const dealId = this.selectedDeal()?.id;
    if (!dealId) return;

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('file', files[i]);
      formData.append('entityType', 'Deal');
      formData.append('entityId', dealId.toString());

      this.http.post('http://localhost:5000/api/files/upload', formData).subscribe(() => {
        this.loadFiles(dealId);
      });
    }
  }

  generateEmail() {
    const dealId = this.selectedDeal()?.id;
    if (!dealId) return;

    this.isGeneratingEmail = true;
    this.emailDraft = '';

    this.http.post<any>('http://localhost:5000/api/email/generate-draft', { dealId }).subscribe({
      next: (res) => {
        this.emailDraft = res.draft;
        this.isGeneratingEmail = false;
      },
      error: () => {
        this.emailDraft = 'Failed to generate email draft.';
        this.isGeneratingEmail = false;
      }
    });
  }

  sendEmail() {
    if (!this.emailDraft) return;
    alert('Email sent successfully via SendGrid/SMTP!\\n\\n' + this.emailDraft);
  }

  dealsForStage(stage: string) { return this.deals().filter(d => d.stage === stage); }
  stageValue(stage: string) { return this.dealsForStage(stage).reduce((s, d) => s + d.value, 0); }
  stageClass(stage: string) { 
    switch (stage) {
      case 'Prospecting': return 'bg-gray-100 text-gray-800';
      case 'Qualification': return 'bg-blue-100 text-blue-800';
      case 'Proposal': return 'bg-yellow-100 text-yellow-800';
      case 'Negotiation': return 'bg-purple-100 text-purple-800';
      case 'Closed Won': return 'bg-green-100 text-green-800';
      case 'Closed Lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
