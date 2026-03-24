import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PageResponse } from '../../models/api-response.model';
import { QuestionResponse, QuestionRequest, Difficulty, QuestionType } from '../../models/question.model';
import { ApiService } from './api.service';

export function getQuestionErrorMessage(err: unknown): string {
  const code: number = (err as any)?.error?.code;
  const messages: Record<number, string> = {
    4403: 'Không tìm thấy câu hỏi.',
    4407: 'Số đáp án đúng không hợp lệ.',
    4402: 'Không tìm thấy chương.',
    1400: 'Yêu cầu không hợp lệ.',
    1500: 'Lỗi hệ thống. Vui lòng thử lại sau.',
  };
  return messages[code] ?? 'Đã xảy ra lỗi. Vui lòng thử lại.';
}

@Injectable({ providedIn: 'root' })
export class QuestionService {
  private api = inject(ApiService);
  private http = this.api.http;

  getByChapter(
    chapterId: string,
    page = 0,
    size = 20,
    difficulty?: Difficulty,
    type?: QuestionType,
  ): Observable<ApiResponse<PageResponse<QuestionResponse>>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (difficulty) params = params.set('difficulty', difficulty);
    if (type) params = params.set('type', type);
    return this.http.get<ApiResponse<PageResponse<QuestionResponse>>>(
      `${this.api.baseUrl}/chapters/${chapterId}/questions`,
      { headers: this.api.createHeaders(false), params },
    );
  }

  getById(questionId: string): Observable<ApiResponse<QuestionResponse>> {
    return this.http.get<ApiResponse<QuestionResponse>>(
      `${this.api.baseUrl}/questions/${questionId}`,
      { headers: this.api.createHeaders(false) },
    );
  }

  create(chapterId: string, request: QuestionRequest): Observable<ApiResponse<QuestionResponse>> {
    return this.http.post<ApiResponse<QuestionResponse>>(
      `${this.api.baseUrl}/chapters/${chapterId}/questions`,
      request,
      { headers: this.api.createHeaders() },
    );
  }

  update(questionId: string, request: QuestionRequest): Observable<ApiResponse<QuestionResponse>> {
    return this.http.put<ApiResponse<QuestionResponse>>(
      `${this.api.baseUrl}/questions/${questionId}`,
      request,
      { headers: this.api.createHeaders() },
    );
  }

  delete(questionId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.api.baseUrl}/questions/${questionId}`,
      { headers: this.api.createHeaders() },
    );
  }
}
