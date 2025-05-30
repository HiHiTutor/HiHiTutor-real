import { Case } from './case';
export * from './case';

// User types
export interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  userType: 'student' | 'tutor' | 'admin' | 'organization';
  status: 'active' | 'pending' | 'blocked';
  createdAt: string;
  upgradeStatus?: 'pending' | 'approved' | 'rejected';
  requestedRole?: string;
}

// Statistics types
export interface Subject {
  name: string;
  count: number;
}

export interface Activity {
  id: string;
  description: string;
  timestamp: string;
}

export interface PlatformUsers {
  totalUsers: number;
  students: number;
  tutors: number;
  institutions: number;
  totalStudents?: number;
  totalTutors?: number;
  activeUsers?: number;
  newUsers?: number;
}

export interface PlatformCases {
  totalCases: number;
  openCases: number;
  matchedCases: number;
  studentCases: number;
  tutorCases: number;
  activeCases?: number;
  completedCases?: number;
}

export interface Statistics {
  users: PlatformUsers;
  cases: PlatformCases;
}

export interface DashboardStatistics {
  totalStudents: number;
  totalTutors: number;
  activeCases: number;
  successRate: number;
  activeUsers: number;
  newUsersThisMonth: number;
  totalCases: number;
  completedCases: number;
  hotSubjects: Subject[];
  recentActivities: Activity[];
}

// State types
export interface UserState {
  users: User[];
  selectedUser: User | null;
  loading: boolean;
  error: string | null;
}

export interface CaseState {
  cases: Case[];
  selectedCase: Case | null;
  loading: boolean;
  error: string | null;
}

export interface StatisticsState {
  statistics: DashboardStatistics | null;
  loading: boolean;
  error: string | null;
} 