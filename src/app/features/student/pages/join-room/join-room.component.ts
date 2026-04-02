import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';
import { ExamRoomService, getRoomErrorMessage } from '../../../../core/services/exam-room.service';

@Component({
  selector: 'app-join-room',
  imports: [FormsModule],
  templateUrl: './join-room.component.html',
  styleUrls: ['./join-room.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JoinRoomComponent {
  private router = inject(Router);
  private roomService = inject(ExamRoomService);

  protected roomCode = signal('');
  protected isSubmitting = signal(false);

  protected onSubmit() {
    const code = this.roomCode().trim().toUpperCase();
    if (!code) {
      toast.warning('Vui lòng nhập mã phòng thi.');
      return;
    }

    this.isSubmitting.set(true);
    this.roomService.joinRoom({ roomCode: code }).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        const room = res.data;
        // Chuyển hướng tới phòng chờ kèm mã phòng
        this.router.navigate(['/rooms', room.id, 'waiting'], { queryParams: { code: code } });
        toast.success(`Đã tham gia phòng thi: ${room.title}`);
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        toast.error(getRoomErrorMessage(err));
      }
    });
  }
}
