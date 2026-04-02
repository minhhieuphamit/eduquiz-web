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
  protected roomCode = signal<string>(''); // For polling if needed
  protected roomInfo = signal<ExamRoom | null>(null);
  
  protected isLoading = signal(true);
  protected isStarting = signal(false);

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

  private loadRoomInfo() {
    const code = this.roomCode();
    if (!code) return;
    this.roomService.checkRoomByCode(code).subscribe({
      next: (res) => {
        this.roomInfo.set(res.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  private startPolling() {
    this.pollSub = interval(5000).subscribe(() => {
      // Poll every 5s if room is SCHEDULED
      if (this.roomInfo()?.status === 'SCHEDULED') {
        this.loadRoomInfo();
      }
    });
  }

  protected refresh() {
    this.loadRoomInfo();
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
        const session = res.data;
        this.router.navigate(['/exams', session.id, 'take']);
      },
      error: (err: any) => {
        this.isStarting.set(false);
        toast.error(getSessionErrorMessage(err));
      }
    });
  }
}
