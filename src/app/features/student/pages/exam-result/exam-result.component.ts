import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import { ExamSessionService, getSessionErrorMessage } from '../../../../core/services/exam-session.service';
import { ExamResultResponse } from '../../../../models/exam-session.model';
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

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.sessionId.set(id);
        this.loadResult();
      }
    });
  }

  private loadResult() {
    this.isLoading.set(true);
    this.sessionService.getResult(this.sessionId()).subscribe({
      next: (res) => {
        this.resultData.set(res.data);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        this.isLoading.set(false);
        toast.error(getSessionErrorMessage(err));
      }
    });
  }
}
