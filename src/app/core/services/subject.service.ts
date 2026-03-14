import { Injectable } from '@angular/core';

/**
 * SubjectService
 * - getAll(): Observable<ApiResponse<Subject[]>>
 * - create(request): Observable<ApiResponse<Subject>> (ADMIN)
 * - getChapters(subjectId): Observable<ApiResponse<Chapter[]>>
 * - createChapter(subjectId, request): Observable<ApiResponse<Chapter>> (ADMIN)
 * TODO: Implement
 */
@Injectable({ providedIn: 'root' })
export class SubjectService {}
