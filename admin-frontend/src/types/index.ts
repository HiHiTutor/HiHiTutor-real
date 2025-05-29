// User types
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'student' | 'tutor' | 'admin' | 'institution';
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

export interface Statistics {
  totalStudents: number;
  totalTutors: number;
  activeUsers: number;
  newUsersThisMonth: number;
  totalCases: number;
  activeCases: number;
  completedCases: number;
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
  statistics: Statistics | null;
  loading: boolean;
  error: string | null;
} 