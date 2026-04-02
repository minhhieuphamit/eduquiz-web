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
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'EduQuiz - Luyện thi & Đánh giá năng lực' },
  {
    path: 'profile',
    loadComponent: () => import('./features/user/pages/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard],
    title: 'Thông tin cá nhân - EduQuiz'
  },
  // Student area with main layout
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['STUDENT'] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/pages/student-dashboard/student-dashboard.component').then(m => m.StudentDashboardComponent),
        title: 'Bảng điều khiển - EduQuiz'
      },
      {
        path: 'rooms/join',
        loadComponent: () => import('./features/student/pages/join-room/join-room.component').then(m => m.JoinRoomComponent),
        title: 'Tham gia phòng thi - EduQuiz'
      },
      {
        path: 'rooms/:id/waiting',
        loadComponent: () => import('./features/student/pages/waiting-room/waiting-room.component').then(m => m.WaitingRoomComponent),
        title: 'Phòng chờ - EduQuiz'
      },
      {
        path: 'exams/:id/take',
        loadComponent: () => import('./features/student/pages/exam-taking/exam-taking.component').then(m => m.ExamTakingComponent),
        title: 'Làm bài thi - EduQuiz'
      },
      {
        path: 'exams/:id/result',
        loadComponent: () => import('./features/student/pages/exam-result/exam-result.component').then(m => m.ExamResultComponent),
        title: 'Kết quả - EduQuiz'
      }
    ]
  },
  // Admin area with sidebar layout
  {
    path: 'admin',
    loadComponent: () => import('./layouts/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
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
  // Teacher area with sidebar layout
  {
    path: 'teacher',
    loadComponent: () => import('./layouts/teacher-layout/teacher-layout.component').then(m => m.TeacherLayoutComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['TEACHER'] },
    children: [
      {
        path: '',
        loadComponent: () => import('./features/teacher/pages/teacher-dashboard/teacher-dashboard.component').then(m => m.TeacherDashboardComponent),
        title: 'Giáo viên - EduQuiz'
      },
      {
        path: 'questions',
        loadComponent: () => import('./features/teacher/pages/question-management/teacher-question-management.component').then(m => m.TeacherQuestionManagementComponent),
        title: 'Ngân hàng câu hỏi - EduQuiz'
      },
      {
        path: 'exams',
        loadComponent: () => import('./features/teacher/pages/exam-management/exam-management.component').then(m => m.ExamManagementComponent),
        title: 'Quản lý đề thi - EduQuiz'
      },
      {
        path: 'rooms',
        loadComponent: () => import('./features/teacher/pages/room-management/room-management.component').then(m => m.RoomManagementComponent),
        title: 'Quản lý phòng thi - EduQuiz'
      },
      {
        path: 'rooms/new',
        loadComponent: () => import('./features/teacher/pages/room-form/room-form.component').then(m => m.RoomFormComponent),
        title: 'Tạo phòng thi - EduQuiz'
      },
      {
        path: 'rooms/:id',
        loadComponent: () => import('./features/teacher/pages/room-detail/room-detail.component').then(m => m.RoomDetailComponent),
        title: 'Chi tiết phòng thi - EduQuiz'
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
