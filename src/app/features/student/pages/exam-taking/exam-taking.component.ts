import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';
import { Subject, Subscription, debounceTime, interval } from 'rxjs';
import { ExamSessionService, getSessionErrorMessage } from '../../../../core/services/exam-session.service';
import { shouldEnableFormulaTools } from '../../../../shared/utils/subject-katex.util';

@Component({
  selector: 'app-exam-taking',
  templateUrl: './exam-taking.component.html',
  styleUrls: ['./exam-taking.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExamTakingComponent implements OnInit, OnDestroy {
  private sessionService = inject(ExamSessionService);
  private router = inject(Router);

  protected session = this.sessionService.currentSession;
  
  protected enableKatex = computed(() => {
    const s = this.session();
    return s ? shouldEnableFormulaTools(s.subjectName) : false;
  });

  // UI state
  protected currentQuestionIndex = signal(0);
  protected isSubmitting = signal(false);

  // Auto-save logic
  private answerSubject = new Subject<{ qId: string; ans: string }>();
  private subs = new Subscription();

  // Timer
  protected timeRemaining = signal(0); // in seconds
  private timerSub?: Subscription;

  ngOnInit() {
    const s = this.session();
    if (!s || s.status !== 'IN_PROGRESS' || !s.questions) {
      toast.error('Không tìm thấy phiên làm bài hợp lệ.');
      this.router.navigate(['/dashboard']);
      return;
    }

    // Auto-save debounce
    this.subs.add(
      this.answerSubject.pipe(debounceTime(500)).subscribe(val => {
        this.sessionService.saveAnswer(s.id, {
          questionId: val.qId,
          selectedAnswer: val.ans
        }).subscribe({
          error: () => toast.error('Lỗi tự động lưu đáp án. Vui lòng kiểm tra kết nối mạng.')
        });
      })
    );

    this.startTimer(s.durationMinutes, s.startedAt);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.timerSub?.unsubscribe();
  }

  private startTimer(durationMinutes: number, startedAt: string) {
    if (!durationMinutes) {
      this.timeRemaining.set(-1); // Infinite
      return;
    }

    const startTime = new Date(startedAt).getTime();
    const endTime = startTime + durationMinutes * 60 * 1000;

    this.updateTimer(endTime);
    this.timerSub = interval(1000).subscribe(() => this.updateTimer(endTime));
  }

  private updateTimer(endTime: number) {
    const now = new Date().getTime();
    const diff = Math.floor((endTime - now) / 1000);

    if (diff <= 0) {
      this.timeRemaining.set(0);
      this.timerSub?.unsubscribe();
      toast.warning('Hết thời gian làm bài! Đang tự động nộp bài...');
      this.submitExam();
    } else {
      this.timeRemaining.set(diff);
    }
  }

  protected formatTime(seconds: number): string {
    if (seconds < 0) return 'Không giới hạn';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  protected currentQuestion = computed(() => {
    const s = this.session();
    if (!s || !s.questions) return null;
    return s.questions[this.currentQuestionIndex()];
  });

  protected answeredCount = computed(() => {
    const s = this.session();
    if (!s || !s.questions) return 0;
    return s.questions.filter(q => q.selectedAnswer !== null).length;
  });

  protected goToQuestion(index: number) {
    this.currentQuestionIndex.set(index);
  }

  protected nextQuestion() {
    const max = (this.session()?.totalQuestions || 1) - 1;
    if (this.currentQuestionIndex() < max) {
      this.currentQuestionIndex.update(i => i + 1);
    }
  }

  protected prevQuestion() {
    if (this.currentQuestionIndex() > 0) {
      this.currentQuestionIndex.update(i => i - 1);
    }
  }

  protected selectOption(questionId: string, optionId: string) {
    // Optimistic update in state
    this.session.update(s => {
      if (!s || !s.questions) return s;
      const q = s.questions.find(x => x.questionId === questionId);
      if (q) q.selectedAnswer = optionId;
      return { ...s }; // Trigger reactivity
    });
    
    // Auto-save via subject
    this.answerSubject.next({ qId: questionId, ans: optionId });
  }

  protected getOptionLabel(index: number): string {
    return String.fromCharCode(65 + index); // 0->A, 1->B...
  }

  protected submitExam() {
    const s = this.session();
    if (!s) return;

    // Check if user has answered all questions (skip if time is up and this is auto-submit)
    if (this.timeRemaining() > 0) {
      const unanswered = (s.totalQuestions || 0) - this.answeredCount();
      if (unanswered > 0) {
        if (!confirm(`Bạn còn ${unanswered} câu chưa trả lời. Bạn có chắc chắn muốn nộp bài?`)) {
          return;
        }
      } else {
        if (!confirm('Bạn đã hoàn thành bài thi. Nộp bài ngay?')) {
          return;
        }
      }
    }

    this.isSubmitting.set(true);
    this.sessionService.submitExam(s.id).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        toast.success('Nộp bài thành công!');
        this.session.set(null); // clear state
        this.router.navigate(['/exams', s.id, 'result']);
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        toast.error(getSessionErrorMessage(err));
        // Also if backend says already submitted
        if (err?.error?.code === 2408 || err?.error?.code === 1400) {
            this.router.navigate(['/exams', s.id, 'result']);
        }
      }
    });
  }
}
