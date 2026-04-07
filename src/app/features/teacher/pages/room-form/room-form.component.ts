import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import { ExamRoomService, getRoomErrorMessage } from '../../../../core/services/exam-room.service';
import { ExamService } from '../../../../core/services/exam.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CreateRoomRequest } from '../../../../models/exam-room.model';
import { ExamResponse } from '../../../../models/exam.model';

@Component({
  selector: 'app-room-form',
  imports: [FormsModule, RouterLink],
  templateUrl: './room-form.component.html',
  styleUrls: ['./room-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomFormComponent implements OnInit {
  private roomService = inject(ExamRoomService);
  private examService = inject(ExamService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Form fields
  protected title = signal('');
  protected examId = signal('');
  protected startTime = signal('');
  protected endTime = signal('');
  protected maxStudents = signal<number | null>(null);

  // Selection data
  protected exams = signal<ExamResponse[]>([]);
  protected isLoadingExams = signal(true);
  protected isSubmitting = signal(false);

  protected selectedExam = computed(() =>
    this.exams().find(e => e.id === this.examId()) ?? null
  );

  ngOnInit() {
    this.loadExams();

    this.route.queryParams.subscribe(params => {
      if (params['examId']) {
        this.examId.set(params['examId']);
      }
    });
  }

  private loadExams() {
    const userId = this.authService.currentUser()?.id;
    this.examService.getAll({ page: 0, size: 200 }).subscribe({
      next: (res) => {
        const visible = res.data.content.filter(
          e => e.createdById === userId || e.isShared
        );
        this.exams.set(visible);
        this.isLoadingExams.set(false);
      },
      error: () => {
        toast.error('Không thể tải danh sách đề thi.');
        this.isLoadingExams.set(false);
      }
    });
  }

  protected onSubmit() {
    if (!this.title().trim()) {
      toast.warning('Vui lòng nhập tên phòng thi.');
      return;
    }
    if (!this.examId()) {
      toast.warning('Vui lòng chọn đề thi.');
      return;
    }
    if (!this.startTime() || !this.endTime()) {
      toast.warning('Vui lòng chọn thời gian bắt đầu và kết thúc.');
      return;
    }

    const start = new Date(this.startTime());
    const end = new Date(this.endTime());

    if (end <= start) {
      toast.warning('Thời gian kết thúc phải lớn hơn thời gian bắt đầu.');
      return;
    }

    const request: CreateRoomRequest = {
      title: this.title().trim(),
      examId: this.examId(),
      startTime: this.startTime().length === 16 ? this.startTime() + ':00' : this.startTime(),
      endTime: this.endTime().length === 16 ? this.endTime() + ':00' : this.endTime(),
      maxStudents: this.maxStudents() ?? undefined,
    };

    this.isSubmitting.set(true);
    this.roomService.createRoom(request).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        toast.success('Tạo phòng thi thành công!');
        this.router.navigate(['/teacher/rooms']);
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        toast.error(getRoomErrorMessage(err));
      }
    });
  }
}
