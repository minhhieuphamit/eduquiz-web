import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError, BehaviorSubject, filter, take, switchMap, catchError } from 'rxjs';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from '../../models/api-response.model';
import { AuthResponse } from '../../models/auth.model';
import { environment } from '../../../environments/environment';

/** URLs that don't need Authorization header */
const PUBLIC_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/verify-otp',
  '/auth/resend-otp',
  '/auth/forgot-password',
  '/auth/reset-password',
];

let isRefreshing = false;
let refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const api = inject(ApiService);
  const auth = inject(AuthService);
  const router = inject(Router);

  // Skip auth for public endpoints
  if (PUBLIC_PATHS.some(path => req.url.includes(path))) {
    return next(req);
  }

  // Attach token if available
  const token = api.getAccessToken();
  const authReq = token ? addToken(req, token) : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        return handle401(req, next, api, auth, router);
      }
      return throwError(() => error);
    })
  );
};

function addToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
}

function handle401(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  api: ApiService,
  auth: AuthService,
  router: Router,
): Observable<any> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const refreshToken = api.getRefreshToken();
    if (!refreshToken) {
      return logoutAndRedirect(auth, router);
    }

    return api.http.post<ApiResponse<AuthResponse>>(
      `${environment.apiUrl}/auth/refresh`,
      { refreshToken },
      { headers: api.createHeaders(false) },
    ).pipe(
      switchMap(res => {
        isRefreshing = false;
        api.setTokens(res.data.accessToken, res.data.refreshToken);
        refreshTokenSubject.next(res.data.accessToken);
        return next(addToken(req, res.data.accessToken));
      }),
      catchError(err => {
        isRefreshing = false;
        refreshTokenSubject.next(null);
        return logoutAndRedirect(auth, router);
      }),
    );
  }

  // Queue: wait until refresh completes, then retry with new token
  return refreshTokenSubject.pipe(
    filter(token => token !== null),
    take(1),
    switchMap(token => next(addToken(req, token!))),
  );
}

function logoutAndRedirect(auth: AuthService, router: Router): Observable<never> {
  auth.logout();
  router.navigate(['/']);
  return throwError(() => new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.'));
}
