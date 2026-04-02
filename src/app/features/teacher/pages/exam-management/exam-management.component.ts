import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';
import { SubjectService } from '../../../../core/services/subject.service';
import { ExamService, getExamErrorMessage } from '../../../../core/services/exam.service';
import { AuthService } from '../../../../core/services/auth.service';
import { SubjectResponse } from '../../../../models/subject.model';
import { ExamResponse, ExamType } from '../../../../models/exam.model';
import { ExamFormModalComponent } from './components/exam-form-modal/exam-form-modal.component';
import { ExamDetailModalComponent } from './components/exam-detail-modal/exam-detail-modal.component';

@Component({
  selector: 'app-exam-management',
  imports: [FormsModule, ExamFormModalComponent, ExamDetailModalComponent],
  templateUrl: './exam-management.component.html',
  styleUrls: ['./exam-management.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExamManagementComponent implements OnInit {
  private subjectService = inject(SubjectService);
  private examService = inject(ExamService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Data
  protected currentUser = this.authService.currentUser;
  protected subjects = signal<SubjectResponse[]>([]);
  protected exams = signal<ExamResponse[]>([]);

  // Filters
  protected selectedSubjectId = signal<string>('');
  protected selectedExamType = signal<ExamType | ''>('');

  // Pagination
  protected page = signal(0);
  protected totalPages = signal(0);
  protected totalElements = signal(0);

  // UI states
  protected isLoading = signal(true);
  protected isSaving = signal(false);

  // Form modal
  protected showFormModal = signal(false);
  protected editingExam = signal<ExamResponse | null>(null);

  // Detail modal
  protected showDetailModal = signal(false);
  protected viewingExam = signal<ExamResponse | null>(null);

  // Delete confirm
  protected showDeleteConfirm = signal(false);
  protected deletingExam = signal<ExamResponse | null>(null);

  protected canFilterByType = computed(() => this.selectedSubjectId() !== '');

  ngOnInit() {
    this.loadSubjects();
    this.loadExams();
  }

  private loadSubjects() {
    this.subjectService.getAll(0, 100).subscribe({
      next: (res) => this.subjects.set(res.data.content),
      error: () => toast.error('Không thể tải danh sách môn học.'),
    });
  }

  protected loadExams() {
    this.isLoading.set(true);
    const subjectId = this.selectedSubjectId();
    const examType = this.selectedExamType();
    const page = this.page();

    const obs = subjectId
      ? this.examService.getBySubject(subjectId, {
          examType: examType || undefined,
          page,
          size: 20,
        })
      : this.examService.getAll({ page, size: 20 });

    obs.subscribe({
      next: (res) => {
        const userId = this.currentUser()?.id;
        const visible = res.data.content.filter(
          e => e.createdById === userId || e.isShared
        );
        this.exams.set(visible);
        this.totalPages.set(res.data.totalPages);
        this.totalElements.set(res.data.totalElements);
        this.isLoading.set(false);
      },
      error: () => {
        toast.error('Không thể tải danh sách đề thi.');
        this.isLoading.set(false);
      },
    });
  }

  protected onSubjectChange() {
    if (!this.selectedSubjectId()) {
      this.selectedExamType.set('');
    }
    this.page.set(0);
    this.loadExams();
  }

  protected onExamTypeChange() {
    this.page.set(0);
    this.loadExams();
  }

  protected goToPage(p: number) {
    if (p < 0 || p >= this.totalPages()) return;
    this.page.set(p);
    this.loadExams();
  }

  // --- CRUD ---

  protected openCreate() {
    this.editingExam.set(null);
    this.showFormModal.set(true);
  }

  protected openEdit(exam: ExamResponse) {
    this.examService.getById(exam.id).subscribe({
      next: (res) => {
        this.editingExam.set(res.data);
        this.showFormModal.set(true);
      },
      error: (err) => toast.error(getExamErrorMessage(err)),
    });
  }

  protected openDetail(exam: ExamResponse) {
    this.examService.getById(exam.id).subscribe({
      next: (res) => {
        this.viewingExam.set(res.data);
        this.showDetailModal.set(true);
      },
      error: (err) => toast.error(getExamErrorMessage(err)),
    });
  }

  protected closeFormModal() {
    this.showFormModal.set(false);
    this.editingExam.set(null);
  }

  protected closeDetailModal() {
    this.showDetailModal.set(false);
    this.viewingExam.set(null);
  }

  protected onFormSaved() {
    this.closeFormModal();
    this.loadExams();
  }

  protected onEditFromDetail(exam: ExamResponse) {
    this.closeDetailModal();
    this.editingExam.set(exam);
    this.showFormModal.set(true);
  }

  protected confirmDelete(exam: ExamResponse) {
    this.deletingExam.set(exam);
    this.showDeleteConfirm.set(true);
  }

  protected cancelDelete() {
    this.showDeleteConfirm.set(false);
    this.deletingExam.set(null);
  }

  protected executeDelete() {
    const exam = this.deletingExam();
    if (!exam) return;

    this.isSaving.set(true);
    this.examService.delete(exam.id).subscribe({
      next: () => {
        this.isSaving.set(false);
        toast.success(`Đã vô hiệu hóa đề thi "${exam.title}".`);
        this.cancelDelete();
        this.loadExams();
      },
      error: (err) => {
        this.isSaving.set(false);
        toast.error(getExamErrorMessage(err));
      },
    });
  }

  protected toggleShare(exam: ExamResponse) {
    if (!this.isOwner(exam)) return;
    this.examService.toggleShare(exam.id).subscribe({
      next: () => {
        toast.success(exam.isShared ? 'Đã tắt chia sẻ đề thi.' : 'Đã chia sẻ đề thi cho toàn bộ giáo viên.');
        this.loadExams();
      },
      error: (err) => toast.error(getExamErrorMessage(err)),
    });
  }

  protected createRoomFromExam(exam: ExamResponse) {
    this.router.navigate(['/teacher/rooms/new'], { queryParams: { examId: exam.id } });
  }

  // --- Helpers ---

  protected isOwner(exam: ExamResponse): boolean {
    return exam.createdById === this.currentUser()?.id;
  }

  protected examTypeBadge(type: ExamType): { label: string; cls: string } {
    const map: Record<ExamType, { label: string; cls: string }> = {
      OFFICIAL: { label: 'Chính thức', cls: 'badge-official' },
      MOCK: { label: 'Thử', cls: 'badge-mock' },
      PRACTICE: { label: 'Luyện tập', cls: 'badge-practice' },
    };
    return map[type] ?? { label: type, cls: '' };
  }

  protected randomModeBadge(mode: string): { label: string; cls: string } {
    const map: Record<string, { label: string; cls: string }> = {
      MANUAL: { label: 'Thủ công', cls: 'badge-manual' },
      FULL_RANDOM: { label: 'Ngẫu nhiên', cls: 'badge-random' },
      POOL_RANDOM: { label: 'Pool', cls: 'badge-pool' },
    };
    return map[mode] ?? { label: mode, cls: '' };
  }
}
