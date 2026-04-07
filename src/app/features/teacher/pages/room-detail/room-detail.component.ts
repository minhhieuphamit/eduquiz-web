import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import { ExamRoomService, getRoomErrorMessage } from '../../../../core/services/exam-room.service';
import { AttemptResult, RoomParticipant, RoomResultResponse, RoomStatus } from '../../../../models/exam-room.model';

@Component({
  selector: 'app-room-detail',
  imports: [DatePipe, DecimalPipe, RouterLink, FormsModule],
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

  // Reopen flow: shown only when reopening a CLOSED room
  protected showReopenForm = signal(false);
  protected reopenEndTime = signal('');

  // Expanded students set — userId keys that are currently expanded
  private expandedIds = signal<ReadonlySet<string>>(new Set());

  protected isExpanded(userId: string): boolean {
    return this.expandedIds().has(userId);
  }

  protected toggleExpand(userId: string): void {
    const current = new Set(this.expandedIds());
    if (current.has(userId)) {
      current.delete(userId);
    } else {
      current.add(userId);
    }
    this.expandedIds.set(current);
  }

  /** Best attempt = highest score; falls back to most recent. */
  protected bestAttempt(p: RoomParticipant): AttemptResult {
    const submitted = p.attempts.filter(a => a.status === 'SUBMITTED' && a.score !== undefined);
    if (submitted.length > 0) {
      return submitted.reduce((best, a) => (a.score! > best.score! ? a : best));
    }
    return p.attempts[p.attempts.length - 1];
  }

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

  protected openRoom() {
    const status = this.resultData()?.roomInfo.status;
    if (status === 'CLOSED') {
      // Require a new endTime before calling the API
      this.showReopenForm.set(true);
      return;
    }
    this.changeStatus('OPEN');
  }

  protected confirmReopen() {
    const endTime = this.reopenEndTime();
    if (!endTime) {
      toast.warning('Vui lòng chọn thời gian đóng phòng mới.');
      return;
    }
    // Convert datetime-local value ("2026-04-07T14:30") to ISO without timezone offset
    this.showReopenForm.set(false);
    this.changeStatus('OPEN', endTime);
  }

  protected cancelReopen() {
    this.showReopenForm.set(false);
    this.reopenEndTime.set('');
  }

  protected changeStatus(newStatus: RoomStatus, endTime?: string) {
    this.isUpdating.set(true);
    // datetime-local gives "2026-04-07T14:30"; BE expects "2026-04-07T14:30:00"
    const isoEndTime = endTime
      ? (endTime.length === 16 ? endTime + ':00' : endTime.substring(0, 19))
      : undefined;
    this.roomService.updateRoomStatus(this.roomId(), newStatus, isoEndTime).subscribe({
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

  protected attemptStatusBadge(status: string): { label: string; cls: string } {
    const map: Record<string, { label: string; cls: string }> = {
      WAITING:   { label: 'Chờ thi',    cls: 'badge-scheduled' },
      STARTED:   { label: 'Đang làm',   cls: 'badge-open' },
      SUBMITTED: { label: 'Đã nộp',     cls: 'badge-success' },
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
