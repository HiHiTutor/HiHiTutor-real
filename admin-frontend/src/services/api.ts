import axios from 'axios';
import { User, Case, Statistics } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
    api.post<{ token: string; user: User }>('/admin/auth/login', credentials),

  logout: () => api.post('/admin/auth/logout'),

  getCurrentUser: () => api.get<User>('/admin/auth/me'),
};

export default api; 