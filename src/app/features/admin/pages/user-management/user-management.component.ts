import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-user-management',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="placeholder-page">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      <h2>Quản lý người dùng</h2>
      <p>Tính năng đang được phát triển.</p>
    </div>
  `,
  styles: [`
    .placeholder-page {
      text-align: center;
      padding: 4rem 2rem;
      color: #718096;
    }
    h2 { color: #2D3748; margin: 1rem 0 0.5rem; }
    p { margin: 0; }
  `]
})
export class UserManagementComponent {}
