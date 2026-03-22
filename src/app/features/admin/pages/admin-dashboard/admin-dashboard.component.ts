import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { SubjectService } from '../../../../core/services/subject.service';

interface StatCard {
  label: string;
  value: string;
  icon: string;
  color: string;
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

  protected userName = this.authService.currentUser()?.lastName ?? 'Admin';

  protected stats = signal<StatCard[]>([
    { label: 'Môn học', value: '...', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>', color: '#2196F3', link: '/admin/subjects' },
    { label: 'Câu hỏi', value: '—', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>', color: '#FF7043', link: '/admin/questions' },
    { label: 'Người dùng', value: '—', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>', color: '#48BB78', link: '/admin/users' },
    { label: 'Đề thi', value: '—', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>', color: '#9F7AEA', link: '/admin' }
  ]);

  ngOnInit() {
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
}
