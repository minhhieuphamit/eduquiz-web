export type QuestionType = 'SINGLE_CHOICE' | 'MULTI_CHOICE';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface OptionResponse {
  id: string;
  label: string;
  content: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface OptionRequest {
  label: string;
  content: string;
  isCorrect: boolean;
}

export interface QuestionResponse {
  id: string;
  chapterId: string;
  chapterName: string;
  subjectId: string;
  subjectName: string;
  content: string;
  type: QuestionType;
  difficulty: Difficulty;
  explanation: string | null;
  options: OptionResponse[];

  // Audit fields (flat — matches BE DTO)
  createdById: string;
  createdByName: string;
  updatedById: string;
  updatedByName: string;

  // Context fields (populated by BE based on current user)
  isOwner: boolean | null;
  isShared: boolean | null;

  createdAt: string;
  updatedAt: string;
}

export type QuestionOwnership = 'all' | 'mine' | 'shared';

export interface QuestionRequest {
  content: string;
  type: QuestionType;
  difficulty: Difficulty;
  explanation?: string;
  options: OptionRequest[];
}

