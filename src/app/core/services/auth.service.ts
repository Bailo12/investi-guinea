import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import * as CryptoJS from 'crypto-js';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  kycStatus?: 'pending' | 'under-review' | 'approved' | 'rejected';
  kycLevel?: 'basic' | 'intermediate' | 'advanced';
  walletId?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  nationality?: string;
  address?: string;
  city?: string;
  country?: string;
  idType?: 'passport' | 'national-id' | 'drivers-license';
  idNumber?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly API_URL = environment.apiUrl;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';
  private readonly ENCRYPTION_KEY = 'neo-tech-secure-key-2024'; // In production, use environment variable

  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Check if token is expired on initialization
    if (this.isTokenExpired()) {
      this.logout();
    }
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, credentials).pipe(
      tap(response => {
        this.setAuthData(response.token, response.user);
        this.currentUserSubject.next(response.user);
      })
    );
  }

  register(data: RegisterData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/register`, data).pipe(
      tap(response => {
        this.setAuthData(response.token, response.user);
        this.currentUserSubject.next(response.user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    const encryptedToken = localStorage.getItem(this.TOKEN_KEY);
    if (!encryptedToken) return null;
    
    try {
      return this.decrypt(encryptedToken);
    } catch {
      return null;
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && !this.isTokenExpired();
  }

  private setAuthData(token: string, user: User): void {
    const encryptedToken = this.encrypt(token);
    const encryptedUser = this.encrypt(JSON.stringify(user));
    
    localStorage.setItem(this.TOKEN_KEY, encryptedToken);
    localStorage.setItem(this.USER_KEY, encryptedUser);
  }

  private getStoredUser(): User | null {
    const encryptedUser = localStorage.getItem(this.USER_KEY);
    if (!encryptedUser) return null;
    
    try {
      const decrypted = this.decrypt(encryptedUser);
      return JSON.parse(decrypted);
    } catch {
      return null;
    }
  }

  private isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      return Date.now() >= expirationTime;
    } catch {
      return true;
    }
  }

  private encrypt(text: string): string {
    return CryptoJS.AES.encrypt(text, this.ENCRYPTION_KEY).toString();
  }

  private decrypt(encryptedText: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedText, this.ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}

