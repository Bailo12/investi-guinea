import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardReport {
  walletBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalInvestments: number;
  totalFees: number;
  transactionCount: number;
  // optional extended metrics
  totalReturn?: number;
  returnPercentage?: number;
  riskScore?: number;
}

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  getDashboard(): Observable<DashboardReport> {
    return this.http.get<DashboardReport>(`${this.API_URL}/reports/dashboard`);
  }
}
