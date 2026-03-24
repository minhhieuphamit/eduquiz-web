import { Component, ChangeDetectionStrategy, signal, inject, OnInit, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { SubjectService } from '../../../../core/services/subject.service';
import { ChapterService, getChapterErrorMessage } from '../../../../core/services/chapter.service';
import { QuestionService, getQuestionErrorMessage } from '../../../../core/services/question.service';
import { SubjectResponse } from '../../../../models/subject.model';
import { ChapterResponse, ChapterRequest } from '../../../../models/chapter.model';
import { QuestionResponse, QuestionRequest, QuestionType, Difficulty, OptionRequest } from '../../../../models/question.model';

@Component({
  selector: 'app-chapter-management',
  imports: [FormsModule],
  templateUrl: './chapter-management.component.html',
  styleUrls: ['./chapter-management.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChapterManagementComponent implements OnInit {
  private subjectService = inject(SubjectService);
  private chapterService = inject(ChapterService);
  private questionService = inject(QuestionService);

  // Data
  protected subjects = signal<SubjectResponse[]>([]);
  protected chapters = signal<ChapterResponse[]>([]);
  protected questions = signal<QuestionResponse[]>([]);

  // Selection
  protected selectedSubjectId = signal<string>('');
  protected selectedChapterId = signal<string>('');

  // Loading
  protected subjectsLoading = signal(true);
  protected chaptersLoading = signal(false);
  protected questionsLoading = signal(false);
  protected isSaving = signal(false);

  // Pagination
  protected questionPage = signal(0);
  protected questionTotalPages = signal(0);
  protected questionTotal = signal(0);

  // Chapter modal
  protected showChapterModal = signal(false);
  protected editingChapter = signal(false);
  protected editingChapterId = signal<string | null>(null);
  protected chapterForm: ChapterRequest = { name: '', description: '' };

  // Delete chapter confirm
  protected showDeleteChapterConfirm = signal(false);
  protected deletingChapter = signal<ChapterResponse | null>(null);

  // Question modal
  protected showQuestionModal = signal(false);
  protected editingQuestion = signal(false);
  protected editingQuestionId = signal<string | null>(null);
  protected questionForm: QuestionRequest = {
    content: '',
    type: 'SINGLE_CHOICE',
    difficulty: 'MEDIUM',
    explanation: '',
    options: [
      { label: 'A', content: '', isCorrect: true },
      { label: 'B', content: '', isCorrect: false },
      { label: 'C', content: '', isCorrect: false },
      { label: 'D', content: '', isCorrect: false },
    ]
  };

  // Delete question confirm
  protected showDeleteQuestionConfirm = signal(false);
  protected deletingQuestion = signal<QuestionResponse | null>(null);

  protected selectedSubject = computed(() =>
    this.subjects().find(s => s.id === this.selectedSubjectId()) ?? null
  );

  protected selectedChapter = computed(() =>
    this.chapters().find(c => c.id === this.selectedChapterId()) ?? null
  );

  ngOnInit() {
    this.loadSubjects();
  }

  private loadSubjects() {
    this.subjectsLoading.set(true);
    this.subjectService.getAll(0, 100).subscribe({
      next: (res) => {
        this.subjects.set(res.data.content);
        this.subjectsLoading.set(false);
        if (res.data.content.length > 0) {
          this.onSubjectChange(res.data.content[0].id);
        }
      },
      error: () => {
        toast.error('Không thể tải danh sách môn học.');
        this.subjectsLoading.set(false);
      }
    });
  }

  protected onSubjectChange(subjectId: string) {
    this.selectedSubjectId.set(subjectId);
    this.selectedChapterId.set('');
    this.questions.set([]);
    this.loadChapters(subjectId);
  }

  private loadChapters(subjectId: string) {
    this.chaptersLoading.set(true);
    this.chapterService.getBySubject(subjectId).subscribe({
      next: (res) => {
        this.chapters.set(res.data);
        this.chaptersLoading.set(false);
      },
      error: () => {
        toast.error('Không thể tải danh sách chương.');
        this.chaptersLoading.set(false);
      }
    });
  }

  protected onChapterSelect(chapterId: string) {
    this.selectedChapterId.set(chapterId);
    this.questionPage.set(0);
    this.loadQuestions(chapterId);
  }

  private loadQuestions(chapterId: string) {
    this.questionsLoading.set(true);
    this.questionService.getByChapter(chapterId, this.questionPage(), 20).subscribe({
      next: (res) => {
        this.questions.set(res.data.content);
        this.questionTotalPages.set(res.data.totalPages);
        this.questionTotal.set(res.data.totalElements);
        this.questionsLoading.set(false);
      },
      error: () => {
        toast.error('Không thể tải danh sách câu hỏi.');
        this.questionsLoading.set(false);
      }
    });
  }

  // ===== Chapter CRUD =====

  protected openCreateChapter() {
    this.editingChapter.set(false);
    this.editingChapterId.set(null);
    this.chapterForm = { name: '', description: '' };
    this.showChapterModal.set(true);
  }

  protected openEditChapter(chapter: ChapterResponse) {
    this.editingChapter.set(true);
    this.editingChapterId.set(chapter.id);
    this.chapterForm = { name: chapter.name, description: chapter.description ?? '', orderIndex: chapter.orderIndex };
    this.showChapterModal.set(true);
  }

  protected closeChapterModal() {
    this.showChapterModal.set(false);
  }

  protected submitChapter() {
    if (!this.chapterForm.name?.trim()) {
      toast.warning('Tên chương không được để trống.');
      return;
    }
    const subjectId = this.selectedSubjectId();
    if (!subjectId) return;

    this.isSaving.set(true);
    if (this.editingChapter() && this.editingChapterId()) {
      this.chapterService.update(subjectId, this.editingChapterId()!, this.chapterForm).subscribe({
        next: () => {
          this.isSaving.set(false);
          toast.success('Cập nhật chương thành công!');
          this.closeChapterModal();
          this.loadChapters(subjectId);
        },
        error: (err) => {
          this.isSaving.set(false);
          toast.error(getChapterErrorMessage(err));
        }
      });
    } else {
      this.chapterService.create(subjectId, this.chapterForm).subscribe({
        next: () => {
          this.isSaving.set(false);
          toast.success('Tạo chương thành công!');
          this.closeChapterModal();
          this.loadChapters(subjectId);
        },
        error: (err) => {
          this.isSaving.set(false);
          toast.error(getChapterErrorMessage(err));
        }
      });
    }
  }

  protected confirmDeleteChapter(chapter: ChapterResponse) {
    this.deletingChapter.set(chapter);
    this.showDeleteChapterConfirm.set(true);
  }

  protected cancelDeleteChapter() {
    this.showDeleteChapterConfirm.set(false);
    this.deletingChapter.set(null);
  }

  protected executeDeleteChapter() {
    const chapter = this.deletingChapter();
    const subjectId = this.selectedSubjectId();
    if (!chapter || !subjectId) return;

    this.isSaving.set(true);
    this.chapterService.delete(subjectId, chapter.id).subscribe({
      next: () => {
        this.isSaving.set(false);
        toast.success(`Đã xóa chương "${chapter.name}".`);
        this.cancelDeleteChapter();
        if (this.selectedChapterId() === chapter.id) {
          this.selectedChapterId.set('');
          this.questions.set([]);
        }
        this.loadChapters(subjectId);
      },
      error: (err) => {
        this.isSaving.set(false);
        toast.error(getChapterErrorMessage(err));
      }
    });
  }

  // ===== Question CRUD =====

  protected openCreateQuestion() {
    this.editingQuestion.set(false);
    this.editingQuestionId.set(null);
    this.questionForm = {
      content: '',
      type: 'SINGLE_CHOICE',
      difficulty: 'MEDIUM',
      explanation: '',
      options: [
        { label: 'A', content: '', isCorrect: true },
        { label: 'B', content: '', isCorrect: false },
        { label: 'C', content: '', isCorrect: false },
        { label: 'D', content: '', isCorrect: false },
      ]
    };
    this.showQuestionModal.set(true);
  }

  protected openEditQuestion(q: QuestionResponse) {
    this.editingQuestion.set(true);
    this.editingQuestionId.set(q.id);
    this.questionForm = {
      content: q.content,
      type: q.type,
      difficulty: q.difficulty,
      explanation: q.explanation ?? '',
      options: q.options.map(o => ({ label: o.label, content: o.content, isCorrect: o.isCorrect }))
    };
    this.showQuestionModal.set(true);
  }

  protected closeQuestionModal() {
    this.showQuestionModal.set(false);
  }

  protected addOption() {
    if (this.questionForm.options.length >= 6) return;
    const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
    const nextLabel = labels[this.questionForm.options.length] ?? String(this.questionForm.options.length + 1);
    this.questionForm.options = [...this.questionForm.options, { label: nextLabel, content: '', isCorrect: false }];
  }

  protected removeOption(index: number) {
    if (this.questionForm.options.length <= 2) return;
    this.questionForm.options = this.questionForm.options.filter((_, i) => i !== index);
    // Re-label
    const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
    this.questionForm.options = this.questionForm.options.map((o, i) => ({ ...o, label: labels[i] ?? String(i + 1) }));
  }

  protected onCorrectChange(index: number) {
    if (this.questionForm.type === 'SINGLE_CHOICE') {
      this.questionForm.options = this.questionForm.options.map((o, i) => ({ ...o, isCorrect: i === index }));
    }
  }

  protected submitQuestion() {
    if (!this.questionForm.content?.trim()) {
      toast.warning('Nội dung câu hỏi không được để trống.');
      return;
    }
    const hasEmpty = this.questionForm.options.some(o => !o.content.trim());
    if (hasEmpty) {
      toast.warning('Tất cả đáp án phải có nội dung.');
      return;
    }
    const correctCount = this.questionForm.options.filter(o => o.isCorrect).length;
    if (this.questionForm.type === 'SINGLE_CHOICE' && correctCount !== 1) {
      toast.warning('Câu hỏi một đáp án phải có đúng 1 đáp án đúng.');
      return;
    }
    if (this.questionForm.type === 'MULTI_CHOICE' && correctCount < 2) {
      toast.warning('Câu hỏi nhiều đáp án phải có ít nhất 2 đáp án đúng.');
      return;
    }

    const chapterId = this.selectedChapterId();
    if (!chapterId) return;

    this.isSaving.set(true);
    if (this.editingQuestion() && this.editingQuestionId()) {
      this.questionService.update(this.editingQuestionId()!, this.questionForm).subscribe({
        next: () => {
          this.isSaving.set(false);
          toast.success('Cập nhật câu hỏi thành công!');
          this.closeQuestionModal();
          this.loadQuestions(chapterId);
          this.loadChapters(this.selectedSubjectId());
        },
        error: (err) => {
          this.isSaving.set(false);
          toast.error(getQuestionErrorMessage(err));
        }
      });
    } else {
      this.questionService.create(chapterId, this.questionForm).subscribe({
        next: () => {
          this.isSaving.set(false);
          toast.success('Tạo câu hỏi thành công!');
          this.closeQuestionModal();
          this.loadQuestions(chapterId);
          this.loadChapters(this.selectedSubjectId());
        },
        error: (err) => {
          this.isSaving.set(false);
          toast.error(getQuestionErrorMessage(err));
        }
      });
    }
  }

  protected confirmDeleteQuestion(q: QuestionResponse) {
    this.deletingQuestion.set(q);
    this.showDeleteQuestionConfirm.set(true);
  }

  protected cancelDeleteQuestion() {
    this.showDeleteQuestionConfirm.set(false);
    this.deletingQuestion.set(null);
  }

  protected executeDeleteQuestion() {
    const q = this.deletingQuestion();
    if (!q) return;

    this.isSaving.set(true);
    this.questionService.delete(q.id).subscribe({
      next: () => {
        this.isSaving.set(false);
        toast.success('Đã xóa câu hỏi.');
        this.cancelDeleteQuestion();
        const chapterId = this.selectedChapterId();
        if (chapterId) {
          this.loadQuestions(chapterId);
          this.loadChapters(this.selectedSubjectId());
        }
      },
      error: (err) => {
        this.isSaving.set(false);
        toast.error(getQuestionErrorMessage(err));
      }
    });
  }

  protected goToQuestionPage(page: number) {
    if (page < 0 || page >= this.questionTotalPages()) return;
    this.questionPage.set(page);
    const chapterId = this.selectedChapterId();
    if (chapterId) this.loadQuestions(chapterId);
  }

  // Helpers
  protected getDifficultyLabel(d: Difficulty): string {
    return { EASY: 'Dễ', MEDIUM: 'Trung bình', HARD: 'Khó' }[d];
  }

  protected getDifficultyClass(d: Difficulty): string {
    return { EASY: 'badge-easy', MEDIUM: 'badge-medium', HARD: 'badge-hard' }[d];
  }

  protected getTypeLabel(t: QuestionType): string {
    return t === 'SINGLE_CHOICE' ? 'Một đáp án' : 'Nhiều đáp án';
  }
}
