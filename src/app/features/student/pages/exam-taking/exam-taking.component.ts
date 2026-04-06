import {
  Component, ChangeDetectionStrategy,
  signal, computed, inject, OnInit, OnDestroy,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { toast } from 'ngx-sonner';
import { Subject, Subscription, debounceTime, interval } from 'rxjs';
import { ExamSessionService, getSessionErrorMessage } from '../../../../core/services/exam-session.service';
import { shouldEnableFormulaTools } from '../../../../shared/utils/subject-katex.util';

@Component({
  selector: 'app-exam-taking',
  imports: [],
  templateUrl: './exam-taking.component.html',
  styleUrls: ['./exam-taking.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExamTakingComponent implements OnInit, OnDestroy {
  private sessionService = inject(ExamSessionService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Source-of-truth lives in the service signal
  protected session = this.sessionService.currentSession;

  protected enableKatex = computed(() => {
    const s = this.session();
    return s ? shouldEnableFormulaTools(s.subjectName) : false;
  });

  // ─── UI state ─────────────────────────────────────────────────────────────
  protected isLoading = signal(true);
  protected currentQuestionIndex = signal(0);
  protected isSubmitting = signal(false);
  protected showSubmitDialog = signal(false);
  protected savingQuestionId = signal<string | null>(null);

  // ─── Computed ─────────────────────────────────────────────────────────────
  protected currentQuestion = computed(() => {
    const s = this.session();
    if (!s?.questions) return null;
    return s.questions[this.currentQuestionIndex()] ?? null;
  });

  protected answeredCount = computed(() => {
    const s = this.session();
    if (!s?.questions) return 0;
    return s.questions.filter(q => q.selectedAnswer !== null).length;
  });

  protected unansweredCount = computed(() =>
    (this.session()?.totalQuestions ?? 0) - this.answeredCount()
  );

  protected timerWarning = computed(() => {
    const t = this.timeRemaining();
    return t > 0 && t <= 300;
  });

  // ─── Timer ────────────────────────────────────────────────────────────────
  protected timeRemaining = signal(0);
  private timerSub?: Subscription;

  // ─── Autosave ─────────────────────────────────────────────────────────────
  private answerSubject = new Subject<{ sessionId: string; qId: string; selectedOptions: string[] }>();
  private subs = new Subscription();

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const sessionId = params.get('id');
      if (!sessionId) {
        this.router.navigate(['/dashboard']);
        return;
      }
      this.initSession(sessionId);
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.timerSub?.unsubscribe();
  }

  // ─── Session init & restore ───────────────────────────────────────────────
  private initSession(sessionId: string) {
    const cached = this.session();

    // Use cached session if it's the same valid in-progress session
    if (
      cached &&
      cached.id === sessionId &&
      cached.status === 'IN_PROGRESS' &&
      cached.questions?.length
    ) {
      this.isLoading.set(false);
      this.setupAutosave(sessionId);
      this.startTimer(cached.durationMinutes, cached.startedAt);
      return;
    }

    // Restore from backend (page reload / direct navigation)
    this.isLoading.set(true);
    this.sessionService.getSession(sessionId).subscribe({
      next: (res) => {
        const s = res.data;
        this.isLoading.set(false);

        if (s.status !== 'IN_PROGRESS') {
          // Already submitted — go straight to result
          toast.info('Bài thi đã được nộp. Đang chuyển đến kết quả...');
          this.router.navigate(['/exams', sessionId, 'result']);
          return;
        }

        this.setupAutosave(sessionId);
        this.startTimer(s.durationMinutes, s.startedAt);
      },
      error: (err: unknown) => {
        this.isLoading.set(false);
        toast.error(getSessionErrorMessage(err));
        this.router.navigate(['/dashboard']);
      },
    });
  }

  private setupAutosave(sessionId: string) {
    this.subs.add(
      this.answerSubject.pipe(debounceTime(400)).subscribe(({ qId, selectedOptions }) => {
        this.savingQuestionId.set(qId);
        this.sessionService
          .saveAnswer(sessionId, { questionId: qId, selectedOptions })
          .subscribe({
            next: () => this.savingQuestionId.set(null),
            error: () => {
              this.savingQuestionId.set(null);
              toast.error('Lỗi lưu đáp án. Kiểm tra kết nối mạng.');
            },
          });
      })
    );
  }

  // ─── Timer ────────────────────────────────────────────────────────────────
  private startTimer(durationMinutes: number | null, startedAt: string) {
    if (!durationMinutes) {
      this.timeRemaining.set(-1); // no limit
      return;
    }

    const endTime = new Date(startedAt).getTime() + durationMinutes * 60_000;
    this.updateTimer(endTime);
    this.timerSub = interval(1000).subscribe(() => this.updateTimer(endTime));
  }

  private updateTimer(endTime: number) {
    const diff = Math.floor((endTime - Date.now()) / 1000);
    if (diff <= 0) {
      this.timeRemaining.set(0);
      this.timerSub?.unsubscribe();
      toast.warning('Hết giờ! Đang tự động nộp bài...');
      this.doSubmit(true);
    } else {
      this.timeRemaining.set(diff);
    }
  }

  protected formatTime(seconds: number): string {
    if (seconds < 0) return '∞';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return h > 0
      ? `${pad(h)}:${pad(m)}:${pad(s)}`
      : `${pad(m)}:${pad(s)}`;
  }

  // ─── Navigation ───────────────────────────────────────────────────────────
  protected goToQuestion(index: number) {
    this.currentQuestionIndex.set(index);
  }

  protected nextQuestion() {
    const max = (this.session()?.totalQuestions ?? 1) - 1;
    if (this.currentQuestionIndex() < max) {
      this.currentQuestionIndex.update(i => i + 1);
    }
  }

  protected prevQuestion() {
    if (this.currentQuestionIndex() > 0) {
      this.currentQuestionIndex.update(i => i - 1);
    }
  }

  // ─── Answer selection ─────────────────────────────────────────────────────
  protected selectOption(questionId: string, label: string) {
    // Immutable update — no direct mutation
    this.session.update(s => {
      if (!s?.questions) return s;
      return {
        ...s,
        questions: s.questions.map(q =>
          q.questionId === questionId ? { ...q, selectedAnswer: label } : q
        ),
      };
    });

    const sessionId = this.session()?.id;
    if (sessionId) {
      this.answerSubject.next({ sessionId, qId: questionId, selectedOptions: [label] });
    }
  }

  // ─── Submit flow ──────────────────────────────────────────────────────────
  protected openSubmitDialog() {
    this.showSubmitDialog.set(true);
  }

  protected closeSubmitDialog() {
    this.showSubmitDialog.set(false);
  }

  protected confirmSubmit() {
    this.doSubmit(false);
  }

  private doSubmit(isAutoSubmit = false) {
    const s = this.session();
    if (!s || this.isSubmitting()) return;

    this.showSubmitDialog.set(false);
    this.isSubmitting.set(true);
    this.timerSub?.unsubscribe();

    this.sessionService.submitExam(s.id).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        toast.success(isAutoSubmit ? 'Hết giờ — bài thi đã được nộp.' : 'Nộp bài thành công!');
        this.router.navigate(['/exams', s.id, 'result']);
      },
      error: (err: unknown) => {
        this.isSubmitting.set(false);
        const code = (err as any)?.error?.code;
        if (code === 6402 || code === 6403) {
          // Already submitted or time expired → still go to result
          toast.info('Bài thi đã được ghi nhận.');
          this.router.navigate(['/exams', s.id, 'result']);
        } else {
          toast.error(getSessionErrorMessage(err));
        }
      },
    });
  }
}
