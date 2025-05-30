import axios from 'axios';
import { User, Case, Statistics } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://hi-hi-tutor-real-backend2.vercel.app/api';

console.log('🌐 Initializing API with base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000, // 10 seconds timeout
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Add CORS headers
  config.headers['Access-Control-Allow-Origin'] = '*';
  config.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS';
  config.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
  
  console.log('🚀 API Request:', {
    url: config.url,
    method: config.method,
    baseURL: config.baseURL,
    headers: {
      'Content-Type': config.headers['Content-Type'],
      'Authorization': config.headers.Authorization ? 'Bearer [hidden]' : 'none',
    },
    data: config.data
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
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      code: error.code
    });

    // Handle specific error cases
    if (!error.response) {
      // Network error
      error.message = 'Network error. Please check your connection.';
    } else if (error.response.status === 401) {
      // Unauthorized - clear token and reload
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
  getCases: (params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) => api.get<{ cases: Case[] }>('/admin/cases', { params }),

  getCaseById: (id: string) => api.get<Case>(`/admin/cases/${id}`),

  updateCase: (id: string, data: Partial<Case>) =>
    api.put<Case>(`/admin/cases/${id}`, data),
};

// Statistics API
export const statisticsAPI = {
  getPlatformStats: () => api.get<Statistics>('/admin/statistics/platform'),
  getSubjectStats: () => api.get<Statistics>('/admin/statistics/subjects'),
};

// Auth API
export const authAPI = {
  login: (credentials: { identifier: string; password: string }) =>
    api.post<{ token: string; user: User; success: boolean; message?: string }>(
      '/admin/auth/login',
      credentials,
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    ),

  logout: () => api.post('/admin/auth/logout'),

  getCurrentUser: () => api.get<User>('/admin/auth/me'),
};

export default api; 