import { RegisterFormData } from '@/types/auth';

// API 基礎 URL
const baseURL = process.env.NEXT_PUBLIC_API_BASE || 'https://hi-hi-tutor-real-backend2.vercel.app';
console.log('🌐 API baseURL:', baseURL);

// 通用 API 請求函數
export const fetchApi = async (endpoint: string, options: RequestInit = {}, params?: Record<string, any>) => {
  try {
    // 確保 endpoint 以 / 開頭
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // 構建完整的 URL
    let url = `${baseURL}/api${normalizedEndpoint}`;
    
    // 如果有查詢參數，添加到 URL
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      url += `?${searchParams.toString()}`;
    }
    
    console.log('🚀 發送 API 請求:', url);
    console.log('📦 請求參數:', options);
    console.log('🔍 查詢參數:', params);

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

    // 特殊處理導師 API 的回應格式
    if (endpoint === '/tutors' && responseData.success && responseData.data && responseData.data.tutors) {
      console.log('🎯 檢測到導師 API 回應，返回 tutors 陣列');
      return responseData.data.tutors;
    }

    // 特殊處理個案 API 的回應格式
    if ((endpoint === '/tutor-cases' || endpoint === '/find-tutor-cases') && responseData.success && responseData.data && responseData.data.cases) {
      console.log('🎯 檢測到個案 API 回應，返回 cases 陣列');
      return responseData.data.cases;
    }

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
    return {
      ...res.user,
      token: res.token
    };
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
  getAllTutors: (params?: Record<string, any>) => fetchApi('/tutors', {}, params),
  
  // 獲取單個導師詳情
  getTutorById: (id: string) => fetchApi(`/tutors/${id}`),
  
  // 獲取推薦導師
  getRecommendedTutors: () => fetchApi('/tutors', {}, { featured: true, limit: 8 }),

  // 獲取當前導師 profile - 使用前端 API 路由
  getProfile: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('未登入');
    }

    const response = await fetch('/api/tutors/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: '無法解析回應' }));
      throw new Error(errorData.message || '獲取導師資料失敗');
    }

    return response.json();
  },

  // 更新導師 profile - 使用前端 API 路由
  updateProfile: async (data: any) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('未登入');
    }

    const response = await fetch('/api/tutors/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: '無法解析回應' }));
      throw new Error(errorData.message || '更新導師資料失敗');
    }

    return response.json();
  },

  // 上傳頭像
  uploadAvatar: async (userId: string, file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const token = localStorage.getItem('token');
    const baseURL = process.env.NEXT_PUBLIC_API_BASE || 'https://hi-hi-tutor-real-backend2.vercel.app';
    const url = `${baseURL}/api/users/${userId}/avatar`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: '無法解析回應' }));
      throw new Error(errorData.message || '頭像上傳失敗');
    }

    return response.json();
  },

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
  getAllTutorCases: (params?: Record<string, any>) => fetchApi('/tutor-cases', {}, params),
  
  // 獲取所有找學生的個案
  getAllStudentCases: (params?: Record<string, any>) => fetchApi('/find-tutor-cases', {}, params),
  
  // 獲取最新/推薦的找學生個案
  getRecommendedStudentCases: () => fetchApi('/find-tutor-cases', {}, { featured: true, limit: 8, sort: 'latest' }),
  
  // 獲取推薦的找導師個案
  getRecommendedTutorCases: () => fetchApi('/tutor-cases', {}, { featured: true, limit: 8 }),
  
  // 獲取單一個案詳情（通用方法）
  getCaseById: (id: string) => fetchApi(`/cases/${id}`),
  
  // 獲取學生搵導師個案詳情
  getTutorCaseById: (id: string) => fetchApi(`/tutor-cases/${id}`),
  
  // 獲取導師搵學生個案詳情  
  getStudentCaseById: (id: string) => fetchApi(`/find-tutor-cases/${id}`),
  
  // 創建找導師個案
  createTutorCase: (data: any) => 
    fetchApi('/find-tutor-cases', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  
  // 創建找學生個案
  createStudentCase: (data: any) => 
    fetchApi('/tutor-cases', {
      method: 'POST',
      body: JSON.stringify(data)
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
  // 統一搜尋（返回包含 tutors 和 cases 的結果）
  search: (query: string) => 
    fetchApi(`/search?q=${encodeURIComponent(query)}`),
  
  // 搜尋導師（向後兼容）
  searchTutors: (query: string) => 
    fetchApi(`/search?q=${encodeURIComponent(query)}`),
  
  // 搜尋個案（向後兼容）
  searchCases: (query: string) => 
    fetchApi(`/search?q=${encodeURIComponent(query)}`),
};

// 學生個案相關 API
export const studentCaseApi = {
  // 創建學生個案
  createStudentCase: (data: any) => 
    fetchApi('/find-tutor-cases', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  
  // 獲取學生個案詳情
  getStudentCaseById: (id: string) => 
    fetchApi(`/find-tutor-cases/${id}`),
  
  // 獲取所有學生個案
  getAllStudentCases: () => 
    fetchApi('/find-tutor-cases'),
};