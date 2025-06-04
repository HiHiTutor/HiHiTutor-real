'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
  const router = useRouter();
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
    if (allCases.length === 0) return;

    console.log("🔍 URL 參數改變，開始過濾資料");
    // 從 URL 獲取搜尋參數
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const subCategory = searchParams.get('subCategory');
    const subject = searchParams.get('subject');
    const region = searchParams.get('region');
    const mode = searchParams.get('mode');

    console.log("🔍 搜尋參數：", {
      search,
      category,
      subCategory,
      subject,
      region,
      mode
    });

    // 從 allCases 過濾
    const filtered = allCases.filter(item => {
      console.log("檢查案例：", item);

      // 搜尋過濾
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch = 
          item.title?.toLowerCase().includes(searchLower) ||
          (Array.isArray(item.subjects) && item.subjects.some(s => 
            String(s).toLowerCase().includes(searchLower)
          )) ||
          String(item.region || '').toLowerCase().includes(searchLower) ||
          String(item.subRegion || '').toLowerCase().includes(searchLower);
        
        if (!matchesSearch) {
          console.log("❌ 不符合搜尋條件：", { search, item });
          return false;
        }
      }

      // 分類和科目篩選
      if (category) {
        const categoryOption = CATEGORY_OPTIONS.find(c => c.value === category);
        if (!categoryOption) {
          console.log("❌ 找不到對應分類：", { category });
          return false;
        }

        // 檢查主分類
        const itemCategory = String(item.category || '').toLowerCase();
        const itemSubCategory = String(item.subCategory || '').toLowerCase();
        const itemSubjects = Array.isArray(item.subjects) ? item.subjects.map(s => String(s).toLowerCase()) : [];
        
        console.log("🔍 檢查分類：", {
          itemCategory,
          itemSubCategory,
          itemSubjects,
          filterCategory: category,
          filterSubCategory: subCategory
        });

        // 特殊處理 primary-secondary 分類
        if (category === 'primary-secondary') {
          // 檢查 category 是否包含 primary 或 secondary
          const matchesMainCategory = 
            itemCategory.includes('primary') || 
            itemCategory.includes('secondary') ||
            itemSubjects.some(s => s.startsWith('primary-') || s.startsWith('secondary-'));

          if (!matchesMainCategory) {
            console.log("❌ 分類不匹配：", { 
              caseCategory: itemCategory,
              caseFrontendCategory: item.category,
              filterCategory: category 
            });
            return false;
          }

          // 如果指定了子分類（primary 或 secondary）
          if (subCategory) {
            const subCategoryStr = typeof subCategory === 'string' ? subCategory : 
                                 Array.isArray(subCategory) ? subCategory[0] : '';
            const matchesSubCategory = 
              itemCategory.includes(subCategoryStr) || 
              itemSubCategory.includes(subCategoryStr) ||
              itemSubjects.some(s => s.startsWith(`${subCategoryStr}-`));

            if (!matchesSubCategory) {
              console.log("❌ 子分類不匹配：", { 
                itemCategory,
                itemSubCategory,
                itemSubjects,
                subCategory: subCategoryStr
              });
              return false;
            }
          }
        } else {
          // 其他分類的一般處理
          const matchesCategory = itemCategory === category;
          
          if (!matchesCategory) {
            console.log("❌ 分類不匹配：", { 
              caseCategory: itemCategory,
              caseFrontendCategory: item.category,
              filterCategory: category 
            });
            return false;
          } else {
            console.log("✅ 主分類匹配：", {
              itemCategory,
              category
            });
          }

          // 如果指定了子分類（科目）
          if (subCategory) {
            const subCategoryStr = typeof subCategory === 'string' ? subCategory : 
                                 Array.isArray(subCategory) ? subCategory[0] : '';
            const matchesSubject = itemSubjects.some(s => 
              s === subCategoryStr || // 完全匹配
              s.includes(subCategoryStr) || // 部分匹配
              s.split('-').slice(-1)[0] === subCategoryStr // 匹配最後一部分
            );

            if (!matchesSubject) {
              console.log("❌ 科目不匹配：", { 
                subjects: itemSubjects,
                subCategory: subCategoryStr
              });
              return false;
            } else {
              console.log("✅ 科目匹配：", {
                subjects: itemSubjects,
                subCategory: subCategoryStr
              });
            }
          }
        }
      }
      
      // 地區篩選
      if (region) {
        const itemRegion = String(item.region || '').toLowerCase();
        const itemRegions = Array.isArray(item.regions) 
          ? item.regions.map(r => String(r).toLowerCase())
          : [];
        const filterRegion = region.toLowerCase();
        
        if (!itemRegion.includes(filterRegion) && !itemRegions.some(r => r.includes(filterRegion))) {
          console.log("❌ 地區不匹配：", { itemRegion, itemRegions, filterRegion });
          return false;
        }
      }
      
      // 教學模式篩選
      if (mode) {
        const itemMode = String(item.mode || '').toLowerCase();
        const itemModes = Array.isArray(item.modes)
          ? item.modes.map(m => String(m).toLowerCase())
          : [];
        const filterMode = mode.toLowerCase();
        
        if (!itemMode.includes(filterMode) && !itemModes.some(m => m.includes(filterMode))) {
          console.log("❌ 教學模式不匹配：", { itemMode, itemModes, filterMode });
          return false;
        }
      }

      console.log("✅ 案例符合所有條件");
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
    
    // 構建查詢參數
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.category) params.set('category', filters.category);
    if (filters.subCategory) params.set('subCategory', filters.subCategory);
    if (filters.subjects?.[0]) params.set('subject', filters.subjects[0]);
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