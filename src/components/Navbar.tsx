import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  console.log('🔥 menuOpen =', menuOpen); // Debug 用

  return (
    <nav className="w-full flex items-center justify-between px-4 py-3 bg-white shadow md:justify-end md:space-x-6">
      {/* 左邊 LOGO */}
      <Link href="/" className="text-2xl font-bold text-yellow-500">HiHiTutor</Link>

      {/* Desktop Menu */}
      <div className="hidden md:flex space-x-6">
        <Link href="/">主頁</Link>
        <Link href="/tutors">尋導師</Link>
        <Link href="/find-tutor-cases">補習個案</Link>
        <Link href="/recommendations">導師推薦</Link>
        <Link href="/articles">教育專欄</Link>
        <Link href="/faq">常見問題</Link>
      </div>

      {/* 漢堡按鈕 */}
      <button
        className="md:hidden"
        aria-label="Open menu"
        onClick={() => {
          console.log("✅ 點擊漢堡 icon");
          setMenuOpen(!menuOpen);
        }}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
      </button>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center space-y-4 py-6 md:hidden overflow-y-auto">
          <div className="text-black text-xl">✅ Menu Open</div>
          <Link href="/" onClick={() => setMenuOpen(false)}>主頁</Link>
          <Link href="/tutors" onClick={() => setMenuOpen(false)}>尋導師</Link>
          <Link href="/find-tutor-cases" onClick={() => setMenuOpen(false)}>補習個案</Link>
          <Link href="/recommendations" onClick={() => setMenuOpen(false)}>導師推薦</Link>
          <Link href="/articles" onClick={() => setMenuOpen(false)}>教育專欄</Link>
          <Link href="/faq" onClick={() => setMenuOpen(false)}>常見問題</Link>
          {/* 登入／註冊按鈕 */}
          <div className="flex flex-col items-center space-y-2 mt-2 w-full">
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
          </div>
        </div>
      )}
    </nav>
  );
} 