import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import { ExamRoomService, getRoomErrorMessage } from '../../../../core/services/exam-room.service';
import { RoomResultResponse, RoomStatus } from '../../../../models/exam-room.model';

@Component({
  selector: 'app-room-detail',
  imports: [DatePipe, DecimalPipe, RouterLink],
  templateUrl: './room-detail.component.html',
  styleUrls: ['./room-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private roomService = inject(ExamRoomService);

  protected roomId = signal<string>('');
  protected resultData = signal<RoomResultResponse | null>(null);
  protected isLoading = signal(true);
  protected isUpdating = signal(false);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.roomId.set(id);
        this.loadResult();
      }
    });
  }

  private loadResult() {
    this.isLoading.set(true);
    this.roomService.getRoomResults(this.roomId()).subscribe({
      next: (res) => {
        this.resultData.set(res.data);
        this.isLoading.set(false);
      },
      error: () => {
        toast.error('Không thể tải thông tin phòng thi.');
        this.isLoading.set(false);
      }
    });
  }

  protected changeStatus(newStatus: RoomStatus) {
    this.isUpdating.set(true);
    this.roomService.updateRoomStatus(this.roomId(), newStatus).subscribe({
      next: () => {
        toast.success('Cập nhật trạng thái phòng thành công.');
        this.loadResult();
        this.isUpdating.set(false);
      },
      error: (err: any) => {
        toast.error(getRoomErrorMessage(err));
        this.isUpdating.set(false);
      }
    });
  }

  protected refresh() {
    this.loadResult();
  }

  protected statusBadge(status: RoomStatus | undefined): { label: string; cls: string } {
    if (!status) return { label: '', cls: '' };
    const map: Record<RoomStatus, { label: string; cls: string }> = {
      SCHEDULED: { label: 'Đã lên lịch', cls: 'badge-scheduled' },
      OPEN: { label: 'Đang mở', cls: 'badge-open' },
      IN_PROGRESS: { label: 'Đang làm bài', cls: 'badge-in-progress' },
      CLOSED: { label: 'Đã đóng', cls: 'badge-closed' },
    };
    return map[status] ?? { label: status, cls: '' };
  }

  protected participantStatusBadge(status: string): { label: string; cls: string } {
    const map: Record<string, { label: string; cls: string }> = {
      JOINED: { label: 'Đã vào phòng', cls: 'badge-scheduled' },
      IN_PROGRESS: { label: 'Đang làm bài', cls: 'badge-open' },
      SUBMITTED: { label: 'Đã nộp bài', cls: 'badge-success' },
    };
    return map[status] ?? { label: status, cls: '' };
  }

  protected copyRoomCode() {
    const code = this.resultData()?.roomInfo.roomCode;
    if (code) {
      navigator.clipboard.writeText(code).then(() => {
        toast.success('Đã sao chép mã phòng!');
      });
    }
  }
}
