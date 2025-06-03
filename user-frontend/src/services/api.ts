import { RegisterFormData } from '@/types/auth';

// API 基礎 URL
const baseURL = process.env.NEXT_PUBLIC_API_BASE || 'https://hi-hi-tutor-real-backend2.vercel.app';
console.log('🌐 API baseURL:', baseURL);

// 通用 API 請求函數
export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  try {
    // 確保 endpoint 以 / 開頭
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // 構建完整的 URL
    const url = `https://hi-hi-tutor-real-backend2.vercel.app/api${normalizedEndpoint}`;
    
    console.log('🚀 發送 API 請求:', url);
    console.log('📦 請求參數:', options);

    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: '無法解析回應' }));
      console.error('❌ API 錯誤:', errorData);
      throw new Error(errorData.message || 'API 請求失敗');
    }

    const responseData = await response.json().catch(() => ({ message: '無法解析回應' }));
    console.log('📥 API 回應:', responseData);

    return responseData;
  } catch (error) {
    console.error('❌ API 請求錯誤:', error);
    throw error;
  }
};

// 認證相關 API
export const authApi = {
  // 用戶登入
  login: async (identifier: string, password: string) => {
    console.log('🔑 嘗試登入:', { identifier });
    
    const res = await fetchApi("/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    });

    if (!res.success || !res.token || !res.user) {
      console.error('❌ 登入回應格式錯誤:', res);
      throw new Error(res.message || "登入回應格式錯誤");
    }

    console.log('✅ 登入成功:', res.user);
    localStorage.setItem("token", res.token);
    return res.user;
  },
  
  // 註冊新用戶
  register: async (data: RegisterFormData | FormData) => {
    const options: RequestInit = {
      method: 'POST',
    };

    // 如果是 FormData，不設置 Content-Type，讓瀏覽器自動設置
    if (data instanceof FormData) {
      options.body = data;
    } else {
      options.headers = {
        'Content-Type': 'application/json',
      };
      options.body = JSON.stringify(data);
    }

    return fetchApi('/auth/register', options);
  },

  // 發送驗證碼
  sendVerificationCode: (identifier: string) =>
    fetchApi('/auth/send-code', {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    }),

  // 驗證驗證碼
  verifyCode: (identifier: string, code: string) =>
    fetchApi('/auth/verify-code', {
      method: 'POST',
      body: JSON.stringify({ identifier, code }),
    }),
  
  // 獲取用戶資料
  getProfile: () => 
    fetchApi('/auth/me', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }),
};

// 導師相關 API
export const tutorApi = {
  // 獲取所有導師
  getAllTutors: () => fetchApi('/tutors'),
  
  // 獲取推薦導師
  getRecommendedTutors: () => fetchApi('/tutors/recommended'),
  
  // 獲取單一導師詳情
  getTutorById: (id: number) => fetchApi(`/tutors/${id}`),

  // 申請配對導師
  applyTutor: (tutorId: number, studentId: number) => 
    fetchApi(`/tutors/${tutorId}/apply`, {
      method: 'POST',
      body: JSON.stringify({ studentId }),
    }),
};

// 個案相關 API
export const caseApi = {
  // 獲取所有找導師的個案
  getAllTutorCases: () => fetchApi('/find-tutor-cases'),
  
  // 獲取所有找學生的個案
  getAllStudentCases: () => fetchApi('/find-student-cases'),
  
  // 獲取最新/推薦的找學生個案
  getRecommendedStudentCases: () => fetchApi('/find-student-cases?featured=true&limit=8&sort=latest'),
  
  // 獲取推薦的找導師個案
  getRecommendedTutorCases: () => fetchApi('/find-tutor-cases?featured=true&limit=8'),
  
  // 獲取單一個案詳情（通用方法）
  getCaseById: (id: string) => fetchApi(`/cases/${id}`),
  
  // 獲取學生搵導師個案詳情
  getTutorCaseById: (id: string) => fetchApi(`/find-tutor-cases/${id}`),
  
  // 獲取導師搵學生個案詳情  
  getStudentCaseById: (id: string) => fetchApi(`/find-student-cases/${id}`),
  
  // 創建找導師個案
  createTutorCase: (data: {
    student: string;
    title: string;
    description: string;
    subject: string;
    subjects: string[];
    category: string;
    subCategory?: string;
    regions: string[];
    subRegions: string[];
    mode: string;
    modes: string[];
    lessonDetails: {
      duration: number;
      pricePerLesson: number;
      lessonsPerWeek: number;
    };
    experience: '無教學經驗要求' | '1-3年教學經驗' | '3-5年教學經驗' | '5年以上教學經驗';
    status: 'open' | 'matched' | 'closed' | 'pending';
    featured: boolean;
    isApproved: boolean;
  }) => {
    return fetchApi('/find-tutor-cases', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // 創建找學生個案
  createStudentCase: (data: any) => 
    fetchApi('/find-student-cases', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 申請個案
  applyCase: async (caseId: number | string, tutorId: number | string) => {
    return fetchApi(`/case-applications/${caseId}/apply`, {
      method: 'POST',
      body: JSON.stringify({ tutorId }),
    });
  },
};

// 分類相關 API
export const categoryApi = {
  // 獲取所有分類
  getAllCategories: () => fetchApi('/categories'),
  
  // 獲取熱門科目
  getHotSubjects: () => fetchApi('/categories/hot-subjects'),
  
  // 獲取地區列表
  getRegions: () => fetchApi('/categories/regions'),
};

// 搜尋相關 API
export const searchApi = {
  // 搜尋導師
  searchTutors: (query: string) => 
    fetchApi(`/search/tutors?q=${encodeURIComponent(query)}`),
  
  // 搜尋個案
  searchCases: (query: string) => 
    fetchApi(`/search/cases?q=${encodeURIComponent(query)}`),
};