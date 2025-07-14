'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';
import { authApi } from '@/services/api';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authApi.login(formData.identifier, formData.password);
      
      // authApi.login 返回的是用戶資料和 token
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response));
      
      // Dispatch login event
      window.dispatchEvent(new Event('login'));
      
      toast.success('登入成功！');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('登入錯誤:', error);
      toast.error('登入失敗，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">請先登入</h2>
          <p className="text-gray-600">您需要登入才能發布個案</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="identifier">電郵或電話</Label>
            <Input
              id="identifier"
              name="identifier"
              type="text"
              value={formData.identifier}
              onChange={handleInputChange}
              placeholder="請輸入你的電子郵件或電話"
              required
            />
          </div>

          <div>
            <Label htmlFor="password">密碼</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="請輸入您的密碼"
              required
            />
          </div>

          <div className="flex flex-col space-y-3 pt-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? '登入中...' : '登入'}
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={() => {
                onClose();
                router.push('/register');
              }}
            >
              註冊新帳戶
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            稍後再說
          </button>
        </div>
      </div>
    </div>
  );
} 