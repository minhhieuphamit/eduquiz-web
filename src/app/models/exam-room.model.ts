export type RoomStatus = 'SCHEDULED' | 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
export type ParticipantStatus = 'JOINED' | 'WAITING' | 'STARTED' | 'SUBMITTED' | 'TIMEOUT' | 'ABSENT';

export interface ExamRoom {
  id: string;
  roomCode: string;
  title: string;
  examId: string;
  examTitle: string;
  subjectName: string;
  teacherName: string;
  startTime: string;
  endTime: string;
  status: RoomStatus;
  maxStudents: number | null;
  durationMinutes: number | null;
  participantCount: number;
  submittedCount: number;
}

export interface CreateRoomRequest {
  title: string;
  examId: string;
  startTime: string;
  endTime: string;
  maxStudents?: number;
}

export interface JoinRoomRequest {
  roomCode: string;
}

export interface RoomParticipant {
  userId: string;
  studentName: string;
  status: ParticipantStatus;
  score?: number;
  correctCount?: number;
  totalQuestions?: number;
  submittedAt?: string;
}

export interface RoomResultResponse {
  roomInfo: {
    roomId: string;
    roomCode: string;
    title: string;
    examTitle: string;
    subjectName: string;
    totalQuestions: number;
    totalParticipants: number;
    submittedCount: number;
  };
  participants: RoomParticipant[];
}
