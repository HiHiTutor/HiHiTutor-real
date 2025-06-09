'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/services/api';

export default function PostPage() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }

    // 先從 localStorage 讀取用戶類型，立即顯示選項
    const cachedUserType = localStorage.getItem('userType');
    if (cachedUserType) {
      console.log('🎭 從 localStorage 讀取用戶角色:', cachedUserType);
      setUserRole(cachedUserType);
      setLoading(false);
    }

    // 然後通過 API 確認用戶資料（背景更新）
    const fetchUserData = async () => {
      try {
        const data = await authApi.getProfile();
        console.log('🔍 API 確認的用戶資料:', data);
        
        // 設置用戶角色，優先使用 userType，如果沒有則使用 role
        const role = data.userType || data.role;
        console.log('🎭 API 確認的用戶角色:', role);
        
        // 如果 API 返回的角色與 localStorage 不同，更新它
        if (role !== cachedUserType) {
          console.log('🔄 更新用戶角色:', { old: cachedUserType, new: role });
          setUserRole(role);
          localStorage.setItem('userType', role);
        }
      } catch (err) {
        console.error('獲取用戶資料失敗:', err);
        // 如果 API 失敗但有 token，不要立即跳轉到登入頁面
        // 讓用戶可以繼續使用 localStorage 中的資料
        if (!cachedUserType) {
          router.replace('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handlePostTypeSelect = (type: 'student' | 'tutor') => {
    if (type === 'student') {
      router.push('/post/student-case');
    } else if (type === 'tutor') {
      router.push('/post/tutor-case');
    }
  };

  // 如果正在載入且沒有快取的用戶類型，顯示載入狀態
  if (loading && !userRole) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-8">我要出Post</h1>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">載入中...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">我要出Post</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">選擇發布類型</h2>
          
          <div className="text-center mb-8">
            <p className="text-gray-600">
              {userRole === 'student' 
                ? '作為學生，您可以直接發帖「尋導師」。'
                : '作為導師，您可以直接發帖「尋導師」和「招學生」。'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => router.push('/post/student')}
              className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">尋導師</h3>
            </button>

            {userRole === 'tutor' && (
              <button
                onClick={() => router.push('/post/tutor')}
                className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">招學生</h3>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 