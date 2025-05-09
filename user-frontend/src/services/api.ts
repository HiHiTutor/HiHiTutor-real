// API 基礎 URL
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
console.log('🌐 API baseURL:', baseURL);

// 通用 API 請求函數
export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  try {
    // 確保 endpoint 以 / 開頭
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${baseURL}/api${normalizedEndpoint}`;
    
    console.log('🚀 發送 API 請求:', url);
    console.log('📦 請求參數:', options);

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
  getAllCases: () => fetchApi('/find-tutor-cases'),
  
  // 獲取最新個案
  getLatestCases: () => fetchApi('/find-student-cases?featured=true&limit=8'),
  
  // 獲取單一個案詳情
  getCaseById: (id: string) => fetchApi(`/find-student-cases/${id}`),

  // 申請個案
  applyCase: (caseId: string, tutorId: number) => 
    fetchApi(`/find-student-cases/${caseId}/apply`, {
      method: 'POST',
      body: JSON.stringify({ tutorId }),
    }),

  getAllStudentCases: () => fetchApi('/find-student-cases'),
  getStudentCaseById: (id: string) => fetchApi(`/find-student-cases/${id}`),
  createStudentCase: (data: any) => fetchApi('/find-student-cases', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  getAllTutorCases: () => fetchApi('/find-student-cases'),
  getRecommendedTutorCases: () => fetchApi('/find-student-cases?featured=true&limit=8'),
};

// 學生個案相關 API
export const studentCaseApi = {
  // 獲取所有學生個案
  getAllStudentCases: () => fetchApi('/student-cases'),
  
  // 獲取單一學生個案
  getStudentCaseById: (id: string) => fetchApi(`/student-cases/${id}`),
  
  // 創建新的學生個案
  createStudentCase: (caseData: any) => 
    fetchApi('/student-cases', {
      method: 'POST',
      body: JSON.stringify(caseData),
    }),
};

// 導師個案相關 API
export const tutorCaseApi = {
  // 獲取所有導師個案
  getAllTutorCases: () => fetchApi('/tutor-cases'),
  
  // 獲取推薦導師個案
  getRecommendedTutorCases: () => fetchApi('/find-student-cases?featured=true&limit=8'),
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
  register: (name: string, email: string, password: string, phone: string, userType: string) => 
    fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone, userType }),
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