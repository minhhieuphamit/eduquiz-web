export interface ExamSession {
  id: number;
  examTitle: string;
  subjectName: string;
  durationMinutes: number;
  startedAt: string;
  submittedAt?: string;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED';
  score?: number;
  correctCount?: number;
  totalQuestions: number;
}

export interface StartExamRequest {
  examId: number;
  roomId?: number;
}

export interface AnswerRequest {
  questionId: number;
  selectedAnswer: string;
}

export interface ExamResultDetail {
  questionId: number;
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
