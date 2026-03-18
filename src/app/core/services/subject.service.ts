import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PageResponse } from '../../models/api-response.model';
import { SubjectResponse, SubjectRequest } from '../../models/subject.model';

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

  create(request: SubjectRequest): Observable<ApiResponse<SubjectResponse>> {
    return this.http.post<ApiResponse<SubjectResponse>>(this.apiUrl, request, {
      headers: this.getHeaders(true)
    });
  }

  update(id: string, request: SubjectRequest): Observable<ApiResponse<SubjectResponse>> {
    return this.http.put<ApiResponse<SubjectResponse>>(`${this.apiUrl}/${id}`, request, {
      headers: this.getHeaders(true)
    });
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(true)
    });
  }
}
