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
      const userStr = localStorage.getItem('user');
      setIsLoggedIn(!!token && !!userStr);
    };

    // 初始檢查
    checkLogin();

    // 監聽登入事件
    const handleLogin = () => {
      checkLogin();
    };

    // 監聽登出事件
    const handleLogout = () => {
      setIsLoggedIn(false);
    };

    window.addEventListener('login', handleLogin);
    window.addEventListener('logout', handleLogout);

    return () => {
      window.removeEventListener('login', handleLogin);
      window.removeEventListener('logout', handleLogout);
    };
  }, []);

  return (
    <header className="bg-gradient-to-b from-white to-[#e6e6e6] border-b border-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-3 relative flex items-center max-sm:px-2 max-sm:py-2 max-[700px]:px-3 max-[700px]:py-2">
        {/* Logo 靠左 */}
        <div className="flex-shrink-0 z-10">
          <Link href="/">
            <img src="/Logo(Rev).png" alt="HiHiTutor" width={120} height={40} className="h-10 w-auto max-sm:h-8 max-[700px]:h-9" />
          </Link>
        </div>
        {/* 主選單置中，統一間距與字體大小 */}
        <nav className="flex-1 flex justify-center space-x-6 text-sm text-gray-700 max-sm:space-x-2 max-sm:text-xs max-sm:flex-wrap max-sm:justify-center max-[700px]:space-x-4 max-[700px]:text-sm max-[700px]:flex-wrap max-[700px]:justify-center">
          <Link href="/tutors">
            <button className="bg-yellow-400 text-white px-4 py-2 rounded-md hover:bg-yellow-500 transition max-sm:px-2 max-sm:py-1 max-sm:text-xs max-[700px]:px-3 max-[700px]:py-1.5 max-[700px]:text-sm">
              導師列表
            </button>
          </Link>
          <Link href="/find-tutor-cases">
            <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition max-sm:px-2 max-sm:py-1 max-sm:text-xs max-[700px]:px-3 max-[700px]:py-1.5 max-[700px]:text-sm">
              補習個案
            </button>
          </Link>
          <Link href="/faq" className="hover:text-primary flex items-center max-sm:flex-col max-sm:items-center max-[700px]:flex-col max-[700px]:items-center">
            <UserGroupIcon className="h-5 w-5 mr-1 max-sm:h-4 max-sm:w-4 max-sm:mr-0 max-sm:mb-1 max-[700px]:h-4 max-[700px]:w-4 max-[700px]:mr-0 max-[700px]:mb-1" />
            <span className="max-sm:text-xs max-[700px]:text-xs">配對流程</span>
          </Link>
          <Link href="/articles" className="hover:text-primary flex items-center max-sm:flex-col max-sm:items-center max-[700px]:flex-col max-[700px]:items-center">
            <BookOpenIcon className="h-5 w-5 mr-1 max-sm:h-4 max-sm:w-4 max-sm:mr-0 max-sm:mb-1 max-[700px]:h-4 max-[700px]:w-4 max-[700px]:mr-0 max-[700px]:mb-1" />
            <span className="max-sm:text-xs max-[700px]:text-xs">教育專欄</span>
          </Link>
          <Link href="/about" className="hover:text-primary flex items-center max-sm:flex-col max-sm:items-center max-[700px]:flex-col max-[700px]:items-center">
            <InformationCircleIcon className="h-5 w-5 mr-1 max-sm:h-4 max-sm:w-4 max-sm:mr-0 max-sm:mb-1 max-[700px]:h-4 max-[700px]:w-4 max-[700px]:mr-0 max-[700px]:mb-1" />
            <span className="max-sm:text-xs max-[700px]:text-xs">平台簡介</span>
          </Link>
        </nav>
        {/* 右側行動按鈕 */}
        <div className="flex items-center gap-2 ml-auto z-10 relative max-sm:gap-1 max-[700px]:gap-2">
          {isLoggedIn && (
            <Link href="/post/student-case">
              <button className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition max-sm:px-2 max-sm:py-1 max-sm:text-xs max-[700px]:px-3 max-[700px]:py-1.5 max-[700px]:text-sm">
                尋導師
              </button>
            </Link>
          )}
          {/* 用戶名稱下拉選單 */}
          {isLoggedIn && user && (
            <div className="relative">
              <button
                className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200 transition flex items-center max-sm:px-2 max-sm:py-1 max-sm:text-xs max-[700px]:px-3 max-[700px]:py-1.5 max-[700px]:text-sm"
                onClick={() => setDropdownOpen((v) => !v)}
              >
                <span className="max-sm:hidden max-[700px]:hidden">{user.name}</span>
                <span className="sm:hidden max-[700px]:block">{user.name.length > 3 ? user.name.substring(0, 3) + '...' : user.name}</span>
                <svg className="ml-2 w-4 h-4 max-sm:ml-1 max-sm:w-3 max-sm:h-3 max-[700px]:ml-1 max-[700px]:w-3 max-[700px]:h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border rounded-md shadow-lg z-50 max-sm:w-32 max-sm:text-xs max-[700px]:w-36 max-[700px]:text-sm">
                  {(user?.userType === 'tutor' || user?.userType === 'organization') && (
                    <Link href="/tutor/dashboard" className="block px-4 py-2 hover:bg-gray-100 max-sm:px-2 max-sm:py-1 max-[700px]:px-3 max-[700px]:py-1.5">我的導師介面</Link>
                  )}
                  <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100 max-sm:px-2 max-sm:py-1 max-[700px]:px-3 max-[700px]:py-1.5">編列個人資料</Link>
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500 max-sm:px-2 max-sm:py-1 max-[700px]:px-3 max-[700px]:py-1.5"
                    onClick={() => {
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
                      window.dispatchEvent(new Event('logout'));
                      window.location.href = '/login';
                    }}
                  >登出</button>
                </div>
              )}
            </div>
          )}
          {!isLoggedIn && (
            <div className="flex items-center gap-2 max-sm:gap-1 max-[700px]:gap-2">
              <Link href="/login">
                <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition max-sm:px-2 max-sm:py-1 max-sm:text-xs max-[700px]:px-3 max-[700px]:py-1.5 max-[700px]:text-sm">
                  用戶登入
                </button>
              </Link>
              <Link href="/register">
                <button className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition max-sm:px-2 max-sm:py-1 max-sm:text-xs max-[700px]:px-3 max-[700px]:py-1.5 max-[700px]:text-sm">
                  註冊用戶
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar; 