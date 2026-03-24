import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * RoleGuard - Chặn truy cập theo role.
 * Dùng route.data['roles'] để check: ['TEACHER'], ['ADMIN'], ['STUDENT','TEACHER']
 *
 * Ví dụ route config:
 *   { path: 'admin', canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN'] } }
 */
export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles: string[] = route.data['roles'] ?? [];
  const user = authService.currentUser();

  if (!user) {
    router.navigate(['/']);
    return false;
  }

  if (allowedRoles.length === 0 || allowedRoles.includes(user.role)) {
    return true;
  }

  // Redirect to appropriate area based on user's actual role
  switch (user.role) {
    case 'ADMIN':
      router.navigate(['/admin']);
      break;
    case 'TEACHER':
      router.navigate(['/teacher']);
      break;
    default:
      router.navigate(['/']);
      break;
  }

  return false;
};
