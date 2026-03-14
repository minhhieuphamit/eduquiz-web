# EduQuiz Web - Frontend Structure

```
src/app/
│
├── core/                                    ⚙️ Singleton services & utilities
│   ├── services/
│   │   ├── auth.service.ts                  Login, register, OTP, JWT token management
│   │   ├── subject.service.ts               CRUD môn học + chương
│   │   ├── question.service.ts              CRUD câu hỏi (Teacher/Admin)
│   │   ├── exam.service.ts                  Tạo/xem đề thi
│   │   ├── exam-room.service.ts             Phòng thi: tạo, join, xem kết quả
│   │   ├── exam-session.service.ts          Làm bài: start, answer, submit
│   │   ├── stats.service.ts                 Thống kê + leaderboard
│   │   └── user.service.ts                  Quản lý user (Admin)
│   ├── interceptors/
│   │   └── auth.interceptor.ts              Gắn JWT header + auto refresh 401
│   ├── guards/
│   │   ├── auth.guard.ts                    Chặn nếu chưa login
│   │   ├── role.guard.ts                    Chặn theo role (STUDENT/TEACHER/ADMIN)
│   │   └── guest.guard.ts                   Chặn login page nếu đã login
│   └── constants/
│       ├── api.constants.ts                 API endpoints map
│       └── app.constants.ts                 Token keys, OTP config, page size...
│
├── shared/                                  🔧 Reusable components & directives
│   ├── components/
│   │   ├── header/                          Navbar (menu khác nhau theo role)
│   │   ├── footer/                          Footer chung
│   │   ├── loading/                         Loading spinner
│   │   ├── pagination/                      Pagination controls
│   │   └── confirm-dialog/                  Confirm dialog (delete, submit...)
│   ├── directives/
│   │   └── katex/
│   │       └── katex.directive.ts           🧮 Render LaTeX → KaTeX (dùng ở mọi nơi)
│   └── pipes/                               Custom pipes
│
├── layouts/                                 📐 Page layouts
│   ├── main-layout/                         Header + Content + Footer (sau login)
│   └── auth-layout/                         Centered card (login, register, OTP)
│
├── features/                                📦 Feature modules
│   │
│   ├── auth/                                🔑 Authentication
│   │   └── pages/
│   │       ├── login/                       Email + password form
│   │       ├── register/                    Register + chọn role (Student/Teacher)
│   │       ├── verify-otp/                  Nhập OTP 6 số từ email
│   │       ├── forgot-password/             Nhập email → gửi OTP
│   │       └── reset-password/              OTP + new password
│   │
│   ├── exam/                                📝 Thi trắc nghiệm (Student)
│   │   ├── pages/
│   │   │   ├── exam-list/                   Danh sách đề theo môn
│   │   │   ├── exam-taking/                 🎯 Trang làm bài (timer + questions)
│   │   │   └── exam-result/                 Kết quả + chi tiết từng câu
│   │   └── components/
│   │       ├── question-card/               1 câu hỏi + 4 đáp án (KaTeX render)
│   │       ├── question-nav/                Thanh số câu (answered/flagged/current)
│   │       └── timer/                       ⏱️ Countdown, auto-submit khi hết giờ
│   │
│   ├── exam-room/                           🏫 Phòng thi (Student)
│   │   └── pages/
│   │       ├── join-room/                   Nhập mã phòng 6 ký tự
│   │       └── waiting-room/                Chờ đến giờ thi, hiển thị countdown
│   │
│   ├── dashboard/                           📊 Dashboard & Profile (Student)
│   │   └── pages/
│   │       ├── student-dashboard/           Thống kê điểm, biểu đồ tiến độ
│   │       ├── leaderboard/                 Bảng xếp hạng theo môn
│   │       ├── exam-history/                Lịch sử làm bài
│   │       ├── profile/                     Xem/sửa thông tin cá nhân
│   │       └── change-password/             Đổi password (OTP verify)
│   │
│   ├── teacher/                             👩‍🏫 Teacher panel
│   │   ├── pages/
│   │   │   ├── teacher-dashboard/           Thống kê phòng thi, đề đã tạo
│   │   │   ├── question-management/         Danh sách câu hỏi (filter, search)
│   │   │   ├── question-form/               Tạo/sửa câu hỏi (LaTeX editor)
│   │   │   ├── exam-management/             Danh sách đề thi
│   │   │   ├── exam-form/                   Tạo đề (chọn mode, câu hỏi)
│   │   │   ├── room-management/             Danh sách phòng thi
│   │   │   ├── room-form/                   Tạo phòng (thời gian, đề, mode)
│   │   │   ├── room-detail/                 Realtime: HS đã vào/đang thi/đã nộp
│   │   │   └── room-results/                Kết quả phòng: DS học sinh + điểm
│   │   └── components/
│   │       └── latex-editor/                ✏️ Split-view: nhập LaTeX | preview KaTeX
│   │
│   └── admin/                               🔧 Admin panel
│       └── pages/
│           ├── admin-dashboard/             Thống kê hệ thống tổng quan
│           ├── subject-management/          CRUD môn học
│           ├── chapter-management/          CRUD chương (theo môn)
│           └── user-management/             Quản lý users (role, activate)
│
├── models/                                  📋 TypeScript interfaces
│   ├── user.model.ts
│   ├── auth.model.ts
│   ├── subject.model.ts
│   ├── question.model.ts
│   ├── exam.model.ts
│   ├── exam-room.model.ts
│   ├── exam-session.model.ts
│   ├── stats.model.ts
│   ├── api-response.model.ts
│   └── index.ts                             Barrel export
│
├── app.routes.ts                            🗺️ Route config (lazy loading)
├── app.component.ts
└── app.config.ts

src/environments/
├── environment.ts                           Dev: apiUrl = localhost:8080
└── environment.prod.ts                      Prod: apiUrl = /api/v1
```

## Nguyên tắc tổ chức

1. **Feature-based**: Mỗi feature (auth, exam, teacher...) là folder riêng, chứa pages + components riêng
2. **Standalone components**: Angular 17+ style, không cần NgModule
3. **Lazy loading**: Mỗi feature group load riêng khi cần
4. **Core singleton**: Services, guards, interceptors dùng chung toàn app
5. **Shared reusable**: Components/directives dùng lại ở nhiều features
6. **Models tập trung**: Import từ `@models` barrel export
