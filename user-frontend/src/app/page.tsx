'use client';
import { useRouter } from 'next/navigation';
import HeroSection from '@/components/HeroSection';
import TutorSection from '@/components/TutorSection';
import CategoryList from '@/components/CategoryList';
import CaseSection from '@/components/CaseSection';
import CaseFilterBar from '@/components/CaseFilterBar';
import Advertisement from '@/components/Advertisement';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { tutorApi } from '@/services/api';

interface Tutor {
  tutorId: string;
  name: string;
  subjects: string[];
  teachingAreas: string[];
  teachingMethods: string[];
  experience: number;
  rating: number;
  hourlyRate: number;
  isVip: boolean;
  isTop: boolean;
}

export default function Home() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("🔍 正在獲取導師資料...");
        const result = await tutorApi.getRecommendedTutors();
        console.log("📦 成功獲取導師資料：", result);
        setTutors(result.data?.tutors || []);
      } catch (error) {
        console.error('❌ 獲取導師資料時發生錯誤：', error);
        setTutors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-yellow-400 to-yellow-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              找到最適合你的導師
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              專業的導師團隊，為你提供最優質的補習服務
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/find-student-cases"
                className="bg-white text-yellow-600 px-8 py-3 rounded-full font-semibold hover:bg-yellow-50 transition-colors"
              >
                尋找導師
              </Link>
              <Link
                href="/find-tutor-cases"
                className="bg-yellow-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-yellow-600 transition-colors"
              >
                尋找學生
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tutors Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              推薦導師
            </h2>
            <p className="text-lg text-gray-600">
              我們精心挑選的優秀導師，為你提供最專業的教學服務
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tutors.map((tutor) => (
              <div
                key={tutor.tutorId}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 font-bold text-xl">
                      {tutor.name?.[0] || '導'}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {tutor.name || '資深導師'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {tutor.experience || '資深導師'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {tutor.subjects?.slice(0, 3).map((subject, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tutor.teachingMethods?.slice(0, 2).map((method, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {method}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">時薪</span>
                      <span className="text-lg font-semibold text-yellow-600">
                        ${tutor.hourlyRate || '待議'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-4">
                  <Link
                    href={`/tutors/${tutor.tutorId}`}
                    className="block text-center bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    查看詳情
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
