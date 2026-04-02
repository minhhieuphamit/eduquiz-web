import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiResponse, PageResponse } from '../../models/api-response.model';
import { 
  ExamSessionResponse, 
  StartExamRequest, 
  AnswerRequest, 
  ExamResultResponse 
} from '../../models/exam-session.model';
import { ApiService } from './api.service';

export function getSessionErrorMessage(err: unknown): string {
  const code: number = (err as any)?.error?.code;
  const messages: Record<number, string> = {
    6401: 'Không tìm thấy session làm bài.',
    6402: 'Bài thi đã được nộp.',
    6403: 'Hết thời gian làm bài.',
    6404: 'Chưa có kết quả do bài thi trắc nghiệm đang xử lý.',
    1400: 'Yêu cầu không hợp lệ.',
    1500: 'Lỗi hệ thống. Vui lòng thử lại sau.',
  };
  return messages[code] ?? 'Đã xảy ra lỗi. Vui lòng thử lại.';
}

@Injectable({ providedIn: 'root' })
export class ExamSessionService {
  private api = inject(ApiService);
  private http = this.api.http;
  private apiUrl = `${this.api.baseUrl}/exam-sessions`;

  // Store current session for the exam-taking component
  public currentSession = signal<ExamSessionResponse | null>(null);

  /** POST /exam-sessions/start — start an exam session */
  startExam(request: StartExamRequest): Observable<ApiResponse<ExamSessionResponse>> {
    return this.http.post<ApiResponse<ExamSessionResponse>>(
      `${this.apiUrl}/start`,
      request,
      { headers: this.api.createHeaders() },
    ).pipe(
      tap(res => this.currentSession.set(res.data))
    );
  }

  /** PUT /exam-sessions/{id}/answer — auto save answer */
  saveAnswer(sessionId: string, request: AnswerRequest): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(
      `${this.api.baseUrl}/exam-sessions/${sessionId}/answer`,
      request,
      { headers: this.api.createHeaders() },
    );
  }

  /** POST /exam-sessions/{id}/submit — submit exam */
  submitExam(sessionId: string): Observable<ApiResponse<ExamSessionResponse>> {
    return this.http.post<ApiResponse<ExamSessionResponse>>(
      `${this.api.baseUrl}/exam-sessions/${sessionId}/submit`,
      {},
      { headers: this.api.createHeaders() },
    );
  }

  /** GET /exam-sessions/{id}/result — get detailed result */
  getResult(sessionId: string): Observable<ApiResponse<ExamResultResponse>> {
    return this.http.get<ApiResponse<ExamResultResponse>>(
      `${this.api.baseUrl}/exam-sessions/${sessionId}/result`,
      { headers: this.api.createHeaders() },
    );
  }

  /** GET /exam-sessions/history — get history of current student */
  getHistory(page = 0, size = 20): Observable<ApiResponse<PageResponse<ExamSessionResponse>>> {
    return this.http.get<ApiResponse<PageResponse<ExamSessionResponse>>>(
      `${this.api.baseUrl}/exam-sessions/history?page=${page}&size=${size}`,
      { headers: this.api.createHeaders() },
    );
  }
}
