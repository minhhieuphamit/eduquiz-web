import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { SubjectService } from '../../../../core/services/subject.service';
import { StatsService } from '../../../../core/services/stats.service';

interface StatCard {
  label: string;
  value: string;
  icon: string;
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
    {
      label: 'Môn học',
      value: '...',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
      color: '#3B82F6',
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
      link: '/admin/subjects'
    },
    {
      label: 'Câu hỏi',
      value: '...',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><circle cx="12" cy="17" r=".5"/></svg>',
      color: '#F97316',
      gradient: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
      link: '/admin/questions'
    },
    {
      label: 'Người dùng',
      value: '...',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
      color: '#10B981',
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      link: '/admin/users'
    },
    {
      label: 'Đề thi',
      value: '...',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 13h4"/><path d="M10 17h4"/><path d="M10 9h1"/></svg>',
      color: '#8B5CF6',
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
      link: '/admin'
    }
  ]);

  ngOnInit() {
    this.statsService.getAdminStats().subscribe({
      next: (res) => {
        const data = res.data;
        this.stats.update(cards => {
          const updated = [...cards];
          updated[0] = { ...updated[0], value: String(data.totalSubjects) };
          updated[1] = { ...updated[1], value: String(data.totalQuestions) };
          updated[2] = { ...updated[2], value: String(data.totalUsers) };
          updated[3] = { ...updated[3], value: String(data.totalExams) };
          return updated;
        });
      },
      error: () => {
        // Fallback: load subject count from SubjectService
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
