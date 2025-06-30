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

interface Tutor {
  id?: string;
  userID?: string;
  tutorId?: string;
  name: string;
  avatarUrl?: string;
  tutorProfile?: {
    subjects?: string[];
    education?: string;
    experience?: string;
    rating?: number;
  };
  subjects?: string[];
  education?: string;
  experience?: string;
  rating?: number;
  isVip?: boolean;
  isTop?: boolean;
  region?: string;
  teachingModes?: string[];
}

interface TutorsResponse {
  tutors?: Tutor[];
  data?: {
    tutors?: Tutor[];
  };
  total?: number;
  totalPages?: number;
  currentPage?: number;
}

export default function TutorsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    }>
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
      
      // 直接從 URL 參數讀取科目，而不是依賴 selectedSubjects 狀態
      const subjectsFromUrl = searchParams.getAll('subjects');
      console.log('🔍 subjectsFromUrl:', subjectsFromUrl);
      console.log('🔍 selectedSubjects:', selectedSubjects);
      console.log('🔍 selectedSubjects.length:', selectedSubjects.length);
      
      if (subjectsFromUrl.length > 0) {
        subjectsFromUrl.forEach(subject => params.append('subjects', subject));
        console.log('🔍 已添加科目參數到 API 請求');
      } else if (selectedSubjects.length > 0) {
        selectedSubjects.forEach(subject => params.append('subjects', subject));
        console.log('🔍 已添加科目參數到 API 請求 (從 selectedSubjects)');
      } else {
        console.log('🔍 沒有選擇的科目，跳過科目參數');
      }
      
      if (selectedAreas.length > 0) params.append('regions', selectedAreas.join(','));
      if (selectedMethods.length > 0) params.append('modes', selectedMethods.join(','));
      
      // 添加分類參數
      const category = searchParams.get('category');
      if (category) {
        params.append('category', category);
      }
      
      params.append('page', currentPage.toString());
      // 移除分頁限制，一次顯示所有導師
      // params.append('limit', '12');

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
        // 如果沒有數據，使用 mock 數據
        tutorsData = [
          {
            id: '1',
            name: '張老師',
            avatarUrl: '/avatars/teacher1.png',
            subjects: ['數學', '物理'],
            experience: '5年教學經驗',
            rating: 4.8,
            isVip: true,
            isTop: true
          },
          {
            id: '2',
            name: '李老師',
            avatarUrl: '/avatars/teacher2.png',
            subjects: ['英文', '中文'],
            experience: '3年教學經驗',
            rating: 4.6,
            isVip: false,
            isTop: true
          },
          {
            id: '3',
            name: '王老師',
            avatarUrl: '/avatars/teacher3.png',
            subjects: ['化學', '生物'],
            experience: '7年教學經驗',
            rating: 4.9,
            isVip: true,
            isTop: false
          }
        ];
      }
      
      setTutors(tutorsData);
      setTotalPages(data.totalPages || Math.ceil(tutorsData.length / 12));
      
      console.log(`✅ 成功載入 ${tutorsData.length} 位導師`);
      
    } catch (error) {
      console.error('❌ 獲取導師資料時發生錯誤:', error);
      setError(error instanceof Error ? error.message : '獲取導師列表失敗');
      
      // 如果 API 失敗，使用 mock 數據
      const mockTutors = [
        {
          id: '1',
          name: '張老師',
          avatarUrl: '/avatars/teacher1.png',
          subjects: ['數學', '物理'],
          experience: '5年教學經驗',
          rating: 4.8,
          isVip: true,
          isTop: true
        },
        {
          id: '2',
          name: '李老師',
          avatarUrl: '/avatars/teacher2.png',
          subjects: ['英文', '中文'],
          experience: '3年教學經驗',
          rating: 4.6,
          isVip: false,
          isTop: true
        },
        {
          id: '3',
          name: '王老師',
          avatarUrl: '/avatars/teacher3.png',
          subjects: ['化學', '生物'],
          experience: '7年教學經驗',
          rating: 4.9,
          isVip: true,
          isTop: false
        },
        {
          id: '4',
          name: '陳老師',
          avatarUrl: '/avatars/teacher4.png',
          subjects: ['歷史', '地理'],
          experience: '4年教學經驗',
          rating: 4.5,
          isVip: false,
          isTop: false
        }
      ];
      
      setTutors(mockTutors);
      setTotalPages(1);
      toast.error('API 連接失敗，顯示示例數據');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 從 URL 參數中讀取搜尋條件
    const search = searchParams.get('search');
    const subjects = searchParams.getAll('subjects'); // 使用 getAll 獲取多個 subjects 參數
    const regions = searchParams.getAll('regions'); // 使用 getAll 獲取多個 regions 參數
    const modes = searchParams.getAll('modes'); // 使用 getAll 獲取多個 modes 參數
    const category = searchParams.get('category');
    
    if (search) {
      setSearchQuery(search);
    }
    if (subjects && subjects.length > 0) {
      setSelectedSubjects(subjects);
      console.log('🔍 設置 selectedSubjects:', subjects);
    } else {
      console.log('🔍 沒有從 URL 讀取到科目參數');
      setSelectedSubjects([]); // 清空科目選擇
    }
    if (regions && regions.length > 0) {
      setSelectedAreas(regions);
    }
    if (modes && modes.length > 0) {
      setSelectedMethods(modes);
    }
    if (category) {
      console.log('📝 檢測到分類參數:', category);
      console.log('📝 檢測到科目參數:', subjects);
      // 這裡可以根據分類設置相應的科目
      // 例如：early-childhood -> 幼兒教育相關科目
    }
    
    // 延遲執行 fetchTutors，確保狀態已經更新
    setTimeout(() => {
      fetchTutors();
    }, 0);
  }, [currentPage, searchParams]);

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
    return tutor.avatarUrl || `/avatars/teacher${Math.floor(Math.random() * 6) + 1}.png`;
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">錯誤</h2>
          <p className="text-gray-600">{error}</p>
          <Button onClick={fetchTutors} className="mt-4">重新載入</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-12 py-8 max-sm:px-4 max-sm:py-6">
      {/* 頁面標題 */}
      <div className="flex items-center gap-2 mb-6 max-sm:gap-1 max-sm:mb-4">
        <span className="text-2xl max-sm:text-xl">👩‍🏫</span>
        <h1 className="text-2xl font-bold border-l-4 border-yellow-400 pl-3 max-sm:text-xl max-sm:pl-2">導師列表</h1>
      </div>

      {/* 搜尋和篩選區域 */}
      <div className="bg-yellow-50 rounded-xl p-6 mb-8 max-sm:p-4 max-sm:mb-6">
        <CaseFilterBar
          onFilter={(filters) => {
            console.log(' 篩選條件:', filters);
            
            // 構建新的 URL 參數
            const newSearchParams = new URLSearchParams();
            
            if (filters.search) {
              setSearchQuery(filters.search);
              newSearchParams.append('search', filters.search);
            }
            if (filters.category) {
              newSearchParams.append('category', filters.category);
            }
            if (filters.subCategory) {
              newSearchParams.append('subCategory', filters.subCategory);
            }
            if (filters.subjects && filters.subjects.length > 0) {
              setSelectedSubjects(filters.subjects);
              newSearchParams.append('subjects', filters.subjects.join(','));
            }
            if (filters.regions && filters.regions.length > 0) {
              setSelectedAreas(filters.regions);
              newSearchParams.append('regions', filters.regions.join(','));
            }
            if (filters.mode && filters.mode.length > 0) {
              setSelectedMethods(filters.mode);
              newSearchParams.append('modes', filters.mode.join(','));
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
        <div className="text-center py-12 max-sm:py-8">
          <p className="text-gray-500 mb-4 max-sm:text-sm">找不到符合條件的導師</p>
          <Button onClick={() => {
            setSearchQuery('');
            setSelectedSubjects([]);
            setSelectedAreas([]);
            setSelectedMethods([]);
            fetchTutors();
          }} className="max-sm:text-sm">清除篩選條件</Button>
        </div>
      ) : (
        <>
          <div className="mb-6 max-sm:mb-4">
            <p className="text-gray-600 max-sm:text-sm">找到 {tutors.length} 位導師</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-sm:gap-3">
            {tutors.map((tutor, index) => (
              <Card 
                key={tutor.id || tutor.userID || index} 
                className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-yellow-300 max-sm:border max-sm:hover:border-yellow-300"
                onClick={() => handleTutorClick(tutor)}
              >
                <CardHeader className="pb-3 max-sm:pb-2">
                  <div className="flex items-center gap-3 max-sm:gap-2">
                    <Avatar className="h-12 w-12 max-sm:h-10 max-sm:w-10">
                      <AvatarImage src={getTutorAvatar(tutor)} alt={tutor.name} />
                      <AvatarFallback className="bg-yellow-100 text-yellow-600 max-sm:text-sm">
                        {tutor.name?.[0] || 'T'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate max-sm:text-base">{tutor.name}</CardTitle>
                      <div className="flex items-center gap-1 text-sm text-gray-600 max-sm:text-xs">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 max-sm:h-3 max-sm:w-3" />
                        <span>{getTutorRating(tutor).toFixed(1)}</span>
                      </div>
                    </div>
                    {(tutor.isVip || tutor.isTop) && (
                      <div className="flex gap-1 max-sm:gap-0.5">
                        {tutor.isVip && <Badge variant="default" className="bg-purple-500 max-sm:text-xs">VIP</Badge>}
                        {tutor.isTop && <Badge variant="default" className="bg-yellow-500 max-sm:text-xs">精選</Badge>}
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 max-sm:pt-0">
                  <div className="space-y-3 max-sm:space-y-2">
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2 max-sm:text-xs max-sm:mb-1">教授科目</div>
                      <div className="flex flex-wrap gap-1 max-sm:gap-0.5">
                        {getTutorSubjects(tutor).slice(0, 3).map((subject) => (
                          <Badge key={subject} variant="secondary" className="text-xs max-sm:text-xs">
                            {getSubjectLabel(subject)}
                          </Badge>
                        ))}
                        {getTutorSubjects(tutor).length > 3 && (
                          <Badge variant="outline" className="text-xs max-sm:text-xs">
                            +{getTutorSubjects(tutor).length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 max-sm:text-xs">
                      <span className="font-medium">教學經驗:</span> {getTutorExperience(tutor)}
                    </div>
                    
                    {/* 地區和教學模式 */}
                    <div className="text-sm text-gray-600 space-y-1 max-sm:text-xs max-sm:space-y-0.5">
                      {tutor.region && (
                        <div>
                          <span className="font-medium">教學地區:</span> {getRegionLabel(tutor.region)}
                        </div>
                      )}
                      {tutor.teachingModes && tutor.teachingModes.length > 0 && (
                        <div>
                          <span className="font-medium">教學模式:</span> {tutor.teachingModes.map(mode => getTeachingModeLabel(mode)).join('、')}
                        </div>
                      )}
                    </div>
                    
                    <Button className="w-full max-sm:text-xs" size="sm">
                      查看詳情
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
} 