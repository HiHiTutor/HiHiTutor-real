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

interface Tutor {
  tutorId: string;
  name: string;
  rating: number;
  isVip: boolean;
  isTop: boolean;
  subjects: string[];
  teachingMethods: string[];
  experience: number;
  hourlyRate: number;
  avatarUrl?: string;
}

export default function Home() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        setLoading(true);
        console.log("🔍 正在獲取導師資料...");
        const result = await tutorApi.getRecommendedTutors();
        console.log("📦 成功獲取導師資料：", result);
        const sortedTutors = (result.data?.tutors || []).sort((a: Tutor, b: Tutor) => {
          // 先比較 VIP 狀態
          if (a.isVip !== b.isVip) return b.isVip ? 1 : -1;
          // 再比較置頂狀態
          if (a.isTop !== b.isTop) return b.isTop ? 1 : -1;
          // 最後比較評分
          return b.rating - a.rating;
        });
        setTutors(sortedTutors.slice(0, 8)); // 只取前8個
      } catch (error) {
        console.error('❌ 獲取導師資料時發生錯誤：', error);
        setTutors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
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
    return <div className="container mx-auto py-8 text-center">載入中...</div>;
  }

  return (
    <Suspense>
      <HomeContent tutors={tutors} loading={loading} />
    </Suspense>
  );
}

function HomeContent({ tutors, loading }: { tutors: Tutor[], loading: boolean }) {
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
              title="導師列表"
              fetchUrl="/tutors?featured=true&limit=8"
              linkUrl="/tutors"
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
              title="補習個案"
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

      <div className="container mx-auto py-8">
        <div className="space-y-8">
          {/* 導師列表 */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">👩‍🏫 導師列表</h2>
              <Link href="/tutors" className="text-blue-600 hover:text-blue-800">
                查看全部 →
              </Link>
            </div>
            {loading ? (
              <div className="text-center py-8">載入中...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {tutors.map((tutor: Tutor) => (
                  <Link key={tutor.tutorId} href={`/tutors/${tutor.tutorId}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <CardHeader>
                        {/* 圓形頭像 */}
                        <div className="w-[80px] h-[80px] rounded-full overflow-hidden mx-auto mb-4">
                          <Image
                            src={tutor.avatarUrl || '/default.jpg'}
                            alt={`${tutor.name} 的照片`}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{tutor.name}</CardTitle>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{tutor.rating.toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {tutor.isVip && (
                            <Badge variant="default" className="bg-yellow-500">VIP</Badge>
                          )}
                          {tutor.isTop && (
                            <Badge variant="secondary">置頂</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm text-gray-500">教授科目：</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {tutor.subjects?.slice(0, 3).map((subject: string) => (
                                <Badge key={subject} variant="outline">
                                  {subject}
                                </Badge>
                              ))}
                              {tutor.subjects && tutor.subjects.length > 3 && (
                                <Badge variant="outline">+{tutor.subjects.length - 3}</Badge>
                              )}
                            </div>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">授課方式：</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {tutor.teachingMethods?.map((method: string) => (
                                <Badge key={method} variant="outline">
                                  {method === 'face-to-face' ? '面授' : 
                                   method === 'online' ? '網上' : '混合'}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">教學經驗：</span>
                            <span className="text-sm">{tutor.experience} 年</span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">時薪：</span>
                            <span className="text-sm">${tutor.hourlyRate}/小時</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
