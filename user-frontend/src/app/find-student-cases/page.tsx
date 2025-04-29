'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import CaseFilterBar from '@/components/CaseFilterBar';
import LoadMoreButton from '@/components/LoadMoreButton';
import CaseCard from '@/components/CaseCard';

export default function FindStudentCasesPage() {
  const searchParams = useSearchParams();
  const [allCases, setAllCases] = useState<any[]>([]); // 保存所有個案
  const [cases, setCases] = useState<any[]>([]); // 顯示的個案
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const CASES_PER_PAGE = 10;
  const [loadingMore, setLoadingMore] = useState(false);

  // 當 URL 參數改變時重新獲取資料
  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
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

        // 構建 API 請求參數
        const query = new URLSearchParams();
        if (category) query.append('category', category);
        if (subCategory.length > 0) query.append('subCategory', subCategory.join(','));
        if (region.length > 0) query.append('region', region.join(','));
        if (priceMin) query.append('priceMin', priceMin);
        if (priceMax) query.append('priceMax', priceMax);

        console.log("🔍 API 請求參數：", query.toString());

        const response = await fetch(`http://localhost:3001/api/find-student-cases?${query.toString()}`);
        if (response.ok) {
          const data = await response.json();
          console.log("📦 API 回傳資料：", data);
          setAllCases(data);
          setCases(data.slice(0, CASES_PER_PAGE));
          setHasMore(data.length > CASES_PER_PAGE);
          console.log("✅ 成功更新狀態：", {
            allCasesCount: data.length,
            displayedCasesCount: Math.min(data.length, CASES_PER_PAGE),
            hasMore: data.length > CASES_PER_PAGE
          });
        } else {
          console.error('❌ API 請求失敗：', response.status);
          setAllCases([]);
          setCases([]);
          setHasMore(false);
        }
      } catch (error) {
        console.error('❌ 發生錯誤：', error);
        setAllCases([]);
        setCases([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, [searchParams]); // 當 URL 參數改變時重新獲取資料

  const handleFilter = (data: any[]) => {
    console.log("🔍 篩選結果：", data);
    setCases(data.slice(0, CASES_PER_PAGE));
    setCurrentPage(1);
    setHasMore(data.length > CASES_PER_PAGE);
  };

  const handleSearch = (query: any) => {
    console.log("🔍 搜尋條件：", query);
    console.log("🎯 重新搜尋 based on allCases，當前 allCases 數量：", allCases.length);
    
    // 從 allCases 過濾
    const filtered = allCases.filter(caseItem => {
      // 分類篩選
      if (query.category && caseItem.category !== query.category) {
        console.log("❌ 分類不匹配：", { caseCategory: caseItem.category, queryCategory: query.category });
        return false;
      }
      
      // 子分類篩選
      if (query.subCategory?.length > 0) {
        const hasMatchingSubCategory = query.subCategory.some((sub: string) => 
          caseItem.subCategory?.includes(sub)
        );
        if (!hasMatchingSubCategory) {
          console.log("❌ 子分類不匹配：", { caseSubCategory: caseItem.subCategory, querySubCategory: query.subCategory });
          return false;
        }
      }
      
      // 地區篩選
      if (query.region?.length > 0) {
        const hasMatchingRegion = query.region.some((region: string) => 
          caseItem.region?.includes(region)
        );
        if (!hasMatchingRegion) {
          console.log("❌ 地區不匹配：", { caseRegion: caseItem.region, queryRegion: query.region });
          return false;
        }
      }
      
      // 價格範圍篩選
      const price = Number(caseItem.budget?.replace(/[^0-9]/g, ''));
      if (price < query.priceMin || price > query.priceMax) {
        console.log("❌ 價格不匹配：", { casePrice: price, queryMin: query.priceMin, queryMax: query.priceMax });
        return false;
      }
      
      console.log("✅ 個案符合所有條件：", caseItem);
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