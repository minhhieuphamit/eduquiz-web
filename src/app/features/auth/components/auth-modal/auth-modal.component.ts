import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { AuthModalService } from '../../../../core/services/auth-modal.service';
import { AuthService, getAuthErrorMessage, validatePassword } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-auth-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthModalComponent {
  modalService = inject(AuthModalService);
  authService = inject(AuthService);

  isLoading = signal(false);

  // Form Models
  loginData = { email: '', password: '' };
  registerData = { 
    firstName: '', 
    lastName: '', 
    email: '', 
    phoneNumber: '', 
    dob: '', 
    password: '', 
    confirmPassword: '', 
    role: 'STUDENT' 
  };
  otpData = { email: '', otp: '' };
  forgotData = { email: '' };
  resetData = { otp: '', newPassword: '', confirmPassword: '' };

  closeModal() {
    this.modalService.close();
  }

  switchView(view: 'login' | 'register' | 'otp' | 'forgot-password' | 'reset-password') {
    this.modalService.switchView(view);
  }

  onLoginSubmit() {
    // Basic Login Validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!this.loginData.email || !emailRegex.test(this.loginData.email)) {
      toast.warning('Email không đúng định dạng.');
      return;
    }
    if (!this.loginData.password) {
      toast.warning('Vui lòng nhập mật khẩu.');
      return;
    }

    this.isLoading.set(true);
    this.authService.login(this.loginData).subscribe({
      next: () => {
        this.authService.getMe().subscribe({
          next: () => {
            this.isLoading.set(false);
            toast.success('Đăng nhập thành công!');
            this.closeModal();
          },
          error: (err) => {
            this.isLoading.set(false);
            toast.error('Không thể lấy thông tin người dùng.');
            console.error('GetMe error', err);
          }
        });
      },
      error: (err) => {
        this.isLoading.set(false);
        toast.error(getAuthErrorMessage(err));
        console.error('Login error', err);
      }
    });
  }

  onRegisterSubmit() {
    // First Name / Last Name Validation
    if (!this.registerData.firstName?.trim()) {
      toast.warning('Họ đệm không được để trống.');
      return;
    }
    if (this.registerData.firstName.length > 50) {
      toast.warning('Họ đệm không được vượt quá 50 ký tự.');
      return;
    }

    if (!this.registerData.lastName?.trim()) {
      toast.warning('Tên không được để trống.');
      return;
    }
    if (this.registerData.lastName.length > 50) {
      toast.warning('Tên không được vượt quá 50 ký tự.');
      return;
    }

    // Email Validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!this.registerData.email || !emailRegex.test(this.registerData.email)) {
      toast.warning('Email không hợp lệ. Vui lòng kiểm tra lại.');
      return;
    }
    if (this.registerData.email.length > 255) {
      toast.warning('Email không được vượt quá 255 ký tự.');
      return;
    }

    // Phone Number Validation
    if (this.registerData.phoneNumber) {
      const phoneRegex = /^(\+?[0-9]{9,15})?$/;
      if (!phoneRegex.test(this.registerData.phoneNumber)) {
        toast.warning('Số điện thoại không hợp lệ.');
        return;
      }
    }

    // Date of Birth Validation
    if (!this.registerData.dob) {
      toast.warning('Vui lòng chọn ngày sinh.');
      return;
    }

    const pwdError = validatePassword(this.registerData.password);
    if (pwdError) {
      toast.warning(pwdError);
      return;
    }

    if (this.registerData.password !== this.registerData.confirmPassword) {
      toast.warning('Mật khẩu xác nhận không khớp.');
      return;
    }

    this.isLoading.set(true);

    // Create payload matching the API (omit confirmPassword)
    const payload = {
      firstName: this.registerData.firstName,
      lastName: this.registerData.lastName,
      email: this.registerData.email,
      phoneNumber: this.registerData.phoneNumber,
      dob: this.registerData.dob,
      password: this.registerData.password,
      role: this.registerData.role // Allow choosing STUDENT or TEACHER
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        toast.success('Đăng ký thành công! Vui lòng kiểm tra email để lấy mã OTP.');
        this.otpData.email = payload.email;
        this.switchView('otp');
      },
      error: (err) => {
        this.isLoading.set(false);
        toast.error(getAuthErrorMessage(err));
        console.error('Register error', err);
      }
    });
  }

  onVerifyOtpSubmit() {
    this.isLoading.set(true);

    this.authService.verifyOtp(this.otpData).subscribe({
      next: () => {
        this.isLoading.set(false);
        toast.success('Xác thực thành công! Bạn có thể đăng nhập ngay bây giờ.');
        this.switchView('login');
      },
      error: (err) => {
        this.isLoading.set(false);
        toast.error(getAuthErrorMessage(err));
        console.error('OTP error', err);
      }
    });
  }

  resendOtp() {
    this.isLoading.set(true);
    this.authService.resendOtp(this.otpData.email).subscribe({
      next: () => {
        this.isLoading.set(false);
        toast.success('Mã OTP mới đã được gửi đến email của bạn.');
      },
      error: (err) => {
        this.isLoading.set(false);
        toast.error(getAuthErrorMessage(err));
      }
    });
  }

  onForgotPasswordSubmit() {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!this.forgotData.email || !emailRegex.test(this.forgotData.email)) {
      toast.warning('Vui lòng nhập email hợp lệ.');
      return;
    }

    this.isLoading.set(true);
    this.authService.forgotPassword(this.forgotData.email).subscribe({
      next: () => {
        this.isLoading.set(false);
        toast.success('Mã OTP đã được gửi đến email của bạn.');
        this.resetData = { otp: '', newPassword: '', confirmPassword: '' };
        this.switchView('reset-password');
      },
      error: (err) => {
        this.isLoading.set(false);
        toast.error(getAuthErrorMessage(err));
      }
    });
  }

  onResetPasswordSubmit() {
    if (!this.resetData.otp || this.resetData.otp.length !== 6) {
      toast.warning('Vui lòng nhập mã OTP 6 số.');
      return;
    }

    const pwdError = validatePassword(this.resetData.newPassword);
    if (pwdError) {
      toast.warning(pwdError);
      return;
    }

    if (this.resetData.newPassword !== this.resetData.confirmPassword) {
      toast.warning('Mật khẩu xác nhận không khớp.');
      return;
    }

    this.isLoading.set(true);
    this.authService.resetPassword({
      email: this.forgotData.email,
      otp: this.resetData.otp,
      newPassword: this.resetData.newPassword
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        toast.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập.');
        this.switchView('login');
      },
      error: (err) => {
        this.isLoading.set(false);
        toast.error(getAuthErrorMessage(err));
      }
    });
  }

  resendForgotOtp() {
    this.isLoading.set(true);
    this.authService.forgotPassword(this.forgotData.email).subscribe({
      next: () => {
        this.isLoading.set(false);
        toast.success('Mã OTP mới đã được gửi đến email của bạn.');
      },
      error: (err) => {
        this.isLoading.set(false);
        toast.error(getAuthErrorMessage(err));
      }
    });
  }
}
