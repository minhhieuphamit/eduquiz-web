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

/** Response DTO from BE admin user management API */
export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dob: string | null;
  phoneNumber: string | null;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserRoleRequest {
  role: string;
}
