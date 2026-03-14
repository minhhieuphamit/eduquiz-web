import { environment } from '../../../environments/environment';

export const API_BASE_URL = environment.apiUrl;

export const API_ENDPOINTS = {
  auth: {
    register: '/auth/register',
    verifyOtp: '/auth/verify-otp',
    resendOtp: '/auth/resend-otp',
    login: '/auth/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    me: '/auth/me',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    changePasswordInit: '/auth/change-password/init',
    changePassword: '/auth/change-password',
    profile: '/auth/profile',
  },
  subjects: '/subjects',
  questions: '/questions',
  exams: '/exams',
  rooms: '/rooms',
  examSessions: '/exam-sessions',
  stats: {
    me: '/stats/me',
    leaderboard: '/stats/leaderboard',
    teacherRooms: '/stats/teacher/rooms',
    adminOverview: '/stats/admin/overview',
  },
  users: '/users',
} as const;
