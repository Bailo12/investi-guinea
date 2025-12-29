import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type ProductType =
  | 'micro-investment'
  | 'savings-account'
  | 'local-project';
export type ProjectCategory =
  | 'agriculture'
  | 'real-estate'
  | 'infrastructure'
  | 'technology'
  | 'commerce'
  | 'other';
export type ProductStatus = 'active' | 'closed' | 'pending' | 'sold-out';

export interface Product {
  id: string;
  type: ProductType;
  name: string;
  description: string;
  status: ProductStatus;

  // Investment details
  minInvestment?: number; // For micro-investments and local projects
  maxInvestment?: number;
  currentInvestment?: number;
  targetAmount?: number;
  interestRate?: number; // For savings accounts
  duration?: number; // In months
  currency: 'GNF' | 'USD' | 'EUR';

  // Local project specific
  category?: ProjectCategory;
  location?: string;
  expectedReturn?: number; // Percentage
  riskLevel?: 'low' | 'medium' | 'high';
  startDate?: string;
  endDate?: string;

  // Savings account specific
  accountType?: 'regular' | 'term' | 'fixed';
  withdrawalTerms?: string;

  // Premium features
  premiumOnly?: boolean;
  premiumPlan?: 'basic' | 'premium' | 'vip';

  // General
  imageUrl?: string;
  documents?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProduct {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  amount: number;
  currency: 'GNF' | 'USD' | 'EUR';
  status: 'active' | 'matured' | 'cancelled';
  purchaseDate: string;
  maturityDate?: string;
  expectedReturn?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMicroInvestment {
  productId: string;
  amount: number;
  currency: 'GNF' | 'USD' | 'EUR';
  paymentMethod: 'wallet' | 'orange-money' | 'mtn-mobile-money';
}

export interface CreateSavingsAccount {
  productId: string;
  initialDeposit: number;
  currency: 'GNF' | 'USD' | 'EUR';
  paymentMethod: 'wallet' | 'orange-money' | 'mtn-mobile-money';
}

export interface InvestInProject {
  productId: string;
  amount: number;
  currency: 'GNF' | 'USD' | 'EUR';
  paymentMethod: 'wallet' | 'orange-money' | 'mtn-mobile-money';
}

export interface ProductsFilter {
  type?: ProductType;
  category?: ProjectCategory;
  status?: ProductStatus;
  minAmount?: number;
  maxAmount?: number;
  riskLevel?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  getProducts(filter?: ProductsFilter): Observable<Product[]> {
    let params = new HttpParams();
    if (filter) {
      if (filter.type) params = params.set('type', filter.type);
      if (filter.category) params = params.set('category', filter.category);
      if (filter.status) params = params.set('status', filter.status);
      if (filter.minAmount)
        params = params.set('minAmount', String(filter.minAmount));
      if (filter.maxAmount)
        params = params.set('maxAmount', String(filter.maxAmount));
      if (filter.riskLevel) params = params.set('riskLevel', filter.riskLevel);
    }
    return this.http.get<Product[]>(`${this.API_URL}/products`, { params });
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.API_URL}/products/${id}`);
  }

  getMicroInvestments(): Observable<Product[]> {
    return this.http.get<Product[]>(
      `${this.API_URL}/products?type=micro-investment`
    );
  }

  getSavingsAccounts(): Observable<Product[]> {
    return this.http.get<Product[]>(
      `${this.API_URL}/products?type=savings-account`
    );
  }

  getLocalProjects(category?: ProjectCategory): Observable<Product[]> {
    const params = category
      ? new HttpParams().set('category', category)
      : new HttpParams();
    return this.http.get<Product[]>(
      `${this.API_URL}/products?type=local-project`,
      { params }
    );
  }

  getUserProducts(): Observable<UserProduct[]> {
    return this.http.get<UserProduct[]>(
      `${this.API_URL}/products/my-investments`
    );
  }

  getUserProduct(id: string): Observable<UserProduct> {
    return this.http.get<UserProduct>(
      `${this.API_URL}/products/my-investments/${id}`
    );
  }

  investInMicroInvestment(
    data: CreateMicroInvestment
  ): Observable<UserProduct> {
    return this.http.post<UserProduct>(
      `${this.API_URL}/products/micro-investments/invest`,
      data
    );
  }

  createSavingsAccount(data: CreateSavingsAccount): Observable<UserProduct> {
    return this.http.post<UserProduct>(
      `${this.API_URL}/products/savings-accounts/create`,
      data
    );
  }

  investInProject(data: InvestInProject): Observable<UserProduct> {
    return this.http.post<UserProduct>(
      `${this.API_URL}/products/local-projects/invest`,
      data
    );
  }

  withdrawFromSavingsAccount(
    accountId: string,
    amount: number
  ): Observable<void> {
    return this.http.post<void>(
      `${this.API_URL}/products/savings-accounts/${accountId}/withdraw`,
      { amount }
    );
  }
}
