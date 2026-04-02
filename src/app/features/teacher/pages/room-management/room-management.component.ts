import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import { ExamRoomService, getRoomErrorMessage } from '../../../../core/services/exam-room.service';
import { ExamRoom, RoomStatus } from '../../../../models/exam-room.model';

@Component({
  selector: 'app-room-management',
  imports: [DatePipe, RouterLink],
  templateUrl: './room-management.component.html',
  styleUrls: ['./room-management.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomManagementComponent implements OnInit {
  private roomService = inject(ExamRoomService);

  // Data
  protected rooms = signal<ExamRoom[]>([]);
  
  // Pagination
  protected page = signal(0);
  protected totalPages = signal(0);
  protected totalElements = signal(0);

  // UI state
  protected isLoading = signal(true);
  protected isUpdating = signal(false);

  ngOnInit() {
    this.loadRooms();
  }

  protected loadRooms() {
    this.isLoading.set(true);
    this.roomService.getMyRooms(this.page(), 20).subscribe({
      next: (res) => {
        this.rooms.set(res.data.content);
        this.totalPages.set(res.data.totalPages);
        this.totalElements.set(res.data.totalElements);
        this.isLoading.set(false);
      },
      error: () => {
        toast.error('Không thể tải danh sách phòng thi.');
        this.isLoading.set(false);
      },
    });
  }

  protected goToPage(p: number) {
    if (p < 0 || p >= this.totalPages()) return;
    this.page.set(p);
    this.loadRooms();
  }

  protected changeStatus(roomId: string, newStatus: RoomStatus) {
    this.isUpdating.set(true);
    this.roomService.updateRoomStatus(roomId, newStatus).subscribe({
      next: () => {
        toast.success('Cập nhật trạng thái phòng thành công.');
        this.loadRooms();
        this.isUpdating.set(false);
      },
      error: (err: any) => {
        toast.error(getRoomErrorMessage(err));
        this.isUpdating.set(false);
      }
    });
  }

  // Helpers
  protected statusBadge(status: RoomStatus): { label: string; cls: string } {
    const map: Record<RoomStatus, { label: string; cls: string }> = {
      SCHEDULED: { label: 'Đã lên lịch', cls: 'badge-scheduled' },
      OPEN: { label: 'Đang mở', cls: 'badge-open' },
      IN_PROGRESS: { label: 'Đang làm bài', cls: 'badge-in-progress' },
      CLOSED: { label: 'Đã đóng', cls: 'badge-closed' },
    };
    return map[status] ?? { label: status, cls: '' };
  }
}
