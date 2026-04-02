import { Component, ChangeDetectionStrategy, input, output, signal, computed, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { ExamService, getExamErrorMessage } from '../../../../../../core/services/exam.service';
import { ChapterService } from '../../../../../../core/services/chapter.service';
import { ExamResponse, CreateExamRequest, RandomMode, ExamType } from '../../../../../../models/exam.model';
import { SubjectResponse } from '../../../../../../models/subject.model';
import { ChapterResponse } from '../../../../../../models/chapter.model';
import { QuestionResponse } from '../../../../../../models/question.model';
import { QuestionPickerModalComponent } from '../question-picker-modal/question-picker-modal.component';

@Component({
  selector: 'app-exam-form-modal',
  imports: [FormsModule, QuestionPickerModalComponent],
  templateUrl: './exam-form-modal.component.html',
  styleUrls: ['./exam-form-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExamFormModalComponent implements OnInit {
  private examService = inject(ExamService);
  private chapterService = inject(ChapterService);

  exam = input<ExamResponse | null>(null);
  subjects = input.required<SubjectResponse[]>();

  save = output<void>();
  cancel = output<void>();

  // Form fields
  protected title = signal('');
  protected description = signal('');
  protected subjectId = signal('');
  protected durationMinutes = signal<number | null>(null);
  protected year = signal<number | null>(null);
  protected examType = signal<ExamType>('PRACTICE');
  protected randomMode = signal<RandomMode>('MANUAL');
  protected totalQuestions = signal<number | null>(null);
  protected difficulty = signal<'EASY' | 'MEDIUM' | 'HARD' | ''>('');

  // MANUAL mode
  protected selectedQuestions = signal<QuestionResponse[]>([]);
  protected showQuestionPicker = signal(false);

  // POOL_RANDOM mode
  protected chapters = signal<ChapterResponse[]>([]);
  protected selectedChapterIds = signal<Set<string>>(new Set());
  protected isLoadingChapters = signal(false);

  // UI
  protected isSaving = signal(false);

  protected isEditing = computed(() => this.exam() !== null);

  protected selectedSubjectName = computed(() => {
    const id = this.subjectId();
    return this.subjects().find(s => s.id === id)?.name ?? '';
  });

  protected manualQuestionCount = computed(() => this.selectedQuestions().length);

  ngOnInit() {
    const e = this.exam();
    if (e) {
      this.title.set(e.title);
      this.description.set(e.description ?? '');
      this.subjectId.set(e.subjectId);
      this.durationMinutes.set(e.durationMinutes);
      this.year.set(e.year);
      this.examType.set(e.examType);
      this.randomMode.set(e.randomMode);
      this.totalQuestions.set(e.totalQuestions);

      if (e.randomMode === 'MANUAL' && e.questions) {
        this.selectedQuestions.set([...e.questions]);
      }

      if (e.subjectId) {
        this.loadChapters(e.subjectId);
      }
    }
  }

  protected onSubjectChange() {
    const id = this.subjectId();
    this.selectedQuestions.set([]);
    this.selectedChapterIds.set(new Set());
    this.chapters.set([]);
    if (id) {
      this.loadChapters(id);
    }
  }

  private loadChapters(subjectId: string) {
    this.isLoadingChapters.set(true);
    this.chapterService.getBySubject(subjectId).subscribe({
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

  protected onRandomModeChange() {
    this.selectedQuestions.set([]);
    this.selectedChapterIds.set(new Set());
    this.totalQuestions.set(null);
    this.difficulty.set('');
  }

  // Question picker
  protected openQuestionPicker() {
    if (!this.subjectId()) {
      toast.warning('Vui lòng chọn môn học trước.');
      return;
    }
    this.showQuestionPicker.set(true);
  }

  protected onQuestionsPicked(questions: QuestionResponse[]) {
    this.selectedQuestions.set(questions);
    this.showQuestionPicker.set(false);
  }

  protected removeQuestion(questionId: string) {
    this.selectedQuestions.update(list => list.filter(q => q.id !== questionId));
  }

  // Chapter selection for POOL_RANDOM
  protected isChapterSelected(chapterId: string): boolean {
    return this.selectedChapterIds().has(chapterId);
  }

  protected toggleChapter(chapterId: string) {
    this.selectedChapterIds.update(set => {
      const next = new Set(set);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  }

  // Submit
  protected onSubmit() {
    if (!this.title().trim()) {
      toast.warning('Tên đề thi không được để trống.');
      return;
    }
    if (!this.subjectId()) {
      toast.warning('Vui lòng chọn môn học.');
      return;
    }

    const mode = this.randomMode();

    if (mode === 'MANUAL' && this.selectedQuestions().length === 0) {
      toast.warning('Vui lòng chọn ít nhất một câu hỏi.');
      return;
    }
    if (mode !== 'MANUAL' && (!this.totalQuestions() || this.totalQuestions()! < 1)) {
      toast.warning('Vui lòng nhập số câu hỏi.');
      return;
    }
    if (mode === 'POOL_RANDOM' && this.selectedChapterIds().size === 0) {
      toast.warning('Vui lòng chọn ít nhất một chương.');
      return;
    }

    const request: CreateExamRequest = {
      title: this.title().trim(),
      description: this.description().trim() || undefined,
      subjectId: this.subjectId(),
      durationMinutes: this.durationMinutes() ?? undefined,
      randomMode: mode,
      year: this.year() ?? undefined,
      examType: this.examType(),
    };

    if (mode === 'MANUAL') {
      request.questionIds = this.selectedQuestions().map(q => q.id);
      request.totalQuestions = this.selectedQuestions().length;
    } else {
      request.totalQuestions = this.totalQuestions() ?? undefined;
    }

    if (mode === 'POOL_RANDOM') {
      request.chapterIds = Array.from(this.selectedChapterIds());
      request.difficulty = this.difficulty() || undefined;
    }

    this.isSaving.set(true);
    const exam = this.exam();

    const obs = exam
      ? this.examService.update(exam.id, request)
      : this.examService.create(request);

    obs.subscribe({
      next: () => {
        this.isSaving.set(false);
        toast.success(exam ? 'Cập nhật đề thi thành công!' : 'Tạo đề thi thành công!');
        this.save.emit();
      },
      error: (err) => {
        this.isSaving.set(false);
        toast.error(getExamErrorMessage(err));
      },
    });
  }
}
