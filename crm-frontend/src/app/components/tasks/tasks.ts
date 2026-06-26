import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, TaskItem, Customer, User } from '../../services/api.service';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">Tasks</h1>
        <button (click)="openForm()" class="px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors">
          + Add Task
        </button>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-4 border-b border-gray-100 bg-gray-50/50 flex gap-4">
          <div class="w-48">
            <select [value]="statusFilter()" (change)="statusFilter.set($any($event.target).value); load()" class="block w-full pl-3 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <option value="">All Statuses</option>
              <option *ngFor="let s of statuses" [value]="s">{{s}}</option>
            </select>
          </div>
          <div class="w-48">
            <select [value]="priorityFilter()" (change)="priorityFilter.set($any($event.target).value); load()" class="block w-full pl-3 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <option value="">All Priorities</option>
              <option *ngFor="let p of priorities" [value]="p">{{p}}</option>
            </select>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status & Priority</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let t of tasks()" class="hover:bg-gray-50 transition-colors" [ngClass]="{'bg-red-50': isOverdue(t)}">
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900" [class.line-through]="t.status === 'Completed'">{{t.title}}</div>
                  <div class="text-xs text-gray-500 mt-1">{{t.description}}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{t.customerName ?? '—'}}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex space-x-2">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" [ngClass]="statusClass(t.status)">
                      {{t.status}}
                    </span>
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" [ngClass]="priorityClass(t.priority)">
                      {{t.priority}}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span [ngClass]="isOverdue(t) ? 'text-red-600 font-medium' : 'text-gray-500'">
                    {{t.dueDate | date}}
                  </span>
                  <span *ngIf="isOverdue(t)" class="ml-2 text-xs text-red-500 font-bold uppercase">Overdue</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button *ngIf="t.status !== 'Completed'" (click)="complete(t)" class="text-green-600 hover:text-green-900">Done</button>
                  <button (click)="edit(t)" class="text-gray-600 hover:text-gray-900">Edit</button>
                  <button (click)="remove(t.id)" class="text-red-600 hover:text-red-900">Del</button>
                </td>
              </tr>
              <tr *ngIf="tasks().length === 0">
                <td colspan="5" class="px-6 py-12 text-center text-gray-500">No tasks found.</td>
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
                {{editing() ? 'Edit' : 'New'}} Task
              </h3>
              <div class="mt-4 grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-gray-700">Title</label>
                  <input type="text" [value]="form().title ?? ''" (input)="patchForm('title', $any($event.target).value)" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Priority</label>
                  <select [value]="form().priority ?? 'Medium'" (change)="patchForm('priority', $any($event.target).value)" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option *ngFor="let p of priorities" [value]="p">{{p}}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Status</label>
                  <select [value]="form().status ?? 'Pending'" (change)="patchForm('status', $any($event.target).value)" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option *ngFor="let s of statuses" [value]="s">{{s}}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Due Date</label>
                  <input type="date" [value]="form().dueDate ?? ''" (input)="patchForm('dueDate', $any($event.target).value)" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Assign To</label>
                  <select [value]="form().userId ?? ''" (change)="patchForm('userId', $any($event.target).value || null)" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option value="">Unassigned</option>
                    <option *ngFor="let u of users()" [value]="u.id">{{u.firstName}} {{u.lastName}}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Customer</label>
                  <select [value]="form().customerId ?? ''" (change)="patchForm('customerId', $any($event.target).value ? +$any($event.target).value : null)" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option value="">None</option>
                    <option *ngFor="let c of customers()" [value]="c.id">{{c.firstName}} {{c.lastName}}</option>
                  </select>
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-gray-700">Description</label>
                  <textarea rows="3" [value]="form().description ?? ''" (input)="patchForm('description', $any($event.target).value)" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
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
    </div>
  `
})
export class TasksComponent implements OnInit {
  tasks = signal<TaskItem[]>([]);
  customers = signal<Customer[]>([]);
  users = signal<User[]>([]);
  statuses = ['Pending', 'In Progress', 'Completed'];
  priorities = ['Low', 'Medium', 'High'];
  statusFilter = signal('');
  priorityFilter = signal('');
  
  showForm = signal(false);
  editing = signal(false);
  form = signal<Partial<TaskItem>>({});

  api = inject(ApiService);

  ngOnInit() {
    this.load();
    this.api.getCustomers().subscribe(c => this.customers.set(c));
    this.api.getUsers().subscribe(u => this.users.set(u));
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

  statusClass(status: string) {
    switch (status) {
      case 'Pending': return 'bg-gray-100 text-gray-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  priorityClass(priority: string) {
    switch (priority) {
      case 'Low': return 'bg-gray-100 text-gray-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
