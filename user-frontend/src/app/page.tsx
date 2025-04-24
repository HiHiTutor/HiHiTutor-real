import HeroSection from '@/components/HeroSection';
import TutorSection from '@/components/TutorSection';
import CategoryList from '@/components/CategoryList';
import CaseSection from '@/components/CaseSection';
import Footer from '@/components/Footer';
import SearchBar from '@/components/SearchBar';
import Advertisement from '@/components/Advertisement';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <HeroSection />
      <SearchBar />
      <CategoryList />
      <TutorSection />
      <CaseSection />
      <Advertisement />
      <Footer />
    </main>
  );
}
