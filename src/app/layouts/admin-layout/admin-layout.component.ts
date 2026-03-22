import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  children?: NavChild[];
}

interface NavChild {
  label: string;
  path: string;
}

@Component({
  selector: 'app-admin-layout',
  imports: [RouterModule],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminLayoutComponent {
  private router = inject(Router);

  protected sidebarOpen = signal(true);
  protected expandedMenu = signal<string | null>(null);

  protected navItems: NavItem[] = [
    {
      label: 'Dashboard',
      path: '/admin',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>'
    },
    {
      label: 'Môn học',
      path: '/admin/subjects',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>'
    },
    {
      label: 'Câu hỏi',
      path: '/admin/questions',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>'
    },
    {
      label: 'Người dùng',
      path: '/admin/users',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
      children: [
        { label: 'Tất cả', path: '/admin/users' },
        { label: 'Học sinh', path: '/admin/users/students' },
        { label: 'Giáo viên', path: '/admin/users/teachers' },
        { label: 'Quản trị viên', path: '/admin/users/admins' }
      ]
    }
  ];

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

  protected isParentActive(item: NavItem): boolean {
    if (!item.children) return false;
    return this.router.url.startsWith(item.path);
  }
}
