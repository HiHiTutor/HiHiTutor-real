'use client';
import { useRouter } from 'next/navigation';
import HeroSection from '@/components/HeroSection';
import TutorSection from '@/components/TutorSection';
import CategoryList from '@/components/CategoryList';
import CaseSection from '@/components/CaseSection';
import CaseFilterBar from '@/components/CaseFilterBar';
import Advertisement from '@/components/Advertisement';
import { Suspense } from 'react';

export default function Home() {
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
    const target = type === "find-tutor-cases" ? "find-student-cases" : "find-tutor-cases";
    
    // 將搜尋條件轉換為 URL 參數
    const searchParams = new URLSearchParams();
    Object.entries(rest).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        searchParams.append(key, value.join(','));
      } else if (value !== undefined && value !== '') {
        searchParams.append(key, String(value));
      }
    });

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
              title="尋導師"
              fetchUrl="/find-student-cases?featured=true&limit=8"
              linkUrl="/find-student-cases"
              borderColor="border-yellow-200"
              bgColor="bg-yellow-50"
              icon="👩‍🏫"
              routeType="tutor"
            />
          </div>
        </div>
      </div>

      {/* 成為導師 */}
      <section className="bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl transform -translate-x-1/2 translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl transform translate-x-1/2 translate-y-1/2"></div>
        </div>
        <div className="relative">
          <TutorSection />
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
              title="招學生"
              fetchUrl="/find-tutor-cases?limit=8"
              linkUrl="/find-tutor-cases"
              borderColor="border-blue-200"
              bgColor="bg-blue-50"
              icon="📄"
              routeType="student"
            />
          </div>
        </div>
      </div>

      <Advertisement />
    </main>
  );
}
