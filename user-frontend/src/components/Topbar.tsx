'use client';

import Link from 'next/link';
import { useState } from 'react';
import React from 'react';

export default function Topbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="w-full flex items-center justify-between py-4 pr-8 md:justify-end md:space-x-6 max-md:py-2 max-md:pr-0">
      {/* Logo */}
      <div className="flex items-center pl-4 select-none">
        <Link href="/" className="text-2xl font-bold text-yellow-500 mr-2">HiHiTutor</Link>
      </div>
      {/* Desktop menu */}
      <div className="hidden md:flex space-x-6">
        <Link href="/" className="hover:text-primary">主頁</Link>
        <Link href="/tutors" className="hover:text-primary">尋導師</Link>
        <Link href="/find-tutor-cases" className="hover:text-primary">補習個案</Link>
        <Link href="/recommendations" className="hover:text-primary">導師推薦</Link>
        <Link href="/articles" className="hover:text-primary">教育專欄</Link>
        <Link href="/faq" className="hover:text-primary">常見問題</Link>
        <Link href="/post/student-case" className="hover:text-white bg-yellow-500 px-3 py-1 rounded font-semibold transition-colors">出Post搵導師</Link>
      </div>
      {/* Mobile hamburger */}
      <button
        className="md:hidden p-2 focus:outline-none"
        aria-label="Open menu"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        )}
      </button>
      {/* Mobile dropdown */}
      {open && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-lg z-50 flex flex-col items-center space-y-4 py-6 md:hidden animate-fade-in">
          <Link href="/" className="hover:text-primary text-lg" onClick={() => setOpen(false)}>主頁</Link>
          <Link href="/tutors" className="hover:text-primary text-lg" onClick={() => setOpen(false)}>尋導師</Link>
          <Link href="/find-tutor-cases" className="hover:text-primary text-lg" onClick={() => setOpen(false)}>補習個案</Link>
          <Link href="/recommendations" className="hover:text-primary text-lg" onClick={() => setOpen(false)}>導師推薦</Link>
          <Link href="/articles" className="hover:text-primary text-lg" onClick={() => setOpen(false)}>教育專欄</Link>
          <Link href="/faq" className="hover:text-primary text-lg" onClick={() => setOpen(false)}>常見問題</Link>
          <Link href="/post/student-case" className="hover:text-white bg-yellow-500 px-4 py-2 rounded font-semibold transition-colors text-lg" onClick={() => setOpen(false)}>出Post搵導師</Link>
        </div>
      )}
    </nav>
  );
} 