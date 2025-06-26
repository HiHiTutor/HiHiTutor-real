'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Star } from 'lucide-react';

interface Tutor {
  id?: string;
  userID?: string;
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
      if (selectedSubjects.length > 0) params.append('subjects', selectedSubjects.join(','));
      if (selectedAreas.length > 0) params.append('regions', selectedAreas.join(','));
      if (selectedMethods.length > 0) params.append('modes', selectedMethods.join(','));
      
      // 添加分類參數
      const category = searchParams.get('category');
      if (category) {
        params.append('category', category);
      }
      
      params.append('page', currentPage.toString());
      params.append('limit', '12');

      console.log('🔍 正在獲取導師資料...', params.toString());
      
      // 使用 Vercel 部署的後端 API
      const apiUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3001/api/tutors'
        : 'https://hi-hi-tutor-real-backend2.vercel.app/api/tutors';
      
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
    const subjects = searchParams.get('subjects');
    const regions = searchParams.get('regions');
    const modes = searchParams.get('modes');
    const category = searchParams.get('category');
    
    if (search) {
      setSearchQuery(search);
    }
    if (subjects) {
      setSelectedSubjects(subjects.split(','));
    }
    if (regions) {
      setSelectedAreas(regions.split(','));
    }
    if (modes) {
      setSelectedMethods(modes.split(','));
    }
    if (category) {
      console.log('📝 檢測到分類參數:', category);
      // 這裡可以根據分類設置相應的科目
      // 例如：early-childhood -> 幼兒教育相關科目
    }
    
    fetchTutors();
  }, [currentPage, searchParams]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchTutors();
  };

  const handleTutorClick = (tutor: Tutor) => {
    const tutorId = tutor.id || tutor.userID;
    if (tutorId) {
      router.push(`/tutors/${tutorId}`);
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
    <div className="max-w-7xl mx-auto px-4 md:px-12 py-8">
      {/* 頁面標題 */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">👩‍🏫</span>
        <h1 className="text-2xl font-bold border-l-4 border-yellow-400 pl-3">導師列表</h1>
      </div>

      {/* 搜尋和篩選區域 */}
      <div className="bg-yellow-50 rounded-xl p-6 mb-8">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="搜尋導師姓名或科目..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} className="sm:w-auto">
              搜尋
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 科目篩選 */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">教授科目</Label>
              <div className="space-y-2">
                {['數學', '物理', '化學', '生物', '英文', '中文'].map((subject) => (
                  <div key={subject} className="flex items-center space-x-2">
                    <Checkbox
                      id={subject}
                      checked={selectedSubjects.includes(subject)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedSubjects([...selectedSubjects, subject]);
                        } else {
                          setSelectedSubjects(selectedSubjects.filter((s) => s !== subject));
                        }
                      }}
                    />
                    <Label htmlFor={subject} className="text-sm">{subject}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* 地區篩選 */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">教學地區</Label>
              <div className="space-y-2">
                {['中環', '金鐘', '銅鑼灣', '旺角', '沙田', '將軍澳'].map((area) => (
                  <div key={area} className="flex items-center space-x-2">
                    <Checkbox
                      id={area}
                      checked={selectedAreas.includes(area)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedAreas([...selectedAreas, area]);
                        } else {
                          setSelectedAreas(selectedAreas.filter((a) => a !== area));
                        }
                      }}
                    />
                    <Label htmlFor={area} className="text-sm">{area}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* 授課方式篩選 */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">授課方式</Label>
              <div className="space-y-2">
                {['面授', '網上', '混合'].map((method) => (
                  <div key={method} className="flex items-center space-x-2">
                    <Checkbox
                      id={method}
                      checked={selectedMethods.includes(method)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedMethods([...selectedMethods, method]);
                        } else {
                          setSelectedMethods(selectedMethods.filter((m) => m !== method));
                        }
                      }}
                    />
                    <Label htmlFor={method} className="text-sm">{method}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 導師列表 */}
      {!tutors || tutors.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">找不到符合條件的導師</p>
          <Button onClick={() => {
            setSearchQuery('');
            setSelectedSubjects([]);
            setSelectedAreas([]);
            setSelectedMethods([]);
            fetchTutors();
          }}>清除篩選條件</Button>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <p className="text-gray-600">找到 {tutors.length} 位導師</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tutors.map((tutor, index) => (
              <Card 
                key={tutor.id || tutor.userID || index} 
                className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-yellow-300"
                onClick={() => handleTutorClick(tutor)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={getTutorAvatar(tutor)} alt={tutor.name} />
                      <AvatarFallback className="bg-yellow-100 text-yellow-600">
                        {tutor.name?.[0] || 'T'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{tutor.name}</CardTitle>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{getTutorRating(tutor).toFixed(1)}</span>
                      </div>
                    </div>
                    {(tutor.isVip || tutor.isTop) && (
                      <div className="flex gap-1">
                        {tutor.isVip && <Badge variant="default" className="bg-purple-500">VIP</Badge>}
                        {tutor.isTop && <Badge variant="default" className="bg-yellow-500">精選</Badge>}
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">教授科目</div>
                      <div className="flex flex-wrap gap-1">
                        {getTutorSubjects(tutor).slice(0, 3).map((subject) => (
                          <Badge key={subject} variant="secondary" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                        {getTutorSubjects(tutor).length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{getTutorSubjects(tutor).length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">教學經驗:</span> {getTutorExperience(tutor)}
                    </div>
                    
                    <Button className="w-full" size="sm">
                      查看詳情
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 分頁 */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                上一頁
              </Button>
              <span className="flex items-center px-4 text-sm text-gray-600">
                第 {currentPage} 頁，共 {totalPages} 頁
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                下一頁
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
} 