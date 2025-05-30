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
  }) => api.get<{ users: User[] }>('/admin/users', { params }),

  getUserById: (id: string) => api.get<User>(`/admin/users/${id}`),

  updateUser: (id: string, data: Partial<User>) =>
    api.put<User>(`/admin/users/${id}`, data),

  approveUserUpgrade: (id: string, role: string) =>
    api.post<User>(`/admin/users/${id}/approve-upgrade`, { role }),
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
      
      // Fetch both student and tutor cases
      const [studentCases, tutorCases] = await Promise.all([
        api.get<{ cases: Case[] }>('/admin/find-student-cases', { params }),
        api.get<{ cases: Case[] }>('/admin/find-tutor-cases', { params })
      ]);

      console.log('Student cases:', studentCases.data);
      console.log('Tutor cases:', tutorCases.data);

      // Combine and deduplicate cases based on case ID
      const allCases = [...studentCases.data.cases, ...tutorCases.data.cases];
      const uniqueCases = Array.from(new Map(allCases.map(c => [c.id, c])).values());

      return {
        data: {
          cases: uniqueCases
        }
      };
    } catch (error) {
      console.error('Error fetching cases:', error);
      throw error;
    }
  },

  getCaseById: (id: string) => api.get<Case>(`/admin/cases/${id}`),

  updateCase: (id: string, data: Partial<Case>) =>
    api.put<Case>(`/admin/cases/${id}`, data),
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
        totalStudents: users.students || 0,
        totalTutors: users.tutors || 0,
        activeCases: cases.openCases || 0,
        activeUsers: users.totalUsers || 0,
        newUsersThisMonth: 0, // This will need to be implemented on the backend
        totalCases: cases.totalCases || 0,
        completedCases: cases.matchedCases || 0,
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