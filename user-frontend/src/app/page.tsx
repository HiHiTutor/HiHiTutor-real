import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import CourseSection from '@/components/CourseSection';
import TutorSection from '@/components/TutorSection';
import CaseSection from '@/components/CaseSection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <HeroSection />
      <CourseSection />
      <TutorSection />
      <CaseSection />
      <Footer />
    </main>
  );
}
