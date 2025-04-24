'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  UserIcon,
  UserPlusIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/solid';

const SubjectBar = ({ name, percent }: { name: string; percent: number }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span>{name}</span>
      <span>{percent}%</span>
    </div>
    <div className="bg-gray-200 h-2 rounded">
      <div className="bg-yellow-400 h-2 rounded" style={{ width: `${percent}%` }} />
    </div>
  </div>
);

export default function HeroSection() {
  return (
    <section className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-start px-4 py-10">
      {/* 左欄：Hero 圖 & 文案 */}
      <div className="w-full lg:w-2/3">
        <div className="relative w-full bg-white">
          {/* 背景圖片 */}
          <Image
            src="/hero-banner.jpg"
            alt="Hero Illustration"
            width={1200}
            height={400}
            className="w-full object-cover h-[400px] opacity-50"
          />

          {/* 疊加內容 */}
          <div className="absolute top-0 left-0 h-full w-full flex items-center px-8">
            <div className="max-w-md text-black space-y-6">
              <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 drop-shadow-md">
                找到最適合你的 <span className="text-yellow-500">私人補習導師</span>
              </h1>
              <p>HiHiTutor 幫你配對最合適的導師，讓學習更有效率。</p>
              <div className="flex gap-4">
                <Link
                  href="/tutors"
                  className="bg-yellow-400 text-white px-5 py-2 rounded hover:bg-yellow-500 transition-all"
                >
                  立即尋找導師
                </Link>
                <button className="border px-5 py-2 rounded hover:bg-gray-100 transition-all">
                  了解更多
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 右欄：登入註冊卡片 + 熱門科目 */}
      <div className="w-full lg:w-1/3 space-y-6">
        <div className="bg-white shadow-md rounded-lg p-4 space-y-3 w-full max-w-xs">
          <Link
            href="/login"
            className="w-full flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
          >
            <UserIcon className="w-5 h-5" />
            會員登入
          </Link>
          <Link
            href="/register"
            className="w-full flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
          >
            <UserPlusIcon className="w-5 h-5" />
            會員註冊
          </Link>
          <button className="w-full flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
            <EnvelopeIcon className="w-5 h-5" />
            聯絡我們
          </button>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="font-bold text-lg mb-4">熱門科目</h2>
          <div className="space-y-2">
            <SubjectBar name="數學" percent={90} />
            <SubjectBar name="英文" percent={70} />
            <SubjectBar name="中文" percent={60} />
          </div>
        </div>
      </div>
    </section>
  );
} 