import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  status: string;
  notes?: string;
  createdAt: string;
}

export interface Deal {
  id: number;
  title: string;
  value: number;
  stage: string;
  probability: number;
  expectedCloseDate?: string;
  notes?: string;
  customerId: number;
  customerName?: string;
  userId?: string;
  createdAt: string;
}

export interface TaskItem {
  id: number;
  title: string;
  description?: string;
  priority: string;
  status: string;
  dueDate?: string;
  customerId?: number;
  customerName?: string;
  userId?: string;
  createdAt: string;
}

export interface DashboardData {
  totalCustomers: number;
  activeCustomers: number;
  totalDeals: number;
  totalRevenue: number;
  pipelineValue: number;
  openTasks: number;
  overdueTasks: number;
  dealsByStage: { stage: string; count: number; value: number }[];
  customersByStatus: { status: string; count: number }[];
  topDeals: { id: number; title: string; value: number; stage: string; probability: number; customerName: string }[];
  recentCustomers: { id: number; firstName: string; lastName: string; company: string; status: string; createdAt: string }[];
}

import { environment } from '../../environments/environment';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  // Users
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${API}/users`);
  }

  // Customers
  getCustomers(search?: string, status?: string): Observable<Customer[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);
    return this.http.get<Customer[]>(`${API}/customers`, { params });
  }
  getCustomer(id: number) { return this.http.get<Customer>(`${API}/customers/${id}`); }
  createCustomer(data: Partial<Customer>) { return this.http.post<Customer>(`${API}/customers`, data); }
  updateCustomer(id: number, data: Partial<Customer>) { return this.http.put<Customer>(`${API}/customers/${id}`, data); }
  deleteCustomer(id: number) { return this.http.delete(`${API}/customers/${id}`); }

  // Deals
  getDeals(stage?: string, customerId?: number): Observable<Deal[]> {
    let params = new HttpParams();
    if (stage) params = params.set('stage', stage);
    if (customerId) params = params.set('customerId', customerId.toString());
    return this.http.get<Deal[]>(`${API}/deals`, { params });
  }
  getDeal(id: number) { return this.http.get<Deal>(`${API}/deals/${id}`); }
  createDeal(data: Partial<Deal>) { return this.http.post<Deal>(`${API}/deals`, data); }
  updateDeal(id: number, data: Partial<Deal>) { return this.http.put<Deal>(`${API}/deals/${id}`, data); }
  deleteDeal(id: number) { return this.http.delete(`${API}/deals/${id}`); }

  // Tasks
  getTasks(status?: string, priority?: string, customerId?: number): Observable<TaskItem[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (priority) params = params.set('priority', priority);
    if (customerId) params = params.set('customerId', customerId.toString());
    return this.http.get<TaskItem[]>(`${API}/tasks`, { params });
  }
  createTask(data: Partial<TaskItem>) { return this.http.post<TaskItem>(`${API}/tasks`, data); }
  updateTask(id: number, data: Partial<TaskItem>) { return this.http.put<TaskItem>(`${API}/tasks/${id}`, data); }
  deleteTask(id: number) { return this.http.delete(`${API}/tasks/${id}`); }

  // Reports
  getDashboard() { return this.http.get<DashboardData>(`${API}/reports/dashboard`); }
  getPipeline() { return this.http.get<any[]>(`${API}/reports/pipeline`); }

  // AI
  chat(message: string) { return this.http.post<{ reply: string }>(`${API}/aiassistant/chat`, { message }); }
}
