'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi, fetchApi } from '@/services/api';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  userType?: 'student' | 'tutor' | 'organization';
}

export default function EditProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [needsPhoneVerification, setNeedsPhoneVerification] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    userType: 'student' as const
  });
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const data = await authApi.getProfile();
        console.log('獲取到的用戶資料:', data);
        
        // 確保數據格式正確
        if (data && typeof data === 'object') {
          const userData = {
            id: data.id || '',
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            userType: data.userType || 'student'
          };
          
          setUser(userData);
          setFormData({
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            userType: userData.userType || 'student'
          });
        } else {
          throw new Error('無效的用戶資料格式');
        }
      } catch (err) {
        console.error('獲取用戶資料失敗:', err);
        setError(err instanceof Error ? err.message : '發生錯誤');
        // 延遲跳轉以顯示錯誤訊息
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  // 發送驗證碼
  const handleSendVerificationCode = async () => {
    if (!formData.phone || formData.phone === user?.phone) {
      setError('請先輸入新的電話號碼');
      return;
    }

    setSendingCode(true);
    setError(null);

    try {
      const response = await fetchApi('/auth/request-verification-code', {
        method: 'POST',
        body: JSON.stringify({ phone: formData.phone })
      });

      if (response.success) {
        setVerificationToken(response.token);
        setNeedsPhoneVerification(true);
        alert('驗證碼已發送到您的手機');
      } else {
        throw new Error(response.message || '發送驗證碼失敗');
      }
    } catch (err) {
      console.error('發送驗證碼失敗:', err);
      setError(err instanceof Error ? err.message : '發送驗證碼失敗');
    } finally {
      setSendingCode(false);
    }
  };

  // 驗證驗證碼
  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setError('請輸入驗證碼');
      return;
    }

    try {
      const response = await fetchApi('/auth/verify-code', {
        method: 'POST',
        body: JSON.stringify({ 
          phone: formData.phone, 
          code: verificationCode 
        })
      });

      if (response.success) {
        setVerificationToken(response.token);
        setNeedsPhoneVerification(false);
        alert('驗證成功！現在可以保存變更');
      } else {
        throw new Error(response.message || '驗證失敗');
      }
    } catch (err) {
      console.error('驗證失敗:', err);
      setError(err instanceof Error ? err.message : '驗證失敗');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // 檢查是否需要電話驗證
    if (formData.phone !== user?.phone && !verificationToken) {
      setError('更改電話號碼需要先進行驗證');
      setSaving(false);
      return;
    }

    try {
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      };

      // 如果電話號碼有變更，添加驗證 token
      if (formData.phone !== user?.phone && verificationToken) {
        updateData.token = verificationToken;
      }

      const response = await fetchApi('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      if (response.success) {
        // 更新成功，返回個人資料頁
        alert('資料更新成功！');
        router.push('/profile');
      } else {
        throw new Error(response.message || '更新資料失敗');
      }
    } catch (err) {
      console.error('更新資料失敗:', err);
      setError(err instanceof Error ? err.message : '發生錯誤');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* 頁面標題 */}
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h1 className="text-xl font-semibold text-gray-800">編輯個人資料</h1>
          </div>

          {/* 編輯表單 */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-center">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  姓名
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  電子郵件
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  電話
                </label>
                <div className="mt-1 flex space-x-2">
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      // 如果電話號碼改變，重置驗證狀態
                      if (e.target.value !== user?.phone) {
                        setNeedsPhoneVerification(false);
                        setVerificationToken('');
                        setVerificationCode('');
                      }
                    }}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                  {formData.phone !== user?.phone && (
                    <button
                      type="button"
                      onClick={handleSendVerificationCode}
                      disabled={sendingCode}
                      className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                    >
                      {sendingCode ? '發送中...' : '發送驗證碼'}
                    </button>
                  )}
                </div>
                {formData.phone !== user?.phone && (
                  <p className="mt-1 text-sm text-yellow-600">
                    更改電話號碼需要驗證
                  </p>
                )}
              </div>

              {/* 驗證碼輸入 */}
              {needsPhoneVerification && (
                <div>
                  <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
                    驗證碼
                  </label>
                  <div className="mt-1 flex space-x-2">
                    <input
                      type="text"
                      id="verificationCode"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="請輸入6位數驗證碼"
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      maxLength={6}
                    />
                    <button
                      type="button"
                      onClick={handleVerifyCode}
                      className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                    >
                      驗證
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="userType" className="block text-sm font-medium text-gray-700">
                  用戶類型
                </label>
                <select
                  id="userType"
                  value={formData.userType}
                  onChange={(e) => setFormData({ ...formData, userType: e.target.value as 'student' | 'tutor' | 'organization' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="student">學生</option>
                  <option value="tutor">家教</option>
                  <option value="organization">機構</option>
                </select>
              </div>
            </div>

            {/* 按鈕區域 */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving || (formData.phone !== user?.phone && !verificationToken)}
                className={`flex-1 px-4 py-2 text-white rounded-md transition-colors ${
                  saving || (formData.phone !== user?.phone && !verificationToken)
                    ? 'bg-indigo-400' 
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {saving ? '儲存中...' : '💾 儲存變更'}
              </button>
              <Link
                href="/profile"
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-center"
              >
                ❌ 取消
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 