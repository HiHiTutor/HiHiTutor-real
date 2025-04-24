'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useVerificationStore } from '@/stores/verificationStore';

interface FormData {
  name: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  userType: 'normal' | 'organization';
  verificationCode: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { tempToken, setTempToken, clearTempToken } = useVerificationStore();
  const [step, setStep] = useState<'phone' | 'register'>('phone');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'normal',
    verificationCode: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  // 檢查是否已有臨時令牌
  useEffect(() => {
    if (tempToken) {
      setStep('register');
    }
  }, [tempToken]);

  const handlePhoneVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/request-verification-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: formData.phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '發送驗證碼失敗');
      }

      setVerificationSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '發送驗證碼失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formData.phone,
          code: formData.verificationCode
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '驗證碼錯誤');
      }

      // 確保正確儲存後端回傳的 token
      if (!data.token) {
        throw new Error('驗證失敗：未收到有效的臨時令牌');
      }

      console.log('✅ 收到臨時令牌:', data.token);
      
      // 儲存令牌到全局狀態
      setTempToken(data.token);
      setStep('register');
    } catch (err) {
      setError(err instanceof Error ? err.message : '驗證碼錯誤');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 檢查是否已驗證電話並有臨時令牌
    if (!tempToken) {
      setError('請先驗證手機號碼');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('密碼與確認密碼不一致');
      return;
    }

    if (formData.password.length < 6) {
      setError('密碼長度必須至少為6個字符');
      return;
    }

    setLoading(true);

    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tempToken}`
      };
      
      console.log('📤 註冊請求標頭:', headers);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          userType: formData.userType
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '註冊失敗');
      }

      // 清除臨時令牌並導向登入頁
      clearTempToken();
      router.push('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : '註冊失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'radio' ? value : value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            會員註冊
          </h2>
        </div>

        {step === 'phone' ? (
          <form className="mt-8 space-y-6" onSubmit={verificationSent ? handleVerifyCode : handlePhoneVerification}>
            <div className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  電話號碼
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-400 focus:border-yellow-400"
                  placeholder="例如「0912345678」"
                  disabled={verificationSent}
                />
              </div>

              {verificationSent && (
                <div>
                  <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
                    驗證碼
                  </label>
                  <input
                    id="verificationCode"
                    name="verificationCode"
                    type="text"
                    required
                    value={formData.verificationCode}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-400 focus:border-yellow-400"
                    placeholder="請輸入驗證碼"
                  />
                </div>
              )}
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                    {verificationSent ? '驗證中...' : '發送中...'}
                  </div>
                ) : (
                  verificationSent ? '驗證碼確認' : '傳送驗證碼'
                )}
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  姓名
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-400 focus:border-yellow-400"
                  placeholder="例如「陳小明」"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  電子郵件
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-400 focus:border-yellow-400"
                  placeholder="請輸入電子郵件"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  設定密碼
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-400 focus:border-yellow-400"
                  placeholder="請輸入密碼"
                />
                <div className="mt-1 text-xs text-gray-500">
                  密碼長度需至少6個字符
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  確認密碼
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-400 focus:border-yellow-400"
                  placeholder="請再次輸入密碼"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  用戶類型
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      id="normal"
                      name="userType"
                      type="radio"
                      value="normal"
                      checked={formData.userType === 'normal'}
                      onChange={handleChange}
                      className="h-4 w-4 text-yellow-400 focus:ring-yellow-400 border-gray-300"
                    />
                    <label htmlFor="normal" className="ml-2 block text-sm text-gray-700">
                      普通用戶
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="organization"
                      name="userType"
                      type="radio"
                      value="organization"
                      checked={formData.userType === 'organization'}
                      onChange={handleChange}
                      className="h-4 w-4 text-yellow-400 focus:ring-yellow-400 border-gray-300"
                    />
                    <label htmlFor="organization" className="ml-2 block text-sm text-gray-700">
                      機構用戶
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                    註冊中...
                  </div>
                ) : (
                  '完成註冊'
                )}
              </button>
            </div>

            <div className="text-center text-sm">
              <Link href="/login" className="text-blue-600 hover:text-blue-800 underline">
                返回登入
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 