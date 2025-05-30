// User types
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  userType: 'student' | 'tutor' | 'admin' | 'organization';
  status: 'active' | 'pending' | 'blocked';
  createdAt: string;
  upgradeStatus?: 'pending' | 'approved' | 'rejected';
  requestedRole?: string;
}

// Case types
export interface Case {
  id: string;
  title: string;
  subject: string;
  status: 'open' | 'matched' | 'closed' | 'pending';
  createdAt: string;
  description: string;
  student: User;
  tutor?: User;
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
}

export interface PlatformCases {
  totalCases: number;
  openCases: number;
  matchedCases: number;
  studentCases: number;
  tutorCases: number;
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