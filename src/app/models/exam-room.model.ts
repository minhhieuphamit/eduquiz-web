export interface ExamRoom {
  id: number;
  roomCode: string;
  title: string;
  examTitle: string;
  subjectName: string;
  teacherName: string;
  randomMode: string;
  startTime: string;
  endTime: string;
  status: 'SCHEDULED' | 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  maxStudents: number | null;
  participantCount: number;
  submittedCount: number;
}

export interface CreateRoomRequest {
  title: string;
  examId: number;
  randomMode: string;
  poolSize?: number;
  startTime: string;
  endTime: string;
  maxStudents?: number;
}

export interface JoinRoomRequest {
  roomCode: string;
}

export interface RoomParticipant {
  userId: number;
  fullName: string;
  status: 'JOINED' | 'IN_PROGRESS' | 'SUBMITTED';
  score?: number;
  correctCount?: number;
  submittedAt?: string;
}
