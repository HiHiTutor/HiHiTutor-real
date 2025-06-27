'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import CaseFilterBar from '@/components/CaseFilterBar';
import LoadMoreButton from '@/components/LoadMoreButton';
import CaseCard from '@/components/CaseCard';
import { caseApi } from '@/services/api';
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

// 分類映射：從後端分類映射到前端分類
const mapBackendToFrontend = (backendCategory: string) => {
  // 直接使用 category key 比對
  const normalizedCategory = backendCategory.toLowerCase().trim();
  
  // 檢查是否直接匹配任何主分類
  const mainCategories = ['early-childhood', 'primary-secondary', 'interest', 'tertiary', 'adult'];
  if (mainCategories.includes(normalizedCategory)) {
    return normalizedCategory;
  }
  
  // 檢查是否包含在任何分類的科目中
  for (const category of mainCategories) {
    if (normalizedCategory.startsWith(category) || normalizedCategory.includes(category)) {
      return category;
    }
  }
  
  return normalizedCategory;
};

const mapCategoryToBackend = (frontendCategory: string) => {
  const options = CATEGORY_OPTIONS as unknown as CategoryOptions;
  const categoryData = options[frontendCategory];
  return categoryData?.subjects.map((s: { value: string }) => s.value) || [frontendCategory];
};

interface Case {
  id: string;
  category: string;
  subCategory: string;
  subjects: string[];
  region: string;
  subRegion: string;
  mode: string;
  budget: {
    min: number;
    max: number;
  };
  experience: string;
  featured: boolean;
  date: string;
  createdAt?: string;
  title?: string;
  regions?: string[];
  modes?: string[];
  lessonDetails?: {
    duration: number;
    pricePerLesson: number;
    lessonsPerWeek: number;
  };
}

export default function FindTutorCasesPage() {
  return (
    <Suspense>
      <FindTutorCasesPageContent />
    </Suspense>
  );
}

function FindTutorCasesPageContent() {
  const searchParams = useSearchParams();
  const [allCases, setAllCases] = useState<Case[]>([]); // 保存所有個案
  const [cases, setCases] = useState<Case[]>([]); // 顯示的個案
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const CASES_PER_PAGE = 10;
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 首次載入時獲取所有資料
  useEffect(() => {
    const fetchAllCases = async () => {
      try {
        setLoading(true);
        console.log("🔍 正在獲取導師個案資料...");
        
        // 獲取導師個案資料（導師搵學生的個案）
        const result = await caseApi.getAllTutorCases();
        console.log("📦 成功獲取導師個案資料：", result);
        const allCases = (result.data?.cases || []).sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setAllCases(allCases);
        console.log("✅ 已保存導師個案資料到 allCases");
      } catch (error) {
        console.error('❌ 獲取導師個案資料時發生錯誤：', error);
        setAllCases([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllCases();
  }, []);

  // 當 URL 參數改變時，從 allCases 中過濾
  useEffect(() => {
    if (allCases.length === 0) return; // 如果還沒有資料，不進行過濾

    console.log("🔍 URL 參數改變，開始過濾資料");
    // 從 URL 獲取搜尋參數
    const category = searchParams.get('category');
    const subCategory = searchParams.getAll('subCategory');
    const region = searchParams.getAll('region');
    const priceMin = searchParams.get('priceMin');
    const priceMax = searchParams.get('priceMax');

    console.log("🔍 搜尋參數：", {
      category,
      subCategory,
      region,
      priceMin,
      priceMax
    });

    // 從 allCases 過濾
    const filtered = allCases.filter(item => {
      // 分類篩選
      if (category) {
        const itemCategory = item.category?.toLowerCase().trim();
        const itemSubjects = item.subjects || [];
        
        // 檢查主分類
        if (itemCategory === category) {
          console.log("✅ 主分類匹配：", { itemCategory, category });
          return true;
        }
        
        // 檢查科目是否屬於該分類
        const hasMatchingSubject = itemSubjects.some(subject => {
          const subjectStr = String(subject).toLowerCase();
          return subjectStr.startsWith(category) || subjectStr.includes(category);
        });
        
        if (hasMatchingSubject) {
          console.log("✅ 科目分類匹配：", { itemSubjects, category });
          return true;
        }

        console.log("❌ 分類不匹配：", { 
          itemCategory,
          itemSubjects,
          filterCategory: category 
        });
        return false;
      }
      
      // 子分類篩選
      if (subCategory.length > 0) {
        const hasMatchingSubCategory = subCategory.some((sub: string) => 
          item.subCategory?.includes(sub)
        );
        if (!hasMatchingSubCategory) {
          console.log("❌ 子分類不匹配：", { caseSubCategory: item.subCategory, filterSubCategory: subCategory });
          return false;
        }
      }
      
      // 地區篩選
      if (region.length > 0) {
        const hasMatchingRegion = region.some((r: string) => 
          item.region?.includes(r)
        );
        if (!hasMatchingRegion) {
          console.log("❌ 地區不匹配：", { caseRegion: item.region, filterRegion: region });
          return false;
        }
      }
      
      // 價格範圍篩選
      if (priceMin || priceMax) {
        // 確保 budget 存在且格式正確
        if (!item.budget || typeof item.budget !== 'object') {
          console.log("❌ 無效的預算格式：", { caseBudget: item.budget });
          return false;
        }

        const budgetMin = Number(item.budget.min) || 0;
        const budgetMax = Number(item.budget.max) || 0;

        if (priceMin && budgetMin < Number(priceMin)) {
          console.log("❌ 價格低於最小值：", { casePrice: budgetMin, filterMin: priceMin });
          return false;
        }
        if (priceMax && budgetMax > Number(priceMax)) {
          console.log("❌ 價格高於最大值：", { casePrice: budgetMax, filterMax: priceMax });
          return false;
        }
      }
      
      return true;
    });

    console.log("🔍 過濾後結果：", {
      totalCases: allCases.length,
      filteredCount: filtered.length,
      filteredCases: filtered
    });

    // 更新顯示的個案
    setCases(filtered.slice(0, CASES_PER_PAGE));
    setCurrentPage(1);
    setHasMore(filtered.length > CASES_PER_PAGE);
  }, [searchParams, allCases]); // 當 URL 參數或 allCases 改變時重新過濾

  const handleFilter = (filters: any) => {
    console.log("🔍 篩選條件：", filters);
    console.log("🎯 重新搜尋 based on allCases，當前 allCases 數量：", allCases.length);
    
    // 從 allCases 過濾
    const filtered = allCases.filter(item => {
      // 分類篩選
      if (filters.category) {
        const itemFrontendCategory = mapBackendToFrontend(item.category);
        if (itemFrontendCategory !== filters.category) {
          console.log("❌ 分類不匹配：", { 
            caseCategory: item.category, 
            caseFrontendCategory: itemFrontendCategory,
            filterCategory: filters.category 
          });
          return false;
        }
      }
      
      // 子分類篩選
      if (filters.subCategory?.length > 0) {
        const hasMatchingSubCategory = filters.subCategory.some((sub: string) => 
          item.subCategory?.includes(sub)
        );
        if (!hasMatchingSubCategory) {
          console.log("❌ 子分類不匹配：", { caseSubCategory: item.subCategory, filterSubCategory: filters.subCategory });
          return false;
        }
      }

      // 科目篩選 - 只顯示完全匹配選擇科目的個案
      if (filters.subjects && filters.subjects.length > 0) {
        const itemSubjects = Array.isArray(item.subjects) ? item.subjects : [];
        
        // 檢查個案的科目是否完全包含在選擇的科目中
        const hasAllMatchingSubjects = itemSubjects.every((subject: string) => 
          filters.subjects.includes(subject)
        );
        
        // 檢查選擇的科目是否完全包含在個案的科目中
        const allSelectedSubjectsMatch = filters.subjects.every((subject: string) => 
          itemSubjects.includes(subject)
        );
        
        // 只有當兩者完全匹配時才顯示
        if (!hasAllMatchingSubjects || !allSelectedSubjectsMatch) {
          console.log("❌ 科目不完全匹配：", { 
            caseSubjects: itemSubjects, 
            filterSubjects: filters.subjects,
            hasAllMatchingSubjects,
            allSelectedSubjectsMatch
          });
          return false;
        }
      }
      
      // 地區篩選
      if (filters.region?.length > 0) {
        const hasMatchingRegion = filters.region.some((region: string) => 
          item.region?.includes(region)
        );
        if (!hasMatchingRegion) {
          console.log("❌ 地區不匹配：", { caseRegion: item.region, filterRegion: filters.region });
          return false;
        }
      }
      
      // 價格範圍篩選
      if (filters.priceMin || filters.priceMax) {
        // 確保 budget 存在且格式正確
        if (!item.budget || typeof item.budget !== 'object') {
          console.log("❌ 無效的預算格式：", { caseBudget: item.budget });
          return false;
        }

        const budgetMin = Number(item.budget.min) || 0;
        const budgetMax = Number(item.budget.max) || 0;

        if (budgetMin < filters.priceMin || budgetMax > filters.priceMax) {
          console.log("❌ 價格不匹配：", { caseBudget: { min: budgetMin, max: budgetMax }, filterMin: filters.priceMin, filterMax: filters.priceMax });
          return false;
        }
      }
      
      console.log("✅ 個案符合所有條件：", item);
      return true;
    });

    console.log("🔍 過濾後結果：", {
      totalCases: allCases.length,
      filteredCount: filtered.length,
      filteredCases: filtered
    });

    // 重置並更新顯示的個案
    setCases(filtered.slice(0, CASES_PER_PAGE));
    setCurrentPage(1);
    setHasMore(filtered.length > CASES_PER_PAGE);
  };

  const loadMoreCases = async () => {
    console.log("▶ 正在觸發 loadMoreCases");
    setLoadingMore(true);
    try {
      const startIndex = currentPage * CASES_PER_PAGE;
      const endIndex = startIndex + CASES_PER_PAGE;
      const newCases = allCases.slice(startIndex, endIndex);
      
      console.log("📦 取得新 cases：", {
        startIndex,
        endIndex,
        newCasesCount: newCases.length,
        totalCases: allCases.length
      });

      if (newCases.length > 0) {
        setCases(prevCases => [...prevCases, ...newCases]);
        setCurrentPage(prev => prev + 1);
        setHasMore(endIndex < allCases.length);
        console.log("✅ 成功加載更多個案");
      } else {
        setHasMore(false);
        console.log("⚠️ 沒有更多個案可加載");
      }
    } catch (error) {
      console.error('❌ loadMoreCases 錯誤：', error);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  // Debug: 輸出 allCases 和 cases
  console.log('allCases:', allCases);
  console.log('cases for render:', cases);

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
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-12 py-8">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">📄</span>
        <h1 className="text-2xl font-bold border-l-4 border-blue-400 pl-3">補習個案</h1>
      </div>

      <div className="bg-blue-50 rounded-xl p-6 mb-8">
        <CaseFilterBar onFilter={handleFilter} fetchUrl="/find-tutor-cases" />
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">載入中...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          <p>{error}</p>
        </div>
      ) : cases.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>目前沒有招學生</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {cases.map((caseItem, index) => (
            <CaseCard
              key={caseItem.id}
              caseData={{
                id: caseItem.id,
                title: caseItem.title,
                subject: { label: caseItem.subjects?.[0] || '' },
                region: { label: caseItem.region || caseItem.regions?.[0] || '' },
                modes: caseItem.modes || [caseItem.mode],
                experienceLevel: { label: caseItem.experience },
                lessonDetails: typeof caseItem.lessonDetails === 'string' 
                  ? JSON.parse(caseItem.lessonDetails)
                  : caseItem.lessonDetails,
                createdAt: caseItem.createdAt || caseItem.date,
              }}
              routeType="tutor"
            />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={loadMoreCases}
            disabled={loadingMore}
            className="bg-blue-500 text-white hover:bg-blue-600 rounded-lg px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingMore ? '載入中...' : '載入更多'}
          </button>
        </div>
      )}
    </div>
  );
} 