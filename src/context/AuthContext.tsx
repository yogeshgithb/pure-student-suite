import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { User, AttendanceRecord, Notification, AppSettings } from '@/types/auth';
import { Student } from '@/types/student';
import { toast } from '@/hooks/use-toast';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  attendanceRecords: AttendanceRecord[];
  notifications: Notification[];
  settings: AppSettings;
  isLoading: boolean;
}

type AuthAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'ADD_ATTENDANCE'; payload: AttendanceRecord }
  | { type: 'UPDATE_ATTENDANCE'; payload: AttendanceRecord }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_NOTIFICATIONS' };

const initialSettings: AppSettings = {
  theme: 'light',
  language: 'en',
  itemsPerPage: 10,
  emailNotifications: true,
  autoBackup: false,
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  attendanceRecords: [],
  notifications: [],
  settings: initialSettings,
  isLoading: false,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
      };
    case 'ADD_ATTENDANCE':
      return {
        ...state,
        attendanceRecords: [...state.attendanceRecords, action.payload],
      };
    case 'UPDATE_ATTENDANCE':
      return {
        ...state,
        attendanceRecords: state.attendanceRecords.map(record =>
          record.id === action.payload.id ? action.payload : record
        ),
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
      };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(notif =>
          notif.id === action.payload ? { ...notif, read: true } : notif
        ),
      };
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
      };
    default:
      return state;
  }
};

interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Omit<User, 'id' | 'createdAt'>) => Promise<boolean>;
  markAttendance: (studentId: string, status: AttendanceRecord['status'], remarks?: string) => void;
  getAttendancePercentage: (studentId: string) => number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  exportData: () => void;
  importData: (data: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load data from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedAttendance = localStorage.getItem('attendanceRecords');
    const savedNotifications = localStorage.getItem('notifications');
    const savedSettings = localStorage.getItem('appSettings');

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        dispatch({ type: 'LOGIN', payload: user });
      } catch (error) {
        console.error('Error loading user:', error);
      }
    }

    if (savedAttendance) {
      try {
        const attendance = JSON.parse(savedAttendance);
        attendance.forEach((record: AttendanceRecord) => {
          dispatch({ type: 'ADD_ATTENDANCE', payload: record });
        });
      } catch (error) {
        console.error('Error loading attendance:', error);
      }
    }

    if (savedNotifications) {
      try {
        const notifications = JSON.parse(savedNotifications);
        notifications.forEach((notif: Notification) => {
          dispatch({ type: 'ADD_NOTIFICATION', payload: notif });
        });
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    }

    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    if (state.user) {
      localStorage.setItem('currentUser', JSON.stringify(state.user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [state.user]);

  useEffect(() => {
    localStorage.setItem('attendanceRecords', JSON.stringify(state.attendanceRecords));
  }, [state.attendanceRecords]);

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(state.notifications));
  }, [state.notifications]);

  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(state.settings));
  }, [state.settings]);

  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check saved users
      const savedUsers = localStorage.getItem('users');
      const users: User[] = savedUsers ? JSON.parse(savedUsers) : [];
      
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        dispatch({ type: 'LOGIN', payload: user });
        addNotification({
          title: 'Welcome Back!',
          message: `Hello ${user.name}, you have successfully logged in.`,
          type: 'success',
        });
        return true;
      } else {
        // Default admin account
        if (email === 'admin@studysync.com' && password === 'admin123') {
          const defaultAdmin: User = {
            id: 'admin',
            email: 'admin@studysync.com',
            password: 'admin123',
            role: 'admin',
            name: 'System Administrator',
            createdAt: new Date().toISOString(),
          };
          dispatch({ type: 'LOGIN', payload: defaultAdmin });
          return true;
        }
        
        addNotification({
          title: 'Login Failed',
          message: 'Invalid email or password.',
          type: 'error',
        });
        return false;
      }
    } catch (error) {
      addNotification({
        title: 'Login Error',
        message: 'Something went wrong. Please try again.',
        type: 'error',
      });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const register = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<boolean> => {
    try {
      const savedUsers = localStorage.getItem('users');
      const users: User[] = savedUsers ? JSON.parse(savedUsers) : [];
      
      // Check if email already exists
      if (users.some(u => u.email === userData.email)) {
        addNotification({
          title: 'Registration Failed',
          message: 'Email already exists.',
          type: 'error',
        });
        return false;
      }

      const newUser: User = {
        ...userData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      addNotification({
        title: 'Registration Successful',
        message: 'Account created successfully. You can now login.',
        type: 'success',
      });
      return true;
    } catch (error) {
      addNotification({
        title: 'Registration Error',
        message: 'Something went wrong. Please try again.',
        type: 'error',
      });
      return false;
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    addNotification({
      title: 'Logged Out',
      message: 'You have been successfully logged out.',
      type: 'info',
    });
  };

  const markAttendance = (studentId: string, status: AttendanceRecord['status'], remarks?: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if attendance already marked for today
    const existingRecord = state.attendanceRecords.find(
      record => record.studentId === studentId && record.date === today
    );

    const attendanceRecord: AttendanceRecord = {
      id: existingRecord?.id || Date.now().toString(),
      studentId,
      date: today,
      status,
      remarks,
    };

    if (existingRecord) {
      dispatch({ type: 'UPDATE_ATTENDANCE', payload: attendanceRecord });
    } else {
      dispatch({ type: 'ADD_ATTENDANCE', payload: attendanceRecord });
    }

    addNotification({
      title: 'Attendance Updated',
      message: `Attendance marked as ${status} for today.`,
      type: 'success',
    });
  };

  const getAttendancePercentage = (studentId: string): number => {
    const studentRecords = state.attendanceRecords.filter(record => record.studentId === studentId);
    if (studentRecords.length === 0) return 0;
    
    const presentCount = studentRecords.filter(record => record.status === 'present').length;
    return Math.round((presentCount / studentRecords.length) * 100);
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
  };

  const updateSettings = (settings: Partial<AppSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
    addNotification({
      title: 'Settings Updated',
      message: 'Your preferences have been saved.',
      type: 'success',
    });
  };

  const exportData = () => {
    const students = localStorage.getItem('students');
    const data = {
      students: students ? JSON.parse(students) : [],
      attendance: state.attendanceRecords,
      users: localStorage.getItem('users') ? JSON.parse(localStorage.getItem('users')!) : [],
      settings: state.settings,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `studysync-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addNotification({
      title: 'Data Exported',
      message: 'System data has been exported successfully.',
      type: 'success',
    });
  };

  const importData = (data: any) => {
    try {
      if (data.students) {
        localStorage.setItem('students', JSON.stringify(data.students));
      }
      if (data.attendance) {
        localStorage.setItem('attendanceRecords', JSON.stringify(data.attendance));
      }
      if (data.users) {
        localStorage.setItem('users', JSON.stringify(data.users));
      }
      if (data.settings) {
        dispatch({ type: 'UPDATE_SETTINGS', payload: data.settings });
      }

      addNotification({
        title: 'Data Imported',
        message: 'System data has been imported successfully. Please refresh the page.',
        type: 'success',
      });
    } catch (error) {
      addNotification({
        title: 'Import Failed',
        message: 'Failed to import data. Please check the file format.',
        type: 'error',
      });
    }
  };

  const value: AuthContextType = {
    state,
    login,
    logout,
    register,
    markAttendance,
    getAttendancePercentage,
    addNotification,
    updateSettings,
    exportData,
    importData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};