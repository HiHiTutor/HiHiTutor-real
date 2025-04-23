import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import TutorSection from '@/components/TutorSection';
import CaseSection from '@/components/CaseSection';
import CategorySection from '@/components/CategorySection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <HeroSection />
      <CategorySection />
      <TutorSection />
      <CaseSection />
      <Footer />
    </main>
  );
}
