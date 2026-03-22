import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-chapter-management',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="placeholder-page">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
      <h2>Quản lý câu hỏi</h2>
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
export class ChapterManagementComponent {}
