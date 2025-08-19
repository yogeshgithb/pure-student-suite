import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { Student, StudentStats, FilterOptions } from '@/types/student';
import { toast } from '@/hooks/use-toast';

interface StudentState {
  students: Student[];
  filteredStudents: Student[];
  isLoading: boolean;
  error: string | null;
  darkMode: boolean;
}

type StudentAction =
  | { type: 'SET_STUDENTS'; payload: Student[] }
  | { type: 'ADD_STUDENT'; payload: Student }
  | { type: 'UPDATE_STUDENT'; payload: Student }
  | { type: 'DELETE_STUDENT'; payload: string }
  | { type: 'FILTER_STUDENTS'; payload: Student[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'CLEAR_ALL_DATA' };

const initialState: StudentState = {
  students: [],
  filteredStudents: [],
  isLoading: false,
  error: null,
  darkMode: false,
};

const studentReducer = (state: StudentState, action: StudentAction): StudentState => {
  switch (action.type) {
    case 'SET_STUDENTS':
      return {
        ...state,
        students: action.payload,
        filteredStudents: action.payload,
      };
    case 'ADD_STUDENT':
      const newStudents = [...state.students, action.payload];
      return {
        ...state,
        students: newStudents,
        filteredStudents: newStudents,
      };
    case 'UPDATE_STUDENT':
      const updatedStudents = state.students.map(student =>
        student.id === action.payload.id ? action.payload : student
      );
      return {
        ...state,
        students: updatedStudents,
        filteredStudents: updatedStudents,
      };
    case 'DELETE_STUDENT':
      const filteredStudents = state.students.filter(student => student.id !== action.payload);
      return {
        ...state,
        students: filteredStudents,
        filteredStudents: filteredStudents,
      };
    case 'FILTER_STUDENTS':
      return {
        ...state,
        filteredStudents: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'TOGGLE_DARK_MODE':
      return {
        ...state,
        darkMode: !state.darkMode,
      };
    case 'CLEAR_ALL_DATA':
      return {
        ...state,
        students: [],
        filteredStudents: [],
      };
    default:
      return state;
  }
};

interface StudentContextType {
  state: StudentState;
  addStudent: (student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  updateStudent: (student: Student) => void;
  deleteStudent: (id: string) => void;
  filterStudents: (filters: FilterOptions) => void;
  getStudentStats: () => StudentStats;
  getGrade: (marks: number) => 'A' | 'B' | 'C' | 'F';
  exportToCSV: () => void;
  toggleDarkMode: () => void;
  clearAllData: () => void;
  isRollNoUnique: (rollNo: string, excludeId?: string) => boolean;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const useStudentContext = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudentContext must be used within a StudentProvider');
  }
  return context;
};

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(studentReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedStudents = localStorage.getItem('students');
    const savedDarkMode = localStorage.getItem('darkMode');
    
    if (savedStudents) {
      try {
        const students = JSON.parse(savedStudents);
        dispatch({ type: 'SET_STUDENTS', payload: students });
      } catch (error) {
        console.error('Error loading students from localStorage:', error);
      }
    }

    if (savedDarkMode === 'true') {
      dispatch({ type: 'TOGGLE_DARK_MODE' });
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Save students to localStorage whenever students change
  useEffect(() => {
    localStorage.setItem('students', JSON.stringify(state.students));
  }, [state.students]);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', state.darkMode.toString());
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.darkMode]);

  const addStudent = (studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): boolean => {
    // Check if roll number is unique
    if (!isRollNoUnique(studentData.rollNo)) {
      toast({
        title: "Error",
        description: "Roll number already exists!",
        variant: "destructive",
      });
      return false;
    }

    const newStudent: Student = {
      ...studentData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_STUDENT', payload: newStudent });
    toast({
      title: "Success",
      description: "Student added successfully!",
    });
    return true;
  };

  const updateStudent = (student: Student) => {
    const updatedStudent = {
      ...student,
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'UPDATE_STUDENT', payload: updatedStudent });
    toast({
      title: "Success",
      description: "Student updated successfully!",
    });
  };

  const deleteStudent = (id: string) => {
    dispatch({ type: 'DELETE_STUDENT', payload: id });
    toast({
      title: "Success",
      description: "Student deleted successfully!",
    });
  };

  const isRollNoUnique = (rollNo: string, excludeId?: string): boolean => {
    return !state.students.some(student => 
      student.rollNo === rollNo && student.id !== excludeId
    );
  };

  const getGrade = (marks: number): 'A' | 'B' | 'C' | 'F' => {
    if (marks >= 90) return 'A';
    if (marks >= 75) return 'B';
    if (marks >= 50) return 'C';
    return 'F';
  };

  const filterStudents = (filters: FilterOptions) => {
    let filtered = [...state.students];

    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchLower) ||
        student.rollNo.toLowerCase().includes(searchLower) ||
        student.course.toLowerCase().includes(searchLower)
      );
    }

    // Course filter
    if (filters.courseFilter && filters.courseFilter !== 'all') {
      filtered = filtered.filter(student => student.course === filters.courseFilter);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (filters.sortBy) {
        case 'marks':
          aValue = a.marks;
          bValue = b.marks;
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'rollNo':
          aValue = a.rollNo.toLowerCase();
          bValue = b.rollNo.toLowerCase();
          break;
        case 'course':
          aValue = a.course.toLowerCase();
          bValue = b.course.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    dispatch({ type: 'FILTER_STUDENTS', payload: filtered });
  };

  const getStudentStats = (): StudentStats => {
    const students = state.students;
    
    if (students.length === 0) {
      return {
        totalStudents: 0,
        averageMarks: 0,
        highestScorer: null,
        lowestScorer: null,
        gradeDistribution: { A: 0, B: 0, C: 0, F: 0 },
      };
    }

    const totalMarks = students.reduce((sum, student) => sum + student.marks, 0);
    const averageMarks = totalMarks / students.length;

    const sortedByMarks = [...students].sort((a, b) => b.marks - a.marks);
    const highestScorer = sortedByMarks[0];
    const lowestScorer = sortedByMarks[sortedByMarks.length - 1];

    const gradeDistribution = students.reduce(
      (acc, student) => {
        const grade = getGrade(student.marks);
        acc[grade]++;
        return acc;
      },
      { A: 0, B: 0, C: 0, F: 0 }
    );

    return {
      totalStudents: students.length,
      averageMarks: Math.round(averageMarks * 100) / 100,
      highestScorer,
      lowestScorer,
      gradeDistribution,
    };
  };

  const exportToCSV = () => {
    if (state.students.length === 0) {
      toast({
        title: "No Data",
        description: "No students to export!",
        variant: "destructive",
      });
      return;
    }

    const headers = ['Name', 'Roll No', 'Course', 'Marks', 'Grade', 'Contact Info'];
    const csvContent = [
      headers.join(','),
      ...state.students.map(student =>
        [
          student.name,
          student.rollNo,
          student.course,
          student.marks,
          getGrade(student.marks),
          student.contactInfo,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `students-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Students data exported successfully!",
    });
  };

  const toggleDarkMode = () => {
    dispatch({ type: 'TOGGLE_DARK_MODE' });
  };

  const clearAllData = () => {
    dispatch({ type: 'CLEAR_ALL_DATA' });
    localStorage.removeItem('students');
    toast({
      title: "Success",
      description: "All student data cleared!",
    });
  };

  const value: StudentContextType = {
    state,
    addStudent,
    updateStudent,
    deleteStudent,
    filterStudents,
    getStudentStats,
    getGrade,
    exportToCSV,
    toggleDarkMode,
    clearAllData,
    isRollNoUnique,
  };

  return (
    <StudentContext.Provider value={value}>
      {children}
    </StudentContext.Provider>
  );
};