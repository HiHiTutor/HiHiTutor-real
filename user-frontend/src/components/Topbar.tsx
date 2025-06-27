'use client';

import Link from 'next/link';

export default function Topbar() {
  return (
    <nav className="flex justify-end space-x-6 py-4 pr-8">
      <Link href="/" className="hover:text-primary">主頁</Link>
      <Link href="/tutors" className="hover:text-primary">尋導師</Link>
      <Link href="/find-tutor-cases" className="hover:text-primary">補習個案</Link>
      <Link href="/recommendations" className="hover:text-primary">導師推薦</Link>
      <Link href="/articles" className="hover:text-primary">教育專欄</Link>
      <Link href="/faq" className="hover:text-primary">常見問題</Link>
    </nav>
  );
} 