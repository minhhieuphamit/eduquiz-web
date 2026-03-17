import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/api-response.model';
import { AuthResponse } from '../../models/auth.model';

export interface UserInfo {
  email: string;
  firstName: string;
  lastName: string;
  dob: string;
  phoneNumber: string;
  role: string;
}

// Validates password matching BE's StrongPasswordValidator (same order, same messages)
export function validatePassword(password: string): string | null {
  if (!password || password.length < 8) {
    return 'Mật khẩu phải có ít nhất 8 ký tự.';
  }
  if (password.length > 50) {
    return 'Mật khẩu không được vượt quá 50 ký tự.';
  }
  if (!/[a-z]/.test(password)) {
    return 'Mật khẩu phải chứa ít nhất 1 chữ thường.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Mật khẩu phải chứa ít nhất 1 chữ hoa.';
  }
  if (!/\d/.test(password)) {
    return 'Mật khẩu phải chứa ít nhất 1 chữ số.';
  }
  if (!/[@$!%*?&]/.test(password)) {
    return 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (@$!%*?&).';
  }
  return null;
}

// Maps BE error codes to Vietnamese messages
export function getAuthErrorMessage(err: any): string {
  const code: number = err?.error?.code;
  const messages: Record<number, string> = {
    2401: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.',
    2402: 'Email hoặc mật khẩu không đúng.',
    2403: 'Token không hợp lệ.',
    2404: 'Token đã hết hạn.',
    2407: 'Tài khoản chưa xác thực email. Vui lòng kiểm tra hộp thư.',
    2408: 'Bạn không có quyền thực hiện thao tác này.',
    2409: 'Tài khoản đã bị khóa. Vui lòng liên hệ hỗ trợ.',
    2410: 'Mật khẩu hiện tại không đúng.',
    2411: 'Mật khẩu mới không được trùng với mật khẩu cũ.',
    2501: 'Mã OTP không đúng.',
    2502: 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.',
    2503: 'Mã OTP đã được sử dụng.',
    2504: 'Đã vượt quá số lần thử OTP. Vui lòng yêu cầu mã mới.',
    2505: 'Đã vượt quá giới hạn gửi lại OTP. Vui lòng thử lại sau.',
    2506: 'Không tìm thấy mã OTP. Vui lòng yêu cầu gửi lại.',
    2507: 'Email đã được xác thực trước đó.',
    2508: 'Không thể gửi email. Vui lòng thử lại sau.',
    3401: 'Không tìm thấy người dùng với email này.',
    3402: 'Email này đã được đăng ký.',
    1400: 'Yêu cầu không hợp lệ. Vui lòng kiểm tra lại thông tin.',
    1500: 'Lỗi hệ thống. Vui lòng thử lại sau.',
  };
  return messages[code] ?? 'Đã xảy ra lỗi. Vui lòng thử lại.';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;
  private apiKey = environment.apiKey;

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

  verifyOtp(data: { email: string; otp: string }): Observable<ApiResponse<void>> {
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
