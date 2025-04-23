import HeroSection from '@/components/HeroSection';
import CourseSection from '@/components/CourseSection';
import TutorSection from '@/components/TutorSection';
import CaseSection from '@/components/CaseSection';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <HeroSection />
      <CourseSection />
      <TutorSection />
      <CaseSection />
    </main>
  );
}
