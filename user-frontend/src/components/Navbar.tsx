'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="HiHiTutor"
                width={120}
                height={40}
                className="h-10 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6 text-sm text-gray-700">
            <Link href="/" className="hover:text-primary">主頁</Link>
            <Link href="/tutors" className="hover:text-primary">尋導師</Link>
            <Link href="/cases" className="hover:text-primary">招學生</Link>
            <Link href="/recommendations" className="hover:text-primary">導師推薦</Link>
            <Link href="/blog" className="hover:text-primary">教育專欄</Link>
            <Link href="/faq" className="hover:text-primary">常見問題</Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Link href="/tutors" className="bg-yellow-400 text-white px-4 py-2 rounded-md hover:bg-yellow-500 transition">
              尋導師
            </Link>
            <Link href="/cases" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
              招學生
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              主頁
            </Link>
            <Link
              href="/tutors"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              尋導師
            </Link>
            <Link
              href="/cases"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              招學生
            </Link>
            <Link
              href="/recommendations"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              導師推薦
            </Link>
            <Link
              href="/blog"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              教育專欄
            </Link>
            <Link
              href="/faq"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              常見問題
            </Link>
            <div className="mt-4 space-y-2">
              <Link
                href="/tutors"
                className="block w-full text-center bg-yellow-400 text-white px-4 py-2 rounded hover:bg-yellow-500 transition"
              >
                尋導師
              </Link>
              <Link
                href="/cases"
                className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                招學生
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar; 