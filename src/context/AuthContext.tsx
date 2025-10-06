import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { User as AuthUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User, AttendanceRecord, Notification, AppSettings } from '@/types/auth';
import { toast } from '@/hooks/use-toast';

interface AuthState {
  user: User | null;
  supabaseUser: AuthUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  attendanceRecords: AttendanceRecord[];
  notifications: Notification[];
  settings: AppSettings;
  isLoading: boolean;
}

type AuthAction =
  | { type: 'SET_SESSION'; payload: { user: AuthUser | null; session: Session | null; isAdmin: boolean } }
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
  supabaseUser: null,
  session: null,
  isAuthenticated: false,
  isAdmin: false,
  attendanceRecords: [],
  notifications: [],
  settings: initialSettings,
  isLoading: true,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_SESSION':
      return {
        ...state,
        supabaseUser: action.payload.user,
        session: action.payload.session,
        isAuthenticated: !!action.payload.user,
        isAdmin: action.payload.isAdmin,
        user: action.payload.user ? {
          id: action.payload.user.id,
          email: action.payload.user.email!,
          password: '',
          role: action.payload.isAdmin ? 'admin' : 'student',
          name: action.payload.user.user_metadata?.name || action.payload.user.email!,
          createdAt: action.payload.user.created_at,
        } : null,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        supabaseUser: null,
        session: null,
        isAuthenticated: false,
        isAdmin: false,
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
  logout: () => Promise<void>;
  register: (userData: { name: string; email: string; password: string; role?: string }) => Promise<boolean>;
  markAttendance: (studentId: string, status: AttendanceRecord['status'], remarks?: string) => void;
  getAttendancePercentage: (studentId: string) => number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (notificationId: string) => void;
  clearNotifications: () => void;
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

const logLogin = async (userId: string | null, email: string, role: string | null) => {
  try {
    await supabase.from('login_logs').insert([{
      user_id: userId,
      email,
      role: role as 'admin' | 'user',
      user_agent: navigator.userAgent,
    }]);
  } catch (error) {
    console.error('Error logging login:', error);
  }
};

const checkAdminRole = async (userId: string): Promise<boolean> => {
  try {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .single();
    return !!data;
  } catch {
    return false;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const isAdmin = await checkAdminRole(session.user.id);
          dispatch({ 
            type: 'SET_SESSION', 
            payload: { 
              user: session.user, 
              session, 
              isAdmin 
            } 
          });
        } else {
          dispatch({ 
            type: 'SET_SESSION', 
            payload: { user: null, session: null, isAdmin: false } 
          });
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const isAdmin = await checkAdminRole(session.user.id);
        dispatch({ 
          type: 'SET_SESSION', 
          payload: { 
            user: session.user, 
            session, 
            isAdmin 
          } 
        });
      } else {
        dispatch({ 
          type: 'SET_SESSION', 
          payload: { user: null, session: null, isAdmin: false } 
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load attendance, notifications, settings from localStorage
  useEffect(() => {
    const savedAttendance = localStorage.getItem('attendanceRecords');
    const savedNotifications = localStorage.getItem('notifications');
    const savedSettings = localStorage.getItem('appSettings');

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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const isAdmin = await checkAdminRole(data.user.id);
        await logLogin(data.user.id, email, isAdmin ? 'admin' : 'user');
        
        addNotification({
          title: 'Welcome Back!',
          message: `Hello, you have successfully logged in.`,
          type: 'success',
        });
        return true;
      }
      return false;
    } catch (error: any) {
      addNotification({
        title: 'Login Failed',
        message: error.message || 'Invalid email or password.',
        type: 'error',
      });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const register = async (userData: { 
    name: string; 
    email: string; 
    password: string; 
    role?: string;
  }): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      if (data.user) {
        await logLogin(data.user.id, userData.email, 'user');
        
        addNotification({
          title: 'Registration Successful',
          message: 'Account created successfully. You can now login.',
          type: 'success',
        });
        return true;
      }
      return false;
    } catch (error: any) {
      addNotification({
        title: 'Registration Failed',
        message: error.message || 'Something went wrong. Please try again.',
        type: 'error',
      });
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    dispatch({ type: 'LOGOUT' });
    addNotification({
      title: 'Logged Out',
      message: 'You have been successfully logged out.',
      type: 'info',
    });
  };

  const markAttendance = (studentId: string, status: AttendanceRecord['status'], remarks?: string) => {
    const today = new Date().toISOString().split('T')[0];
    
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

  const markNotificationRead = (notificationId: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notificationId });
  };

  const clearNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
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
    markNotificationRead,
    clearNotifications,
    updateSettings,
    exportData,
    importData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};