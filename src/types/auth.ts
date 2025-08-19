export interface User {
  id: string;
  email: string;
  password: string;
  role: 'admin' | 'student';
  name: string;
  studentId?: string; // For student users
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  remarks?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: string;
  read: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: 'en' | 'hi';
  itemsPerPage: number;
  emailNotifications: boolean;
  autoBackup: boolean;
}