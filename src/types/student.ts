export interface Student {
  id: string;
  name: string;
  rollNo: string;
  course: string;
  marks: number;
  contactInfo: string;
  email?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  guardianName?: string;
  guardianContact?: string;
  admissionDate?: string;
  bloodGroup?: string;
  photo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentStats {
  totalStudents: number;
  averageMarks: number;
  highestScorer: Student | null;
  lowestScorer: Student | null;
  gradeDistribution: {
    A: number;
    B: number;
    C: number;
    F: number;
  };
}

export type Grade = 'A' | 'B' | 'C' | 'F';

export interface FilterOptions {
  searchTerm: string;
  courseFilter: string;
  sortBy: 'name' | 'rollNo' | 'course' | 'marks';
  sortOrder: 'asc' | 'desc';
}