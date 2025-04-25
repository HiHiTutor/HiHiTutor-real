'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  userType?: 'personal' | 'organization';
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:3001/api/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('無法獲取用戶資料');
        }

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message || '獲取用戶資料失敗');
        }

        setUser(data.data);
      } catch (err) {
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-600 text-center">{error}</p>
            <p className="text-gray-500 text-center mt-2">正在返回登入頁面...</p>
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
            <h1 className="text-xl font-semibold text-gray-800">我的帳戶</h1>
          </div>

          {/* 用戶資料 */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-500">姓名</label>
                <p className="text-gray-800">{user?.name}</p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-500">電郵</label>
                <p className="text-gray-800">{user?.email}</p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-500">電話</label>
                <p className="text-gray-800">{user?.phone}</p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-500">用戶類型</label>
                <p className="text-gray-800">
                  {user?.userType === 'organization' ? '機構' : '個人'}
                </p>
              </div>
            </div>

            {/* 按鈕區域 */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                onClick={() => router.push('/profile/edit')}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                ✏️ 編輯資料
              </button>
              <Link
                href="/"
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-center"
              >
                🏠 返回主頁
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 