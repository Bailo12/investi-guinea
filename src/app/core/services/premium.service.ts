import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PremiumAccount {
  id: string;
  userId: string;
  plan: 'basic' | 'premium' | 'vip';
  status: 'active' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  benefits: PremiumBenefit[];
  createdAt: string;
  updatedAt: string;
}

export interface PremiumBenefit {
  id: string;
  name: string;
  description: string;
  type:
    | 'exclusive-projects'
    | 'lower-fees'
    | 'priority-support'
    | 'advanced-analytics'
    | 'early-access';
  enabled: boolean;
}

export interface PremiumPlan {
  id: string;
  name: string;
  plan: 'basic' | 'premium' | 'vip';
  price: number;
  currency: 'GNF' | 'USD' | 'EUR';
  duration: number; // in months
  features: string[];
  benefits: PremiumBenefit[];
}

export interface PremiumSubscription {
  planId: string;
  paymentMethod:
    | 'wallet'
    | 'orange-money'
    | 'mtn-mobile-money'
    | 'bank-transfer';
  autoRenew: boolean;
}

export interface PremiumProject {
  id: string;
  name: string;
  type: 'real-estate' | 'gold' | 'premium-investment';
  category:
    | 'luxury-real-estate'
    | 'commercial-real-estate'
    | 'gold-bullion'
    | 'gold-mining'
    | 'premium-fund';
  description: string;
  minInvestment: number;
  maxInvestment?: number;
  expectedReturn: number;
  riskLevel: 'low' | 'medium' | 'high';
  location?: string;
  imageUrl?: string;
  documents?: string[];
  status: 'active' | 'closed' | 'sold-out';
  premiumOnly: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class PremiumService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  // Account Management
  getAccount(): Observable<PremiumAccount | null> {
    return this.http.get<PremiumAccount | null>(
      `${this.API_URL}/premium/account`
    );
  }

  getPlans(): Observable<PremiumPlan[]> {
    return this.http.get<PremiumPlan[]>(`${this.API_URL}/premium/plans`);
  }

  subscribe(subscription: PremiumSubscription): Observable<PremiumAccount> {
    return this.http.post<PremiumAccount>(
      `${this.API_URL}/premium/subscribe`,
      subscription
    );
  }

  cancelSubscription(): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/premium/cancel`, {});
  }

  renewSubscription(): Observable<PremiumAccount> {
    return this.http.post<PremiumAccount>(`${this.API_URL}/premium/renew`, {});
  }

  // Premium Projects
  getPremiumProjects(category?: string): Observable<PremiumProject[]> {
    const params = category
      ? new HttpParams().set('category', category)
      : new HttpParams();
    return this.http.get<PremiumProject[]>(`${this.API_URL}/premium/projects`, {
      params,
    });
  }

  getPremiumProject(id: string): Observable<PremiumProject> {
    return this.http.get<PremiumProject>(
      `${this.API_URL}/premium/projects/${id}`
    );
  }

  investInPremiumProject(
    projectId: string,
    amount: number,
    paymentMethod: string
  ): Observable<any> {
    return this.http.post(
      `${this.API_URL}/premium/projects/${projectId}/invest`,
      {
        amount,
        paymentMethod,
      }
    );
  }

  // Benefits
  getBenefits(): Observable<PremiumBenefit[]> {
    return this.http.get<PremiumBenefit[]>(`${this.API_URL}/premium/benefits`);
  }

  isPremiumUser(): Observable<boolean> {
    return this.http.get<boolean>(`${this.API_URL}/premium/status`);
  }
}
