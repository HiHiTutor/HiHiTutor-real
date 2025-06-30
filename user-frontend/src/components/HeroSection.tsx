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
    <section className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-start px-4 py-10 max-sm:px-4 max-sm:py-6 max-[700px]:flex-col max-[700px]:gap-6">
      {/* 左欄：Hero 圖 & 文案 */}
      <div className="flex-1 max-sm:w-full max-[700px]:w-full">
        <div className="relative w-full h-[400px] bg-[url('/backbroad.jpg')] bg-cover bg-center max-sm:h-[300px] max-[700px]:h-[350px]">
          {/* 疊加內容 */}
          <div className="absolute top-0 left-0 h-full w-full flex items-center max-sm:items-center max-[700px]:items-center">
            <div className="max-w-2xl px-8 max-sm:px-4 max-sm:max-w-full max-[700px]:px-6 max-[700px]:max-w-full">
              <div className="flex flex-col items-start max-sm:items-center max-sm:text-center max-[700px]:items-center max-[700px]:text-center">
                <h1 className="text-white font-bold text-5xl md:text-6xl leading-tight tracking-wide drop-shadow-lg max-sm:text-3xl max-sm:leading-tight max-[700px]:text-4xl max-[700px]:leading-tight">
                  尋找最適合你的導師
                </h1>
                <p className="text-gray-100 text-lg md:text-xl mt-4 drop-shadow-md max-sm:text-base max-sm:mt-3 max-[700px]:text-lg max-[700px]:mt-3">
                  我們提供專業的導師配對服務，幫助你找到最適合的學習夥伴
                </p>
                <Link
                  href="/about"
                  className="mt-6 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-white rounded-xl shadow-lg transition-colors max-sm:mt-4 max-sm:px-4 max-sm:py-2 max-[700px]:mt-4 max-[700px]:px-5 max-[700px]:py-2.5"
                >
                  了解更多
                </Link>
              </div>
            </div>
          </div>
        </div>
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