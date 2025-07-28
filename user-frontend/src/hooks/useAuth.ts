import { useState, useEffect } from 'react';
import { useUser } from './useUser';

export function useAuth() {
  const { user, isLoading } = useUser();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // 檢查是否有 token
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const hasToken = !!token;
    
    // 如果有 token 且用戶資料已載入，則認為已認證
    if (hasToken && !isLoading) {
      setIsAuthenticated(!!user);
    } else if (!hasToken) {
      setIsAuthenticated(false);
    }
  }, [user, isLoading]);

  const logout = () => {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('logout'));
    window.location.href = '/login';
  };

  const login = (token: string) => {
    localStorage.setItem('token', token);
    window.dispatchEvent(new Event('login'));
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    logout,
    login
  };
} 