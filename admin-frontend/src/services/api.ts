import axios from 'axios';
import { User, Case, Statistics, DashboardStatistics } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://hi-hi-tutor-real-backend2.vercel.app/api';

console.log('🌐 Initializing API with base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
  timeout: 10000, // 10 seconds timeout
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
  (error) => {
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
export const usersAPI = {
  getUsers: (params: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  }) => api.get<{ users: User[]; pagination: { total: number; page: number; limit: number } }>('/admin/users', { params }),

  getUserById: (id: string) => {
    if (!id) {
      throw new Error('User ID is required');
    }
    return api.get<User>(`/admin/users/${id}`);
  },

  updateUser: (id: string, data: Partial<User>) => {
    if (!id) {
      throw new Error('User ID is required');
    }
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
export const casesAPI = {
  getCases: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) => {
    try {
      console.log('Fetching cases with params:', params);
      
      const response = await api.get<Case[]>('/cases', { params });
      
      console.log('Cases response:', response.data);
      
      return {
        data: {
          cases: response.data,
          pagination: {
            total: response.data.length,
            page: params.page || 1,
            limit: params.limit || 10,
            totalPages: Math.ceil(response.data.length / (params.limit || 10))
          }
        }
      };
    } catch (error) {
      console.error('Error fetching cases:', error);
      throw error;
    }
  },

  getCaseById: (id: string) => {
    if (!id) {
      throw new Error('Case ID is required');
    }
    return api.get<{ success: boolean; data: Case }>(`/cases/${id}`);
  },

  updateCase: (id: string, data: Partial<Case>) => {
    if (!id) {
      throw new Error('Case ID is required');
    }
    return api.put<{ success: boolean; data: Case }>(`/cases/${id}`, data);
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