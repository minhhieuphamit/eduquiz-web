import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;
  private apiKey = environment.apiKey;

  // Global User State
  public currentUser = signal<UserInfo | null>(null);

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      this.currentUser.set(JSON.parse(userJson));
    }
  }

  private saveTokens(data: AuthResponse) {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.currentUser.set(null);
  }

  private getHeaders(includeAuth = false): HttpHeaders {
    let headers = new HttpHeaders({
      'x-api-key': this.apiKey,
      'x-request-id': crypto.randomUUID()
    });
    if (includeAuth) {
      const token = localStorage.getItem('accessToken');
      if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  login(credentials: object): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, credentials, { headers: this.getHeaders() })
      .pipe(tap(res => this.saveTokens(res.data)));
  }

  getMe(): Observable<ApiResponse<UserInfo>> {
    return this.http.get<ApiResponse<UserInfo>>(`${this.apiUrl}/me`, { headers: this.getHeaders(true) })
      .pipe(tap(res => {
        this.currentUser.set(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
      }));
  }

  register(userData: object): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/register`, userData, { headers: this.getHeaders() });
  }

  verifyOtp(data: { email: string, otp: string }): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/verify-otp`, data, { headers: this.getHeaders() });
  }

  resendOtp(email: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/resend-otp?email=${encodeURIComponent(email)}`, {}, { headers: this.getHeaders() });
  }

  updateProfile(data: object): Observable<ApiResponse<UserInfo>> {
    return this.http.patch<ApiResponse<UserInfo>>(`${this.apiUrl}/profile`, data, { headers: this.getHeaders(true) });
  }

  requestPasswordChange(data: object): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/password-change/request`, data, { headers: this.getHeaders(true) });
  }

  confirmPasswordChange(data: object): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/password-change/confirm`, data, { headers: this.getHeaders(true) });
  }

  forgotPassword(email: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/forgot-password`, { email }, { headers: this.getHeaders() });
  }

  resetPassword(data: { email: string; otp: string; newPassword: string }): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/reset-password`, data, { headers: this.getHeaders() });
  }
}
