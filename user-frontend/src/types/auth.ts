export interface VerificationCode {
  code: string;
  phoneNumber: string;
  createdAt: number;
  isVerified: boolean;
}

export interface VerificationResponse {
  message: string;
  status: 'success' | 'error';
  retryAfter?: number;
  token?: string;
}

export interface RegisterToken {
  phone: string;
  expiresAt: number;
}

export interface RegisterFormData {
  token: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  userType: 'personal' | 'organization';
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  userType: 'personal' | 'organization';
  createdAt: number;
}

export interface LoginResponse {
  status: 'success' | 'error';
  message: string;
  token?: string;
  user?: Omit<User, 'password'>;
} 