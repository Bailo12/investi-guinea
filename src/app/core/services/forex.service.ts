import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ForexPair {
  symbol: string; // EUR/USD, GBP/USD, etc.
  bid: number;
  ask: number;
  spread: number;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  timestamp: string;
}

export interface ForexTrade {
  id: string;
  userId: string;
  type: 'buy' | 'sell';
  pair: string;
  lotSize: number;
  entryPrice: number;
  currentPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  leverage: number;
  margin: number;
  profit?: number;
  profitPercent?: number;
  status: 'open' | 'closed' | 'stopped' | 'take-profit';
  closedAt?: string;
  closedPrice?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ForexPosition {
  id: string;
  trade: ForexTrade;
  unrealizedProfit: number;
  unrealizedProfitPercent: number;
  marginUsed: number;
  marginAvailable: number;
}

export interface CreateForexTrade {
  type: 'buy' | 'sell';
  pair: string;
  lotSize: number;
  leverage: number;
  stopLoss?: number;
  takeProfit?: number;
  useDemoAccount?: boolean;
}

export interface ForexAccount {
  id: string;
  userId: string;
  type: 'real' | 'demo';
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  currency: 'USD' | 'EUR' | 'GNF';
  leverage: number;
  createdAt: string;
  updatedAt: string;
}

export interface ForexAlert {
  id: string;
  userId: string;
  pair: string;
  condition: 'above' | 'below' | 'equals';
  targetPrice: number;
  currentPrice: number;
  status: 'active' | 'triggered' | 'cancelled';
  triggeredAt?: string;
  createdAt: string;
}

export interface CreateForexAlert {
  pair: string;
  condition: 'above' | 'below' | 'equals';
  targetPrice: number;
}

@Injectable({
  providedIn: 'root',
})
export class ForexService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  // Account
  getAccount(type?: 'real' | 'demo'): Observable<ForexAccount> {
    const params = type ? new HttpParams().set('type', type) : new HttpParams();
    return this.http.get<ForexAccount>(`${this.API_URL}/forex/account`, {
      params,
    });
  }

  createDemoAccount(initialBalance: number = 10000): Observable<ForexAccount> {
    return this.http.post<ForexAccount>(`${this.API_URL}/forex/demo/account`, {
      initialBalance,
    });
  }

  // Market Data
  getPairs(): Observable<ForexPair[]> {
    return this.http.get<ForexPair[]>(`${this.API_URL}/forex/pairs`);
  }

  getPair(symbol: string): Observable<ForexPair> {
    return this.http.get<ForexPair>(`${this.API_URL}/forex/pairs/${symbol}`);
  }

  // Trading
  createTrade(trade: CreateForexTrade): Observable<ForexTrade> {
    return this.http.post<ForexTrade>(`${this.API_URL}/forex/trades`, trade);
  }

  getTrades(params?: {
    pair?: string;
    status?: string;
  }): Observable<ForexTrade[]> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.pair) httpParams = httpParams.set('pair', params.pair);
      if (params.status) httpParams = httpParams.set('status', params.status);
    }
    return this.http.get<ForexTrade[]>(`${this.API_URL}/forex/trades`, {
      params: httpParams,
    });
  }

  getTrade(id: string): Observable<ForexTrade> {
    return this.http.get<ForexTrade>(`${this.API_URL}/forex/trades/${id}`);
  }

  closeTrade(id: string): Observable<ForexTrade> {
    return this.http.post<ForexTrade>(
      `${this.API_URL}/forex/trades/${id}/close`,
      {}
    );
  }

  // Positions
  getPositions(): Observable<ForexPosition[]> {
    return this.http.get<ForexPosition[]>(`${this.API_URL}/forex/positions`);
  }

  // Risk Management
  updateStopLoss(tradeId: string, stopLoss: number): Observable<ForexTrade> {
    return this.http.put<ForexTrade>(
      `${this.API_URL}/forex/trades/${tradeId}/stop-loss`,
      { stopLoss }
    );
  }

  updateTakeProfit(
    tradeId: string,
    takeProfit: number
  ): Observable<ForexTrade> {
    return this.http.put<ForexTrade>(
      `${this.API_URL}/forex/trades/${tradeId}/take-profit`,
      { takeProfit }
    );
  }

  // Alerts
  createAlert(alert: CreateForexAlert): Observable<ForexAlert> {
    return this.http.post<ForexAlert>(`${this.API_URL}/forex/alerts`, alert);
  }

  getAlerts(): Observable<ForexAlert[]> {
    return this.http.get<ForexAlert[]>(`${this.API_URL}/forex/alerts`);
  }

  deleteAlert(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/forex/alerts/${id}`);
  }

  // Demo Trading
  createDemoTrade(trade: CreateForexTrade): Observable<ForexTrade> {
    return this.http.post<ForexTrade>(`${this.API_URL}/forex/demo/trades`, {
      ...trade,
      useDemoAccount: true,
    });
  }
}
