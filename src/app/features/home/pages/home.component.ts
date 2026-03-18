import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SubjectService } from '../../../core/services/subject.service';
import { SubjectResponse } from '../../../models/subject.model';
import { getSubjectVisual } from '../../../core/constants/subject-defaults';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  private subjectService = inject(SubjectService);
  private sanitizer = inject(DomSanitizer);

  protected subjects = signal<SubjectResponse[]>([]);
  protected isLoading = signal(true);
  protected hasError = signal(false);

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
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      }
    });
  }

  protected getColor(subject: SubjectResponse): string {
    return getSubjectVisual(subject.name).color;
  }

  protected getIcon(subject: SubjectResponse): SafeHtml {
    const icon = subject.icon ?? getSubjectVisual(subject.name).svg;
    return this.sanitizer.bypassSecurityTrustHtml(icon);
  }

  protected retry() {
    this.loadSubjects();
  }
}
