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
import HeroAdCarousel from './HeroAdCarousel';

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
    <section className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-start px-4 py-10 max-sm:px-4 max-sm:py-6 max-[700px]:flex-col max-[700px]:gap-6">
      {/* 左欄：Hero 輪播廣告 */}
      <div className="flex-1 max-sm:w-full max-[700px]:w-full">
        <HeroAdCarousel />
      </div>

      {/* 右欄：熱門科目 */}
      <div className="w-full lg:w-[400px] max-sm:w-full max-[700px]:w-full">
        <div className="bg-white shadow-md rounded-lg p-6 h-[400px] max-sm:h-auto max-sm:p-4 max-[700px]:h-auto max-[700px]:p-5">
          <h2 className="font-bold text-xl mb-6 max-sm:text-lg max-sm:mb-4 max-[700px]:text-lg max-[700px]:mb-4">熱門科目</h2>
          <div className="space-y-4 max-sm:space-y-3 max-[700px]:space-y-3">
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