import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const BASE_URL = 'http://localhost:5253/api';

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
  }

  getUser(): any {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
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