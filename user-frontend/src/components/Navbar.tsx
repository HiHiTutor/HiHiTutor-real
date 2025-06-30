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
  const [menuOpen, setMenuOpen] = useState(false);

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
      <div className="max-w-7xl mx-auto px-4 py-3 relative flex items-center">
        {/* Logo 靠左 */}
        <div className="flex-shrink-0 z-10">
          <Link href="/">
            <img src="/Logo(Rev).png" alt="HiHiTutor" width={120} height={40} className="h-10 w-auto max-sm:h-8 max-[700px]:h-9" />
          </Link>
        </div>
        {/* 桌面選單+右側按鈕 */}
        <div className="flex-1 flex justify-center md:space-x-6 text-sm text-gray-700 md:flex md:items-center md:justify-center max-md:hidden">
          <nav className="flex space-x-6">
            <Link href="/" className="hover:text-primary">主頁</Link>
            <Link href="/tutors" className="hover:text-primary">尋導師</Link>
            <Link href="/find-tutor-cases" className="hover:text-primary">補習個案</Link>
            <Link href="/recommendations" className="hover:text-primary">導師推薦</Link>
            <Link href="/articles" className="hover:text-primary">教育專欄</Link>
            <Link href="/faq" className="hover:text-primary">常見問題</Link>
          </nav>
        </div>
        {/* 桌面右側行動按鈕 */}
        <div className="md:flex items-center gap-2 ml-auto z-10 relative max-md:hidden">
          {isLoggedIn && (
            <Link href="/post/student-case">
              <button className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition">尋導師</button>
            </Link>
          )}
          {isLoggedIn && user && (
            <div className="relative">
              <button
                className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200 transition flex items-center"
                onClick={() => setDropdownOpen((v) => !v)}
              >
                <span className="max-sm:hidden max-[700px]:hidden">{user.name}</span>
                <span className="sm:hidden max-[700px]:block">{user.name.length > 3 ? user.name.substring(0, 3) + '...' : user.name}</span>
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border rounded-md shadow-lg z-50">
                  {(user?.userType === 'tutor' || user?.userType === 'organization') && (
                    <Link href="/tutor/dashboard" className="block px-4 py-2 hover:bg-gray-100">我的導師介面</Link>
                  )}
                  <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100">編列個人資料</Link>
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
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
        {/* 手機漢堡選單按鈕 */}
        <button
          className="md:hidden ml-auto z-20 p-2"
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

            <Link href="/" onClick={() => setMenuOpen(false)}>主頁</Link>
            <Link href="/tutors" onClick={() => setMenuOpen(false)}>尋導師</Link>
            <Link href="/find-tutor-cases" onClick={() => setMenuOpen(false)}>補習個案</Link>
            <Link href="/recommendations" onClick={() => setMenuOpen(false)}>導師推薦</Link>
            <Link href="/articles" onClick={() => setMenuOpen(false)}>教育專欄</Link>
            <Link href="/faq" onClick={() => setMenuOpen(false)}>常見問題</Link>

            {user ? (
              <>
                <div className="flex flex-col items-center space-y-2 mt-4">
                  <img
                    src="/avatars/default.png"
                    alt="avatar"
                    className="w-16 h-16 rounded-full object-cover border"
                  />
                  <div className="font-medium">{user.name}</div>
                </div>

                <Link
                  href="/profile"
                  className="bg-yellow-500 text-white px-4 py-2 rounded w-4/5 text-center"
                  onClick={() => setMenuOpen(false)}
                >
                  編輯個人資料
                </Link>
                <button
                  onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.dispatchEvent(new Event('logout'));
                    window.location.href = '/login';
                    setMenuOpen(false);
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded w-4/5"
                >
                  登出
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="bg-blue-500 text-white px-4 py-2 rounded w-4/5 text-center"
                  onClick={() => setMenuOpen(false)}
                >
                  用戶登入
                </Link>
                <Link
                  href="/register"
                  className="bg-green-500 text-white px-4 py-2 rounded w-4/5 text-center"
                  onClick={() => setMenuOpen(false)}
                >
                  註冊用戶
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar; 