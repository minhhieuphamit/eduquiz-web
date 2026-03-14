export interface Subject {
  id: number;
  name: string;
  description: string;
  icon: string;
  defaultDurationMinutes: number;
}

export interface Chapter {
  id: number;
  subjectId: number;
  name: string;
  orderIndex: number;
}
