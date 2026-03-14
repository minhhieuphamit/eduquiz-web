export interface Exam {
  id: number;
  title: string;
  subjectId: number;
  subjectName: string;
  durationMinutes: number;
  totalQuestions: number;
  randomMode: 'FULL_RANDOM' | 'POOL_RANDOM' | 'MANUAL';
  isActive: boolean;
  createdByName: string;
  createdAt: string;
}

export interface CreateExamRequest {
  title: string;
  subjectId: number;
  durationMinutes?: number;
  totalQuestions: number;
  randomMode: string;
  difficulty?: string;
  questionIds?: number[];  // MANUAL mode
}
