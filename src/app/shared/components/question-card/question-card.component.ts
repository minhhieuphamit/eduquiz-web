import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { QuestionResponse, Difficulty, QuestionType } from '../../../models/question.model';
import { QuestionPermissions } from '../../../core/utils/question-permission.util';
import { MathContentComponent } from '../math-content/math-content.component';
import { AuditInfoComponent } from '../audit-info/audit-info.component';

@Component({
  selector: 'app-question-card',
  imports: [MathContentComponent, AuditInfoComponent],
  templateUrl: './question-card.component.html',
  styleUrl: './question-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionCardComponent {
  question = input.required<QuestionResponse>();
  index = input.required<number>();
  permissions = input.required<QuestionPermissions>();
  enableKatex = input.required<boolean>();

  edit = output<QuestionResponse>();
  delete = output<QuestionResponse>();
  share = output<QuestionResponse>();
  view = output<QuestionResponse>();

  getDifficultyClass(diff: Difficulty): string {
    return { EASY: 'badge-success', MEDIUM: 'badge-warning', HARD: 'badge-danger' }[diff] || 'badge-secondary';
  }

  getDifficultyLabel(diff: Difficulty): string {
    return { EASY: 'Dễ', MEDIUM: 'Trung bình', HARD: 'Khó' }[diff] || diff;
  }

  getTypeLabel(type: QuestionType): string {
    return { SINGLE_CHOICE: 'Một đáp án', MULTI_CHOICE: 'Nhiều đáp án' }[type] || type;
  }
}
