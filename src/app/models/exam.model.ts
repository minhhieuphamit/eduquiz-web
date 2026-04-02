import { QuestionResponse } from './question.model';

export type RandomMode = 'FULL_RANDOM' | 'POOL_RANDOM' | 'MANUAL';
export type ExamType = 'OFFICIAL' | 'MOCK' | 'PRACTICE';

export interface ExamResponse {
  id: string;
  title: string;
  description: string | null;
  subjectId: string;
  subjectName: string;
  durationMinutes: number | null;
  totalQuestions: number;
  randomMode: RandomMode;
  year: number | null;
  examType: ExamType;
  createdById: string;
  createdByName: string;
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
  questions: QuestionResponse[] | null;
}

export interface CreateExamRequest {
  title: string;
  description?: string;
  subjectId: string;
  durationMinutes?: number;
  randomMode: RandomMode;
  year?: number;
  examType?: ExamType;
  totalQuestions?: number;
  questionIds?: string[];
  chapterIds?: string[];
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
}
