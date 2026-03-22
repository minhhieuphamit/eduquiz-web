import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PageResponse } from '../../models/api-response.model';
import { UserResponse, UpdateUserRoleRequest } from '../../models/user.model';

/** Maps BE user management error codes to Vietnamese messages */
export function getUserErrorMessage(err: any): string {
  const code: number = err?.error?.code;
  const messages: Record<number, string> = {
    3401: 'Không tìm thấy người dùng.',
    3402: 'Email đã tồn tại.',
    3404: 'Vai trò không tồn tại.',
    3406: 'Không thể vô hiệu hóa tài khoản của chính mình.',
    3407: 'Không thể thay đổi vai trò của chính mình.',
    3408: 'Tài khoản đã được kích hoạt.',
    3409: 'Tài khoản đã bị vô hiệu hóa.',
    2408: 'Bạn không có quyền thực hiện thao tác này.',
    1400: 'Yêu cầu không hợp lệ.',
    1500: 'Lỗi hệ thống. Vui lòng thử lại sau.',
  };
  return messages[code] ?? 'Đã xảy ra lỗi. Vui lòng thử lại.';
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;
  private apiKey = environment.apiKey;

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'x-api-key': this.apiKey,
      'x-request-id': crypto.randomUUID()
    });
    const token = localStorage.getItem('accessToken');
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  getAll(
    page = 0,
    size = 20,
    keyword?: string,
    roleName?: string,
    isActive?: boolean
  ): Observable<ApiResponse<PageResponse<UserResponse>>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);
    if (keyword) {
      params = params.set('keyword', keyword);
    }
    if (roleName) {
      params = params.set('role', roleName);
    }
    if (isActive !== undefined) {
      params = params.set('isActive', isActive);
    }
    return this.http.get<ApiResponse<PageResponse<UserResponse>>>(this.apiUrl, {
      headers: this.getHeaders(),
      params
    });
  }

  getById(id: string): Observable<ApiResponse<UserResponse>> {
    return this.http.get<ApiResponse<UserResponse>>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  updateRole(id: string, request: UpdateUserRoleRequest): Observable<ApiResponse<UserResponse>> {
    return this.http.put<ApiResponse<UserResponse>>(`${this.apiUrl}/${id}/role`, request, {
      headers: this.getHeaders().set('Content-Type', 'application/json')
    });
  }

  activate(id: string): Observable<ApiResponse<UserResponse>> {
    return this.http.put<ApiResponse<UserResponse>>(`${this.apiUrl}/${id}/activate`, {}, {
      headers: this.getHeaders()
    });
  }

  deactivate(id: string): Observable<ApiResponse<UserResponse>> {
    return this.http.put<ApiResponse<UserResponse>>(`${this.apiUrl}/${id}/deactivate`, {}, {
      headers: this.getHeaders()
    });
  }
}
