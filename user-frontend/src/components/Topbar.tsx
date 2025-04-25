'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Topbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    setIsLoggedIn(!!token);
    if (user) {
      console.log('👤 已登入用戶：', JSON.parse(user));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    location.reload();
  };

  return (
    <div className="flex justify-end space-x-4">
      {isLoggedIn ? (
        <>
          <button
            className="text-sm bg-white px-3 py-1 border rounded"
            onClick={() => router.push('/dashboard')}
          >
            👤 我的帳戶
          </button>
          <button
            className="text-sm bg-red-100 text-red-600 px-3 py-1 border rounded"
            onClick={handleLogout}
          >
            🚪 登出
          </button>
        </>
      ) : (
        <>
          <button
            className="text-sm bg-yellow-500 text-white px-3 py-1 rounded"
            onClick={() => router.push('/login')}
          >
            登入
          </button>
          <button
            className="text-sm bg-blue-500 text-white px-3 py-1 rounded"
            onClick={() => router.push('/register')}
          >
            註冊
          </button>
        </>
      )}
    </div>
  );
} 