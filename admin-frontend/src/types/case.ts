export interface Case {
  _id: string;
  id: string;
  title: string;
  description: string;
  status: CaseStatus;
  type: CaseType;
  subject: string;
  createdAt: string;
  student: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    userType: 'student' | 'tutor' | 'admin' | 'organization';
    status: 'active' | 'pending' | 'blocked';
  };
  tutor?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    userType: 'student' | 'tutor' | 'admin' | 'organization';
    status: 'active' | 'pending' | 'blocked';
  };
  category?: string;
  subCategory?: string;
  subjects?: string[];
  regions?: string[];
  subRegions?: string[];
  budget?: {
    min: number;
    max: number;
  };
  mode?: string;
  experience?: string;
  featured?: boolean;
  isApproved?: boolean;
  // ... other case fields ...
}

export interface CaseResponse {
  success: boolean;
  data: {
    cases: Case[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export type CaseType = 'student' | 'tutor' | 'all';

export type CaseStatus = 'open' | 'matched' | 'closed' | 'pending' | ''; 