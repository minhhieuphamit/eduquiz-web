import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api-response.model';
import { ChapterResponse, ChapterRequest } from '../../models/chapter.model';
import { ApiService } from './api.service';

export function getChapterErrorMessage(err: unknown): string {
  const code: number = (err as any)?.error?.code;
  const messages: Record<number, string> = {
    4402: 'Không tìm thấy chương.',
    4410: 'Tên chương đã tồn tại trong môn học này.',
    4401: 'Không tìm thấy môn học.',
    1400: 'Yêu cầu không hợp lệ.',
    1500: 'Lỗi hệ thống. Vui lòng thử lại sau.',
  };
  return messages[code] ?? 'Đã xảy ra lỗi. Vui lòng thử lại.';
}

@Injectable({ providedIn: 'root' })
export class ChapterService {
  private api = inject(ApiService);
  private http = this.api.http;

  private getUrl(subjectId: string): string {
    return `${this.api.baseUrl}/subjects/${subjectId}/chapters`;
  }

  getBySubject(subjectId: string): Observable<ApiResponse<ChapterResponse[]>> {
    return this.http.get<ApiResponse<ChapterResponse[]>>(this.getUrl(subjectId), {
      headers: this.api.createHeaders(false),
    });
  }

  getById(subjectId: string, chapterId: string): Observable<ApiResponse<ChapterResponse>> {
    return this.http.get<ApiResponse<ChapterResponse>>(`${this.getUrl(subjectId)}/${chapterId}`, {
      headers: this.api.createHeaders(false),
    });
  }

  create(subjectId: string, request: ChapterRequest): Observable<ApiResponse<ChapterResponse>> {
    return this.http.post<ApiResponse<ChapterResponse>>(this.getUrl(subjectId), request, {
      headers: this.api.createHeaders(),
    });
  }

  update(subjectId: string, chapterId: string, request: ChapterRequest): Observable<ApiResponse<ChapterResponse>> {
    return this.http.put<ApiResponse<ChapterResponse>>(`${this.getUrl(subjectId)}/${chapterId}`, request, {
      headers: this.api.createHeaders(),
    });
  }

  delete(subjectId: string, chapterId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.getUrl(subjectId)}/${chapterId}`, {
      headers: this.api.createHeaders(),
    });
  }
}
