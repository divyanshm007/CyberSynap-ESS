export type Role = 'super_admin' | 'admin' | 'employee';
export type Theme = 'light' | 'dark' | 'system';
export type ActiveStatus = 'active' | 'inactive';

export interface User {
  id: string;
  email: string;
  password: string;
  role: Role;
  employeeId: string;
  firstName: string;
  lastName: string;
  avatar: string;
  department: string;
  designation: string;
  managerId?: string;
  phone: string;
  location: string;
  joinDate: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bloodGroup: string;
  emergencyContact: { name: string; relation: string; phone: string };
  status: ActiveStatus;
  skills: string[];
  bio: string;
  salary: number;
  bankAccount: string;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  headId: string;
  employeeCount: number;
}

export interface PortalSession {
  id: string;
  userId: string;
  loginAt: string;    // ISO datetime
  logoutAt?: string;  // ISO datetime — absent while session is active
  durationMins?: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}
