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
    fullName: string;
    email: string;
    role: string;
    lastLogin: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private logoutTimer: any;
  private currentUserSubject = new BehaviorSubject<any>(this.getUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

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
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    this.scheduleAutoLogout(60 * 60 * 1000);
  }

  storeUser(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
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
    return user?.role === 'Admin';
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    if (this.logoutTimer) clearTimeout(this.logoutTimer);
  }

  private scheduleAutoLogout(ms: number): void {
    if (this.logoutTimer) clearTimeout(this.logoutTimer);
    this.logoutTimer = setTimeout(() => this.logout(), ms);
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }
}