export interface ChapterResponse {
  id: string;
  subjectId: string;
  subjectName: string;
  name: string;
  description: string | null;
  orderIndex: number;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChapterRequest {
  name: string;
  description?: string;
  orderIndex?: number;
}
