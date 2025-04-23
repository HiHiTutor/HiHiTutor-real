// API 基礎 URL
const API_BASE_URL = 'http://localhost:3001/api';

// 通用 API 請求函數
const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'API 請求失敗' }));
      throw new Error(error.message || 'API 請求失敗');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API 請求錯誤:', error);
    throw error;
  }
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
  // 獲取所有個案
  getAllCases: () => fetchApi('/cases'),
  
  // 獲取最新個案
  getLatestCases: () => fetchApi('/cases/latest'),
  
  // 獲取單一個案詳情
  getCaseById: (id: number) => fetchApi(`/cases/${id}`),

  // 申請個案
  applyCase: (caseId: number, tutorId: number) => 
    fetchApi(`/cases/${caseId}/apply`, {
      method: 'POST',
      body: JSON.stringify({ tutorId }),
    }),
};

// 導師個案相關 API
export const tutorCaseApi = {
  // 獲取所有導師個案
  getAllTutorCases: () => fetchApi('/tutor-cases'),
};

// 分類相關 API
export const categoryApi = {
  // 獲取所有分類
  getAllCategories: () => fetchApi('/categories'),
};

// 熱門科目相關 API
export const hotSubjectApi = {
  // 獲取熱門科目統計
  getHotSubjects: () => fetchApi('/hot-subjects'),
};

// 搜尋相關 API
export const searchApi = {
  // 搜尋導師和個案
  search: (keyword: string) => fetchApi(`/search?q=${encodeURIComponent(keyword)}`),
};

// 認證相關 API
export const authApi = {
  // 用戶登入
  login: (email: string, password: string) => 
    fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  // 用戶註冊
  register: (name: string, email: string, password: string) => 
    fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),
  
  // 獲取用戶資料
  getProfile: (token: string) => 
    fetchApi('/auth/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
};

// 聯絡表單相關 API
export const contactApi = {
  // 提交聯絡表單
  submitContactForm: (name: string, email: string, message: string) => 
    fetchApi('/contact', {
      method: 'POST',
      body: JSON.stringify({ name, email, message }),
    }),
}; 