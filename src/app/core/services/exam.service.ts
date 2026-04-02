import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PageResponse } from '../../models/api-response.model';
import { ExamResponse, CreateExamRequest, ExamType } from '../../models/exam.model';
import { ApiService } from './api.service';

export function getExamErrorMessage(err: unknown): string {
  const code: number = (err as any)?.error?.code;
  const messages: Record<number, string> = {
    4404: 'Không tìm thấy đề thi.',
    4405: 'Đề thi phải có ít nhất một câu hỏi.',
    4406: 'Thời lượng không hợp lệ.',
    4408: 'Đề thi đã được công bố, không thể chỉnh sửa.',
    4401: 'Không tìm thấy môn học.',
    4403: 'Không tìm thấy câu hỏi.',
    1400: 'Yêu cầu không hợp lệ.',
    1500: 'Lỗi hệ thống. Vui lòng thử lại sau.',
  };
  return messages[code] ?? 'Đã xảy ra lỗi. Vui lòng thử lại.';
}

@Injectable({ providedIn: 'root' })
export class ExamService {
  private api = inject(ApiService);
  private http = this.api.http;

  /** GET /exams — paginated list (public) */
  getAll(opts: {
    page?: number;
    size?: number;
    sort?: string;
    direction?: 'ASC' | 'DESC';
  } = {}): Observable<ApiResponse<PageResponse<ExamResponse>>> {
    let params = new HttpParams()
      .set('page', opts.page ?? 0)
      .set('size', opts.size ?? 20);
    if (opts.sort) params = params.set('sort', opts.sort);
    if (opts.direction) params = params.set('direction', opts.direction);
    return this.http.get<ApiResponse<PageResponse<ExamResponse>>>(
      `${this.api.baseUrl}/exams`,
      { headers: this.api.createHeaders(), params },
    );
  }

  /** GET /subjects/{subjectId}/exams — filtered by subject (public) */
  getBySubject(subjectId: string, opts: {
    examType?: ExamType;
    year?: number;
    page?: number;
    size?: number;
  } = {}): Observable<ApiResponse<PageResponse<ExamResponse>>> {
    let params = new HttpParams()
      .set('page', opts.page ?? 0)
      .set('size', opts.size ?? 20);
    if (opts.examType) params = params.set('examType', opts.examType);
    if (opts.year) params = params.set('year', opts.year);
    return this.http.get<ApiResponse<PageResponse<ExamResponse>>>(
      `${this.api.baseUrl}/subjects/${subjectId}/exams`,
      { headers: this.api.createHeaders(), params },
    );
  }

  /** GET /exams/{examId} — detail with questions */
  getById(examId: string): Observable<ApiResponse<ExamResponse>> {
    return this.http.get<ApiResponse<ExamResponse>>(
      `${this.api.baseUrl}/exams/${examId}`,
      { headers: this.api.createHeaders() },
    );
  }

  /** POST /exams — create (ADMIN/TEACHER) */
  create(request: CreateExamRequest): Observable<ApiResponse<ExamResponse>> {
    return this.http.post<ApiResponse<ExamResponse>>(
      `${this.api.baseUrl}/exams`,
      request,
      { headers: this.api.createHeaders() },
    );
  }

  /** PUT /exams/{examId} — update (ADMIN/TEACHER) */
  update(examId: string, request: CreateExamRequest): Observable<ApiResponse<ExamResponse>> {
    return this.http.put<ApiResponse<ExamResponse>>(
      `${this.api.baseUrl}/exams/${examId}`,
      request,
      { headers: this.api.createHeaders() },
    );
  }

  /** DELETE /exams/{examId} — soft delete (ADMIN only) */
  delete(examId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.api.baseUrl}/exams/${examId}`,
      { headers: this.api.createHeaders() },
    );
  }

  /** PUT /exams/{examId}/share — toggle share status (ADMIN/TEACHER) */
  toggleShare(examId: string): Observable<ApiResponse<ExamResponse>> {
    return this.http.put<ApiResponse<ExamResponse>>(
      `${this.api.baseUrl}/exams/${examId}/share`,
      {},
      { headers: this.api.createHeaders() },
    );
  }
}
