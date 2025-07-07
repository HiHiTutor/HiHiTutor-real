'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import CaseFilterBar from '@/components/CaseFilterBar';
import LoadMoreButton from '@/components/LoadMoreButton';
import StudentCaseCard from '@/components/student/StudentCaseCard';
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

interface StudentCase {
  id: string;
  title?: string;
  region: string;
  subRegions?: string[];
  mode: string;
  experience: string;
  budget: {
    min: number;
    max: number;
  };
  createdAt: string;
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
  const [allCases, setAllCases] = useState<StudentCase[]>([]); // 保存所有個案
  const [cases, setCases] = useState<StudentCase[]>([]); // 顯示的個案
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
        console.log("🔍 正在獲取補習個案資料...");
        
        const result = await caseApi.searchByTarget('find-student');
        console.log("📦 成功獲取補習個案：", result);
        
        // 處理回應數據
        const casesData = Array.isArray(result) ? result : (result.success && result.data && result.data.cases ? result.data.cases : []);
        console.log("📊 個案數據：", casesData);
        
        setAllCases(casesData);
        console.log("✅ 已保存個案資料到 allCases，數量：", casesData.length);
      } catch (error) {
        console.error('❌ 獲取補習個案時發生錯誤：', error);
        setAllCases([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllCases();
  }, []);

  // 當 URL 參數改變時，從 allCases 中過濾
  useEffect(() => {
    if (allCases.length === 0) return;

    console.log("🔍 URL 參數改變，開始過濾個案資料");
    console.log("📊 總個案數量：", allCases.length);
    
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

    // 檢查是否有任何篩選條件
    const hasFilters = search || category || subCategory || subject || (subjects && subjects.length > 0) || (regions && regions.length > 0) || (modes && modes.length > 0);
    
    console.log("🔍 是否有篩選條件：", hasFilters);

    // 從 allCases 過濾
    const filtered = allCases.filter((caseItem: any) => {
      // 搜尋過濾
      if (search && search.trim()) {
        const searchLower = typeof search === 'string' ? search.toLowerCase() : '';
        const matchesSearch = 
          (caseItem.title && typeof caseItem.title === 'string' && caseItem.title.toLowerCase().includes(searchLower)) ||
          (caseItem.subjects && Array.isArray(caseItem.subjects) && caseItem.subjects.filter((s: any) => typeof s === 'string').some((s: string) => s.toLowerCase().includes(searchLower)));
        if (!matchesSearch) {
          console.log("❌ 不符合搜尋條件：", { search, caseItem: caseItem.title });
          return false;
        }
      }

      // 地區篩選
      if (
        regions &&
        regions.length > 0 &&
        !(regions.length === 1 && regions[0] === 'unlimited')
      ) {
        const caseRegions = Array.isArray(caseItem.regions) ? caseItem.regions.filter((r: any) => typeof r === 'string').map((r: string) => r.toLowerCase()) : [];
        const filterRegions = Array.isArray(regions) ? regions.filter((r: any) => typeof r === 'string').map((r: string) => r.toLowerCase()) : [];
        const hasMatchingRegion = caseRegions.some((caseRegion: string) => 
          filterRegions.some((filterRegion: string) => caseRegion.includes(filterRegion))
        );
        if (!hasMatchingRegion) {
          console.log("❌ 地區不匹配：", { caseTitle: caseItem.title, caseRegions, filterRegions });
          return false;
        }
      }
      
      // 教學模式篩選
      if (
        modes &&
        modes.length > 0 &&
        !(modes.length === 1 && modes[0] === 'unlimited')
      ) {
        const caseModes = Array.isArray(caseItem.modes) ? caseItem.modes.filter((m: any) => typeof m === 'string').map((m: string) => m.toLowerCase()) : [];
        const filterModes = Array.isArray(modes) ? modes.filter((m: any) => typeof m === 'string').map((m: string) => m.toLowerCase()) : [];
        const hasMatchingMode = caseModes.some((caseMode: string) => 
          filterModes.some((filterMode: string) => caseMode.includes(filterMode))
        );
        if (!hasMatchingMode) {
          console.log("❌ 教學模式不匹配：", { caseTitle: caseItem.title, caseModes, filterModes });
          return false;
        }
      }

      console.log("✅ 個案符合所有條件：", caseItem.title);
      return true;
    });

    console.log("🔍 過濾後結果：", {
      totalCases: allCases.length,
      filteredCount: filtered.length,
      filteredCases: filtered.map((c: any) => ({ title: c.title, id: c.id }))
    });

    // 更新顯示的個案 - 暫時顯示所有個案以便調試
    setCases(filtered);
    setCurrentPage(1);
    setHasMore(false); // 暫時關閉分頁
  }, [searchParams, allCases]);

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
    <div className="max-w-7xl mx-auto px-4 md:px-12 py-8 bg-gradient-to-br from-blue-50 to-white min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-blue-500 p-3 rounded-full">
          <span className="text-2xl text-white">📄</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-blue-900 border-l-4 border-blue-500 pl-4">補習個案</h1>
          <p className="text-blue-600 mt-1">尋找適合的補習個案</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-blue-100">
        <CaseFilterBar onFilter={handleFilter} fetchUrl="/find-tutor-cases" />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-blue-700 font-medium">載入中...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        </div>
      ) : cases.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 max-w-md mx-auto">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-blue-700 font-medium text-lg">目前沒有符合條件的個案</p>
            <p className="text-blue-500 mt-2">請嘗試調整搜尋條件</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {cases.map((caseItem, index) => (
            <StudentCaseCard
              key={caseItem.id || index}
              case={caseItem}
            />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="mt-12 text-center">
          <button
            onClick={loadMoreCases}
            disabled={loadingMore}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 rounded-xl px-8 py-3 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
          >
            {loadingMore ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                載入中...
              </div>
            ) : (
              '載入更多個案'
            )}
          </button>
        </div>
      )}
    </div>
  );
} 