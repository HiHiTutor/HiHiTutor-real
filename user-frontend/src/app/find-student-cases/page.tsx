'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import CaseFilterBar from '@/components/CaseFilterBar';
import LoadMoreButton from '@/components/LoadMoreButton';
import CaseCard from '@/components/CaseCard';

export default function FindStudentCasesPage() {
  const searchParams = useSearchParams();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const CASES_PER_PAGE = 10;
  const [loadingMore, setLoadingMore] = useState(false);

  // 初次載入時獲取個案
  useEffect(() => {
    if (!searchParams) return;

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

    const query = new URLSearchParams({
      ...(category && { category }),
      ...(subCategory.length && subCategory[0] && { subCategory: subCategory[0] }),
      ...(region.length && region[0] && { region: region[0] }),
      ...(priceMin && { priceMin }),
      ...(priceMax && { priceMax }),
    }).toString();

    console.log("🔍 API 請求參數：", query);

    fetch(`http://localhost:3001/api/find-student-cases?${query}`)
      .then(res => res.json())
      .then(data => {
        console.log("📦 API 回傳資料：", data);
        if (data && data.length > 0) {
          setCases(data.slice(0, CASES_PER_PAGE));
          setHasMore(data.length > CASES_PER_PAGE);
          console.log("✅ 成功更新狀態：", {
            displayedCasesCount: Math.min(data.length, CASES_PER_PAGE),
            hasMore: data.length > CASES_PER_PAGE
          });
        } else {
          console.log("⚠️ 沒有符合條件的個案");
          setCases([]);
          setHasMore(false);
        }
      })
      .catch(error => {
        console.error('❌ API 請求失敗：', error);
        setCases([]);
        setHasMore(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [searchParams]);

  const handleFilter = (data: any[]) => {
    console.log("🔍 篩選結果：", data);
    setCases(data.slice(0, CASES_PER_PAGE));
    setCurrentPage(1);
    setHasMore(data.length > CASES_PER_PAGE);
  };

  const handleSearch = (query: any) => {
    console.log("🔍 搜尋條件：", query);
    // 前端篩選
    const filteredCases = cases.filter(caseItem => {
      // 分類篩選
      if (query.category && caseItem.category !== query.category) return false;
      
      // 子分類篩選
      if (query.subCategory?.length > 0) {
        const hasMatchingSubCategory = query.subCategory.some((sub: string) => 
          caseItem.subCategory?.includes(sub)
        );
        if (!hasMatchingSubCategory) return false;
      }
      
      // 地區篩選
      if (query.region?.length > 0) {
        const hasMatchingRegion = query.region.some((region: string) => 
          caseItem.region?.includes(region)
        );
        if (!hasMatchingRegion) return false;
      }
      
      // 價格範圍篩選
      const price = Number(caseItem.budget?.replace(/[^0-9]/g, ''));
      if (price < query.priceMin || price > query.priceMax) return false;
      
      return true;
    });

    console.log("🔍 篩選後結果：", filteredCases);
    setCases(filteredCases.slice(0, CASES_PER_PAGE));
    setCurrentPage(1);
    setHasMore(filteredCases.length > CASES_PER_PAGE);
  };

  const loadMoreCases = async () => {
    console.log("▶ 正在觸發 loadMoreCases");
    setLoadingMore(true);
    try {
      const startIndex = currentPage * CASES_PER_PAGE;
      const endIndex = startIndex + CASES_PER_PAGE;
      const newCases = cases.slice(startIndex, endIndex);
      
      console.log("📦 取得新 cases：", {
        startIndex,
        endIndex,
        newCasesCount: newCases.length
      });

      if (newCases.length > 0) {
        setCases(prevCases => [...prevCases, ...newCases]);
        setCurrentPage(prev => prev + 1);
        setHasMore(endIndex < cases.length);
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

  return (
    <>
      <CaseFilterBar
        onFilter={handleFilter}
        onSearch={handleSearch}
        fetchUrl="/api/find-student-cases"
      />
      <section className="px-4 py-8 max-w-screen-xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">👩‍🏫</span>
          <h2 className="text-2xl font-bold border-l-4 border-yellow-400 pl-3">精選導師搵學生個案</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.length > 0 ? (
            (() => {
              console.log("🖼 正在 render cases，總數：", cases.length);
              return cases.map((caseItem, index) => {
                console.log("🎨 Rendering case: ", caseItem);
                return (
                  <CaseCard
                    key={`${caseItem.id}-${currentPage}-${index}`}
                    caseItem={{
                      id: caseItem.id,
                      subject: caseItem.subject,
                      grade: caseItem.grade,
                      location: caseItem.location,
                      salary: caseItem.budget,
                      frequency: caseItem.mode,
                      requirements: caseItem.requirement,
                      status: caseItem.status
                    }}
                  />
                );
              });
            })()
          ) : (
            <div className="col-span-full text-center text-gray-500 py-8">
              <span className="text-2xl">🚫</span>
              <p className="mt-2">沒有符合條件的個案</p>
            </div>
          )}
        </div>
        <div className="mt-8 text-center">
          <LoadMoreButton
            loading={loadingMore}
            hasMore={hasMore}
            onLoad={loadMoreCases}
          />
        </div>
      </section>
    </>
  );
} 