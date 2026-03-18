export interface SubjectResponse {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  defaultDurationMinutes: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubjectRequest {
  name: string;
  description?: string;
  icon?: string;
  defaultDurationMinutes?: number;
}

export interface Chapter {
  id: string;
  subjectId: string;
  name: string;
  orderIndex: number;
}
