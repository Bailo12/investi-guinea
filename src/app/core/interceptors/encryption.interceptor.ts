import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { EncryptionService } from '../services/encryption.service';

/**
 * Interceptor to encrypt sensitive transaction data before sending to server
 */
export const encryptionInterceptor: HttpInterceptorFn = (req, next) => {
  const encryptionService = inject(EncryptionService);

  // Only encrypt sensitive endpoints
  const sensitiveEndpoints = [
    '/wallet/deposit',
    '/wallet/withdraw',
    '/products/invest',
    '/crypto/trades',
    '/forex/trades'
  ];

  const shouldEncrypt = sensitiveEndpoints.some(endpoint => req.url.includes(endpoint));

  if (shouldEncrypt && req.body) {
    // Get user encryption key (should be stored securely)
    const userKey = localStorage.getItem('user_encryption_key') || 'default-key';
    
    // Encrypt transaction data
    if (req.body && typeof req.body === 'object') {
      const encrypted = encryptionService.encrypt(req.body, userKey);
      req = req.clone({
        body: {
          encrypted: true,
          data: encrypted.data,
          iv: encrypted.iv,
          algorithm: encrypted.algorithm
        }
      });
    }
  }

  return next(req);
};


