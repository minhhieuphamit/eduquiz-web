import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/api-response.model';
import { AdminStats } from '../../models/stats.model';

@Injectable({ providedIn: 'root' })
export class StatsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/stats`;
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

  getAdminStats(): Observable<ApiResponse<AdminStats>> {
    return this.http.get<ApiResponse<AdminStats>>(`${this.apiUrl}/admin/overview`, {
      headers: this.getHeaders()
    });
  }
}
