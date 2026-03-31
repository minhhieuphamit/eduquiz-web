import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-teacher-layout',
  imports: [RouterModule],
  templateUrl: './teacher-layout.component.html',
  styleUrls: ['./teacher-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick()'
  }
})
export class TeacherLayoutComponent {
  private router = inject(Router);
  protected authService = inject(AuthService);

  protected sidebarOpen = signal(true);
  protected userDropdownOpen = signal(false);

  protected toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }

  protected isActive(path: string): boolean {
    if (path === '/teacher') return this.router.url === '/teacher';
    return this.router.url.startsWith(path);
  }

  protected toggleUserDropdown(event: Event) {
    event.stopPropagation();
    this.userDropdownOpen.update(v => !v);
  }

  protected navigateToProfile() {
    this.userDropdownOpen.set(false);
    this.router.navigate(['/profile']);
  }

  protected logout() {
    this.userDropdownOpen.set(false);
    this.authService.logout();
    this.router.navigate(['/']);
  }

  onDocumentClick() {
    this.userDropdownOpen.set(false);
  }
}
