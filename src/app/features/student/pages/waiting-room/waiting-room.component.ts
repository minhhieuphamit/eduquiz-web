import { Component, ChangeDetectionStrategy, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { toast } from 'ngx-sonner';
import { ExamRoomService, getRoomErrorMessage } from '../../../../core/services/exam-room.service';
import { ExamSessionService, getSessionErrorMessage } from '../../../../core/services/exam-session.service';
import { ExamRoom } from '../../../../models/exam-room.model';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-waiting-room',
  imports: [DatePipe],
  templateUrl: './waiting-room.component.html',
  styleUrls: ['./waiting-room.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaitingRoomComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private roomService = inject(ExamRoomService);
  private sessionService = inject(ExamSessionService);

  protected roomId = signal<string>('');
  protected roomCode = signal<string>('');
  protected roomInfo = signal<ExamRoom | null>(null);

  protected isLoading = signal(true);
  protected isStarting = signal(false);

  // Track whether we came in while room was already OPEN (no transition needed)
  private initialStatusChecked = false;

  private pollSub?: Subscription;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.roomId.set(id);
        // Note: Students join by roomCode and only have ID in URL.
        // We will try to fetch room info. The student doesn't have a direct 'getRoomDetail' API by ID,
        // but 'joinRoom' returned the room. So we can check the status via getMySessions or by roomCode.
        // Wait, the API has a public GET /api/v1/rooms/check/{roomCode}. The student URL doesn't have roomCode!
        // We need a way to get room info. The best way is to try to start exam if OPEN, or fetch from history?
        // Actually, let's adjust: when joining room, pass roomCode via queryParam.
      }
    });

    this.route.queryParams.subscribe(q => {
      if (q['code']) {
        this.roomCode.set(q['code']);
        this.loadRoomInfo();
        this.startPolling();
      } else {
        toast.error('Thiếu mã phòng. Vui lòng tham gia lại.');
        this.router.navigate(['/rooms/join']);
      }
    });
  }

  ngOnDestroy() {
    this.pollSub?.unsubscribe();
  }

  private loadRoomInfo(isPolling = false) {
    const code = this.roomCode();
    if (!code) return;

    this.roomService.checkRoomByCode(code).subscribe({
      next: (res) => {
        const prevStatus = this.roomInfo()?.status;
        const room = res.data;
        this.roomInfo.set(room);
        this.isLoading.set(false);

        // Auto-start: room just transitioned to OPEN while we were waiting
        const justOpened = isPolling && prevStatus === 'SCHEDULED' && room.status === 'OPEN';

        // On first load and room is already OPEN — also auto-start
        const alreadyOpen = !this.initialStatusChecked && room.status === 'OPEN';
        this.initialStatusChecked = true;

        if (alreadyOpen) {
          toast.info('Phòng thi đã mở! Bạn có thể bắt đầu làm bài ngay bây giờ.');
        } else if (justOpened) {
          toast.info('Phòng thi đã bắt đầu! Hãy nhấn nút Bắt đầu để làm bài.');
        }
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  private startPolling() {
    this.pollSub = interval(5000).subscribe(() => {
      const status = this.roomInfo()?.status;
      // Keep polling while SCHEDULED; stop when OPEN/CLOSED (startExam handles navigation)
      if (status === 'SCHEDULED' || status === 'OPEN') {
        this.loadRoomInfo(true);
      }
    });
  }

  protected refresh() {
    this.loadRoomInfo(false);
  }

  protected startExam() {
    const room = this.roomInfo();
    if (!room || room.status !== 'OPEN') {
      toast.warning('Phòng thi chưa mở hoặc đã kết thúc!');
      return;
    }

    this.isStarting.set(true);
    this.sessionService.startExam({ examId: room.examId, roomId: room.id }).subscribe({
      next: (res) => {
        this.isStarting.set(false);
        this.pollSub?.unsubscribe();
        const session = res.data;
        this.router.navigate(['/exams', session.id, 'take']);
      },
      error: (err: any) => {
        this.isStarting.set(false);
        const code = (err as any)?.error?.code;
        // If session already started (student refreshed), retrieve via getSession
        if (code === 6402) {
          toast.info('Bạn đã có phiên làm bài. Đang chuẩn bị vào...');
          // Since it's already started, we can try to fetch the session info
          this.sessionService.getCurrentSession(room.examId, room.id).subscribe({
            next: (sRes) => this.router.navigate(['/exams', sRes.data.id, 'take']),
            error: () => toast.warning('Vui lòng tải lại trang để vào phòng thi.')
          });
        } else {
          toast.error(getSessionErrorMessage(err));
        }
      },
    });
  }
}
