'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UserIcon,
  UserPlusIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/solid';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  userType: string;
}

const SubjectBar = ({ name, percent }: { name: string; percent: number }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span>{name}</span>
      <span>{percent}%</span>
    </div>
    <div className="bg-gray-200 h-2 rounded">
      <div className="bg-yellow-400 h-2 rounded" style={{ width: `${percent}%` }} />
    </div>
  </div>
);

export default function HeroSection() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // 從 localStorage 讀取用戶資料
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (error) {
        console.error('解析用戶資料失敗:', error);
        localStorage.removeItem('user');
        // localStorage.removeItem('token'); // 不要自動清除 token
      }
    }
  }, []);

  // 處理登出
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.reload();
  };

  return (
    <section className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-start px-4 py-10">
      {/* 左欄：Hero 圖 & 文案 */}
      <div className="w-full lg:w-2/3">
        <div className="relative w-full h-[400px] bg-[url('/backbroad.jpg')] bg-cover bg-center">
          {/* 疊加內容 */}
          <div className="absolute top-0 left-0 h-full w-full flex items-center">
            <div className="max-w-2xl px-8">
              <div className="flex flex-col items-start">
                <h1 className="text-white font-bold text-5xl md:text-6xl leading-tight tracking-wide drop-shadow-lg">
                  尋找最適合你的導師
                </h1>
                <p className="text-gray-100 text-lg md:text-xl mt-4 drop-shadow-md">
                  我們提供專業的導師配對服務，幫助你找到最適合的學習夥伴
                </p>
                <Link
                  href="/about"
                  className="mt-6 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-white rounded-xl shadow-lg transition-colors"
                >
                  了解更多
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 右欄：登入註冊卡片 + 熱門科目 */}
      <div className="w-full lg:w-1/3 space-y-6">
        <div className="bg-white shadow-md rounded-lg p-4 space-y-3">
          {user ? (
            <div className="space-y-2">
              <button
                onClick={() => router.push('/profile')}
                className="w-full flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                <UserIcon className="w-5 h-5" />
                👤 我的帳戶
              </button>
              {user.userType === 'normal' && (
                <Link href="/upgrade" className="w-full">
                  <div className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition">
                    <span>🆙</span>
                    <span>申請成為導師</span>
                  </div>
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 border border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition"
              >
                <UserPlusIcon className="w-5 h-5" />
                🚪 登出
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => router.push('/login')}
                className="w-full flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                <UserIcon className="w-5 h-5" />
                🔐 會員登入
              </button>
              <button
                onClick={() => router.push('/register')}
                className="w-full flex items-center gap-2 border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition"
              >
                <UserPlusIcon className="w-5 h-5" />
                📝 會員註冊
              </button>
            </>
          )}
          <button
            onClick={() => router.push('/contact')}
            className="w-full flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
          >
            <EnvelopeIcon className="w-5 h-5" />
            💬 聯絡我們
          </button>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="font-bold text-lg mb-4">熱門科目</h2>
          <div className="space-y-2">
            <SubjectBar name="數學" percent={90} />
            <SubjectBar name="英文" percent={70} />
            <SubjectBar name="中文" percent={60} />
          </div>
        </div>
      </div>
    </section>
  );
} 