export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dob: string;          // ISO date string, e.g. "2000-01-01"
  phoneNumber?: string;
  role: string;         // STUDENT | TEACHER
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ChangePasswordInitRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  otp: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  dob?: string;
  phoneNumber?: string;
}
