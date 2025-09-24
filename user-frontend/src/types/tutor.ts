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
  publicCertificates?: string[];
  isVip?: boolean;
  isTop?: boolean;
  region?: string;
  teachingModes?: string[];
  teachingMode?: string; // 主要教學模式：in-person, online, both
  teachingSubModes?: string[]; // 教學子模式：one-on-one, small-group, etc.
  gender?: 'male' | 'female'; // 添加根級別性別字段
  birthDate?: Date | string; // 添加出生日期字段
  
  // 新增：用戶升級做導師時填寫的欄位
  tutorProfile?: {
    subjects?: string[];
    education?: string;
    experience?: string;
    rating?: number;
    gender?: 'male' | 'female'; // 性別
    birthDate?: Date | string; // 出生日期
    // 新增欄位
    teachingMode?: string; // 補習形式，如：上門／網上／面授
    teachingSubModes?: string[]; // 教學方式細項，如：Zoom／Google Meet
    sessionRate?: number; // 每堂收費
    region?: string; // 主要地區
    subRegions?: string[]; // 教授地區
    category?: string; // 課程分類
    subCategory?: string; // 子課程分類
  };
  
  // 新增：導師申請資料
  tutorApplication?: {
    education?: string; // 學歷
    experience?: string; // 教學經驗
    subjects?: string[]; // 專長科目
    documents?: string[]; // 證書清單
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