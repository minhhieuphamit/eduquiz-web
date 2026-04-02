import { OptionResponse } from './question.model';

export type SessionStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED';

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
  submittedAt?: string;
  status: SessionStatus;
  score?: number;
  correctCount?: number;
  totalQuestions: number;
  questions?: QuestionWithAnswer[];
}

export interface StartExamRequest {
  examId: string;
  roomId?: string | null;
}

export interface AnswerRequest {
  questionId: string;
  selectedAnswer: string;
}

export interface ExamResultDetail {
  questionId: string;
  content: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  selectedAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

export interface ExamResultResponse {
  sessionId: string;
  examTitle: string;
  subjectName: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  startedAt: string;
  submittedAt: string;
  answers: ExamResultDetail[];
}
