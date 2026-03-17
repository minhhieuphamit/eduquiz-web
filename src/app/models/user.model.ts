export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dob: string;
  phoneNumber?: string;
  role: Role;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
}

export interface Role {
  id: string;
  name: 'STUDENT' | 'TEACHER' | 'ADMIN';
}
