import { Component, ChangeDetectionStrategy, input, output, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ExamResponse } from '../../../../../../models/exam.model';
import { QuestionCardComponent } from '../../../../../../shared/components/question-card/question-card.component';
import { QuestionPermissions } from '../../../../../../core/utils/question-permission.util';
import { AuthService } from '../../../../../../core/services/auth.service';
import { shouldEnableFormulaTools } from '../../../../../../shared/utils/subject-katex.util';

const VIEW_ONLY_PERMISSIONS: QuestionPermissions = {
  canView: true, canEdit: false, canDelete: false, canShare: false,
  isOwner: false, isShared: false, ownershipLabel: '', ownershipColor: '',
};

@Component({
  selector: 'app-exam-detail-modal',
  imports: [QuestionCardComponent, DatePipe],
  templateUrl: './exam-detail-modal.component.html',
  styleUrls: ['./exam-detail-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExamDetailModalComponent {
  private authService = inject(AuthService);

  exam = input.required<ExamResponse>();
  close = output<void>();
  edit = output<ExamResponse>();

  protected permissions = VIEW_ONLY_PERMISSIONS;

  protected enableKatex = computed(() =>
    shouldEnableFormulaTools(this.exam().subjectName),
  );

  protected examTypeBadge = computed(() => {
    const map: Record<string, { label: string; cls: string }> = {
      OFFICIAL: { label: 'Chính thức', cls: 'badge-official' },
      MOCK: { label: 'Thử', cls: 'badge-mock' },
      PRACTICE: { label: 'Luyện tập', cls: 'badge-practice' },
    };
    return map[this.exam().examType] ?? { label: this.exam().examType, cls: '' };
  });

  protected randomModeLabel = computed(() => {
    const map: Record<string, string> = {
      MANUAL: 'Thủ công',
      FULL_RANDOM: 'Ngẫu nhiên toàn bộ',
      POOL_RANDOM: 'Ngẫu nhiên từ pool',
    };
    return map[this.exam().randomMode] ?? this.exam().randomMode;
  });

  protected onEdit() {
    this.edit.emit(this.exam());
  }
}
