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
  modes?: string[];           // 新增：匹配user-frontend的modes字段
  experience?: string;
  userID?: string;            // 用戶ID
  studentId?: {
    _id?: string;
    userId?: string;
    name?: string;
    email?: string;
  };
  tutor?: {
    id: string;
    name: string;
  };
  // 新增：匹配user-frontend的字段
  price?: number;             // 價格（數字）
  duration?: number;          // 時長（分鐘）
  durationUnit?: string;      // 時長單位
  weeklyLessons?: number;     // 每週堂數
  requirement?: string;       // 要求
  requirements?: string;      // 要求（複數）
  region?: string[];          // 地區
  priceRange?: string;        // 價格範圍
  detailedAddress?: string;   // 詳細地址
  startDate?: string;         // 開始上堂日子
  featured?: boolean;         // 特色
  isVip?: boolean;            // VIP
  vipLevel?: number;          // VIP等級
  isTop?: boolean;            // 置頂
  topLevel?: number;          // 置頂等級
  ratingScore?: number;       // 評分
  ratingCount?: number;       // 評分數量
  isPaid?: boolean;           // 付費
  paymentType?: string;       // 付費類型
  promotionLevel?: number;    // 推廣等級
  isApproved?: boolean;       // 已審批
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
  modes?: string[];           // 新增：匹配user-frontend的modes字段
  experience?: string;
  userID?: string;            // 用戶ID
  // 新增：匹配user-frontend的字段
  price?: number;             // 價格（數字）
  duration?: number;          // 時長（分鐘）
  durationUnit?: string;      // 時長單位
  weeklyLessons?: number;     // 每週堂數
  requirement?: string;       // 要求
  requirements?: string;      // 要求（複數）
  region?: string[];          // 地區
  priceRange?: string;        // 價格範圍
  detailedAddress?: string;   // 詳細地址
  startDate?: string;         // 開始上堂日子
  featured?: boolean;         // 特色
  isVip?: boolean;            // VIP
  vipLevel?: number;          // VIP等級
  isTop?: boolean;            // 置頂
  topLevel?: number;          // 置頂等級
  ratingScore?: number;       // 評分
  ratingCount?: number;       // 評分數量
  isPaid?: boolean;           // 付費
  paymentType?: string;       // 付費類型
  promotionLevel?: number;    // 推廣等級
  isApproved?: boolean;       // 已審批
}