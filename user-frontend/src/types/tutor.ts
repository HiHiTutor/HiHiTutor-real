export interface Tutor {
  id: string;
  userId?: string;
  tutorId?: string;
  name: string;
  subject?: string;
  subjects?: string[];
  experience?: string | number;
  education?: string;
  avatarUrl?: string;
  avatar?: string;
  avatarOffsetX?: number;
  rating?: number;
  introduction?: string;
  teachingAreas?: string[];
  teachingMethods?: string[];
  qualifications?: string[];
  hourlyRate?: number;
  availableTime?: string[];
  examResults?: string[];
  courseFeatures?: string;
  isVip?: boolean;
  isTop?: boolean;
  region?: string;
  teachingModes?: string[];
  tutorProfile?: {
    subjects?: string[];
    education?: string;
    experience?: string;
    rating?: number;
  };
}

export interface TutorsResponse {
  tutors?: Tutor[];
  data?: {
    tutors?: Tutor[];
  };
  total?: number;
  totalPages?: number;
  currentPage?: number;
} 