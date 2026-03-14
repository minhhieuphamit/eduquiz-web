export const APP_CONSTANTS = {
  TOKEN_KEY: 'eduquiz_access_token',
  REFRESH_TOKEN_KEY: 'eduquiz_refresh_token',
  USER_KEY: 'eduquiz_user',
  OTP_LENGTH: 6,
  OTP_EXPIRY_MINUTES: 5,
  OTP_MAX_RESEND: 3,
  DEFAULT_PAGE_SIZE: 10,
  EXAM_DURATIONS: {
    TOAN: 120,
    VAN: 120,
    DEFAULT: 50,
  },
} as const;
