import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { ExamSessionService } from '../../../../core/services/exam-session.service';
import { ExamResultResponse } from '../../../../models/exam-session.model';

@Component({
  selector: 'app-student-dashboard',
  imports: [RouterLink, DatePipe, DecimalPipe],
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private sessionService = inject(ExamSessionService);

  protected firstName = this.authService.currentUser()?.firstName ?? 'Học sinh';

  protected recentSessions = signal<ExamResultResponse[]>([]);
  protected isLoadingHistory = signal(true);

  protected totalExams = signal(0);
  protected avgScore   = signal<number | null>(null);
  protected bestScore  = signal<number | null>(null);

  ngOnInit() {
    this.loadHistory();
  }

  private loadHistory() {
    this.sessionService.getHistory(0, 5).subscribe({
      next: (res) => {
        const sessions = res.data.content;
        this.recentSessions.set(sessions);
        this.totalExams.set(res.data.totalElements);

        const finished = sessions.filter(s => s.score !== undefined && s.score !== null);
        if (finished.length > 0) {
          const total = finished.reduce((sum, s) => sum + s.score, 0);
          this.avgScore.set(total / finished.length);
          this.bestScore.set(Math.max(...finished.map(s => s.score)));
        }

        this.isLoadingHistory.set(false);
      },
      error: () => {
        this.isLoadingHistory.set(false);
      },
    });
  }

  protected getScoreBand(score: number): 'excellent' | 'good' | 'average' | 'poor' {
    if (score >= 8) return 'excellent';
    if (score >= 6.5) return 'good';
    if (score >= 5) return 'average';
    return 'poor';
  }

  protected isFinished(status: string): boolean {
    return status === 'SUBMITTED' || status === 'AUTO_SUBMITTED' || status === 'GRADED';
  }

  protected statusLabel(status: string): string {
    const map: Record<string, string> = {
      IN_PROGRESS: 'Đang làm',
      SUBMITTED: 'Đã nộp',
      AUTO_SUBMITTED: 'Đã nộp',
      GRADED: 'Đã chấm',
    };
    return map[status] ?? status;
  }
}
