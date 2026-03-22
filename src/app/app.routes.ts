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
 * ADMIN (AdminLayout, AuthGuard):
 *   /admin               → AdminDashboardComponent
 *   /admin/subjects      → SubjectManagementComponent
 *   /admin/questions     → (placeholder)
 *   /admin/users         → UserManagementComponent
 *
 * Lazy Loading: Mỗi feature group dùng loadChildren() để lazy load
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
  // Admin area with sidebar layout
  {
    path: 'admin',
    loadComponent: () => import('./layouts/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/admin/pages/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
        title: 'Admin Dashboard - EduQuiz'
      },
      {
        path: 'subjects',
        loadComponent: () => import('./features/admin/pages/subject-management/subject-management.component').then(m => m.SubjectManagementComponent),
        title: 'Quản lý môn học - EduQuiz'
      },
      {
        path: 'questions',
        loadComponent: () => import('./features/admin/pages/chapter-management/chapter-management.component').then(m => m.ChapterManagementComponent),
        title: 'Quản lý câu hỏi - EduQuiz'
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/pages/user-management/user-management.component').then(m => m.UserManagementComponent),
        title: 'Quản lý người dùng - EduQuiz'
      },
      {
        path: 'users/students',
        loadComponent: () => import('./features/admin/pages/user-management/user-management.component').then(m => m.UserManagementComponent),
        data: { role: 'STUDENT' },
        title: 'Quản lý học sinh - EduQuiz'
      },
      {
        path: 'users/teachers',
        loadComponent: () => import('./features/admin/pages/user-management/user-management.component').then(m => m.UserManagementComponent),
        data: { role: 'TEACHER' },
        title: 'Quản lý giáo viên - EduQuiz'
      },
      {
        path: 'users/admins',
        loadComponent: () => import('./features/admin/pages/user-management/user-management.component').then(m => m.UserManagementComponent),
        data: { role: 'ADMIN' },
        title: 'Quản lý quản trị viên - EduQuiz'
      }
    ]
  },
  // Additional routes will go here
  { path: '**', redirectTo: '' }
];
