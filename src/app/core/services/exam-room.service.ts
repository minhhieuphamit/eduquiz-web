import { Injectable } from '@angular/core';

/**
 * ExamRoomService
 * - createRoom(request): Observable<ApiResponse<ExamRoom>> (TEACHER)
 * - getMyRooms(): Observable<ApiResponse<ExamRoom[]>> (TEACHER)
 * - getRoomDetail(id): Observable<ApiResponse<ExamRoom>> (TEACHER)
 * - updateRoomStatus(id, status): Observable<ApiResponse> (TEACHER)
 * - getRoomResults(id): Observable<ApiResponse<RoomParticipant[]>> (TEACHER)
 * - joinRoom(request: JoinRoomRequest): Observable<ApiResponse> (STUDENT)
 * - getMyExamInRoom(roomId): Observable<ApiResponse<Exam>> (STUDENT)
 * TODO: Implement
 */
@Injectable({ providedIn: 'root' })
export class ExamRoomService {}
