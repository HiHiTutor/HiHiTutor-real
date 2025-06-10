'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
        {/* 主選單絕對置中並稍微偏左 */}
        <nav className="absolute left-[47%] top-1/2 -translate-x-1/2 -translate-y-1/2 flex space-x-6 text-sm text-gray-700">
          <Link href="/faq" className="hover:text-primary">配對流程</Link>
          <Link href="/articles" className="hover:text-primary">教育專欄</Link>
          <Link href="/about" className="hover:text-primary">平台簡介</Link>
        </nav>
        {/* 右側行動按鈕 */}
        <div className="flex items-center gap-2 ml-auto z-10">
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
          {isLoggedIn && (
            <Link href="/post">
              <button className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition">
                尋導師 / 招學生
              </button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar; 