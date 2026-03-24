import { Component, ChangeDetectionStrategy, signal, inject, OnInit, OnDestroy, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { toast } from 'ngx-sonner';
import { UserService, getUserErrorMessage } from '../../../../core/services/user.service';
import { UserResponse } from '../../../../models/user.model';

interface RoleTab {
  label: string;
  roleName: string | undefined;
  route: string;
}

@Component({
  selector: 'app-user-management',
  imports: [FormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserManagementComponent implements OnInit, OnDestroy {
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private routeSub?: Subscription;

  protected users = signal<UserResponse[]>([]);
  protected isLoading = signal(true);
  protected isSaving = signal(false);
  protected searchKeyword = '';
  protected filterActive: string = '';

  // Pagination
  protected currentPage = signal(0);
  protected totalPages = signal(0);
  protected totalElements = signal(0);
  protected pageSize = 15;

  // Current role filter from route
  protected activeRole = signal<string | undefined>(undefined);

  // Role change modal
  protected showRoleModal = signal(false);
  protected roleModalUser = signal<UserResponse | null>(null);
  protected selectedRole = '';

  // Deactivate/Activate confirmation
  protected showStatusConfirm = signal(false);
  protected statusConfirmUser = signal<UserResponse | null>(null);

  // User detail modal
  protected showDetailModal = signal(false);
  protected detailUser = signal<UserResponse | null>(null);

  protected roleTabs: RoleTab[] = [
    { label: 'Tất cả', roleName: undefined, route: '/admin/users' },
    { label: 'Học sinh', roleName: 'STUDENT', route: '/admin/users/students' },
    { label: 'Giáo viên', roleName: 'TEACHER', route: '/admin/users/teachers' },
    { label: 'Quản trị viên', roleName: 'ADMIN', route: '/admin/users/admins' }
  ];

  protected pageTitle = computed(() => {
    const role = this.activeRole();
    if (role === 'STUDENT') return 'Quản lý học sinh';
    if (role === 'TEACHER') return 'Quản lý giáo viên';
    if (role === 'ADMIN') return 'Quản lý quản trị viên';
    return 'Quản lý người dùng';
  });

  protected pageSubtitle = computed(() => {
    const total = this.totalElements();
    const role = this.activeRole();
    if (role === 'STUDENT') return `Tổng cộng ${total} học sinh trong hệ thống.`;
    if (role === 'TEACHER') return `Tổng cộng ${total} giáo viên trong hệ thống.`;
    if (role === 'ADMIN') return `Tổng cộng ${total} quản trị viên trong hệ thống.`;
    return `Tổng cộng ${total} người dùng trong hệ thống.`;
  });

  ngOnInit() {
    // Subscribe to route data changes so role filter updates when navigating between tabs
    this.routeSub = this.route.data.subscribe(data => {
      this.activeRole.set(data['role'] ?? undefined);
      this.searchKeyword = '';
      this.filterActive = '';
      this.currentPage.set(0);
      this.loadUsers();
    });
  }

  ngOnDestroy() {
    this.routeSub?.unsubscribe();
  }

  private loadUsers() {
    this.isLoading.set(true);
    const isActive = this.filterActive === '' ? undefined : this.filterActive === 'true';
    this.userService.getAll(
      this.currentPage(),
      this.pageSize,
      this.searchKeyword?.trim() || undefined,
      this.activeRole(),
      isActive
    ).subscribe({
      next: (res) => {
        this.users.set(res.data.content);
        this.totalPages.set(res.data.totalPages);
        this.totalElements.set(res.data.totalElements);
        this.isLoading.set(false);
      },
      error: () => {
        toast.error('Không thể tải danh sách người dùng.');
        this.isLoading.set(false);
      }
    });
  }

  protected onSearch() {
    this.currentPage.set(0);
    this.loadUsers();
  }

  protected onFilterChange() {
    this.currentPage.set(0);
    this.loadUsers();
  }

  protected clearSearch() {
    this.searchKeyword = '';
    this.currentPage.set(0);
    this.loadUsers();
  }

  protected goToPage(page: number) {
    if (page < 0 || page >= this.totalPages()) return;
    this.currentPage.set(page);
    this.loadUsers();
  }

  protected getPages(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    const maxVisible = 5;

    if (total <= maxVisible) {
      for (let i = 0; i < total; i++) pages.push(i);
    } else {
      let start = Math.max(0, current - 2);
      let end = Math.min(total - 1, start + maxVisible - 1);
      if (end - start < maxVisible - 1) {
        start = Math.max(0, end - maxVisible + 1);
      }
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  }

  // Role display
  protected getRoleLabel(role: string): string {
    switch (role) {
      case 'STUDENT': return 'Học sinh';
      case 'TEACHER': return 'Giáo viên';
      case 'ADMIN': return 'Quản trị viên';
      default: return role;
    }
  }

  protected getRoleClass(role: string): string {
    switch (role) {
      case 'STUDENT': return 'badge-student';
      case 'TEACHER': return 'badge-teacher';
      case 'ADMIN': return 'badge-admin';
      default: return '';
    }
  }

  // Status display
  protected getStatusLabel(user: UserResponse): string {
    if (!user.isActive) return 'Vô hiệu hóa';
    if (!user.emailVerified) return 'Chưa xác thực';
    return 'Hoạt động';
  }

  protected getStatusClass(user: UserResponse): string {
    if (!user.isActive) return 'badge-inactive';
    if (!user.emailVerified) return 'badge-unverified';
    return 'badge-active';
  }

  // Format date
  protected formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  // View user detail
  protected viewDetail(user: UserResponse) {
    this.detailUser.set(user);
    this.showDetailModal.set(true);
  }

  protected closeDetailModal() {
    this.showDetailModal.set(false);
    this.detailUser.set(null);
  }

  // Role change modal
  protected openRoleModal(user: UserResponse) {
    this.roleModalUser.set(user);
    this.selectedRole = user.role;
    this.showRoleModal.set(true);
  }

  protected closeRoleModal() {
    this.showRoleModal.set(false);
    this.roleModalUser.set(null);
    this.selectedRole = '';
  }

  protected submitRoleChange() {
    const user = this.roleModalUser();
    if (!user || this.selectedRole === user.role) return;

    this.isSaving.set(true);
    this.userService.updateRole(user.id, { role: this.selectedRole }).subscribe({
      next: () => {
        this.isSaving.set(false);
        toast.success(`Đã đổi vai trò của ${user.email} thành ${this.getRoleLabel(this.selectedRole)}.`);
        this.closeRoleModal();
        this.loadUsers();
      },
      error: (err) => {
        this.isSaving.set(false);
        toast.error(getUserErrorMessage(err));
      }
    });
  }

  // Activate/Deactivate confirmation
  protected openStatusConfirm(user: UserResponse) {
    this.statusConfirmUser.set(user);
    this.showStatusConfirm.set(true);
  }

  protected closeStatusConfirm() {
    this.showStatusConfirm.set(false);
    this.statusConfirmUser.set(null);
  }

  protected executeStatusChange() {
    const user = this.statusConfirmUser();
    if (!user) return;

    this.isSaving.set(true);
    const action$ = user.isActive
      ? this.userService.deactivate(user.id)
      : this.userService.activate(user.id);

    action$.subscribe({
      next: () => {
        this.isSaving.set(false);
        const msg = user.isActive
          ? `Đã vô hiệu hóa tài khoản ${user.email}.`
          : `Đã kích hoạt tài khoản ${user.email}.`;
        toast.success(msg);
        this.closeStatusConfirm();
        this.loadUsers();
      },
      error: (err) => {
        this.isSaving.set(false);
        toast.error(getUserErrorMessage(err));
      }
    });
  }

  protected navigateTab(tab: RoleTab) {
    this.router.navigate([tab.route]);
  }

  protected isActiveTab(tab: RoleTab): boolean {
    return this.activeRole() === tab.roleName;
  }
}
