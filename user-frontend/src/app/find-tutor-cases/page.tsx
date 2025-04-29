'use client';

import { useEffect, useState } from 'react';
import CaseFilterBar from '@/components/CaseFilterBar';

export default function FindTutorCasesPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const CASES_PER_PAGE = 10;
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/find-tutor-cases?page=1&limit=10');
        if (response.ok) {
          const data = await response.json();
          setCases(data);
          setHasMore(data.length === CASES_PER_PAGE);
          setCurrentPage(1);
        } else {
          console.error('Failed to fetch tutor cases');
        }
      } catch (error) {
        console.error('Error fetching tutor cases:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  const handleFilter = (data: any[]) => {
    setCases(data);
  };

  const loadMoreCases = async () => {
    setLoadingMore(true);
    try {
      const response = await fetch(`http://localhost:3001/api/find-tutor-cases?page=${currentPage + 1}&limit=${CASES_PER_PAGE}`);
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setCases(prevCases => [...prevCases, ...data]);
          setCurrentPage(prev => prev + 1);
          setHasMore(data.length === CASES_PER_PAGE);
        } else {
          setHasMore(false);
        }
      } else {
        console.error('API錯誤:', response.statusText);
        setHasMore(false);
      }
    } catch (error) {
      console.error('loadMoreCases出錯:', error);
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
        fetchUrl="/api/find-tutor-cases"
      />
      <section className="px-4 py-8 max-w-screen-xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">📄</span>
          <h2 className="text-2xl font-bold border-l-4 border-blue-400 pl-3">最新學生搵導師個案</h2>
        </div>
        <div className="space-y-6">
          {cases.length > 0 ? (
            cases.map((caseItem, index) => (
              <div key={`${caseItem.id}-${index}`} className="bg-blue-100 border border-blue-300 rounded-xl p-6">
                <p className="text-gray-600">ID: {caseItem.id}</p>
                <p className="text-gray-600">科目: {caseItem.subject}</p>
                <p className="text-gray-600">地點: {caseItem.location}</p>
                <p className="text-gray-600">收費: {caseItem.budget}</p>
                <p className="text-gray-600">模式: {caseItem.mode}</p>
                <p className="text-gray-600">要求: {caseItem.requirement}</p>
              </div>
            ))
          ) : (
            <div>目前沒有最新學生搵導師個案</div>
          )}
        </div>
        <div className="mt-8 text-center">
          {hasMore ? (
            <button
              onClick={loadMoreCases}
              disabled={loadingMore}
              className={`bg-blue-500 text-white rounded-md px-6 py-2 hover:bg-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto gap-2 min-w-[160px]`}
            >
              {loadingMore ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  <span>載入中...</span>
                </>
              ) : (
                <span>查看更多個案</span>
              )}
            </button>
          ) : (
            <p className="text-gray-500">🚫 沒有更多個案</p>
          )}
        </div>
      </section>
    </>
  );
} 