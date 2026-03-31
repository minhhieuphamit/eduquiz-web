import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SubjectService } from '../../../core/services/subject.service';
import { ChapterService } from '../../../core/services/chapter.service';
import { SubjectResponse } from '../../../models/subject.model';
import { ChapterResponse } from '../../../models/chapter.model';
import { getSubjectVisual } from '../../../core/constants/subject-defaults';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  private subjectService = inject(SubjectService);
  private chapterService = inject(ChapterService);
  private sanitizer = inject(DomSanitizer);

  protected subjects = signal<SubjectResponse[]>([]);
  protected isLoading = signal(true);
  protected hasError = signal(false);
  protected brokenImages = signal<Set<string>>(new Set());

  // Chapter display state
  protected selectedSubject = signal<SubjectResponse | null>(null);
  protected chapters = signal<ChapterResponse[]>([]);
  protected chaptersLoading = signal(false);
  protected expandedChapters = signal<Set<string>>(new Set());

  ngOnInit() {
    this.loadSubjects();
  }

  private loadSubjects() {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.subjectService.getAll(0, 50).subscribe({
      next: (res) => {
        this.subjects.set(res.data.content);
        this.isLoading.set(false);
        // Auto-select first subject
        if (res.data.content.length > 0) {
          this.selectSubject(res.data.content[0]);
        }
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      }
    });
  }

  protected selectSubject(subject: SubjectResponse) {
    if (this.selectedSubject()?.id === subject.id) return;
    this.selectedSubject.set(subject);
    this.chapters.set([]);
    this.expandedChapters.set(new Set());
    this.chaptersLoading.set(true);

    this.chapterService.getBySubject(subject.id).subscribe({
      next: (res) => {
        this.chapters.set(res.data);
        this.chaptersLoading.set(false);
      },
      error: () => {
        this.chaptersLoading.set(false);
      }
    });
  }

  protected isSelected(subject: SubjectResponse): boolean {
    return this.selectedSubject()?.id === subject.id;
  }

  protected toggleChapter(chapterId: string) {
    this.expandedChapters.update(set => {
      const next = new Set(set);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  }

  protected isChapterExpanded(chapterId: string): boolean {
    return this.expandedChapters().has(chapterId);
  }

  protected getColor(subject: SubjectResponse): string {
    return getSubjectVisual(subject.name).color;
  }

  protected getFallbackIcon(subject: SubjectResponse): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(getSubjectVisual(subject.name).svg);
  }

  protected hasImage(subject: SubjectResponse): boolean {
    return !!subject.imageUrl && !this.brokenImages().has(subject.id);
  }

  protected onImageError(subjectId: string) {
    this.brokenImages.update(set => {
      const next = new Set(set);
      next.add(subjectId);
      return next;
    });
  }

  protected retry() {
    this.loadSubjects();
  }
}
