import HeroSection from '@/components/HeroSection';
import TutorSection from '@/components/TutorSection';
import CategoryList from '@/components/CategoryList';
import CaseSection from '@/components/CaseSection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <HeroSection />
      <CategoryList />
      <TutorSection />
      <CaseSection />
      <Footer />
    </main>
  );
}
