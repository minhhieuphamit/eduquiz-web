import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PageResponse } from '../../models/api-response.model';
import { SubjectResponse, SubjectRequest } from '../../models/subject.model';
import { ApiService } from './api.service';

/** Maps BE subject error codes to Vietnamese messages */
export function getSubjectErrorMessage(err: unknown): string {
  const code: number = (err as any)?.error?.code;
  const messages: Record<number, string> = {
    4401: 'Không tìm thấy môn học.',
    4409: 'Tên môn học đã tồn tại.',
    1400: 'Yêu cầu không hợp lệ. Vui lòng kiểm tra lại thông tin.',
    1500: 'Lỗi hệ thống. Vui lòng thử lại sau.',
  };
  return messages[code] ?? 'Đã xảy ra lỗi. Vui lòng thử lại.';
}

@Injectable({ providedIn: 'root' })
export class SubjectService {
  private api = inject(ApiService);
  private http = this.api.http;
  private apiUrl = `${this.api.baseUrl}/subjects`;

  getAll(page = 0, size = 20): Observable<ApiResponse<PageResponse<SubjectResponse>>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<PageResponse<SubjectResponse>>>(this.apiUrl, {
      headers: this.api.createHeaders(false),
      params,
    });
  }

  getById(id: string): Observable<ApiResponse<SubjectResponse>> {
    return this.http.get<ApiResponse<SubjectResponse>>(`${this.apiUrl}/${id}`, {
      headers: this.api.createHeaders(false),
    });
  }

  create(request: SubjectRequest, image?: File): Observable<ApiResponse<SubjectResponse>> {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(request)], { type: 'application/json' }));
    if (image) formData.append('image', image);
    return this.http.post<ApiResponse<SubjectResponse>>(this.apiUrl, formData, {
      headers: this.api.createHeaders(),
    });
  }

  update(id: string, request: SubjectRequest, image?: File): Observable<ApiResponse<SubjectResponse>> {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(request)], { type: 'application/json' }));
    if (image) formData.append('image', image);
    return this.http.put<ApiResponse<SubjectResponse>>(`${this.apiUrl}/${id}`, formData, {
      headers: this.api.createHeaders(),
    });
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`, {
      headers: this.api.createHeaders(),
    });
  }
}
