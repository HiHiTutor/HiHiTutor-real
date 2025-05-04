'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PostPage() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }
    // 有 token 才 fetch user data
    const fetchUserData = async () => {
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
        // 設置用戶角色，優先使用 userType，如果沒有則使用 role
        const role = data.data.userType || data.data.role;
        setUserRole(role);
      } catch (err) {
        router.replace('/login');
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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">我要出Post</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">選擇發布類型</h2>
          
          <div className="space-y-4">
            {/* 學生個案選項 */}
            <button
              onClick={() => handlePostTypeSelect('student')}
              className="w-full p-4 border rounded-lg hover:bg-gray-50 transition flex items-center justify-between"
            >
              <div>
                <h3 className="font-medium">發布學生個案</h3>
                <p className="text-sm text-gray-600">尋找適合的導師</p>
              </div>
              <span className="text-blue-600">→</span>
            </button>

            {/* 導師個案選項 - 只有 tutor 角色才能看到 */}
            {userRole === 'tutor' && (
              <button
                onClick={() => handlePostTypeSelect('tutor')}
                className="w-full p-4 border rounded-lg hover:bg-gray-50 transition flex items-center justify-between"
              >
                <div>
                  <h3 className="font-medium">發布導師個案</h3>
                  <p className="text-sm text-gray-600">招收學生</p>
                </div>
                <span className="text-blue-600">→</span>
              </button>
            )}
          </div>

          {/* 提示信息 */}
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              {userRole === 'tutor'
                ? '作為導師，您可以發布學生個案和導師個案。'
                : '作為學生，您可以發布學生個案來尋找導師。'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 