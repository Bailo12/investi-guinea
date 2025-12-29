import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failure' | 'blocked';
  details?: any;
  riskLevel: 'low' | 'medium' | 'high';
  timestamp: string;
}

export interface SecurityEvent {
  id: string;
  type:
    | 'login-attempt'
    | 'transaction'
    | 'data-access'
    | 'configuration-change'
    | 'security-alert';
  severity: 'info' | 'warning' | 'error' | 'critical';
  description: string;
  userId?: string;
  ipAddress: string;
  metadata?: any;
  timestamp: string;
}

export interface PenetrationTest {
  id: string;
  testType: 'automated' | 'manual';
  scope: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  findings: {
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendation: string;
    status: 'open' | 'in-progress' | 'resolved';
  }[];
  startedAt?: string;
  completedAt?: string;
  reportUrl?: string;
}

export interface SecurityCompliance {
  kycCompliance: {
    totalUsers: number;
    verifiedUsers: number;
    pendingVerification: number;
    rejectedUsers: number;
    complianceRate: number;
  };
  amlCompliance: {
    totalTransactions: number;
    screenedTransactions: number;
    flaggedTransactions: number;
    complianceRate: number;
  };
  dataProtection: {
    encryptedData: number;
    encryptionCoverage: number;
    lastAuditDate: string;
  };
  securityScore: number; // 0-100
}

@Injectable({
  providedIn: 'root',
})
export class SecurityAuditService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  /**
   * Log security event
   */
  logEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/security/audit/log`, event);
  }

  /**
   * Get audit logs
   */
  getAuditLogs(params?: {
    userId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Observable<AuditLog[]> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.userId) httpParams = httpParams.set('userId', params.userId);
      if (params.action) httpParams = httpParams.set('action', params.action);
      if (params.startDate)
        httpParams = httpParams.set('startDate', params.startDate);
      if (params.endDate)
        httpParams = httpParams.set('endDate', params.endDate);
      if (params.limit)
        httpParams = httpParams.set('limit', String(params.limit));
    }
    return this.http.get<AuditLog[]>(`${this.API_URL}/security/audit/logs`, {
      params: httpParams,
    });
  }

  /**
   * Get security events
   */
  getSecurityEvents(params?: {
    type?: string;
    severity?: string;
    startDate?: string;
    endDate?: string;
  }): Observable<SecurityEvent[]> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.type) httpParams = httpParams.set('type', params.type);
      if (params.severity)
        httpParams = httpParams.set('severity', params.severity);
      if (params.startDate)
        httpParams = httpParams.set('startDate', params.startDate);
      if (params.endDate)
        httpParams = httpParams.set('endDate', params.endDate);
    }
    return this.http.get<SecurityEvent[]>(`${this.API_URL}/security/events`, {
      params: httpParams,
    });
  }

  /**
   * Get compliance status
   */
  getComplianceStatus(): Observable<SecurityCompliance> {
    return this.http.get<SecurityCompliance>(
      `${this.API_URL}/security/compliance`
    );
  }

  /**
   * Run penetration test
   */
  runPenetrationTest(
    testType: 'automated' | 'manual',
    scope: string[]
  ): Observable<PenetrationTest> {
    return this.http.post<PenetrationTest>(
      `${this.API_URL}/security/penetration-test`,
      {
        testType,
        scope,
      }
    );
  }

  /**
   * Get penetration test results
   */
  getPenetrationTests(): Observable<PenetrationTest[]> {
    return this.http.get<PenetrationTest[]>(
      `${this.API_URL}/security/penetration-tests`
    );
  }

  /**
   * Get penetration test details
   */
  getPenetrationTest(id: string): Observable<PenetrationTest> {
    return this.http.get<PenetrationTest>(
      `${this.API_URL}/security/penetration-tests/${id}`
    );
  }

  /**
   * Export audit logs
   */
  exportAuditLogs(
    format: 'csv' | 'pdf' | 'json',
    params?: any
  ): Observable<Blob> {
    let httpParams = new HttpParams().set('format', format);
    if (params) {
      httpParams = httpParams.appendAll(params);
    }
    return this.http.get(`${this.API_URL}/security/audit/export`, {
      params: httpParams,
      responseType: 'blob',
    }) as Observable<Blob>;
  }

  /**
   * Get security metrics
   */
  getSecurityMetrics(period: 'daily' | 'weekly' | 'monthly'): Observable<{
    totalEvents: number;
    criticalEvents: number;
    failedLogins: number;
    blockedAttempts: number;
    averageResponseTime: number;
  }> {
    const params = new HttpParams().set('period', period);
    return this.http.get<{
      totalEvents: number;
      criticalEvents: number;
      failedLogins: number;
      blockedAttempts: number;
      averageResponseTime: number;
    }>(`${this.API_URL}/security/metrics`, { params });
  }
}
