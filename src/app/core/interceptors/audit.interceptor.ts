import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SecurityAuditService } from '../services/security-audit.service';
import { tap } from 'rxjs/operators';

/**
 * Interceptor to log all security-relevant requests
 */
export const auditInterceptor: HttpInterceptorFn = (req, next) => {
  const auditService = inject(SecurityAuditService);

  // Log security-relevant requests
  const securityEndpoints = [
    '/auth',
    '/wallet',
    '/products',
    '/crypto',
    '/forex',
    '/kyc',
    '/security'
  ];

  const shouldAudit = securityEndpoints.some(endpoint => req.url.includes(endpoint));

  if (shouldAudit) {
    const event = {
      type: getEventType(req.url, req.method),
      severity: getSeverity(req.url, req.method),
      description: `${req.method} ${req.url}`,
      ipAddress: 'client-ip', // Should be extracted from request
      metadata: {
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
      }
    };

    auditService.logEvent(event).subscribe();
  }

  return next(req);
};

function getEventType(url: string, method: string): 'login-attempt' | 'transaction' | 'data-access' | 'configuration-change' | 'security-alert' {
  if (url.includes('/auth')) return 'login-attempt';
  if (url.includes('/wallet') || url.includes('/trades')) return 'transaction';
  if (url.includes('/security') || url.includes('/audit')) return 'security-alert';
  if (method === 'PUT' || method === 'DELETE') return 'configuration-change';
  return 'data-access';
}

function getSeverity(url: string, method: string): 'info' | 'warning' | 'error' | 'critical' {
  if (url.includes('/security') || url.includes('/fraud')) return 'critical';
  if (method === 'DELETE') return 'error';
  if (url.includes('/wallet') || url.includes('/trades')) return 'warning';
  return 'info';
}


