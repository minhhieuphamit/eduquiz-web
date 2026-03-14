export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  birthYear: number;
  role: Role;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
}

export interface Role {
  id: number;
  name: 'STUDENT' | 'TEACHER' | 'ADMIN';
}
