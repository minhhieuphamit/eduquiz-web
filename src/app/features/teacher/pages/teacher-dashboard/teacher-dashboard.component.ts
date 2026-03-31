import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-teacher-dashboard',
  imports: [RouterModule],
  templateUrl: './teacher-dashboard.component.html',
  styleUrls: ['./teacher-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeacherDashboardComponent {
  private authService = inject(AuthService);
  protected userName = this.authService.currentUser()?.lastName ?? 'Giáo viên';
}
