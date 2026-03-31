import { Component, ChangeDetectionStrategy, signal, inject, OnInit, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { SubjectService } from '../../../../core/services/subject.service';
import { ChapterService } from '../../../../core/services/chapter.service';
import { QuestionService, getQuestionErrorMessage } from '../../../../core/services/question.service';
import { AuthService } from '../../../../core/services/auth.service';
import { SubjectResponse } from '../../../../models/subject.model';
import { ChapterResponse } from '../../../../models/chapter.model';
import { QuestionResponse, QuestionRequest, QuestionOwnership } from '../../../../models/question.model';
import { shouldEnableFormulaTools } from '../../../../shared/utils/subject-katex.util';
import { QuestionFormComponent } from '../../../admin/pages/chapter-management/components/question-form/question-form.component';
import { QuestionCardComponent } from '../../../../shared/components/question-card/question-card.component';
import { ShareModalComponent } from '../../../../shared/components/share-modal/share-modal.component';
import { QuestionPermissions, getQuestionPermissions } from '../../../../core/utils/question-permission.util';

@Component({
  selector: 'app-teacher-question-management',
  imports: [FormsModule, QuestionFormComponent, QuestionCardComponent, ShareModalComponent],
  templateUrl: './teacher-question-management.component.html',
  styleUrl: './teacher-question-management.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherQuestionManagementComponent implements OnInit {
  private subjectService = inject(SubjectService);
  private chapterService = inject(ChapterService);
  private questionService = inject(QuestionService);
  private authService = inject(AuthService);

  // Data
  protected subjects = signal<SubjectResponse[]>([]);
  protected chapters = signal<ChapterResponse[]>([]);
  protected questions = signal<QuestionResponse[]>([]);

  // Selection & Filter
  protected selectedSubjectId = signal<string>('');
  protected selectedChapterId = signal<string>('');
  protected activeFilter = signal<QuestionOwnership>('all');

  // Loading
  protected subjectsLoading = signal(true);
  protected chaptersLoading = signal(false);
  protected questionsLoading = signal(false);
  protected isSaving = signal(false);

  // Pagination
  protected questionPage = signal(0);
  protected questionTotalPages = signal(0);
  protected questionTotal = signal(0);

  // Modals
  protected showQuestionModal = signal(false);
  protected editingQuestion = signal(false);
  protected editingQuestionId = signal<string | null>(null);
  protected questionToEdit = signal<QuestionResponse | null>(null);
  protected questionFormReadOnly = signal(false);

  protected showDeleteQuestionConfirm = signal(false);
  protected deletingQuestion = signal<QuestionResponse | null>(null);

  protected showShareModal = signal(false);
  protected sharingQuestion = signal<QuestionResponse | null>(null);

  // Computed
  protected currentUser = computed(() => this.authService.currentUser());

  protected selectedSubject = computed(() =>
    this.subjects().find(s => s.id === this.selectedSubjectId()) ?? null,
  );

  protected isKatexEnabled = computed(() =>
    shouldEnableFormulaTools(this.selectedSubject()?.name),
  );

  protected selectedChapter = computed(() =>
    this.chapters().find(c => c.id === this.selectedChapterId()) ?? null,
  );

  /** Client-side filter based on BE-provided isOwner/isShared flags */
  protected displayQuestions = computed(() => {
    const qs = this.questions();
    const filter = this.activeFilter();
    if (filter === 'all') return qs;
    if (filter === 'mine') return qs.filter(q => q.isOwner);
    return qs.filter(q => q.isShared);
  });

  ngOnInit() {
    this.loadSubjects();
  }

  private loadSubjects() {
    this.subjectsLoading.set(true);
    this.subjectService.getAll(0, 100).subscribe({
      next: (res) => {
        this.subjects.set(res.data.content);
        this.subjectsLoading.set(false);
        if (res.data.content.length > 0) this.onSubjectChange(res.data.content[0].id);
      },
      error: () => {
        toast.error('Không thể tải danh sách môn học.');
        this.subjectsLoading.set(false);
      },
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
      },
    });
  }

  protected onChapterSelect(chapterId: string) {
    this.selectedChapterId.set(chapterId);
    this.questionPage.set(0);
    this.loadQuestions();
  }

  protected setFilter(filter: QuestionOwnership) {
    this.activeFilter.set(filter);
  }

  /** Use getMyQuestions for authenticated context (isOwner/isShared populated) */
  private loadQuestions() {
    const chapterId = this.selectedChapterId();
    if (!chapterId) return;

    this.questionsLoading.set(true);
    this.questionService.getMyQuestions({
      chapterId,
      page: this.questionPage(),
      size: 50,
    }).subscribe({
      next: (res) => {
        this.questions.set(res.data.content);
        this.questionTotalPages.set(res.data.totalPages);
        this.questionTotal.set(res.data.totalElements);
        this.questionsLoading.set(false);
      },
      error: () => {
        toast.error('Không thể tải danh sách câu hỏi.');
        this.questionsLoading.set(false);
      },
    });
  }

  // ===== Question Actions =====

  protected openCreateQuestion() {
    this.editingQuestion.set(false);
    this.editingQuestionId.set(null);
    this.questionToEdit.set(null);
    this.questionFormReadOnly.set(false);
    this.showQuestionModal.set(true);
  }

  protected openEditQuestion(q: QuestionResponse) {
    this.editingQuestion.set(true);
    this.editingQuestionId.set(q.id);
    this.questionToEdit.set(q);
    this.questionFormReadOnly.set(false);
    this.showQuestionModal.set(true);
  }

  /** Open shared question in read-only mode */
  protected openViewQuestion(q: QuestionResponse) {
    this.editingQuestion.set(false);
    this.editingQuestionId.set(null);
    this.questionToEdit.set(q);
    this.questionFormReadOnly.set(true);
    this.showQuestionModal.set(true);
  }

  protected closeQuestionModal() {
    this.showQuestionModal.set(false);
    this.questionToEdit.set(null);
    this.questionFormReadOnly.set(false);
  }

  protected handleQuestionSave(request: QuestionRequest) {
    const chapterId = this.selectedChapterId();
    if (!chapterId) return;

    this.isSaving.set(true);
    if (this.editingQuestion() && this.editingQuestionId()) {
      this.questionService.update(this.editingQuestionId()!, request).subscribe({
        next: () => {
          this.isSaving.set(false);
          toast.success('Cập nhật câu hỏi thành công!');
          this.closeQuestionModal();
          this.loadQuestions();
          this.loadChapters(this.selectedSubjectId());
        },
        error: (err) => {
          this.isSaving.set(false);
          toast.error(getQuestionErrorMessage(err));
        },
      });
    } else {
      this.questionService.create(chapterId, request).subscribe({
        next: () => {
          this.isSaving.set(false);
          toast.success('Tạo câu hỏi thành công!');
          this.closeQuestionModal();
          this.loadQuestions();
          this.loadChapters(this.selectedSubjectId());
        },
        error: (err) => {
          this.isSaving.set(false);
          toast.error(getQuestionErrorMessage(err));
        },
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
        this.loadQuestions();
        this.loadChapters(this.selectedSubjectId());
      },
      error: (err) => {
        this.isSaving.set(false);
        toast.error(getQuestionErrorMessage(err));
      },
    });
  }

  // Share
  protected openShareModal(q: QuestionResponse) {
    this.sharingQuestion.set(q);
    this.showShareModal.set(true);
  }

  protected closeShareModal() {
    this.showShareModal.set(false);
    this.sharingQuestion.set(null);
  }

  protected onShareChanged() {
    this.loadQuestions();
  }

  // Pagination
  protected goToQuestionPage(page: number) {
    if (page < 0 || page >= this.questionTotalPages()) return;
    this.questionPage.set(page);
    this.loadQuestions();
  }

  protected getPermissions(q: QuestionResponse): QuestionPermissions {
    return getQuestionPermissions(q, this.currentUser()?.role ?? null);
  }
}
