'use client';
import HeroSection from '@/components/HeroSection';
import TutorSection from '@/components/TutorSection';
import CategoryList from '@/components/CategoryList';
import CaseSection from '@/components/CaseSection';
import Footer from '@/components/Footer';
import CaseFilterBar from '@/components/CaseFilterBar';
import Advertisement from '@/components/Advertisement';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <HeroSection />
      <CaseFilterBar onFilter={() => {}} />
      <CategoryList />
      
      {/* 精選導師個案 */}
      <section>
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
      <TutorSection />

      {/* 最新學生搵導師個案 */}
      <section>
        <CaseSection 
          title="最新學生搵導師個案"
          fetchUrl="/find-tutor-cases?featured=true&limit=8"
          linkUrl="/find-tutor-cases"
          borderColor="border-blue-400"
          bgColor="bg-blue-50"
          icon="📄"
        />
      </section>

      <Advertisement />
      <Footer />
    </main>
  );
}
