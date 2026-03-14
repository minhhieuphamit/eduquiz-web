/**
 * RoleGuard - Chặn truy cập theo role.
 * Dùng route.data['roles'] để check: ['TEACHER'], ['ADMIN'], ['STUDENT','TEACHER']
 *
 * Ví dụ route config:
 *   { path: 'teacher', canActivate: [roleGuard], data: { roles: ['TEACHER'] } }
 *
 * Nếu không có quyền → redirect /dashboard hoặc /auth/login
 *
 * TODO: Implement export const roleGuard: CanActivateFn
 */
export const roleGuard = () => {
  // TODO: Implement
  return true;
};
