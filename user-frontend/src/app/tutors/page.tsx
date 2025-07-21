'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Star } from 'lucide-react';
import CaseFilterBar from '@/components/CaseFilterBar';
import { getTeachingModeLabel } from '@/constants/teachingModeOptions';
import { getSubjectName, getRegionName } from '@/utils/translate';
import { Tutor, TutorsResponse } from '@/types/tutor';
import TutorCard from '@/components/TutorCard';

export default function TutorsPage() {
  return (
    <Suspense>
      <TutorsPageContent />
    </Suspense>
  );
}

function TutorsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTutors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 構建查詢參數
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      
      // 從 URL 參數讀取所有篩選條件
      const subjectsFromUrl = searchParams.getAll('subjects');
      const regionsFromUrl = searchParams.getAll('regions');
      const modesFromUrl = searchParams.getAll('modes');
      const categoryFromUrl = searchParams.get('category');
      
      console.log('🔍 URL 參數:', {
        subjects: subjectsFromUrl,
        regions: regionsFromUrl,
        modes: modesFromUrl,
        category: categoryFromUrl
      });
      
      // 添加科目參數
      if (subjectsFromUrl.length > 0) {
        subjectsFromUrl.forEach(subject => params.append('subjects', subject));
        console.log('🔍 已添加科目參數到 API 請求');
      }
      
      // 添加地區參數
      if (regionsFromUrl.length > 0) {
        regionsFromUrl.forEach(region => params.append('regions', region));
        console.log('🔍 已添加地區參數到 API 請求');
      }
      
      // 添加模式參數
      if (modesFromUrl.length > 0) {
        modesFromUrl.forEach(mode => params.append('modes', mode));
        console.log('🔍 已添加模式參數到 API 請求');
      }
      
      // 添加分類參數
      if (categoryFromUrl) {
        params.append('category', categoryFromUrl);
        console.log('🔍 已添加分類參數到 API 請求');
      }
      
      params.append('page', currentPage.toString());

      console.log('🔍 正在獲取導師資料...', params.toString());
      
      // 使用 Vercel 部署的後端 API
      const apiUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3001/api/tutors'
        : 'https://hi-hi-tutor-real-backend2.vercel.app/api/tutors';
      
      console.log('🔍 完整 API URL:', `${apiUrl}?${params}`);
      
      const response = await fetch(`${apiUrl}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 API 回應狀態:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`API 請求失敗: ${response.status} ${response.statusText}`);
      }
      
      const data: TutorsResponse = await response.json();
      console.log('📦 獲取到的導師資料:', data);
      
      // 處理不同格式的回應
      let tutorsData: Tutor[] = [];
      if (Array.isArray(data)) {
        tutorsData = data;
      } else if (data.tutors) {
        tutorsData = data.tutors;
      } else if (data.data?.tutors) {
        tutorsData = data.data.tutors;
      } else {
        console.warn('⚠️ 無法識別回應格式:', data);
        tutorsData = [];
      }
      
      setTutors(tutorsData);
      setTotalPages(data.totalPages || Math.ceil(tutorsData.length / 12));
      
      console.log(`✅ 成功載入 ${tutorsData.length} 位導師`);
      
    } catch (error) {
      console.error('❌ 獲取導師資料時發生錯誤:', error);
      setError(error instanceof Error ? error.message : '獲取導師列表失敗');
      setTutors([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 從 URL 參數中讀取搜尋條件
    const search = searchParams.get('search');
    const subjects = searchParams.getAll('subjects');
    const regions = searchParams.getAll('regions');
    const modes = searchParams.getAll('modes');
    const category = searchParams.get('category');
    
    if (search) {
      setSearchQuery(search);
    }
    if (subjects && subjects.length > 0) {
      setSelectedSubjects(subjects);
      console.log('🔍 設置 selectedSubjects:', subjects);
    } else {
      setSelectedSubjects([]);
    }
    if (regions && regions.length > 0) {
      setSelectedAreas(regions);
    }
    if (modes && modes.length > 0) {
      setSelectedMethods(modes);
    }
    
    // 延遲執行 fetchTutors，確保狀態已經更新
    const timer = setTimeout(() => {
      fetchTutors();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [searchParams, currentPage]); // 移除 fetchTutors 依賴，避免無限循環

  const handleSearch = () => {
    setCurrentPage(1);
    fetchTutors();
  };

  const handleTutorClick = (tutor: Tutor) => {
    if (tutor.tutorId) {
      router.push(`/tutors/${tutor.tutorId}`);
    } else {
      alert('此導師缺少 tutorId，請聯絡管理員修正資料');
    }
  };

  const getTutorSubjects = (tutor: Tutor) => {
    return tutor.subjects || tutor.tutorProfile?.subjects || [];
  };

  const getTutorExperience = (tutor: Tutor) => {
    return tutor.experience || tutor.tutorProfile?.experience || '經驗豐富';
  };

  const getTutorRating = (tutor: Tutor) => {
    return tutor.rating || tutor.tutorProfile?.rating || 4.5;
  };

  const getTutorAvatar = (tutor: Tutor) => {
    return tutor.avatarUrl || tutor.avatar || `https://hi-hi-tutor-real-backend2.vercel.app/avatars/teacher${Math.floor(Math.random() * 6) + 1}.png`;
  };

  // 科目編碼到用戶友好標籤的映射 - 使用統一的翻譯函數
  const getSubjectLabel = (subjectCode: string) => {
    return getSubjectName(subjectCode);
  };

  // 地區編碼到用戶友好標籤的映射 - 使用統一的翻譯函數
  const getRegionLabel = (regionCode: string) => {
    return getRegionName(regionCode) || regionCode;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-yellow-200 border-t-yellow-500"></div>
          <p className="mt-4 text-yellow-700 font-medium">載入中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">錯誤</h2>
          <p className="text-yellow-700">{error}</p>
          <Button onClick={fetchTutors} className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white">重新載入</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-12 py-8 bg-gradient-to-br from-yellow-50 to-white min-h-screen">
      {/* 標題區 */}
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-yellow-400 p-3 rounded-full">
          <span className="text-2xl text-white">👩‍🏫</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-yellow-900 border-l-4 border-yellow-500 pl-4">導師列表</h1>
          <p className="text-yellow-600 mt-1">尋找合適的專業導師</p>
        </div>
      </div>

      {/* 篩選區 */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-yellow-100">
        <CaseFilterBar
          onFilter={(filters) => {
            console.log(' 篩選條件:', filters);
            
            // 構建新的 URL 參數
            const newSearchParams = new URLSearchParams();
            
            if (filters.search) {
              setSearchQuery(filters.search);
              newSearchParams.append('search', filters.search);
            }
            if (filters.category && filters.category !== 'unlimited') {
              newSearchParams.append('category', filters.category);
            }
            if (filters.subCategory && filters.subCategory !== 'unlimited') {
              newSearchParams.append('subCategory', filters.subCategory);
            }
            if (filters.subjects && filters.subjects.length > 0) {
              setSelectedSubjects(filters.subjects);
              newSearchParams.append('subjects', filters.subjects.join(','));
            }
            if (filters.regions && filters.regions.length > 0) {
              const filteredRegions = filters.regions.filter((region: string) => region !== 'unlimited');
              if (filteredRegions.length > 0) {
                setSelectedAreas(filteredRegions);
                newSearchParams.append('regions', filteredRegions.join(','));
              }
            }
            if (filters.mode && filters.mode.length > 0) {
              const filteredModes = filters.mode.filter((mode: string) => mode !== 'unlimited');
              if (filteredModes.length > 0) {
                setSelectedMethods(filteredModes);
                newSearchParams.append('modes', filteredModes.join(','));
              }
            }
            
            // 更新 URL
            const newUrl = `/tutors?${newSearchParams.toString()}`;
            router.push(newUrl);
            
            // 執行搜尋
            handleSearch();
          }}
          fetchUrl="/tutors"
        />
      </div>

      {/* 導師列表 */}
      {!tutors || tutors.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 max-w-md mx-auto">
            <div className="text-6xl mb-4">🧑‍🏫</div>
            <p className="text-yellow-700 font-medium text-lg">目前沒有符合條件的導師</p>
            <p className="text-yellow-500 mt-2">請嘗試調整搜尋條件</p>
            <Button onClick={() => {
              setSearchQuery('');
              setSelectedSubjects([]);
              setSelectedAreas([]);
              setSelectedMethods([]);
              fetchTutors();
            }} className="mt-6 bg-yellow-500 hover:bg-yellow-600 text-white">清除篩選條件</Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {tutors.map((tutor, index) => (
            <TutorCard key={tutor.id || tutor.userId || index} tutor={tutor} />
          ))}
        </div>
      )}
    </div>
  );
} 