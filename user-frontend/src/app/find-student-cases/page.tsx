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

export default function FindStudentCasesPage() {
  return (
    <Suspense>
      <FindStudentCasesPageContent />
    </Suspense>
  );
}

function FindStudentCasesPageContent() {
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
        console.log("🔍 正在獲取所有學生個案資料...");
        
        const result = await caseApi.getAllStudentCases();
        console.log("📦 成功獲取所有學生個案：", result);
        const sorted = (result.data?.cases || []).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setAllCases(sorted);
        console.log("✅ 已保存全量資料到 allCases");
      } catch (error) {
        console.error('❌ 獲取所有學生個案時發生錯誤：', error);
        setAllCases([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllCases();
  }, []); // 只在首次載入時執行

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
          item.region?.includes(r) || item.regions?.includes(r)
        );
        if (!hasMatchingRegion) {
          console.log("❌ 地區不匹配：", { caseRegion: item.region, caseRegions: item.regions, filterRegion: region });
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
  }, [searchParams, allCases]);

  const handleFilter = (filters: any) => {
    console.log("🔍 篩選條件：", filters);
    console.log("🎯 重新搜尋 based on allCases，當前 allCases 數量：", allCases.length);
    
    // 從 allCases 過濾
    const filtered = allCases.filter(item => {
      // 分類篩選
      if (filters.category) {
        const itemCategory = item.category?.toLowerCase().trim();
        const itemSubjects = item.subjects || [];
        
        // 檢查主分類
        if (itemCategory === filters.category) {
          console.log("✅ 主分類匹配：", { itemCategory, filterCategory: filters.category });
          return true;
        }
        
        // 檢查科目是否屬於該分類
        const hasMatchingSubject = itemSubjects.some(subject => {
          const subjectStr = String(subject).toLowerCase();
          return subjectStr.startsWith(filters.category) || subjectStr.includes(filters.category);
        });
        
        if (hasMatchingSubject) {
          console.log("✅ 科目分類匹配：", { itemSubjects, filterCategory: filters.category });
          return true;
        }

        console.log("❌ 分類不匹配：", { 
          itemCategory,
          itemSubjects,
          filterCategory: filters.category 
        });
        return false;
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
      
      // 地區篩選
      if (filters.region?.length > 0) {
        const hasMatchingRegion = filters.region.some((region: string) => 
          item.region?.includes(region) || item.regions?.includes(region)
        );
        if (!hasMatchingRegion) {
          console.log("❌ 地區不匹配：", { caseRegion: item.region, caseRegions: item.regions, filterRegion: filters.region });
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

        if (filters.priceMin && budgetMin < Number(filters.priceMin)) {
          console.log("❌ 價格低於最小值：", { casePrice: budgetMin, filterMin: filters.priceMin });
          return false;
        }
        if (filters.priceMax && budgetMax > Number(filters.priceMax)) {
          console.log("❌ 價格高於最大值：", { casePrice: budgetMax, filterMax: filters.priceMax });
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

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-12 py-8">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">📄</span>
        <h1 className="text-2xl font-bold border-l-4 border-yellow-400 pl-3">最新導師招學生個案</h1>
      </div>

      <div className="bg-yellow-50 rounded-xl p-6 mb-8">
        <CaseFilterBar onFilter={handleFilter} onSearch={handleFilter} fetchUrl="/find-student-cases" />
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
      ) : cases.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>目前沒有最新導師招學生個案</p>
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
            />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={loadMoreCases}
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