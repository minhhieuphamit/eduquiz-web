import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { SubjectService, getSubjectErrorMessage } from '../../../../core/services/subject.service';
import { SubjectResponse, SubjectRequest } from '../../../../models/subject.model';

@Component({
  selector: 'app-subject-management',
  imports: [FormsModule],
  templateUrl: './subject-management.component.html',
  styleUrls: ['./subject-management.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubjectManagementComponent implements OnInit {
  private subjectService = inject(SubjectService);

  protected subjects = signal<SubjectResponse[]>([]);
  protected isLoading = signal(true);
  protected isSaving = signal(false);

  // Modal state
  protected showModal = signal(false);
  protected isEditing = signal(false);
  protected editingId = signal<string | null>(null);

  // Form data
  protected formData: SubjectRequest = { name: '', description: '', defaultDurationMinutes: undefined };
  protected selectedImage: File | null = null;
  protected imagePreview = signal<string | null>(null);

  // Track broken images to show placeholder (signal for OnPush CD)
  protected brokenImages = signal<Set<string>>(new Set());

  // Delete confirmation
  protected showDeleteConfirm = signal(false);
  protected deletingSubject = signal<SubjectResponse | null>(null);

  ngOnInit() {
    this.loadSubjects();
  }

  private loadSubjects() {
    this.isLoading.set(true);
    this.subjectService.getAll(0, 100).subscribe({
      next: (res) => {
        this.subjects.set(res.data.content);
        this.isLoading.set(false);
      },
      error: () => {
        toast.error('Không thể tải danh sách môn học.');
        this.isLoading.set(false);
      }
    });
  }

  protected openCreateModal() {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.formData = { name: '', description: '', defaultDurationMinutes: undefined };
    this.selectedImage = null;
    this.imagePreview.set(null);
    this.showModal.set(true);
  }

  protected openEditModal(subject: SubjectResponse) {
    this.isEditing.set(true);
    this.editingId.set(subject.id);
    this.formData = {
      name: subject.name,
      description: subject.description ?? '',
      defaultDurationMinutes: subject.defaultDurationMinutes ?? undefined
    };
    this.selectedImage = null;
    this.imagePreview.set(subject.imageUrl);
    this.showModal.set(true);
  }

  protected closeModal() {
    this.showModal.set(false);
    this.selectedImage = null;
    this.imagePreview.set(null);
  }

  protected onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.warning('Vui lòng chọn file ảnh.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.warning('Ảnh không được vượt quá 5MB.');
      return;
    }

    this.selectedImage = file;
    const reader = new FileReader();
    reader.onload = () => this.imagePreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  protected onSubmit() {
    if (!this.formData.name?.trim()) {
      toast.warning('Tên môn học không được để trống.');
      return;
    }
    if (this.formData.name.length > 100) {
      toast.warning('Tên môn học không được vượt quá 100 ký tự.');
      return;
    }
    if (this.formData.defaultDurationMinutes != null && this.formData.defaultDurationMinutes < 1) {
      toast.warning('Thời gian mặc định phải từ 1 phút trở lên.');
      return;
    }

    this.isSaving.set(true);
    const image = this.selectedImage ?? undefined;

    if (this.isEditing() && this.editingId()) {
      this.subjectService.update(this.editingId()!, this.formData, image).subscribe({
        next: () => {
          this.isSaving.set(false);
          toast.success('Cập nhật môn học thành công!');
          this.closeModal();
          this.loadSubjects();
        },
        error: (err) => {
          this.isSaving.set(false);
          toast.error(getSubjectErrorMessage(err));
        }
      });
    } else {
      this.subjectService.create(this.formData, image).subscribe({
        next: () => {
          this.isSaving.set(false);
          toast.success('Tạo môn học thành công!');
          this.closeModal();
          this.loadSubjects();
        },
        error: (err) => {
          this.isSaving.set(false);
          toast.error(getSubjectErrorMessage(err));
        }
      });
    }
  }

  protected onImageError(subjectId: string) {
    this.brokenImages.update(set => {
      const next = new Set(set);
      next.add(subjectId);
      return next;
    });
  }

  protected confirmDelete(subject: SubjectResponse) {
    this.deletingSubject.set(subject);
    this.showDeleteConfirm.set(true);
  }

  protected cancelDelete() {
    this.showDeleteConfirm.set(false);
    this.deletingSubject.set(null);
  }

  protected executeDelete() {
    const subject = this.deletingSubject();
    if (!subject) return;

    this.isSaving.set(true);
    this.subjectService.delete(subject.id).subscribe({
      next: () => {
        this.isSaving.set(false);
        toast.success(`Đã xóa môn "${subject.name}".`);
        this.cancelDelete();
        this.loadSubjects();
      },
      error: (err) => {
        this.isSaving.set(false);
        toast.error(getSubjectErrorMessage(err));
      }
    });
  }
}
