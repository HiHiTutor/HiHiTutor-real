export type CaseStatus = 'open' | 'matched' | 'closed' | 'pending' | '';
export type CaseType = 'student' | 'tutor' | 'all';

export interface Case {
  id: string;
  title: string;
  description: string;
  type: 'student' | 'tutor';
  category: string;
  subCategory?: string;
  subjects: string[];
  regions: string[];
  subRegions: string[];
  budget: string;
  mode: 'online' | 'offline' | 'hybrid';
  experience?: string;
  status: CaseStatus;
  student?: {
    id: string;
    name: string;
  };
  tutor?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CaseResponse {
  success: boolean;
  data: {
    cases: Case[];
    pagination: {
      total: number;
      page: number;
      limit: number;
    };
  };
}

export interface SingleCaseResponse {
  success: boolean;
  data: Case;
  message?: string;
} 