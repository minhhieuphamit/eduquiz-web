import { ChangeDetectionStrategy, Component, inject, OnInit, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toast } from 'ngx-sonner';
import { AuthService, UserInfo } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent implements OnInit {
  public authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isLoading = signal(false);

  constructor() {
    // Redirection effect: if user logs out while on this page, jump to home
    effect(() => {
      if (!this.authService.currentUser()) {
        this.router.navigate(['/']);
      }
    });
  }
  errorMsg = signal('');
  
  // Profile Form Model
  profileData = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dob: '',
    role: ''
  };
  
  // Password Change Form Model
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  
  // View Toggle: 'profile' | 'password'
  currentTab = signal<'profile' | 'password'>('profile');

  ngOnInit() {
    this.loadUserData();
    this.route.queryParams.subscribe(params => {
      const newTab = params['tab'];
      if (newTab === 'password' && this.currentTab() !== 'password') {
        this.setTab('password');
      } else if (newTab === 'profile' && this.currentTab() !== 'profile') {
        this.setTab('profile');
      } else if (!newTab && this.currentTab() !== 'profile') {
         // Default to profile if no tab param is present
         this.setTab('profile');
      }
    });
  }

  loadUserData() {
    const user = this.authService.currentUser();
    if (user) {
      this.populateForm(user);
    } else {
      // Force fetch if signal is empty but token exists
      this.authService.getMe().subscribe({
        next: (res) => {
          this.populateForm(res.data);
        },
        error: (err) => {
          console.error('Lỗi tải thông tin user', err);
        }
      });
    }
  }

  private populateForm(user: any) {
    this.profileData.firstName = user.firstName || '';
    this.profileData.lastName = user.lastName || '';
    this.profileData.email = user.email || '';
    this.profileData.phoneNumber = user.phoneNumber || '';
    
    if (user.dob) {
      const d = new Date(user.dob);
      if (!isNaN(d.getTime())) {
        const month = ('0' + (d.getMonth() + 1)).slice(-2);
        const day = ('0' + d.getDate()).slice(-2);
        this.profileData.dob = `${d.getFullYear()}-${month}-${day}`;
      } else {
        this.profileData.dob = user.dob; // Fallback
      }
    } else {
      this.profileData.dob = '';
    }
    
    this.profileData.role = user.role || '';
  }

  getFormattedDate(): string {
    if (!this.profileData.dob) return 'dd/mm/yyyy';
    const parts = this.profileData.dob.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return this.profileData.dob;
  }

  onDateChange(event: any) {
    this.profileData.dob = event.target.value;
  }

  onProfileSubmit() {
    this.errorMsg.set('');

    // Validate required logic
    if (!this.profileData.firstName?.trim() || !this.profileData.lastName?.trim()) {
      this.errorMsg.set('Họ và tên không được để trống.');
      return;
    }

    this.isLoading.set(true);

    const payload = {
      firstName: this.profileData.firstName,
      lastName: this.profileData.lastName,
      phoneNumber: this.profileData.phoneNumber,
      dob: this.profileData.dob
    };

    this.authService.updateProfile(payload).subscribe({
      next: (res) => {
        this.authService.getMe().subscribe({
          next: (userRes) => {
            this.isLoading.set(false);
            toast.success('Cập nhật hồ sơ thành công!');
            this.authService.currentUser.set(userRes.data);
            this.populateForm(userRes.data);
          },
          error: () => {
            this.isLoading.set(false);
            toast.success('Cập nhật hồ sơ thành công!');
            this.authService.currentUser.set(res.data);
            this.populateForm(res.data);
          }
        });
      },
      error: (err) => {
        this.isLoading.set(false);
        toast.error(err.error?.message || 'Cập nhật thất bại. Vui lòng thử lại sau.');
      }
    });
  }

  otpRequested = signal(false);
  otp = '';

  onPasswordSubmit() {
    this.errorMsg.set('');

    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.errorMsg.set('Mật khẩu xác nhận không khớp.');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(this.passwordData.newPassword)) {
      this.errorMsg.set('Mật khẩu mới phải đủ mạnh (hoa, thường, số, ký tự đặc biệt).');
      return;
    }

    this.isLoading.set(true);
    const payload = {
      oldPassword: this.passwordData.currentPassword,
      newPassword: this.passwordData.newPassword
    };

    if (!this.otpRequested()) {
      this.authService.requestPasswordChange(payload).subscribe({
        next: () => {
          this.isLoading.set(false);
          toast.info('Vui lòng kiểm tra email để lấy mã OTP xác nhận.');
          this.otpRequested.set(true);
        },
        error: (err: any) => {
          this.isLoading.set(false);
          toast.error(err.error?.message || 'Yêu cầu đổi mật khẩu thất bại.');
        }
      });
    } else {
      if (!this.otp) {
         this.errorMsg.set('Vui lòng nhập mã OTP');
         this.isLoading.set(false);
         return;
      }
      this.authService.confirmPasswordChange({ otp: this.otp }).subscribe({
        next: () => {
          this.isLoading.set(false);
          toast.success('Đổi mật khẩu thành công!');
          this.passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };
          this.otpRequested.set(false);
          this.otp = '';
          setTimeout(() => this.currentTab.set('profile'), 2000);
        },
        error: (err: any) => {
          this.isLoading.set(false);
          toast.error(err.error?.message || 'Xác nhận OTP thất bại.');
        }
      });
    }
  }

  setTab(tab: 'profile' | 'password') {
    this.currentTab.set(tab);
    this.errorMsg.set('');
    this.otpRequested.set(false);
    this.otp = '';
  }
}
