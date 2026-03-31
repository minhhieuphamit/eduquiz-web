import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterModule],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick()'
  }
})
export class AdminLayoutComponent {
  private router = inject(Router);
  protected authService = inject(AuthService);

  protected sidebarOpen = signal(true);
  protected expandedMenu = signal<string | null>(null);
  protected userDropdownOpen = signal(false);

  protected toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }

  protected toggleMenu(label: string) {
    this.expandedMenu.update(v => v === label ? null : label);
  }

  protected isMenuExpanded(label: string): boolean {
    return this.expandedMenu() === label;
  }

  protected isActive(path: string): boolean {
    return this.router.url === path;
  }

  protected isUsersActive(): boolean {
    return this.router.url.startsWith('/admin/users');
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
