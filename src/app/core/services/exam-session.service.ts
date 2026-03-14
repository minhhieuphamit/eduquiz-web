import { Injectable } from '@angular/core';

/**
 * ExamSessionService
 * - startExam(request: StartExamRequest): Observable<ApiResponse<ExamSession>>
 * - saveAnswer(sessionId, request: AnswerRequest): Observable<ApiResponse>
 * - submitExam(sessionId): Observable<ApiResponse>
 * - getResult(sessionId): Observable<ApiResponse<{session, answers: ExamResultDetail[]}>>
 * - getHistory(page, size): Observable<ApiResponse<PageResponse<ExamSession>>>
 * TODO: Implement (STUDENT)
 */
@Injectable({ providedIn: 'root' })
export class ExamSessionService {}
