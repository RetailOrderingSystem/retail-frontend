import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

const BASE_URL = `${environment.apiUrl}/api`;

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
}

export interface LoginPayload {
  email: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user?: {
    userId: number;
    fullName: string;
    email: string;
    phone?: string;
    role?: string;
    roleName?: string;
    isEmailVerified: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
    addressLine?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private logoutTimer: any;
  private currentUserSubject = new BehaviorSubject<any>(this.getUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Initialize auth state on service creation
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    const token = localStorage.getItem('accessToken');
    const user = this.getUser();
    if (token && user) {
      this.currentUserSubject.next(user);
      // Reschedule logout timer if token exists
      this.scheduleAutoLogout(60 * 60 * 1000);
    }
  }

  register(data: RegisterPayload): Observable<any> {
    return this.http.post(`${BASE_URL}/auth/register`, data);
  }

  login(email: string): Observable<any> {
    return this.http.post(`${BASE_URL}/auth/login`, { email });
  }

  verifyOtp(data: VerifyOtpPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${BASE_URL}/auth/verify-otp`, data);
  }

  storeTokens(accessToken: string, refreshToken: string): void {
    if (!accessToken) {
      console.error('No access token provided to storeTokens');
      return;
    }
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    console.log('Tokens stored successfully');
    this.scheduleAutoLogout(60 * 60 * 1000);
  }

  storeUser(user: any): void {
    if (!user) {
      console.error('No user provided to storeUser');
      return;
    }
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
    console.log('User stored successfully', user);
  }

  getUser(): any {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  isAdmin(): boolean {
    const user = this.getUser();
    // Check both 'role' and 'roleName' fields for compatibility
    const userRole = user?.role || user?.roleName;
    return userRole === 'Admin' || userRole === 'ADMIN';
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('pendingEmail');
    this.currentUserSubject.next(null);
    if (this.logoutTimer) clearTimeout(this.logoutTimer);
    console.log('User logged out');
  }

  private scheduleAutoLogout(ms: number): void {
    if (this.logoutTimer) clearTimeout(this.logoutTimer);
    this.logoutTimer = setTimeout(() => {
      console.log('Auto logout triggered');
      this.logout();
    }, ms);
  }

  isLoggedIn(): boolean {
    const token = this.getAccessToken();
    const isLoggedIn = !!token;
    console.log('isLoggedIn check:', isLoggedIn, 'token:', token);
    return isLoggedIn;
  }
}