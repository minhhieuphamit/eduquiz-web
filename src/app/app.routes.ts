/**
 * App Routes Configuration.
 *
 * Structure:
 *
 * AUTH (AuthLayout, GuestGuard):
 *   /auth/login          → LoginComponent
 *   /auth/register       → RegisterComponent
 *   /auth/verify-otp     → VerifyOtpComponent
 *   /auth/forgot-password → ForgotPasswordComponent
 *   /auth/reset-password → ResetPasswordComponent
 *
 * STUDENT (MainLayout, AuthGuard, RoleGuard['STUDENT']):
 *   /dashboard           → StudentDashboardComponent
 *   /exam-history        → ExamHistoryComponent
 *   /leaderboard         → LeaderboardComponent
 *   /profile             → ProfileComponent
 *   /change-password     → ChangePasswordComponent
 *   /exams               → ExamListComponent
 *   /exams/:id/take      → ExamTakingComponent
 *   /exams/:id/result    → ExamResultComponent
 *   /rooms/join          → JoinRoomComponent
 *   /rooms/:id/waiting   → WaitingRoomComponent
 *
 * TEACHER (MainLayout, AuthGuard, RoleGuard['TEACHER']):
 *   /teacher/dashboard        → TeacherDashboardComponent
 *   /teacher/questions        → QuestionManagementComponent
 *   /teacher/questions/new    → QuestionFormComponent
 *   /teacher/questions/:id    → QuestionFormComponent (edit)
 *   /teacher/exams            → ExamManagementComponent
 *   /teacher/exams/new        → ExamFormComponent
 *   /teacher/rooms            → RoomManagementComponent
 *   /teacher/rooms/new        → RoomFormComponent
 *   /teacher/rooms/:id        → RoomDetailComponent
 *   /teacher/rooms/:id/results → RoomResultsComponent
 *
 * ADMIN (MainLayout, AuthGuard, RoleGuard['ADMIN']):
 *   /admin/dashboard     → AdminDashboardComponent
 *   /admin/subjects      → SubjectManagementComponent
 *   /admin/subjects/:id/chapters → ChapterManagementComponent
 *   /admin/users         → UserManagementComponent
 *
 * REDIRECTS:
 *   /                    → /auth/login
 *   **                   → 404 page
 *
 * Lazy Loading: Mỗi feature group dùng loadChildren() để lazy load
 *
 * TODO: Implement Routes[]
 */
import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/pages/home.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'EduQuiz - Luyện thi & Đánh giá năng lực' },
  { 
    path: 'profile', 
    loadComponent: () => import('./features/user/pages/profile/profile.component').then(m => m.ProfileComponent), 
    canActivate: [authGuard],
    title: 'Thông tin cá nhân - EduQuiz' 
  },
  // Additional routes will go here
  { path: '**', redirectTo: '' }
];
