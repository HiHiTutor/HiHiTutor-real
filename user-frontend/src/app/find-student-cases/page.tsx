'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import CaseFilterBar from '@/components/CaseFilterBar';
import LoadMoreButton from '@/components/LoadMoreButton';
import TutorCard from '@/components/TutorCard';
import { tutorApi } from '@/services/api';
import CATEGORY_OPTIONS from '@/constants/categoryOptions';

// 定義分類選項的類型
interface CategoryOption {
  label: string;
  subjects: Array<{
    value: string;
    label: string;
  }>;
}

interface CategoryOptions {
  'early-childhood': CategoryOption;
  'primary-secondary': CategoryOption;
  'interest': CategoryOption;
  'tertiary': CategoryOption;
  'adult': CategoryOption;
  [key: string]: CategoryOption;
}

interface Tutor {
  id: string;
  tutorId: string;
  name: string;
  subject: string;
  subjects: string[];
  education: string;
  experience: string;
  rating: number;
  avatarUrl: string;
  isVip: boolean;
  isTop: boolean;
  introduction: string;
  regions: string[];
  modes: string[];
}

export default function FindStudentCasesPage() {
  return (
    <Suspense>
      <FindStudentCasesPageContent />
    </Suspense>
  );
}

function FindStudentCasesPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [allTutors, setAllTutors] = useState<Tutor[]>([]); // 保存所有導師
  const [tutors, setTutors] = useState<Tutor[]>([]); // 顯示的導師
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const TUTORS_PER_PAGE = 10;
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 首次載入時獲取所有資料
  useEffect(() => {
    const fetchAllTutors = async () => {
      try {
        setLoading(true);
        console.log("🔍 正在獲取導師資料...");
        
        const result = await tutorApi.getAllTutors();
        console.log("📦 成功獲取導師：", result);
        
        // fetchApi 已經返回了 tutors 陣列，不需要再提取
        const tutorsData = Array.isArray(result) ? result : (result.data?.tutors || result.tutors || []);
        console.log("📊 導師數據：", tutorsData);
        
        const sorted = tutorsData.sort((a: any, b: any) => {
          // 優先顯示 VIP 和 Top 導師
          if (a.isVip && !b.isVip) return -1;
          if (!a.isVip && b.isVip) return 1;
          if (a.isTop && !b.isTop) return -1;
          if (!a.isTop && b.isTop) return 1;
          return 0;
        });
        
        console.log("📊 排序後的導師：", sorted.map((t: any) => ({ name: t.name, tutorId: t.tutorId, subjects: t.subjects })));
        setAllTutors(sorted);
        console.log("✅ 已保存導師資料到 allTutors，數量：", sorted.length);
      } catch (error) {
        console.error('❌ 獲取導師時發生錯誤：', error);
        setAllTutors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllTutors();
  }, []);

  // 當 URL 參數改變時，從 allTutors 中過濾
  useEffect(() => {
    if (allTutors.length === 0) return;

    console.log("🔍 URL 參數改變，開始過濾導師資料");
    console.log("📊 總導師數量：", allTutors.length);
    console.log("📊 前5個導師的科目：", allTutors.slice(0, 5).map((t: any) => ({
      name: t.name,
      tutorId: t.tutorId,
      subjects: t.subjects,
      subjectsType: typeof t.subjects,
      isArray: Array.isArray(t.subjects)
    })));
    
    // 從 URL 獲取搜尋參數
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const subCategory = searchParams.get('subCategory');
    const subject = searchParams.get('subject');
    const subjects = searchParams.getAll('subjects'); // 獲取多個科目參數
    const regions = searchParams.getAll('regions'); // 獲取多個地區參數
    const modes = searchParams.getAll('mode'); // 獲取多個教學模式參數

    console.log("🔍 搜尋參數：", {
      search,
      category,
      subCategory,
      subject,
      subjects,
      regions,
      modes
    });

    // 從 allTutors 過濾
    const filtered = allTutors.filter((tutor: any) => {
      console.log("🔍 檢查導師：", {
        name: tutor.name,
        tutorId: tutor.tutorId,
        subjects: tutor.subjects,
        subjectsType: typeof tutor.subjects,
        isArray: Array.isArray(tutor.subjects),
        regions: tutor.regions,
        modes: tutor.modes
      });

      // 搜尋過濾
      if (search && search.trim()) {
        const searchLower = search.toLowerCase();
        const matchesSearch = 
          tutor.name?.toLowerCase().includes(searchLower) ||
          (Array.isArray(tutor.subjects) && tutor.subjects.some((s: any) => 
            String(s).toLowerCase().includes(searchLower)
          )) ||
          String(tutor.education || '').toLowerCase().includes(searchLower) ||
          String(tutor.introduction || '').toLowerCase().includes(searchLower);
        
        if (!matchesSearch) {
          console.log("❌ 不符合搜尋條件：", { search, tutor: tutor.name });
          return false;
        }
      }

      // 分類和科目篩選
      if (category && category.trim()) {
        const categoryOption = CATEGORY_OPTIONS.find(c => c.value === category);
        if (!categoryOption) {
          console.log("❌ 找不到對應分類：", { category });
          return false;
        }

        // 檢查導師的科目是否匹配分類
        const tutorSubjects = Array.isArray(tutor.subjects) ? tutor.subjects.map((s: any) => String(s).toLowerCase()) : [];
        
        console.log("🔍 檢查分類：", {
          tutorName: tutor.name,
          tutorSubjects,
          filterCategory: category,
          filterSubCategory: subCategory
        });

        // 檢查導師是否有該分類的科目
        const hasCategorySubject = tutorSubjects.some((subject: any) => {
          if (category === 'primary-secondary') {
            return subject.startsWith('primary-') || subject.startsWith('secondary-');
          } else {
            return subject.startsWith(`${category}-`);
          }
        });

        console.log("🔍 分類匹配檢查：", {
          tutorName: tutor.name,
          tutorSubjects,
          category,
          hasCategorySubject,
          categoryCheck: tutorSubjects.map((s: any) => ({
            subject: s,
            startsWith: s.startsWith(`${category}-`),
            result: s.startsWith(`${category}-`)
          }))
        });

        if (!hasCategorySubject) {
          console.log("❌ 導師沒有該分類的科目：", { 
            tutorName: tutor.name,
            tutorSubjects,
            filterCategory: category 
          });
          return false;
        } else {
          console.log("✅ 導師有該分類的科目：", {
            tutorName: tutor.name,
            tutorSubjects,
            category
          });
        }

        // 如果指定了子分類（科目）
        if (subCategory && subCategory.trim()) {
          const subCategoryStr = typeof subCategory === 'string' ? subCategory : 
                               Array.isArray(subCategory) ? subCategory[0] : '';
          const matchesSubject = tutorSubjects.some((s: any) => s === subCategoryStr);

          if (!matchesSubject) {
            console.log("❌ 科目不匹配：", { 
              tutorName: tutor.name,
              subjects: tutorSubjects,
              subCategory: subCategoryStr
            });
            return false;
          } else {
            console.log("✅ 科目匹配：", {
              tutorName: tutor.name,
              subjects: tutorSubjects,
              subCategory: subCategoryStr
            });
          }
        }
      }
      
      // 科目篩選 - 處理多個科目的精確匹配
      if (subjects && subjects.length > 0) {
        const tutorSubjects = Array.isArray(tutor.subjects) ? tutor.subjects.map((s: any) => String(s).toLowerCase()) : [];
        const filterSubjects = subjects.map((s: any) => String(s).toLowerCase());
        // 檢查導師的科目是否包含任何一個選擇的科目
        const hasMatchingSubject = tutorSubjects.some((subject: any) => 
          filterSubjects.includes(subject)
        );
        
        if (!hasMatchingSubject) {
          console.log("❌ 導師沒有匹配的科目：", { 
            tutorName: tutor.name,
            tutorSubjects, 
            filterSubjects
          });
          return false;
        }
      }
      
      // 地區篩選
      if (regions && regions.length > 0) {
        const tutorRegions = Array.isArray(tutor.regions) 
          ? tutor.regions.map((r: any) => String(r).toLowerCase())
          : [];
        const filterRegions = regions.map((r: any) => String(r).toLowerCase());
        
        const hasMatchingRegion = tutorRegions.some((tutorRegion: any) => 
          filterRegions.some((filterRegion: any) => tutorRegion.includes(filterRegion))
        );
        
        if (!hasMatchingRegion) {
          console.log("❌ 地區不匹配：", { tutorName: tutor.name, tutorRegions, filterRegions });
          return false;
        }
      }
      
      // 教學模式篩選
      if (modes && modes.length > 0) {
        const tutorModes = Array.isArray(tutor.modes)
          ? tutor.modes.map((m: any) => String(m).toLowerCase())
          : [];
        const filterModes = modes.map((m: any) => String(m).toLowerCase());
        
        const hasMatchingMode = tutorModes.some((tutorMode: any) => 
          filterModes.some((filterMode: any) => tutorMode.includes(filterMode))
        );
        
        if (!hasMatchingMode) {
          console.log("❌ 教學模式不匹配：", { tutorName: tutor.name, tutorModes, filterModes });
          return false;
        }
      }

      console.log("✅ 導師符合所有條件：", tutor.name);
      return true;
    });

    console.log("🔍 過濾後結果：", {
      totalTutors: allTutors.length,
      filteredCount: filtered.length,
      filteredTutors: filtered.map((t: any) => ({ name: t.name, tutorId: t.tutorId }))
    });

    // 更新顯示的導師
    setTutors(filtered.slice(0, TUTORS_PER_PAGE));
    setCurrentPage(1);
    setHasMore(filtered.length > TUTORS_PER_PAGE);
  }, [searchParams, allTutors]);

  const handleFilter = (filters: any) => {
    console.log("🔍 篩選條件：", filters);
    
    // 構建查詢參數
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.category) params.set('category', filters.category);
    if (filters.subCategory) params.set('subCategory', filters.subCategory);
    if (filters.subjects && filters.subjects.length > 0) {
      filters.subjects.forEach((subject: string) => {
        params.append('subjects', subject);
      });
    }
    if (filters.region) params.set('region', filters.region);
    if (filters.mode) params.set('mode', filters.mode);
    
    // 更新 URL
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    router.push(newUrl);
  };

  const loadMoreTutors = async () => {
    console.log("▶ 正在觸發 loadMoreTutors");
    setLoadingMore(true);
    try {
      const startIndex = currentPage * TUTORS_PER_PAGE;
      const endIndex = startIndex + TUTORS_PER_PAGE;
      const newTutors = allTutors.slice(startIndex, endIndex);
      
      console.log("📦 取得新 tutors：", {
        startIndex,
        endIndex,
        newTutorsCount: newTutors.length,
        totalTutors: allTutors.length
      });

      if (newTutors.length > 0) {
        setTutors(prevTutors => [...prevTutors, ...newTutors]);
        setCurrentPage(prev => prev + 1);
        setHasMore(endIndex < allTutors.length);
        console.log("✅ 成功加載更多導師");
      } else {
        setHasMore(false);
        console.log("⚠️ 沒有更多導師可加載");
      }
    } catch (error) {
      console.error('❌ loadMoreTutors 錯誤：', error);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-12 py-8">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">👩‍🏫</span>
        <h1 className="text-2xl font-bold border-l-4 border-yellow-400 pl-3">導師列表</h1>
      </div>

      <div className="bg-yellow-50 rounded-xl p-6 mb-8">
        <CaseFilterBar onFilter={handleFilter} fetchUrl="/tutors" />
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
          <p className="mt-2 text-gray-600">載入中...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          <p>{error}</p>
        </div>
      ) : tutors.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>目前沒有符合條件的導師</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tutors.map((tutor, index) => (
            <TutorCard
              key={tutor.id || tutor.tutorId}
              tutor={tutor}
            />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={loadMoreTutors}
            disabled={loadingMore}
            className="bg-yellow-500 text-white hover:bg-yellow-600 rounded-lg px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingMore ? '載入中...' : '載入更多'}
          </button>
        </div>
      )}
    </div>
  );
} 