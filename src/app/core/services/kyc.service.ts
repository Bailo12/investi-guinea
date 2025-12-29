import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface KYCData {
  id?: string;
  userId: string;
  status: 'pending' | 'under-review' | 'approved' | 'rejected';
  level: 'basic' | 'intermediate' | 'advanced';
  
  // Personal Information
  dateOfBirth: string;
  nationality: string;
  address: string;
  city: string;
  country: string;
  postalCode?: string;
  
  // Identity Documents
  idType: 'passport' | 'national-id' | 'drivers-license';
  idNumber: string;
  idDocumentFront?: string; // File URL or base64
  idDocumentBack?: string; // File URL or base64
  
  // Additional Documents
  proofOfAddress?: string; // File URL or base64
  selfie?: string; // File URL or base64
  
  // AML Information
  occupation?: string;
  sourceOfFunds?: string;
  pepStatus?: boolean; // Politically Exposed Person
  sanctionsCheck?: boolean;
  
  // ID Verification
  idVerificationStatus?: 'pending' | 'verified' | 'failed' | 'manual-review';
  idVerificationProvider?: string; // 'internal' | 'external-api'
  idVerificationScore?: number; // 0-100
  idVerificationDetails?: {
    documentMatch: boolean;
    faceMatch: boolean;
    livenessCheck: boolean;
    dataExtraction: any;
  };
  
  // AML Checks
  amlChecks?: {
    sanctionsList: boolean;
    pepList: boolean;
    adverseMedia: boolean;
    riskRating: 'low' | 'medium' | 'high';
    lastChecked: string;
  };
  
  // Verification Details
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  notes?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface KYCSubmission {
  dateOfBirth: string;
  nationality: string;
  address: string;
  city: string;
  country: string;
  postalCode?: string;
  idType: 'passport' | 'national-id' | 'drivers-license';
  idNumber: string;
  idDocumentFront: File | string;
  idDocumentBack?: File | string;
  proofOfAddress?: File | string;
  selfie?: File | string;
  occupation?: string;
  sourceOfFunds?: string;
  pepStatus?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class KYCService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  getKYCStatus(): Observable<KYCData> {
    return this.http.get<KYCData>(`${this.API_URL}/kyc/status`);
  }

  submitKYC(data: KYCSubmission): Observable<KYCData> {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      const value = (data as any)[key];
      if (value !== undefined && value !== null) {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (typeof value === 'boolean') {
          formData.append(key, value.toString());
        } else {
          formData.append(key, value);
        }
      }
    });

    return this.http.post<KYCData>(`${this.API_URL}/kyc/submit`, formData);
  }

  updateKYC(data: Partial<KYCSubmission>): Observable<KYCData> {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      const value = (data as any)[key];
      if (value !== undefined && value !== null) {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (typeof value === 'boolean') {
          formData.append(key, value.toString());
        } else {
          formData.append(key, value);
        }
      }
    });

    return this.http.put<KYCData>(`${this.API_URL}/kyc/update`, formData);
  }

  getKYCDocuments(): Observable<{ [key: string]: string }> {
    return this.http.get<{ [key: string]: string }>(`${this.API_URL}/kyc/documents`);
  }

  /**
   * Verify ID document using automated verification
   */
  verifyIDDocument(documentData: {
    documentFront: File | string;
    documentBack?: File | string;
    selfie?: File | string;
  }): Observable<{
    verified: boolean;
    score: number;
    details: {
      documentMatch: boolean;
      faceMatch: boolean;
      livenessCheck: boolean;
      dataExtraction: any;
    };
  }> {
    const formData = new FormData();
    if (documentData.documentFront instanceof File) {
      formData.append('documentFront', documentData.documentFront);
    }
    if (documentData.documentBack instanceof File) {
      formData.append('documentBack', documentData.documentBack);
    }
    if (documentData.selfie instanceof File) {
      formData.append('selfie', documentData.selfie);
    }

    return this.http.post<{
      verified: boolean;
      score: number;
      details: any;
    }>(`${this.API_URL}/kyc/verify-id`, formData);
  }

  /**
   * Run AML checks
   */
  runAMLChecks(userId: string): Observable<{
    sanctionsList: boolean;
    pepList: boolean;
    adverseMedia: boolean;
    riskRating: 'low' | 'medium' | 'high';
  }> {
    return this.http.post<{
      sanctionsList: boolean;
      pepList: boolean;
      adverseMedia: boolean;
      riskRating: 'low' | 'medium' | 'high';
    }>(`${this.API_URL}/kyc/aml-checks`, { userId });
  }

  /**
   * Get compliance report
   */
  getComplianceReport(): Observable<{
    totalUsers: number;
    verifiedUsers: number;
    complianceRate: number;
    pendingReviews: number;
  }> {
    return this.http.get<{
      totalUsers: number;
      verifiedUsers: number;
      complianceRate: number;
      pendingReviews: number;
    }>(`${this.API_URL}/kyc/compliance-report`);
  }
}

