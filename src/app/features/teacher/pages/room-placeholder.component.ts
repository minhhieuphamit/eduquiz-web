import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-room-placeholder',
  imports: [RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="placeholder-container">
      <div class="placeholder-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      </div>
      <h2>Quản lý phòng thi</h2>
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
export class RoomPlaceholderComponent {}
