import { Case } from './case';
export * from './case';

// User types
export interface User {
  _id: string;
  id: string;
  userId?: string;
  tutorId?: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin' | 'super_admin';
  userType: 'student' | 'tutor' | 'admin' | 'super_admin' | 'organization';
  status: 'active' | 'pending' | 'blocked';
  createdAt: string;
  avatar: string;
  upgradeStatus?: 'pending' | 'approved' | 'rejected';
  requestedRole?: string;
  organizationDocuments?: {
    businessRegistration: string;
    addressProof: string;
  };
  tutorProfile?: {
    education: string;
    experience: string;
    specialties: string[];
    documents: string[];
    applicationStatus: 'pending' | 'approved' | 'rejected';
    gender?: 'male' | 'female';
    birthDate?: string;
    teachingExperienceYears?: number;
    educationLevel?: string;
    subjects?: string[];
    examResults?: Array<{
      subject: string;
      grade: string;
    }>;
    teachingAreas?: string[];
    availableTime?: Array<{
      day: string;
      time: string;
    }>;
    teachingMethods?: string[];
    classType?: string[];
    sessionRate?: number;
    introduction?: string;
    courseFeatures?: string;
    avatarUrl?: string;
  };
  subjects?: string[];
  teachingAreas?: string[];
  teachingMethods?: string[];
  experience?: number;
  rating?: number;
  introduction?: string;
  qualifications?: string[];
  hourlyRate?: number;
  availableTime?: string[];
  ratingScore?: number;
  ratingCount?: number;
  isVip?: boolean;
  vipLevel?: number;
  isTop?: boolean;
  topLevel?: number;
  isPaid?: boolean;
  paymentType?: 'free' | 'basic' | 'premium' | 'vip';
  promotionLevel?: number;
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
  success?: boolean;
  data?: {
    users: PlatformUsers;
    cases: PlatformCases;
  };
  users?: PlatformUsers;
  cases?: PlatformCases;
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