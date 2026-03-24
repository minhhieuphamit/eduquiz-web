import { environment } from '../../../environments/environment';

export const APP_CONSTANTS = {
  STORAGE: environment.storageKeys,
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
