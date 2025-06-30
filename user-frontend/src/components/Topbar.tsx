'use client';

import Link from 'next/link';

export default function Topbar() {
  return (
    <nav className="flex justify-end space-x-6 py-4 pr-8 max-sm:justify-center max-sm:space-x-3 max-sm:py-2 max-sm:pr-0 max-sm:flex-wrap max-[700px]:justify-center max-[700px]:space-x-4 max-[700px]:py-3 max-[700px]:pr-0 max-[700px]:flex-wrap">
      <Link href="/" className="hover:text-primary max-sm:text-sm max-[700px]:text-sm">主頁</Link>
      <Link href="/tutors" className="hover:text-primary max-sm:text-sm max-[700px]:text-sm">尋導師</Link>
      <Link href="/find-tutor-cases" className="hover:text-primary max-sm:text-sm max-[700px]:text-sm">補習個案</Link>
      <Link href="/recommendations" className="hover:text-primary max-sm:text-sm max-[700px]:text-sm">導師推薦</Link>
      <Link href="/articles" className="hover:text-primary max-sm:text-sm max-[700px]:text-sm">教育專欄</Link>
      <Link href="/faq" className="hover:text-primary max-sm:text-sm max-[700px]:text-sm">常見問題</Link>
    </nav>
  );
} 