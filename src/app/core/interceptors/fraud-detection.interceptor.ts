import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { FraudDetectionService } from '../services/fraud-detection.service';
import { switchMap, catchError } from 'rxjs/operators';
import { of, throwError } from 'rxjs';

/**
 * Interceptor to analyze transactions for fraud before processing
 */
export const fraudDetectionInterceptor: HttpInterceptorFn = (req, next) => {
  const fraudService = inject(FraudDetectionService);

  // Only analyze transaction endpoints
  const transactionEndpoints = [
    '/wallet/deposit',
    '/wallet/withdraw',
    '/products/invest',
    '/crypto/trades',
    '/forex/trades'
  ];

  const shouldAnalyze = transactionEndpoints.some(endpoint => req.url.includes(endpoint));

  if (shouldAnalyze && req.method === 'POST' && req.body) {
    // Analyze transaction for fraud
    const transaction = {
      amount: req.body.amount || 0,
      currency: req.body.currency || 'GNF',
      type: req.url.split('/').pop() || 'unknown',
      userId: 'current-user', // Should be injected from auth service
      timestamp: new Date().toISOString(),
      metadata: req.body
    };

    // Note: In production, this should be done synchronously or the request should wait
    // For now, we'll log the analysis but continue with the request
    fraudService.analyzeTransaction(transaction).subscribe({
      next: (risk) => {
        if (risk.recommendation === 'block') {
          console.error('Transaction blocked due to high fraud risk', risk);
          // In production, this should block the request
        }
        if (risk.recommendation === 'review') {
          console.warn('Transaction flagged for review', risk);
        }
      },
      error: (error) => {
        console.error('Fraud detection error:', error);
      }
    });

    return next(req);
  }

  return next(req);
};

