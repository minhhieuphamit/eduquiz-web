import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { ApiResponse, PageResponse } from '../../models/api-response.model';
import { ExamRoom, CreateRoomRequest, JoinRoomRequest, RoomResultResponse } from '../../models/exam-room.model';
import { ApiService } from './api.service';

export function getRoomErrorMessage(err: unknown): string {
  const code: number = (err as any)?.error?.code;
  const messages: Record<number, string> = {
    5401: 'Không tìm thấy phòng thi.',
    5402: 'Mã phòng không hợp lệ.',
    5403: 'Phòng thi chưa mở hoặc đã kết thúc.',
    5404: 'Phòng thi đã đóng.',
    5405: 'Bạn đã tham gia phòng thi này rồi.',
    5406: 'Phòng thi đã đầy.',
    5407: 'Đề thi chưa được gán cho phòng.',
    5408: 'Trạng thái phòng không hợp lệ.',
    1400: 'Yêu cầu không hợp lệ.',
    1500: 'Lỗi hệ thống. Vui lòng thử lại sau.',
  };
  return messages[code] ?? 'Đã xảy ra lỗi. Vui lòng thử lại.';
}

@Injectable({ providedIn: 'root' })
export class ExamRoomService {
  private api = inject(ApiService);
  private http = this.api.http;

  /** POST /rooms — create room (TEACHER) */
  createRoom(request: CreateRoomRequest): Observable<ApiResponse<ExamRoom>> {
    return this.http.post<ApiResponse<ExamRoom>>(
      `${this.api.baseUrl}/rooms`,
      request,
      { headers: this.api.createHeaders() },
    );
  }

  /** GET /rooms/my — teacher's rooms */
  getMyRooms(page = 0, size = 20): Observable<ApiResponse<PageResponse<ExamRoom>>> {
    return this.http.get<ApiResponse<PageResponse<ExamRoom>>>(
      `${this.api.baseUrl}/rooms/my?page=${page}&size=${size}`,
      { headers: this.api.createHeaders() },
    );
  }

  /** GET /rooms/{id} — room detail */
  getRoomDetail(roomId: string): Observable<ApiResponse<ExamRoom>> {
    return this.http.get<ApiResponse<ExamRoom>>(
      `${this.api.baseUrl}/rooms/${roomId}`,
      { headers: this.api.createHeaders() },
    );
  }

  /** PUT /rooms/{id}/status — update room status */
  updateRoomStatus(roomId: string, status: string): Observable<ApiResponse<ExamRoom>> {
    return this.http.put<ApiResponse<ExamRoom>>(
      `${this.api.baseUrl}/rooms/${roomId}/status`,
      { status },
      { headers: this.api.createHeaders() },
    );
  }

  /** GET /rooms/{id}/results — room results with participants */
  getRoomResults(roomId: string): Observable<ApiResponse<RoomResultResponse>> {
    return this.http.get<ApiResponse<RoomResultResponse>>(
      `${this.api.baseUrl}/rooms/${roomId}/results`,
      { headers: this.api.createHeaders() },
    );
  }

  /** POST /rooms/join — student joins room */
  joinRoom(request: JoinRoomRequest): Observable<ApiResponse<ExamRoom>> {
    return this.http.post<ApiResponse<ExamRoom>>(
      `${this.api.baseUrl}/rooms/join`,
      request,
      { headers: this.api.createHeaders() },
    );
  }

  /** GET /rooms/check/{roomCode} — public check room */
  checkRoomByCode(roomCode: string): Observable<ApiResponse<ExamRoom>> {
    return this.http.get<ApiResponse<ExamRoom>>(
      `${this.api.baseUrl}/rooms/check/${roomCode}`,
      { headers: this.api.createHeaders(false) }, // Maybe no auth needed, or depends on backend
    );
  }
}
