import { Component } from '@angular/core';

/**
 * Auth Layout - Dùng cho trang Login, Register, OTP, Forgot Password.
 * Không có header/footer, chỉ có centered card.
 *
 * TODO: Implement
 */
@Component({
  selector: 'app-auth-layout',
  standalone: true,
  template: `
    <div class="auth-container">
      <router-outlet></router-outlet>
    </div>
  `,
})
export class AuthLayoutComponent {}
