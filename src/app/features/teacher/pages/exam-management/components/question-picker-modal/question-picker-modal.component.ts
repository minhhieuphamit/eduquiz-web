import { Component, ChangeDetectionStrategy, input, output, signal, computed, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { ChapterService } from '../../../../../../core/services/chapter.service';
import { QuestionService } from '../../../../../../core/services/question.service';
import { ChapterResponse } from '../../../../../../models/chapter.model';
import { QuestionResponse, Difficulty, QuestionType } from '../../../../../../models/question.model';
import { shouldEnableFormulaTools } from '../../../../../../shared/utils/subject-katex.util';
import { MathContentComponent } from '../../../../../../shared/components/math-content/math-content.component';

@Component({
  selector: 'app-question-picker-modal',
  imports: [FormsModule, MathContentComponent],
  templateUrl: './question-picker-modal.component.html',
  styleUrls: ['./question-picker-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionPickerModalComponent implements OnInit {
  private chapterService = inject(ChapterService);
  private questionService = inject(QuestionService);

  subjectId = input.required<string>();
  subjectName = input<string>('');
  alreadySelected = input<string[]>([]);

  confirm = output<QuestionResponse[]>();
  cancel = output<void>();

  // Data
  protected chapters = signal<ChapterResponse[]>([]);
  protected questions = signal<QuestionResponse[]>([]);

  // Selection
  protected selectedChapterId = signal<string>('');
  protected selectedDifficulty = signal<Difficulty | ''>('');
  protected selectedType = signal<QuestionType | ''>('');
  protected selectedQuestions = signal<Map<string, QuestionResponse>>(new Map());

  // Pagination
  protected page = signal(0);
  protected totalPages = signal(0);

  // UI
  protected isLoadingChapters = signal(true);
  protected isLoadingQuestions = signal(false);

  protected enableKatex = computed(() => shouldEnableFormulaTools(this.subjectName()));
  protected selectedCount = computed(() => this.selectedQuestions().size);

  ngOnInit() {
    // Pre-fill already selected questions
    const already = this.alreadySelected();
    if (already.length > 0) {
      const map = new Map<string, QuestionResponse>();
      this.selectedQuestions.set(map);
    }

    this.loadChapters();
  }

  private loadChapters() {
    this.isLoadingChapters.set(true);
    this.chapterService.getBySubject(this.subjectId()).subscribe({
      next: (res) => {
        this.chapters.set(res.data);
        this.isLoadingChapters.set(false);
      },
      error: () => {
        toast.error('Không thể tải danh sách chương.');
        this.isLoadingChapters.set(false);
      },
    });
  }

  protected loadQuestions() {
    this.isLoadingQuestions.set(true);
    this.questionService.getMyQuestions({
      subjectId: this.subjectId(),
      chapterId: this.selectedChapterId() || undefined,
      difficulty: this.selectedDifficulty() || undefined,
      type: this.selectedType() || undefined,
      page: this.page(),
      size: 20,
    }).subscribe({
      next: (res) => {
        this.questions.set(res.data.content);
        this.totalPages.set(res.data.totalPages);
        this.isLoadingQuestions.set(false);
      },
      error: () => {
        toast.error('Không thể tải câu hỏi.');
        this.isLoadingQuestions.set(false);
      },
    });
  }

  protected onChapterChange() {
    this.page.set(0);
    this.loadQuestions();
  }

  protected onFilterChange() {
    this.page.set(0);
    this.loadQuestions();
  }

  protected goToPage(p: number) {
    if (p < 0 || p >= this.totalPages()) return;
    this.page.set(p);
    this.loadQuestions();
  }

  protected isSelected(questionId: string): boolean {
    return this.selectedQuestions().has(questionId);
  }

  protected toggleQuestion(question: QuestionResponse) {
    this.selectedQuestions.update(map => {
      const next = new Map(map);
      if (next.has(question.id)) {
        next.delete(question.id);
      } else {
        next.set(question.id, question);
      }
      return next;
    });
  }

  protected onConfirm() {
    const selected = Array.from(this.selectedQuestions().values());
    if (selected.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một câu hỏi.');
      return;
    }
    this.confirm.emit(selected);
  }

  protected getDifficultyLabel(diff: Difficulty): string {
    return { EASY: 'Dễ', MEDIUM: 'Trung bình', HARD: 'Khó' }[diff] || diff;
  }

  protected getDifficultyClass(diff: Difficulty): string {
    return { EASY: 'diff-easy', MEDIUM: 'diff-medium', HARD: 'diff-hard' }[diff] || '';
  }
}
