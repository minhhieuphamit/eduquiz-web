import { Injectable } from '@angular/core';

/**
 * QuestionService
 * - getAll(params: {chapterId?, difficulty?, page, size}): Observable<ApiResponse<PageResponse<Question>>>
 * - getById(id): Observable<ApiResponse<Question>>
 * - create(request): Observable<ApiResponse<Question>>
 * - update(id, request): Observable<ApiResponse<Question>>
 * - delete(id): Observable<ApiResponse>
 * TODO: Implement (TEACHER/ADMIN)
 */
@Injectable({ providedIn: 'root' })
export class QuestionService {}
