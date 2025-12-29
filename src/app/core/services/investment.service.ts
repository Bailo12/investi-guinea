import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Investment {
  id: string;
  userId: string;
  type: 'stocks' | 'bonds' | 'real-estate' | 'crypto' | 'mutual-funds' | 'other';
  name: string;
  amount: number;
  currency: 'GNF' | 'USD' | 'EUR';
  purchaseDate: string;
  currentValue?: number;
  returnPercentage?: number;
  status: 'active' | 'sold' | 'pending';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvestmentStats {
  totalInvestments: number;
  totalValue: number;
  totalReturn: number;
  returnPercentage: number;
  activeInvestments: number;
  byType: {
    type: string;
    count: number;
    value: number;
  }[];
}

export interface CreateInvestmentDto {
  type: Investment['type'];
  name: string;
  amount: number;
  currency: Investment['currency'];
  purchaseDate: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InvestmentService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  getInvestments(): Observable<Investment[]> {
    return this.http.get<Investment[]>(`${this.API_URL}/investments`);
  }

  getInvestment(id: string): Observable<Investment> {
    return this.http.get<Investment>(`${this.API_URL}/investments/${id}`);
  }

  createInvestment(data: CreateInvestmentDto): Observable<Investment> {
    return this.http.post<Investment>(`${this.API_URL}/investments`, data);
  }

  updateInvestment(id: string, data: Partial<CreateInvestmentDto>): Observable<Investment> {
    return this.http.put<Investment>(`${this.API_URL}/investments/${id}`, data);
  }

  deleteInvestment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/investments/${id}`);
  }

  getStats(): Observable<InvestmentStats> {
    return this.http.get<InvestmentStats>(`${this.API_URL}/investments/stats`);
  }
}

