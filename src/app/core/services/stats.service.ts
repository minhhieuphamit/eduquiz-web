import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api-response.model';
import { AdminStats } from '../../models/stats.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class StatsService {
  private api = inject(ApiService);
  private http = this.api.http;
  private apiUrl = `${this.api.baseUrl}/stats`;

  getAdminStats(): Observable<ApiResponse<AdminStats>> {
    return this.http.get<ApiResponse<AdminStats>>(`${this.apiUrl}/admin/overview`, {
      headers: this.api.createHeaders(),
    });
  }
}
