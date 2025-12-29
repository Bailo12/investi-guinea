import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// File updated to fix TypeScript errors

export interface TransactionReport {
  period: string;
  totalTransactions: number;
  totalAmount: number;
  totalFees: number;
  deposits: {
    count: number;
    amount: number;
    fees: number;
  };
  withdrawals: {
    count: number;
    amount: number;
    fees: number;
  };
  investments: {
    count: number;
    amount: number;
    fees: number;
  };
}

export interface FeeReport {
  period: string;
  totalFees: number;
  byType: {
    type: 'deposit' | 'withdrawal' | 'investment';
    count: number;
    totalFees: number;
    averageFee: number;
    averageFeePercentage: number;
  }[];
  byMethod: {
    method: string;
    count: number;
    totalFees: number;
  }[];
  trends: {
    date: string;
    fees: number;
    transactions: number;
  }[];
}

export interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
  totalVolume: number;
  totalFees: number;
  averageTransactionAmount: number;
  topProducts: {
    productId: string;
    productName: string;
    investments: number;
    totalAmount: number;
  }[];
}

export interface UserReport {
  userId: string;
  period: string;
  totalInvested: number;
  totalEarned: number;
  totalFeesPaid: number;
  transactions: {
    deposits: number;
    withdrawals: number;
    investments: number;
  };
  portfolioValue: number;
  returnPercentage: number;
}

@Injectable({
  providedIn: 'root',
})
export class ReportingService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  getTransactionReport(
    period: 'daily' | 'weekly' | 'monthly' | 'yearly',
    startDate?: string,
    endDate?: string
  ): Observable<TransactionReport> {
    let params = new HttpParams().set('period', period);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<TransactionReport>(
      `${this.API_URL}/reports/transactions`,
      { params }
    );
  }

  getFeeReport(
    period: 'daily' | 'weekly' | 'monthly' | 'yearly',
    startDate?: string,
    endDate?: string
  ): Observable<FeeReport> {
    let params = new HttpParams().set('period', period);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<FeeReport>(`${this.API_URL}/reports/fees`, { params });
  }

  getPlatformStats(): Observable<PlatformStats> {
    return this.http.get<PlatformStats>(
      `${this.API_URL}/reports/platform-stats`
    );
  }

  getUserReport(
    period: 'daily' | 'weekly' | 'monthly' | 'yearly',
    startDate?: string,
    endDate?: string
  ): Observable<UserReport> {
    let params = new HttpParams().set('period', period);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<UserReport>(`${this.API_URL}/reports/user`, {
      params,
    });
  }

  exportReport(
    type: 'transactions' | 'fees' | 'user',
    format: 'pdf' | 'csv' | 'excel',
    period?: string
  ): Observable<Blob> {
    let params = new HttpParams().set('format', format);
    if (period) params = params.set('period', period);

    return this.http.get(`${this.API_URL}/reports/${type}/export`, {
      params,
      responseType: 'blob',
    }) as Observable<Blob>;
  }
}
