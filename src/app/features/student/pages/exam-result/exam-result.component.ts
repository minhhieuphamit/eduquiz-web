import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import { ExamSessionService, getSessionErrorMessage } from '../../../../core/services/exam-session.service';
import { ExamAnswerDetail, ExamResultResponse } from '../../../../models/exam-session.model';
import { shouldEnableFormulaTools } from '../../../../shared/utils/subject-katex.util';

@Component({
  selector: 'app-exam-result',
  imports: [DatePipe, DecimalPipe, RouterLink],
  templateUrl: './exam-result.component.html',
  styleUrls: ['./exam-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExamResultComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private sessionService = inject(ExamSessionService);

  protected sessionId = signal<string>('');
  protected resultData = signal<ExamResultResponse | null>(null);
  protected isLoading = signal(true);

  protected enableKatex = computed(() => {
    const res = this.resultData();
    return res ? shouldEnableFormulaTools(res.subjectName) : false;
  });

  /** Duration in minutes (null if no start/submit timestamps) */
  protected durationTaken = computed<number | null>(() => {
    const r = this.resultData();
    if (!r?.startedAt || !r?.submittedAt) return null;
    const ms = new Date(r.submittedAt).getTime() - new Date(r.startedAt).getTime();
    return Math.round(ms / 60_000);
  });

  /** Score band: excellent / good / average / poor */
  protected scoreBand = computed<'excellent' | 'good' | 'average' | 'poor'>(() => {
    const r = this.resultData();
    if (!r) return 'average';
    const pct = (r.correctCount / r.totalQuestions) * 100;
    if (pct >= 80) return 'excellent';
    if (pct >= 60) return 'good';
    if (pct >= 40) return 'average';
    return 'poor';
  });

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.sessionId.set(id);
        this.loadResult();
      }
    });
  }

  /** Returns true if student selected a given option label */
  protected isSelected(ans: ExamAnswerDetail, label: string): boolean {
    return ans.selectedOptions?.includes(label) ?? false;
  }

  /** Returns true if this answer was left blank */
  protected isUnanswered(ans: ExamAnswerDetail): boolean {
    return !ans.selectedOptions || ans.selectedOptions.length === 0;
  }

  private loadResult() {
    this.isLoading.set(true);
    this.sessionService.getResult(this.sessionId()).subscribe({
      next: (res) => {
        this.resultData.set(res.data);
        this.isLoading.set(false);
      },
      error: (err: unknown) => {
        this.isLoading.set(false);
        toast.error(getSessionErrorMessage(err));
      },
    });
  }
}
