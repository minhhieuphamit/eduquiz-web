export interface StudentStats {
  totalExams: number;
  avgScore: number;
  subjectStats: SubjectStat[];
}

export interface SubjectStat {
  subjectName: string;
  examCount: number;
  avgScore: number;
  bestScore: number;
  recentScores: number[];
}

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  fullName: string;
  avgScore: number;
  totalExams: number;
}

export interface AdminStats {
  totalUsers: number;
  totalSubjects: number;
  totalStudents: number;
  totalTeachers: number;
  totalQuestions: number;
  totalExams: number;
  totalSessions: number;
  avgScore: number;
}

export interface TeacherStats {
  totalRooms: number;
  totalExamsCreated: number;
  roomStats: RoomStat[];
}

export interface RoomStat {
  roomTitle: string;
  participantCount: number;
  avgScore: number;
  passRate: number;
}
