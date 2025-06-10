'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UserIcon,
  UserPlusIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import { SubjectBar } from './SubjectBar';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  userType: string;
  role: 'user' | 'admin';
}

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
      <div className="flex-1">
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

      {/* 右欄：熱門科目 */}
      <div className="w-full lg:w-[400px]">
        <div className="bg-white shadow-md rounded-lg p-6 h-[400px]">
          <h2 className="font-bold text-xl mb-6">熱門科目</h2>
          <div className="space-y-4">
            <SubjectBar name="數學" percent={95} />
            <SubjectBar name="英文" percent={90} />
            <SubjectBar name="中文" percent={85} />
            <SubjectBar name="物理" percent={80} />
            <SubjectBar name="化學" percent={75} />
            <SubjectBar name="生物" percent={70} />
          </div>
        </div>
      </div>
    </section>
  );
} 