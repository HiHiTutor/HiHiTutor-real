'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import CaseCard from '@/components/CaseCard';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<any>({ cases: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);

        // 從 URL 參數獲取搜索條件
        const query = searchParams.toString();
        
        // 調用搜索 API
        const response = await fetch(`/api/find-student-cases?${query}`);
        if (!response.ok) {
          throw new Error('搜索請求失敗');
        }

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message || '搜索失敗');
        }

        setResults(data.data);
      } catch (err) {
        console.error('搜索錯誤:', err);
        setError(err instanceof Error ? err.message : '搜索時發生錯誤');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px] text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">搜索結果</h1>
      
      {results.cases.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {results.cases.map((caseItem: any) => (
            <CaseCard 
              key={caseItem.id} 
              caseData={caseItem} 
              routeType="tutor"
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">沒有找到符合條件的結果</p>
        </div>
      )}
    </div>
  );
} 