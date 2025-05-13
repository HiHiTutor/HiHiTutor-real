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
      <div className="bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-yellow-50 opacity-50"></div>
        <div className="relative">
          <HeroSection />
          <CaseFilterBar 
            onSearch={handleSearch}
            onFilter={handleSearch}
            fetchUrl="/find-tutor-cases"
          />
          <CategoryList />
        </div>
      </div>
      
      {/* 精選導師個案 */}
      <section className="bg-yellow-50 py-12">
        <CaseSection 
          title="精選導師個案"
          fetchUrl="/find-student-cases?featured=true&limit=8"
          linkUrl="/find-student-cases"
          borderColor="border-yellow-400"
          bgColor="bg-yellow-50"
          icon="👩‍🏫"
        />
      </section>

      {/* 成為導師 */}
      <section className="bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 via-white to-yellow-50 opacity-50"></div>
        <div className="relative">
          <TutorSection />
        </div>
      </section>

      {/* 最新學生搵導師個案 */}
      <section className="bg-blue-50 py-12">
        <CaseSection 
          title="最新學生搵導師個案"
          fetchUrl="/find-tutor-cases"
          linkUrl="/find-tutor-cases"
          borderColor="border-blue-400"
          bgColor="bg-blue-50"
          icon="📄"
        />
      </section>

      <Advertisement />
    </main>
  );
}
