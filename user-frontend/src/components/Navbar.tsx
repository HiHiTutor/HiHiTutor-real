'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { 
  UserGroupIcon, 
  BookOpenIcon, 
  InformationCircleIcon 
} from '@heroicons/react/24/outline';
import React from 'react';
import LoginModal from './LoginModal';

const Navbar = () => {
  const { user, isLoading, error } = useUser();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const checkLogin = () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      setIsLoggedIn(!!token);
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

  // 當 user 資料載入完成後更新登入狀態
  useEffect(() => {
    if (!isLoading) {
      setIsLoggedIn(!!user);
    }
  }, [user, isLoading]);

  // 如果有錯誤且是認證相關錯誤，清除登入狀態
  useEffect(() => {
    if (error && (error.includes('登入已過期') || error.includes('Not authenticated'))) {
      setIsLoggedIn(false);
    }
  }, [error]);

  return (
    <header className="bg-gradient-to-b from-white to-[#e6e6e6] border-b border-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-3 relative flex items-center">
        {/* Logo 靠左 */}
        <div className="flex-shrink-0 z-10">
          <Link href="/">
            <img src="/Logo(Rev).png" alt="HiHiTutor" width={120} height={40} className="h-10 w-auto max-sm:h-8 max-[700px]:h-9" />
          </Link>
        </div>
        {/* 桌面選單+右側按鈕 */}
        <div className="flex-1 justify-center items-center max-md:hidden flex">
          <nav className="flex space-x-4 items-center justify-center">
            <Link href="/" className="hover:text-primary">主頁</Link>
            <Link href="/tutors" className="bg-yellow-400 text-white px-3 py-1 rounded-md hover:bg-yellow-500 transition">導師列表</Link>
            <Link href="/find-student-cases" className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition">補習個案</Link>
            <Link href="/articles" className="hover:text-primary">教育專欄</Link>
            <Link href="/faq" className="hover:text-primary">配對流程</Link>
            {isLoggedIn ? (
              <Link href="/post/student-case" className="hover:text-white bg-yellow-500 px-3 py-1 rounded font-semibold transition-colors">發帖尋導師</Link>
            ) : (
              <button 
                onClick={() => setShowLoginModal(true)}
                className="hover:text-white bg-yellow-500 px-3 py-1 rounded font-semibold transition-colors"
              >
                發帖尋導師
              </button>
            )}
          </nav>
        </div>
        {/* 桌面右側用戶icon+名+下拉 */}
        <div className="md:flex items-center gap-2 ml-auto z-10 relative max-md:hidden">
          {isLoggedIn && user && (
            <div className="relative flex items-center gap-2">
              {/* Tutor 顯示頭像，Student 不顯示 */}
              {user.userType === 'tutor' && (
                <img
                  src={user.avatarUrl || user.avatar || '/avatars/default.png'}
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover border"
                />
              )}
              <button
                className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200 transition flex items-center"
                onClick={() => setDropdownOpen((v) => !v)}
              >
                <span>{user.name}</span>
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              {dropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-44 bg-white border rounded-md shadow-lg z-50">
                  {user?.userType === 'tutor' && (
                    <Link href="/tutor/dashboard" className="block px-4 py-2 hover:bg-gray-100">我的導師介面</Link>
                  )}
                  {user?.userType === 'organization' && (
                    <Link href="/org/dashboard" className="block px-4 py-2 hover:bg-gray-100">機構儀表板</Link>
                  )}
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
          {!isLoggedIn && (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition">用戶登入</button>
              </Link>
              <Link href="/register">
                <button className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition">註冊用戶</button>
              </Link>
            </div>
          )}
        </div>
        {/* 手機版icon+名+三合一 */}
        <div className="md:hidden flex items-center gap-2 ml-auto">
          {isLoggedIn && user ? (
            <div className="relative flex items-center gap-2">
              {user.userType === 'tutor' && (
                <img
                  src={user.avatarUrl || user.avatar || '/avatars/default.png'}
                  alt="avatar"
                  className="w-6 h-6 rounded-full object-cover border"
                />
              )}
              <button
                className="flex items-center gap-1 bg-gray-100 text-gray-800 px-2 py-1 rounded-md hover:bg-gray-200 transition text-sm"
                onClick={() => setDropdownOpen((v) => !v)}
              >
                <span className="max-w-[80px] truncate">{user.name}</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {dropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-32 bg-white border rounded-md shadow-lg z-50 text-sm">
                  {user?.userType === 'tutor' && (
                    <Link href="/tutor/dashboard" className="block px-3 py-2 hover:bg-gray-100">我的導師介面</Link>
                  )}
                  {user?.userType === 'organization' && (
                    <Link href="/org/dashboard" className="block px-3 py-2 hover:bg-gray-100">機構儀表板</Link>
                  )}
                  <Link href="/profile" className="block px-3 py-2 hover:bg-gray-100">編列個人資料</Link>
                  <button
                    className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-red-500"
                    onClick={() => {
                      localStorage.removeItem('token');
                      window.dispatchEvent(new Event('logout'));
                      window.location.href = '/login';
                    }}
                  >登出</button>
                </div>
              )}
              <button
                className="p-2"
                aria-label="Open menu"
                onClick={() => setMenuOpen((v) => !v)}
              >
                {menuOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                )}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Link href="/login">
                  <button className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition">登入</button>
                </Link>
                <Link href="/register">
                  <button className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 transition">註冊</button>
                </Link>
              </div>
              <button
                className="p-2"
                aria-label="Open menu"
                onClick={() => setMenuOpen((v) => !v)}
              >
                {menuOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>
        
        {/* 手機 dropdown menu */}
        {menuOpen && (
          <div className="absolute top-full left-0 w-full bg-white shadow-lg z-50 flex flex-col items-center space-y-4 py-6 md:hidden animate-fade-in max-h-[90vh] overflow-y-auto">
            {/* 🔺新增關閉按鈕 */}
            <div className="w-full flex justify-end px-4">
              <button
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                className="text-gray-700 text-3xl"
              >
                &times;
              </button>
            </div>
            {/* 推薦導師/補習個案橫向按鈕區域 */}
            <div className="flex w-4/5 gap-3 mb-2">
              <Link href="/tutors" onClick={() => setMenuOpen(false)} className="flex-1">
                <button className="bg-yellow-400 text-white px-2 py-2 w-full rounded font-semibold shadow hover:bg-yellow-500 transition whitespace-nowrap text-base">
                  導師列表
                </button>
              </Link>
              <Link href="/find-student-cases" onClick={() => setMenuOpen(false)} className="flex-1">
                <button className="bg-blue-500 text-white px-2 py-2 w-full rounded font-semibold shadow hover:bg-blue-600 transition whitespace-nowrap text-base">
                  補習個案
                </button>
              </Link>
            </div>
            {/* 主頁及其他選項 */}
            <Link href="/" onClick={() => setMenuOpen(false)}>主頁</Link>
            <Link href="/articles" onClick={() => setMenuOpen(false)}>教育專欄</Link>
            <Link href="/faq" className="hover:text-primary text-lg" onClick={() => setMenuOpen(false)}>配對流程</Link>
            {isLoggedIn ? (
              <Link href="/post/student-case" className="hover:text-white bg-yellow-500 px-4 py-2 rounded font-semibold transition-colors text-lg" onClick={() => setMenuOpen(false)}>發帖尋導師</Link>
            ) : (
              <button 
                onClick={() => {
                  setMenuOpen(false);
                  setShowLoginModal(true);
                }}
                className="hover:text-white bg-yellow-500 px-4 py-2 rounded font-semibold transition-colors text-lg"
              >
                發帖尋導師
              </button>
            )}
          </div>
        )}
      </div>
      
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          setShowLoginModal(false);
          // Optionally redirect to the post page after successful login
          window.location.href = '/post/student-case';
        }}
      />
    </header>
  );
};

export default Navbar; 