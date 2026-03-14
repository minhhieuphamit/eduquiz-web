/**
 * Auth Interceptor (HttpInterceptorFn - Angular 17+ functional style).
 *
 * Flow:
 * 1. Lấy accessToken từ AuthService
 * 2. Clone request, gắn header: Authorization: Bearer <token>
 * 3. Skip cho các URL không cần auth: /auth/login, /auth/register, /auth/verify-otp...
 * 4. Nếu response 401:
 *    a. Gọi /auth/refresh để lấy token mới
 *    b. Nếu refresh thành công → retry request gốc
 *    c. Nếu refresh fail → logout, redirect về /auth/login
 * 5. Queue requests khi đang refresh (tránh gọi refresh nhiều lần)
 *
 * TODO: Implement export const authInterceptor: HttpInterceptorFn
 */
export const authInterceptor = () => {
  // TODO: Implement
};
