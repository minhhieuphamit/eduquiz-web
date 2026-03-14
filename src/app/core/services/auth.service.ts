import { Injectable } from '@angular/core';

/**
 * AuthService - Quản lý authentication.
 *
 * Methods:
 * - register(request: RegisterRequest): Observable<ApiResponse>
 * - verifyOtp(request: VerifyOtpRequest): Observable<ApiResponse>
 * - resendOtp(email: string): Observable<ApiResponse>
 * - login(request: LoginRequest): Observable<ApiResponse<AuthResponse>>
 * - refreshToken(): Observable<ApiResponse<AuthResponse>>
 * - logout(): Observable<ApiResponse>
 * - getMe(): Observable<ApiResponse<User>>
 * - forgotPassword(email: string): Observable<ApiResponse>
 * - resetPassword(request: ResetPasswordRequest): Observable<ApiResponse>
 * - changePasswordInit(): Observable<ApiResponse>
 * - changePassword(request: ChangePasswordRequest): Observable<ApiResponse>
 * - updateProfile(request: UpdateProfileRequest): Observable<ApiResponse<User>>
 *
 * Token management:
 * - saveTokens(authResponse): void → lưu vào localStorage
 * - getAccessToken(): string | null
 * - getRefreshToken(): string | null
 * - removeTokens(): void
 * - isLoggedIn(): boolean
 * - getCurrentUser(): User | null (cached)
 * - getUserRole(): string | null
 *
 * TODO: Implement @Injectable({ providedIn: 'root' })
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  // TODO: Implement
}
