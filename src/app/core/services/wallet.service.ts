import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: 'GNF' | 'USD' | 'EUR';
  status: 'active' | 'suspended' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  type: 'deposit' | 'withdrawal';
  method: 'orange-money' | 'mtn-mobile-money' | 'bank-transfer';
  amount: number;
  currency: 'GNF' | 'USD' | 'EUR';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  reference: string;
  phoneNumber?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DepositRequest {
  amount: number;
  currency: 'GNF' | 'USD' | 'EUR';
  method: 'orange-money' | 'mtn-mobile-money';
  phoneNumber: string;
  pin?: string;
}

export interface WithdrawalRequest {
  amount: number;
  currency: 'GNF' | 'USD' | 'EUR';
  method: 'orange-money' | 'mtn-mobile-money';
  phoneNumber: string;
  pin?: string;
}

export interface WalletStats {
  totalBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  pendingTransactions: number;
  recentTransactions: Transaction[];
}

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  getWallet(): Observable<Wallet> {
    return this.http.get<Wallet>(`${this.API_URL}/wallet`);
  }

  getTransactions(params?: {
    limit?: number;
    offset?: number;
    type?: string;
  }): Observable<Transaction[]> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.limit !== undefined)
        httpParams = httpParams.set('limit', String(params.limit));
      if (params.offset !== undefined)
        httpParams = httpParams.set('offset', String(params.offset));
      if (params.type) httpParams = httpParams.set('type', params.type);
    }
    return this.http.get<Transaction[]>(`${this.API_URL}/wallet/transactions`, {
      params: httpParams,
    });
  }

  getTransaction(id: string): Observable<Transaction> {
    return this.http.get<Transaction>(
      `${this.API_URL}/wallet/transactions/${id}`
    );
  }

  deposit(request: DepositRequest): Observable<Transaction> {
    return this.http.post<Transaction>(
      `${this.API_URL}/wallet/deposit`,
      request
    );
  }

  withdraw(request: WithdrawalRequest): Observable<Transaction> {
    return this.http.post<Transaction>(
      `${this.API_URL}/wallet/withdraw`,
      request
    );
  }

  getStats(): Observable<WalletStats> {
    return this.http.get<WalletStats>(`${this.API_URL}/wallet/stats`);
  }
}
