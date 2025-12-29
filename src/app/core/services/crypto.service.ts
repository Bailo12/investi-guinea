import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CryptoWallet {
  id: string;
  userId: string;
  currency: string; // BTC, ETH, USDT, etc.
  balance: number;
  availableBalance: number;
  lockedBalance: number;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CryptoTrade {
  id: string;
  userId: string;
  type: 'buy' | 'sell';
  pair: string; // BTC/USDT, ETH/USDT, etc.
  amount: number;
  price: number;
  total: number;
  fee: number;
  status: 'pending' | 'completed' | 'cancelled' | 'failed';
  orderType: 'market' | 'limit' | 'stop-loss';
  stopLoss?: number;
  takeProfit?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CryptoOrder {
  id: string;
  userId: string;
  type: 'buy' | 'sell';
  pair: string;
  orderType: 'market' | 'limit' | 'stop-loss';
  amount: number;
  price?: number; // For limit orders
  stopLoss?: number;
  takeProfit?: number;
  status: 'open' | 'filled' | 'cancelled' | 'partially-filled';
  filledAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CryptoPrice {
  pair: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  timestamp: string;
}

export interface CreateCryptoTrade {
  type: 'buy' | 'sell';
  pair: string;
  amount: number;
  orderType: 'market' | 'limit' | 'stop-loss';
  price?: number;
  stopLoss?: number;
  takeProfit?: number;
  useDemoAccount?: boolean;
}

export interface CryptoBalance {
  currency: string;
  balance: number;
  available: number;
  locked: number;
  valueInGNF: number;
}

@Injectable({
  providedIn: 'root',
})
export class CryptoService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  // Wallets
  getWallets(): Observable<CryptoWallet[]> {
    return this.http.get<CryptoWallet[]>(`${this.API_URL}/crypto/wallets`);
  }

  getWallet(currency: string): Observable<CryptoWallet> {
    return this.http.get<CryptoWallet>(
      `${this.API_URL}/crypto/wallets/${currency}`
    );
  }

  createWallet(currency: string): Observable<CryptoWallet> {
    return this.http.post<CryptoWallet>(`${this.API_URL}/crypto/wallets`, {
      currency,
    });
  }

  getBalances(): Observable<CryptoBalance[]> {
    return this.http.get<CryptoBalance[]>(`${this.API_URL}/crypto/balances`);
  }

  // Trading
  getPrices(pairs?: string[]): Observable<CryptoPrice[]> {
    const params = pairs
      ? new HttpParams().set('pairs', pairs.join(','))
      : new HttpParams();
    return this.http.get<CryptoPrice[]>(`${this.API_URL}/crypto/prices`, {
      params,
    });
  }

  getPrice(pair: string): Observable<CryptoPrice> {
    return this.http.get<CryptoPrice>(`${this.API_URL}/crypto/prices/${pair}`);
  }

  createTrade(trade: CreateCryptoTrade): Observable<CryptoTrade> {
    return this.http.post<CryptoTrade>(`${this.API_URL}/crypto/trades`, trade);
  }

  getTrades(params?: {
    pair?: string;
    status?: string;
    limit?: number;
  }): Observable<CryptoTrade[]> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.pair) httpParams = httpParams.set('pair', params.pair);
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.limit)
        httpParams = httpParams.set('limit', String(params.limit));
    }
    return this.http.get<CryptoTrade[]>(`${this.API_URL}/crypto/trades`, {
      params: httpParams,
    });
  }

  getTrade(id: string): Observable<CryptoTrade> {
    return this.http.get<CryptoTrade>(`${this.API_URL}/crypto/trades/${id}`);
  }

  // Orders
  getOrders(params?: {
    pair?: string;
    status?: string;
  }): Observable<CryptoOrder[]> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.pair) httpParams = httpParams.set('pair', params.pair);
      if (params.status) httpParams = httpParams.set('status', params.status);
    }
    return this.http.get<CryptoOrder[]>(`${this.API_URL}/crypto/orders`, {
      params: httpParams,
    });
  }

  cancelOrder(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/crypto/orders/${id}`);
  }

  // Demo Account
  getDemoBalance(): Observable<CryptoBalance[]> {
    return this.http.get<CryptoBalance[]>(
      `${this.API_URL}/crypto/demo/balance`
    );
  }

  createDemoTrade(trade: CreateCryptoTrade): Observable<CryptoTrade> {
    return this.http.post<CryptoTrade>(`${this.API_URL}/crypto/demo/trades`, {
      ...trade,
      useDemoAccount: true,
    });
  }
}
