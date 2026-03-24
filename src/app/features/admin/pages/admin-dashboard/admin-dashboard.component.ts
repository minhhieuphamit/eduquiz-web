import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { SubjectService } from '../../../../core/services/subject.service';
import { StatsService } from '../../../../core/services/stats.service';

interface StatCard {
  label: string;
  value: string;
  color: string;
  gradient: string;
  link: string;
}

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private subjectService = inject(SubjectService);
  private statsService = inject(StatsService);

  protected userName = this.authService.currentUser()?.lastName ?? 'Admin';

  protected stats = signal<StatCard[]>([
    { label: 'Môn học',     value: '...', color: '#3B82F6', gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', link: '/admin/subjects' },
    { label: 'Câu hỏi',    value: '...', color: '#F97316', gradient: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)', link: '/admin/questions' },
    { label: 'Người dùng',  value: '...', color: '#10B981', gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', link: '/admin/users' },
    { label: 'Đề thi',     value: '...', color: '#8B5CF6', gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)', link: '/admin' },
  ]);

  ngOnInit() {
    this.statsService.getAdminStats().subscribe({
      next: (res) => {
        const data = res.data;
        this.stats.update(cards => cards.map((card, i) => {
          const values = [data.totalSubjects, data.totalQuestions, data.totalUsers, data.totalExams];
          return { ...card, value: String(values[i]) };
        }));
      },
      error: () => {
        this.subjectService.getAll(0, 1).subscribe({
          next: (res) => {
            this.stats.update(cards => {
              const updated = [...cards];
              updated[0] = { ...updated[0], value: String(res.data.totalElements) };
              return updated;
            });
          }
        });
      }
    });
  }
}
