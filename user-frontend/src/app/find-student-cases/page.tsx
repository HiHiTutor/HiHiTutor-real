'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import CaseFilterBar from '@/components/CaseFilterBar';
import LoadMoreButton from '@/components/LoadMoreButton';
import CaseCard from '@/components/CaseCard';

// 分類映射
const CATEGORY_MAP: Record<string, string[]> = {
  'primary-secondary': ['小學', '中學', '高中', '國中'],
  'early-childhood': ['幼兒', '幼稚園'],
  'interest': ['興趣', 'interest'],
  'tertiary': ['大學', '大專'],
  'adult': ['成人', '職業']
};

// 反向分類映射：從後端分類映射到前端分類
const mapBackendToFrontend = (backendCategory: string) => {
  for (const [frontend, backends] of Object.entries(CATEGORY_MAP)) {
    if (backends.some(cat => backendCategory.includes(cat))) {
      return frontend;
    }
  }
  return backendCategory;
};

const mapCategoryToBackend = (frontendCategory: string) => {
  return CATEGORY_MAP[frontendCategory] || [frontendCategory];
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
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    // Define the structure of your form data here
  });
  const [initialFormData, setInitialFormData] = useState({
    // Define the structure of your initial form data here
  });
  const [submitting, setSubmitting] = useState(false);

  // 首次載入時獲取所有資料
  useEffect(() => {
    const fetchAllCases = async () => {
      try {
        setLoading(true);
        console.log("🔍 正在獲取所有個案資料...");
        
        const response = await fetch('/api/find-student-cases');
        if (response.ok) {
          const data = await response.json();
          console.log("📦 成功獲取所有個案：", data);
          setAllCases(data.data?.cases || []);
          console.log("✅ 已保存全量資料到 allCases");
        } else {
          console.error('❌ 獲取所有個案失敗：', response.status);
          setAllCases([]);
        }
      } catch (error) {
        console.error('❌ 獲取所有個案時發生錯誤：', error);
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
        const itemFrontendCategory = mapBackendToFrontend(item.category);
        if (itemFrontendCategory !== category) {
          console.log("❌ 分類不匹配：", { 
            caseCategory: item.category, 
            caseFrontendCategory: itemFrontendCategory,
            filterCategory: category 
          });
          return false;
        }
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
      if (priceMin && item.budget.min < Number(priceMin)) {
        console.log("❌ 價格低於最小值：", { casePrice: item.budget.min, filterMin: priceMin });
        return false;
      }
      if (priceMax && item.budget.max > Number(priceMax)) {
        console.log("❌ 價格高於最大值：", { casePrice: item.budget.max, filterMax: priceMax });
        return false;
      }
      
      console.log("✅ 個案符合所有條件：", item);
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
      if (item.budget.min < filters.priceMin || item.budget.max > filters.priceMax) {
        console.log("❌ 價格不匹配：", { casePrice: item.budget, filterMin: filters.priceMin, filterMax: filters.priceMax });
        return false;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/find-student-cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('🧪 發送結果 status:', res.status, 'ok:', res.ok);

      let result = null;
      try {
        result = await res.json();
      } catch (jsonErr) {
        console.error('❌ 解析 JSON 失敗:', jsonErr);
        throw new Error('API 回傳格式錯誤');
      }

      if (!res.ok || !result?.success) {
        throw new Error(`發布失敗：${result?.message || res.statusText}`);
      }

      console.log('✅ 發布成功：', result);
      setSuccess(true);
      setFormData(initialFormData); // 清空表單
    } catch (err: any) {
      console.error('❌ 發布導師個案時出錯:', err);
      setError(err.message || '未知錯誤');
    } finally {
      setSubmitting(false);
    }
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
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-12 py-8">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">👩‍🏫</span>
        <h2 className="text-2xl font-bold border-l-4 border-yellow-400 pl-3">精選導師搵學生個案</h2>
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
          <p>目前沒有精選導師搵學生個案</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {cases.map((caseItem, index) => (
            <CaseCard
              key={`${caseItem.id}-${currentPage}-${index}`}
              routeType="student"
              caseData={{
                id: caseItem.id,
                subject: caseItem.subjects && caseItem.subjects[0] ? { label: caseItem.subjects[0] } : undefined,
                region: caseItem.region ? { label: caseItem.region } : undefined,
                mode: caseItem.mode ? { label: caseItem.mode } : undefined,
                experienceLevel: caseItem.experience ? { label: caseItem.experience } : undefined,
                budget: typeof caseItem.budget === 'object' ? `${caseItem.budget.min || ''} - ${caseItem.budget.max || ''}` : (caseItem.budget || ''),
                createdAt: (caseItem.createdAt || caseItem.date || ''),
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