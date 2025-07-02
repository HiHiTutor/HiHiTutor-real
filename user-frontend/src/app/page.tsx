'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { tutorApi } from '@/services/api';
import HeroSection from '@/components/HeroSection';
import CategoryList from '@/components/CategoryList';
import CaseSection from '@/components/CaseSection';
import TutorSection from '@/components/TutorSection';
import Advertisement from '@/components/Advertisement';
import CaseFilterBar from '@/components/CaseFilterBar';
import { Tutor } from '@/types/tutor';

export default function Home() {
  const router = useRouter();

  const handleSearch = (query: any) => {
    const { type, ...rest } = query;
    const target = type === "tutors" ? "tutors" : "find-student-cases";
    
    // 將搜尋條件轉換為 URL 參數
    const searchParams = new URLSearchParams();
    
    // 處理不同的參數名稱映射
    if (rest.category) {
      searchParams.append('category', rest.category);
    }
    if (rest.subCategory) {
      searchParams.append('subCategory', rest.subCategory);
    }
    if (rest.subjects && Array.isArray(rest.subjects) && rest.subjects.length > 0) {
      rest.subjects.forEach((subject: string) => searchParams.append('subjects', subject));
    }
    if (rest.search) {
      searchParams.append('search', rest.search);
    }
    
    // 處理教學模式參數
    if (rest.modes && Array.isArray(rest.modes) && rest.modes.length > 0) {
      rest.modes.forEach((mode: string) => searchParams.append('modes', mode));
    } else if (rest.mode && Array.isArray(rest.mode) && rest.mode.length > 0) {
      rest.mode.forEach((mode: string) => searchParams.append('modes', mode));
    }
    
    // 處理地區參數
    if (rest.regions && Array.isArray(rest.regions) && rest.regions.length > 0) {
      rest.regions.forEach((region: string) => searchParams.append('regions', region));
    } else if (rest.region) {
      searchParams.append('regions', rest.region);
    }

    // 跳轉到目標頁面，並帶上搜尋參數
    router.push(`/${target}?${searchParams.toString()}`);
  };

  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const router = useRouter();

  const handleSearch = (query: any) => {
    const { type, ...rest } = query;
    const target = type === "tutors" ? "tutors" : "find-student-cases";
    
    // 將搜尋條件轉換為 URL 參數
    const searchParams = new URLSearchParams();
    
    // 處理不同的參數名稱映射
    if (rest.category) {
      searchParams.append('category', rest.category);
    }
    if (rest.subCategory) {
      searchParams.append('subCategory', rest.subCategory);
    }
    if (rest.subjects && Array.isArray(rest.subjects) && rest.subjects.length > 0) {
      rest.subjects.forEach((subject: string) => searchParams.append('subjects', subject));
    }
    if (rest.search) {
      searchParams.append('search', rest.search);
    }
    
    // 處理教學模式參數
    if (rest.modes && Array.isArray(rest.modes) && rest.modes.length > 0) {
      rest.modes.forEach((mode: string) => searchParams.append('modes', mode));
    } else if (rest.mode && Array.isArray(rest.mode) && rest.mode.length > 0) {
      rest.mode.forEach((mode: string) => searchParams.append('modes', mode));
    }
    
    // 處理地區參數
    if (rest.regions && Array.isArray(rest.regions) && rest.regions.length > 0) {
      rest.regions.forEach((region: string) => searchParams.append('regions', region));
    } else if (rest.region) {
      searchParams.append('regions', rest.region);
    }

    // 跳轉到目標頁面，並帶上搜尋參數
    router.push(`/${target}?${searchParams.toString()}`);
  };

  return (
    <main className="min-h-screen">
      <div className="bg-[url('/newBK.png')] bg-no-repeat bg-cover bg-fixed relative overflow-hidden">
        {/* 幾何圖案背景 */}
        <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
          <div className="absolute top-0 left-0 w-64 h-64 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl transform -translate-x-1/2 translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl transform translate-x-1/2 translate-y-1/2"></div>
        </div>
        <div className="relative">
          {/* 刪除手機版主頁上方按鈕區域 */}
          <HeroSection />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <CaseFilterBar
              onFilter={handleSearch}
              fetchUrl="/find-tutor-cases"
            />
          </div>
          <CategoryList />
        </div>
      </div>
      
      {/* 精選導師個案 */}
      <div className="relative overflow-hidden">
        <div className="bg-yellow-50 max-w-7xl mx-auto rounded-2xl">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-yellow-600 rounded-full mix-blend-multiply filter blur-xl transform translate-x-1/2 translate-y-1/2"></div>
          </div>
          <div className="relative px-4 sm:px-6 lg:px-8">
            <CaseSection 
              title="導師列表"
              fetchUrl="/tutors"
              linkUrl="/tutors"
              borderColor="border-yellow-200"
              bgColor="bg-yellow-50"
              icon="👩‍🏫"
              routeType="tutor"
              queryParams={{ featured: true }}
            />
          </div>
        </div>
      </div>

      {/* 成為導師宣傳區塊（banner/poster） */}
      <section className="bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl transform -translate-x-1/2 translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl transform translate-x-1/2 translate-y-1/2"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 flex justify-center">
            <Image
              src="/tutor-hero.jpg"
              alt="成為導師"
              width={400}
              height={250}
              className="rounded-lg shadow-lg w-full h-auto max-w-xs md:max-w-md"
            />
          </div>
          <div className="flex-1 space-y-4 text-center md:text-left">
            <h3 className="text-2xl font-bold text-gray-900">加入我們的導師團隊</h3>
            <p className="text-gray-600">
              成為 HiHiTutor 的導師，分享你的專業知識，幫助學生實現學習目標。
              我們提供靈活的工作時間和豐厚的報酬。
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>✨ 靈活的工作時間</li>
              <li>💰 豐厚的報酬</li>
              <li>📚 多元的教學機會</li>
              <li>👥 專業的教學平台</li>
            </ul>
            <Link href="/upgrade">
              <button className="mt-4 bg-yellow-400 text-white px-6 py-2 rounded-lg hover:bg-yellow-500 transition-all">
                立即申請成為導師
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* 最新學生搵導師個案 */}
      <div className="bg-white py-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl transform translate-x-1/2 translate-y-1/2"></div>
          </div>
          <div className="relative px-4 sm:px-6 lg:px-8">
            <CaseSection 
              title="補習個案"
              fetchUrl="/find-tutor-cases"
              linkUrl="/find-tutor-cases"
              borderColor="border-blue-200"
              bgColor="bg-blue-50"
              icon="📄"
              routeType="student"
              queryParams={{}}
            />
          </div>
        </div>
      </div>

      <Advertisement />

    </main>
  );
}
