import { OptionResponse } from './question.model';

export type SessionStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'AUTO_SUBMITTED' | 'GRADED';

// ── Active session (used during exam-taking) ────────────────────────────────

export interface QuestionWithAnswer {
  questionId: string;
  content: string;
  options: OptionResponse[];
  selectedAnswer: string | null;
}

export interface ExamSessionResponse {
  id: string;
  examId: string;
  examTitle: string;
  subjectName: string;
  durationMinutes: number;
  startedAt: string;
  expiresAt?: string;
  remainingSeconds?: number;
  submittedAt?: string;
  status: SessionStatus;
  score?: number;
  correctCount?: number;
  totalQuestions: number;
  questions?: QuestionWithAnswer[];
}

// ── Requests ────────────────────────────────────────────────────────────────

export interface StartExamRequest {
  examId: string;
  roomId?: string | null;
}

export interface AnswerRequest {
  questionId: string;
  selectedOptions: string[];
}

// ── Result / History (returned from /result and /history endpoints) ─────────

export interface ExamOptionDetail {
  label: string;
  content: string;
  isCorrect: boolean;
}

export interface ExamAnswerDetail {
  questionId: string;
  questionContent: string;
  options: ExamOptionDetail[];
  selectedOptions: string[] | null;  // null = not answered
  correctOptions: string[];
  isCorrect: boolean;
  explanation?: string;
}

export interface ExamResultResponse {
  sessionId: string;
  examId: string;
  examTitle: string;
  subjectName: string;
  examCreatorName?: string;   // who created the exam
  studentName?: string;
  // Room context (null when taken outside a room)
  roomTitle?: string;
  roomCode?: string;
  teacherName?: string;       // who created the room
  status: SessionStatus;
  score: number;            // 0–10 scale
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  totalQuestions: number;
  startedAt: string;
  submittedAt: string;
  answers: ExamAnswerDetail[];
}
