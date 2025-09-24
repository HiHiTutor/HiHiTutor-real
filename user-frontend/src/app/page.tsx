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
import HeroAdCarousel from '@/components/ads/HeroAdCarousel';
import CategoryList from '@/components/CategoryList';
import CaseSection from '@/components/CaseSection';
import TutorSection from '@/components/TutorSection';
import Advertisement from '@/components/Advertisement';
import CaseFilterBar from '@/components/CaseFilterBar';
import { Tutor } from '@/types/tutor';
import MainBannerAd from '@/components/ads/MainBannerAd';

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const router = useRouter();
  const [currentTarget, setCurrentTarget] = useState('tutors');

  const handleSearch = (query: any) => {
    const { target, type, ...rest } = query;
    // 優先使用 target，如果沒有則使用 type
    const searchTarget = target === "find-tutor" || type === "tutors" ? "tutors" : "find-student-cases";
    
    // 將搜尋條件轉換為 URL 參數
    const searchParams = new URLSearchParams();
    
    // 處理不同的參數名稱映射
    if (rest.category && rest.category !== 'unlimited') {
      searchParams.append('category', rest.category);
    }
    if (rest.subCategory && rest.subCategory !== 'unlimited') {
      searchParams.append('subCategory', rest.subCategory);
    }
    if (rest.subjects && Array.isArray(rest.subjects) && rest.subjects.length > 0) {
      rest.subjects.forEach((subject: string) => searchParams.append('subjects', subject));
    }
    if (rest.search) {
      searchParams.append('search', rest.search);
    }
    
    // 處理教學模式參數
    if (rest.modes && Array.isArray(rest.modes) && rest.modes.length > 0) {
      rest.modes.filter((mode: string) => mode !== 'unlimited').forEach((mode: string) => searchParams.append('modes', mode));
    } else if (rest.mode) {
      // 檢查 mode 是陣列還是字串
      if (Array.isArray(rest.mode)) {
        rest.mode.filter((mode: string) => mode !== 'unlimited').forEach((mode: string) => searchParams.append('modes', mode));
      } else if (rest.mode !== 'unlimited') {
        searchParams.append('modes', rest.mode);
      }
    }
    
    // 處理地區參數
    if (rest.regions && Array.isArray(rest.regions) && rest.regions.length > 0) {
      rest.regions.filter((region: string) => region !== 'unlimited').forEach((region: string) => searchParams.append('regions', region));
    } else if (rest.region && rest.region !== 'unlimited') {
      searchParams.append('regions', rest.region);
    }

    // 跳轉到目標頁面，並帶上搜尋參數
    router.push(`/${searchTarget}?${searchParams.toString()}`);
  };

  const handleTargetChange = (target: string) => {
    setCurrentTarget(target);
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
          {/* 第一行：會員優惠信息 + 熱門科目 */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* 左面：會員優惠信息 */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🎁</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">成為會員即送報名禮券</h2>
                </div>
                <p className="text-gray-700 text-lg mb-4">
                  註冊帳戶即享首次報名折扣優惠，精明家長之選！
                </p>
                <div className="flex gap-3">
                  <Link href="/register">
                    <button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all shadow-md">
                      立即註冊
                    </button>
                  </Link>
                  <Link href="/login">
                    <button className="border-2 border-yellow-400 text-yellow-600 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-50 transition-all">
                      登入帳戶
                    </button>
                  </Link>
                </div>
              </div>

              {/* 右面：熱門科目 */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">熱門科目</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-3xl mb-2">📊</div>
                    <div className="text-lg font-semibold text-gray-800">數學</div>
                    <div className="text-sm text-gray-600">95%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">🔤</div>
                    <div className="text-lg font-semibold text-gray-800">英文</div>
                    <div className="text-sm text-gray-600">90%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">📝</div>
                    <div className="text-lg font-semibold text-gray-800">中文</div>
                    <div className="text-sm text-gray-600">85%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">⚛️</div>
                    <div className="text-lg font-semibold text-gray-800">物理</div>
                    <div className="text-sm text-gray-600">80%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">🧪</div>
                    <div className="text-lg font-semibold text-gray-800">化學</div>
                    <div className="text-sm text-gray-600">75%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">🧬</div>
                    <div className="text-lg font-semibold text-gray-800">生物</div>
                    <div className="text-sm text-gray-600">70%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 第二行：Search Bar */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <Suspense fallback={<div className="text-center py-8">載入篩選器...</div>}>
              <CaseFilterBar
                onFilter={handleSearch}
                fetchUrl={currentTarget === 'tutors' ? '/tutors' : '/find-student-cases'}
                currentTarget={currentTarget}
                onTargetChange={handleTargetChange}
              />
            </Suspense>
          </div>

          {/* 刪除手機版主頁上方按鈕區域 */}
          <HeroSection />
          <CategoryList />
        </div>
      </div>
      
      {/* 第三行：導師列表 */}
      <div className="bg-white py-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-yellow-600 rounded-full mix-blend-multiply filter blur-xl transform translate-x-1/2 translate-y-1/2"></div>
          </div>
          <div className="relative px-4 sm:px-6 lg:px-8">
            <CaseSection 
              title="導師列表"
              fetchUrl="/tutors"
              linkUrl="/tutors"
              borderColor="border-yellow-200"
              bgColor="bg-yellow-50"
              icon="👩‍🏫"
              routeType="tutor"
              queryParams={{ featured: 'true' }}
            />
          </div>
        </div>
      </div>

      {/* 第五行：加入我們的導師團隊 */}
      <section className="bg-gradient-to-r from-blue-50 to-purple-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl transform -translate-x-1/2 translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl transform translate-x-1/2 translate-y-1/2"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 flex justify-center">
            <Image
              src="/tutor-hero.jpg"
              alt="成為導師"
              width={400}
              height={250}
              className="rounded-lg shadow-lg w-full h-auto max-w-xs md:max-w-md"
            />
          </div>
          <div className="flex-1 space-y-4 text-center md:text-left">
            <h3 className="text-2xl font-bold text-gray-900">加入我們的導師團隊</h3>
            <p className="text-gray-600">
              成為 HiHiTutor 的導師，分享你的專業知識，幫助學生實現學習目標。
              我們提供靈活的工作時間和豐厚的報酬。
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>✨ 靈活的工作時間</li>
              <li>💰 豐厚的報酬</li>
              <li>📚 多元的教學機會</li>
              <li>👥 專業的教學平台</li>
            </ul>
            <Link href="/upgrade">
              <button className="mt-4 bg-yellow-400 text-white px-6 py-2 rounded-lg hover:bg-yellow-500 transition-all">
                立即申請成為導師
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* 第四行：補習個案 */}
      <div className="bg-gray-50 py-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl transform translate-x-1/2 translate-y-1/2"></div>
          </div>
          <div className="relative px-4 sm:px-6 lg:px-8">
            <CaseSection 
              title="補習個案"
              fetchUrl="/find-student-cases"
              linkUrl="/find-student-cases"
              borderColor="border-blue-200"
              bgColor="bg-blue-50"
              icon="📄"
              routeType="student"
              queryParams={{}}
            />
          </div>
        </div>
      </div>

      {/* 第六行：導師配對服務介紹（暫時隱藏） */}
      {/* <Advertisement /> */}

    </main>
  );
}
