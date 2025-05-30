import axios from 'axios';
import { User, Case, Statistics, DashboardStatistics } from '../types';
import { CaseResponse, SingleCaseResponse } from '../types/case';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://hi-hi-tutor-real-backend2.vercel.app/api';

console.log('🌐 Initializing API with base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
  timeout: 30000, // 增加到 30 秒
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  console.log('🚀 API Request:', {
    url: config.url,
    method: config.method,
    baseURL: config.baseURL,
    headers: {
      'Content-Type': config.headers['Content-Type'],
      'Authorization': config.headers.Authorization ? 'Bearer [hidden]' : 'none',
    }
  });
  
  return config;
}, (error) => {
  console.error('❌ Request interceptor error:', error);
  return Promise.reject(error);
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  async (error) => {
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      console.log('🔄 Retrying request due to timeout...');
      const config = error.config;
      // 最多重試 2 次
      config.retry = config.retry || 0;
      if (config.retry < 2) {
        config.retry += 1;
        return api(config);
      }
    }

    if (error.response) {
      console.error('❌ API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    } else {
      console.error('❌ Network Error:', {
        url: error.config?.url,
        message: error.message
      });
    }

    // Handle specific error cases
    if (!error.response) {
      error.message = 'Network error. Please check your connection.';
    } else if (error.response.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.reload();
    }

    return Promise.reject(error);
  }
);

// Users API
interface UserResponse {
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

interface CreateUserData {
  name: string;
  email: string;
  phone: string;
  password: string;
  userType: string;
}

interface CreateUserResponse {
  success: boolean;
  data: User;
  message?: string;
}

export const usersAPI = {
  getUsers: (params: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  }) => {
    return api.get<UserResponse>(`/admin/users`, { params });
  },

  getUserById: (id: string) => {
    return api.get<User>(`/admin/users/${id}`);
  },

  createUser: (data: CreateUserData) => {
    return api.post<CreateUserResponse>(`/admin/users`, data);
  },

  updateUser: (id: string, data: Partial<User>) => {
    return api.put<User>(`/admin/users/${id}`, data);
  },

  approveUserUpgrade: (id: string, role: string) => {
    if (!id) {
      throw new Error('User ID is required');
    }
    return api.post<User>(`/admin/users/${id}/approve-upgrade`, { role });
  },
};

// Cases API
interface CreateCaseData {
  title: string;
  description: string;
  type: string;
  category: string;
  subCategory?: string;
  subjects: string[];
  regions: string[];
  subRegions: string[];
  budget: string;
  mode: string;
  experience?: string;
}

export const casesAPI = {
  getCases: (params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    type?: string;
  }) => {
    return api.get<CaseResponse>(`/admin/cases`, { params });
  },

  getCaseById: (id: string, type?: string) => {
    return api.get<SingleCaseResponse>(`/admin/cases/${id}`, { params: { type } });
  },

  createCase: (data: CreateCaseData) => {
    return api.post<SingleCaseResponse>(`/admin/cases`, data);
  },

  updateCase: (id: string, data: Partial<Case>) => {
    return api.put<SingleCaseResponse>(`/admin/cases/${id}`, data);
  },
};

// Statistics API
export const statisticsAPI = {
  getPlatformStats: () => api.get<Statistics>('/admin/statistics/platform').then(response => {
    console.log('Raw statistics response:', response.data);
    
    // Safely extract values with fallbacks
    const users = response.data?.users || {};
    const cases = response.data?.cases || {};
    
    return {
      ...response,
      data: {
        totalStudents: users.students || users.totalStudents || 0,
        totalTutors: users.tutors || users.totalTutors || 0,
        activeCases: cases.openCases || cases.activeCases || 0,
        activeUsers: users.totalUsers || users.activeUsers || 0,
        newUsersThisMonth: users.newUsers || 0,
        totalCases: cases.totalCases || 0,
        completedCases: cases.matchedCases || cases.completedCases || 0,
        successRate: cases.totalCases > 0
          ? Math.round((cases.matchedCases / cases.totalCases) * 100)
          : 0,
        hotSubjects: [], // We'll implement this later
        recentActivities: [] // We'll implement this later
      } as DashboardStatistics
    };
  }),
  getSubjectStats: () => api.get<Statistics>('/admin/statistics/subjects'),
};

// Auth API
export const authAPI = {
  login: (credentials: { identifier: string; password: string }) => {
    console.log('📤 Sending login request:', {
      url: `${API_BASE_URL}/admin/auth/login`,
      credentials: {
        identifier: credentials.identifier,
        password: '********'
      }
    });
    return api.post<{ token: string; user: User; success: boolean; message?: string }>(
      '/admin/auth/login',
      credentials,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  },

  logout: () => api.post('/admin/auth/logout'),

  getCurrentUser: () => api.get<User>('/admin/auth/me'),
};

export default api; 