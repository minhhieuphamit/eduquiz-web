import { Component, ChangeDetectionStrategy, signal, inject, OnInit, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { SubjectService } from '../../../../core/services/subject.service';
import { ChapterService, getChapterErrorMessage } from '../../../../core/services/chapter.service';
import { QuestionService, getQuestionErrorMessage } from '../../../../core/services/question.service';
import { SubjectResponse } from '../../../../models/subject.model';
import { ChapterResponse, ChapterRequest } from '../../../../models/chapter.model';
import { QuestionResponse, QuestionRequest, QuestionType, Difficulty } from '../../../../models/question.model';
import { shouldEnableFormulaTools } from '../../../../shared/utils/subject-katex.util';
import { QuestionFormComponent } from './components/question-form/question-form.component';
import { QuestionCardComponent } from '../../../../shared/components/question-card/question-card.component';
import { ShareModalComponent } from '../../../../shared/components/share-modal/share-modal.component';
import { AuthService } from '../../../../core/services/auth.service';
import { QuestionPermissions, getQuestionPermissions } from '../../../../core/utils/question-permission.util';

@Component({
  selector: 'app-chapter-management',
  imports: [FormsModule, QuestionFormComponent, QuestionCardComponent, ShareModalComponent],
  templateUrl: './chapter-management.component.html',
  styleUrl: './chapter-management.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChapterManagementComponent implements OnInit {
  private subjectService = inject(SubjectService);
  private chapterService = inject(ChapterService);
  private questionService = inject(QuestionService);
  private authService = inject(AuthService);

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
  protected questionToEdit = signal<QuestionResponse | null>(null);

  // Delete question confirm
  protected showDeleteQuestionConfirm = signal(false);
  protected deletingQuestion = signal<QuestionResponse | null>(null);

  // Share modal
  protected showShareModal = signal(false);
  protected sharingQuestion = signal<QuestionResponse | null>(null);

  protected selectedSubject = computed(() =>
    this.subjects().find(s => s.id === this.selectedSubjectId()) ?? null,
  );

  protected isKatexEnabled = computed(() =>
    shouldEnableFormulaTools(this.selectedSubject()?.name),
  );

  protected selectedChapter = computed(() =>
    this.chapters().find(c => c.id === this.selectedChapterId()) ?? null,
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

  /**
   * Use getMyQuestions (authenticated) so BE returns isOwner/isShared context.
   * For admin, BE returns ALL questions. For teacher, own + shared.
   */
  private loadQuestions() {
    const chapterId = this.selectedChapterId();
    if (!chapterId) return;

    this.questionsLoading.set(true);
    this.questionService.getMyQuestions({
      chapterId,
      page: this.questionPage(),
      size: 20,
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
        },
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
        },
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
      },
    });
  }

  // ===== Question CRUD =====

  protected openCreateQuestion() {
    this.editingQuestion.set(false);
    this.editingQuestionId.set(null);
    this.questionToEdit.set(null);
    this.showQuestionModal.set(true);
  }

  protected openEditQuestion(q: QuestionResponse) {
    this.editingQuestion.set(true);
    this.editingQuestionId.set(q.id);
    this.questionToEdit.set(q);
    this.showQuestionModal.set(true);
  }

  protected closeQuestionModal() {
    this.showQuestionModal.set(false);
    this.questionToEdit.set(null);
  }

  handleQuestionSave(request: QuestionRequest) {
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

  protected goToQuestionPage(page: number) {
    if (page < 0 || page >= this.questionTotalPages()) return;
    this.questionPage.set(page);
    this.loadQuestions();
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

  // Helpers
  protected getPermissions(q: QuestionResponse): QuestionPermissions {
    return getQuestionPermissions(q, this.authService.currentUser()?.role ?? null);
  }
}
