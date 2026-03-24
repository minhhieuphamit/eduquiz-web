import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-exam-placeholder',
  imports: [RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="placeholder-container">
      <div class="placeholder-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      </div>
      <h2>Quản lý đề thi</h2>
      <p>Tính năng đang được phát triển</p>
    </div>
  `,
  styles: [`
    .placeholder-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      color: #64748b;
      text-align: center;
    }
    .placeholder-icon {
      margin-bottom: 1rem;
      color: #94a3b8;
    }
    h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #334155;
      margin: 0 0 0.5rem;
    }
    p {
      font-size: 0.95rem;
      margin: 0;
    }
  `]
})
export class ExamPlaceholderComponent {}
