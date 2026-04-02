import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiResponse } from '../../models/api-response.model';
import { AuthResponse } from '../../models/auth.model';
import { ApiService } from './api.service';

export interface UserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dob: string;
  phoneNumber: string;
  role: string;
}

/** Validates password matching BE's StrongPasswordValidator (same order, same messages) */
export function validatePassword(password: string): string | null {
  if (!password || password.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự.';
  if (password.length > 50) return 'Mật khẩu không được vượt quá 50 ký tự.';
  if (!/[a-z]/.test(password)) return 'Mật khẩu phải chứa ít nhất 1 chữ thường.';
  if (!/[A-Z]/.test(password)) return 'Mật khẩu phải chứa ít nhất 1 chữ hoa.';
  if (!/\d/.test(password)) return 'Mật khẩu phải chứa ít nhất 1 chữ số.';
  if (!/[@$!%*?&]/.test(password)) return 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (@$!%*?&).';
  return null;
}

/** Maps BE error codes to Vietnamese messages */
export function getAuthErrorMessage(err: unknown): string {
  const code: number = (err as any)?.error?.code;
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

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);
  private http = this.api.http;
  private apiUrl = `${this.api.baseUrl}/auth`;

  public currentUser = signal<UserInfo | null>(null);

  constructor() {
    const cached = this.api.getUserFromStorage<UserInfo>();
    if (cached) {
      this.currentUser.set(cached);
      // Refresh if cached data is missing id (old cache format)
      if (!cached.id && this.api.getAccessToken()) {
        this.getMe().subscribe();
      }
    }
  }

  login(credentials: object): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, credentials, {
      headers: this.api.createHeaders(false),
    }).pipe(tap(res => this.api.setTokens(res.data.accessToken, res.data.refreshToken)));
  }

  getMe(): Observable<ApiResponse<UserInfo>> {
    return this.http.get<ApiResponse<UserInfo>>(`${this.apiUrl}/me`, {
      headers: this.api.createHeaders(),
    }).pipe(tap(res => {
      this.currentUser.set(res.data);
      this.api.setUserInStorage(res.data);
    }));
  }

  register(userData: object): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/register`, userData, {
      headers: this.api.createHeaders(false),
    });
  }

  verifyOtp(data: { email: string; otp: string }): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/verify-otp`, data, {
      headers: this.api.createHeaders(false),
    });
  }

  resendOtp(email: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/resend-otp?email=${encodeURIComponent(email)}`, {},
      { headers: this.api.createHeaders(false) },
    );
  }

  updateProfile(data: object): Observable<ApiResponse<UserInfo>> {
    return this.http.patch<ApiResponse<UserInfo>>(`${this.apiUrl}/profile`, data, {
      headers: this.api.createHeaders(),
    });
  }

  requestPasswordChange(data: object): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/password-change/request`, data, {
      headers: this.api.createHeaders(),
    });
  }

  confirmPasswordChange(data: object): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/password-change/confirm`, data, {
      headers: this.api.createHeaders(),
    });
  }

  forgotPassword(email: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/forgot-password`, { email }, {
      headers: this.api.createHeaders(false),
    });
  }

  resetPassword(data: { email: string; otp: string; newPassword: string }): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/reset-password`, data, {
      headers: this.api.createHeaders(false),
    });
  }

  logout() {
    this.api.clearStorage();
    this.currentUser.set(null);
  }
}
