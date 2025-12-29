import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FraudAlert {
  id: string;
  userId: string;
  type:
    | 'suspicious-transaction'
    | 'unusual-activity'
    | 'multiple-failed-attempts'
    | 'anomaly-detected';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  transactionId?: string;
  riskScore: number; // 0-100
  status: 'pending' | 'reviewed' | 'resolved' | 'false-positive';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface FraudRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  threshold: number;
  action: 'alert' | 'block' | 'review';
}

export interface TransactionRisk {
  transactionId: string;
  riskScore: number;
  riskFactors: string[];
  recommendation: 'approve' | 'review' | 'block';
  fraudProbability: number;
}

export interface FraudStats {
  totalAlerts: number;
  criticalAlerts: number;
  resolvedAlerts: number;
  falsePositives: number;
  averageRiskScore: number;
  alertsByType: {
    type: string;
    count: number;
  }[];
}

export interface AnomalyDetection {
  userId: string;
  anomalyType:
    | 'unusual-amount'
    | 'unusual-time'
    | 'unusual-location'
    | 'velocity-check';
  detectedAt: string;
  details: any;
}

@Injectable({
  providedIn: 'root',
})
export class FraudDetectionService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  private alertsSubject = new BehaviorSubject<FraudAlert[]>([]);
  public alerts$ = this.alertsSubject.asObservable();

  /**
   * Analyze transaction for fraud
   */
  analyzeTransaction(transaction: {
    amount: number;
    currency: string;
    type: string;
    userId: string;
    timestamp: string;
    metadata?: any;
  }): Observable<TransactionRisk> {
    return this.http.post<TransactionRisk>(
      `${this.API_URL}/security/fraud/analyze`,
      transaction
    );
  }

  /**
   * Get fraud alerts
   */
  getAlerts(params?: {
    status?: string;
    severity?: string;
    limit?: number;
  }): Observable<FraudAlert[]> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.severity)
        httpParams = httpParams.set('severity', params.severity);
      if (params.limit)
        httpParams = httpParams.set('limit', String(params.limit));
    }
    return this.http.get<FraudAlert[]>(
      `${this.API_URL}/security/fraud/alerts`,
      { params: httpParams }
    );
  }

  /**
   * Get fraud statistics
   */
  getStats(period?: 'daily' | 'weekly' | 'monthly'): Observable<FraudStats> {
    const params = period
      ? new HttpParams().set('period', period)
      : new HttpParams();
    return this.http.get<FraudStats>(`${this.API_URL}/security/fraud/stats`, {
      params,
    });
  }

  /**
   * Review fraud alert
   */
  reviewAlert(
    alertId: string,
    decision: 'resolved' | 'false-positive',
    notes?: string
  ): Observable<void> {
    return this.http.post<void>(
      `${this.API_URL}/security/fraud/alerts/${alertId}/review`,
      {
        decision,
        notes,
      }
    );
  }

  /**
   * Get fraud rules
   */
  getRules(): Observable<FraudRule[]> {
    return this.http.get<FraudRule[]>(`${this.API_URL}/security/fraud/rules`);
  }

  /**
   * Update fraud rule
   */
  updateRule(
    ruleId: string,
    updates: Partial<FraudRule>
  ): Observable<FraudRule> {
    return this.http.put<FraudRule>(
      `${this.API_URL}/security/fraud/rules/${ruleId}`,
      updates
    );
  }

  /**
   * Get anomalies
   */
  getAnomalies(userId?: string): Observable<AnomalyDetection[]> {
    const params = userId
      ? new HttpParams().set('userId', userId)
      : new HttpParams();
    return this.http.get<AnomalyDetection[]>(
      `${this.API_URL}/security/fraud/anomalies`,
      { params }
    );
  }

  /**
   * Report suspicious activity
   */
  reportSuspiciousActivity(report: {
    type: string;
    description: string;
    transactionId?: string;
    userId?: string;
  }): Observable<void> {
    return this.http.post<void>(
      `${this.API_URL}/security/fraud/report`,
      report
    );
  }
}
