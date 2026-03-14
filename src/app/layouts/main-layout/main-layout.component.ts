import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

/**
 * Main Layout - Dùng cho các trang sau khi đăng nhập.
 * Gồm: Header (navbar + user info) + <router-outlet> + Footer
 *
 * Header hiển thị khác nhau theo role:
 * - STUDENT: Dashboard, Thi thử, Phòng thi, Leaderboard
 * - TEACHER: Dashboard, Câu hỏi, Đề thi, Phòng thi
 * - ADMIN: Dashboard, Môn học, Users
 *
 * TODO: Implement
 */
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <app-header></app-header>
    <main class="container">
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
  `,
})
export class MainLayoutComponent {}
