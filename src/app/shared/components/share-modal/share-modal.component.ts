import { Component, ChangeDetectionStrategy, input, output, signal, inject } from '@angular/core';
import { toast } from 'ngx-sonner';
import { QuestionResponse } from '../../../models/question.model';
import { QuestionService, getQuestionErrorMessage } from '../../../core/services/question.service';

@Component({
  selector: 'app-share-modal',
  templateUrl: './share-modal.component.html',
  styleUrl: './share-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareModalComponent {
  private questionService = inject(QuestionService);

  question = input<QuestionResponse | null>(null);
  isOpen = input(false);

  closeModal = output<void>();
  shareChanged = output<void>();

  isProcessing = signal(false);

  toggleShare() {
    const q = this.question();
    if (!q || this.isProcessing()) return;

    this.isProcessing.set(true);
    this.questionService.shareQuestion(q.id).subscribe({
      next: () => {
        const msg = q.isShared
          ? 'Đã hủy chia sẻ câu hỏi.'
          : 'Đã chia sẻ câu hỏi cho tất cả giáo viên.';
        toast.success(msg);
        this.isProcessing.set(false);
        this.shareChanged.emit();
        this.closeModal.emit();
      },
      error: (err) => {
        toast.error(getQuestionErrorMessage(err));
        this.isProcessing.set(false);
      },
    });
  }

  handleClose() {
    if (!this.isProcessing()) {
      this.closeModal.emit();
    }
  }
}
