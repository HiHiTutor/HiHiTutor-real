export type CaseStatus = '' | 'open' | 'matched' | 'closed' | 'pending';
export type CaseType = 'all' | 'student' | 'tutor';

export interface Case {
  id?: string;
  _id?: string;
  type: 'student' | 'tutor';
  title: string;
  description: string;
  status: CaseStatus;
  category: string;
  subCategory?: string;
  subjects: string[];
  regions: string[];
  subRegions: string[];
  budget: string;
  mode: string;
  experience?: string;
  studentId?: {
    _id?: string;
    userId?: string;
    name?: string;
    email?: string;
  };
  student?: {
    _id?: string;
    userId?: string;
    name?: string;
    email?: string;
  };
  tutor?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SingleCaseResponse {
  success: boolean;
  data: {
    case: Case;
  };
  message?: string;
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
  message?: string;
}

export interface CreateCaseData {
  type: 'student' | 'tutor';
  title: string;
  description: string;
  category: string;
  subCategory?: string;
  subjects: string[];
  regions: string[];
  subRegions: string[] | { region: string; subRegion: string }[];
  budget: string;
  mode: string;
  experience?: string;
} 