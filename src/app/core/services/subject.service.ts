import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PageResponse } from '../../models/api-response.model';
import { SubjectResponse, SubjectRequest } from '../../models/subject.model';

// Maps BE subject error codes to Vietnamese messages
export function getSubjectErrorMessage(err: any): string {
  const code: number = err?.error?.code;
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
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/subjects`;
  private apiKey = environment.apiKey;

  private getHeaders(includeAuth = false): HttpHeaders {
    let headers = new HttpHeaders({
      'x-api-key': this.apiKey,
      'x-request-id': crypto.randomUUID()
    });
    if (includeAuth) {
      const token = localStorage.getItem('accessToken');
      if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  getAll(page = 0, size = 20): Observable<ApiResponse<PageResponse<SubjectResponse>>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);
    return this.http.get<ApiResponse<PageResponse<SubjectResponse>>>(this.apiUrl, {
      headers: this.getHeaders(),
      params
    });
  }

  getById(id: string): Observable<ApiResponse<SubjectResponse>> {
    return this.http.get<ApiResponse<SubjectResponse>>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  create(request: SubjectRequest, image?: File): Observable<ApiResponse<SubjectResponse>> {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(request)], { type: 'application/json' }));
    if (image) {
      formData.append('image', image);
    }
    return this.http.post<ApiResponse<SubjectResponse>>(this.apiUrl, formData, {
      headers: this.getHeaders(true)
    });
  }

  update(id: string, request: SubjectRequest, image?: File): Observable<ApiResponse<SubjectResponse>> {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(request)], { type: 'application/json' }));
    if (image) {
      formData.append('image', image);
    }
    return this.http.put<ApiResponse<SubjectResponse>>(`${this.apiUrl}/${id}`, formData, {
      headers: this.getHeaders(true)
    });
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(true)
    });
  }
}
