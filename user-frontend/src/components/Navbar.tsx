'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { 
  UserGroupIcon, 
  BookOpenIcon, 
  InformationCircleIcon 
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { user } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const checkLogin = () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      setIsLoggedIn(!!token);
    };

    checkLogin();
    window.addEventListener('login', checkLogin);
    window.addEventListener('logout', checkLogin);
    return () => {
      window.removeEventListener('login', checkLogin);
      window.removeEventListener('logout', checkLogin);
    };
  }, []);

  return (
    <header className="bg-gradient-to-b from-white to-[#e6e6e6] border-b border-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-3 relative flex items-center">
        {/* Logo 靠左 */}
        <div className="flex-shrink-0 z-10">
          <Link href="/">
            <img src="/Logo(Rev).png" alt="HiHiTutor" width={120} height={40} className="h-10 w-auto" />
          </Link>
        </div>
        {/* 新增：Logo 右邊的主動作按鈕 */}
        <div className="flex items-center gap-2 ml-4">
          <Link href="/find-student-cases">
            <button className="bg-yellow-400 text-white px-4 py-2 rounded-md hover:bg-yellow-500 transition">
              導師列表
            </button>
          </Link>
          <Link href="/find-tutor-cases">
            <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition">
              補習個案
            </button>
          </Link>
        </div>
        {/* 主選單絕對置中並稍微偏左，統一間距與字體大小，並加上 icon */}
        <nav className="absolute left-[47%] top-1/2 -translate-x-1/2 -translate-y-1/2 flex space-x-6 text-sm text-gray-700">
          <Link href="/faq" className="hover:text-primary flex items-center">
            <UserGroupIcon className="h-5 w-5 mr-1" />
            配對流程
          </Link>
          <Link href="/articles" className="hover:text-primary flex items-center">
            <BookOpenIcon className="h-5 w-5 mr-1" />
            教育專欄
          </Link>
          <Link href="/about" className="hover:text-primary flex items-center">
            <InformationCircleIcon className="h-5 w-5 mr-1" />
            平台簡介
          </Link>
        </nav>
        {/* 右側行動按鈕 */}
        <div className="flex items-center gap-2 ml-auto z-10 relative">
          {isLoggedIn && (
            <Link href="/post">
              <button className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition">
                招學生
              </button>
            </Link>
          )}
          {/* 用戶名稱下拉選單 */}
          {isLoggedIn && user && (
            <div className="relative">
              <button
                className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200 transition flex items-center"
                onClick={() => setDropdownOpen((v) => !v)}
              >
                {user.name}
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border rounded-md shadow-lg z-50">
                  <Link href="/tutor/dashboard" className="block px-4 py-2 hover:bg-gray-100">我的導師介面</Link>
                  <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100">編列個人資料</Link>
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
                    onClick={() => {
                      localStorage.removeItem('token');
                      window.dispatchEvent(new Event('logout'));
                      window.location.href = '/login';
                    }}
                  >登出</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar; 