'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchApi } from '@/services/api';
import TutorCard from '@/components/TutorCard';
import CaseCard from '@/components/CaseCard';

interface SearchResult {
  tutors: any[];
  cases: any[];
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResult>({ tutors: [], cases: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setResults({ tutors: [], cases: [] });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await searchApi.search(query);
        setResults(data);
        setError(null);
      } catch (err) {
        console.error('搜尋失敗:', err);
        setError('搜尋失敗，請稍後再試');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-6">
          搜尋結果: {query}
        </h1>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-600">搜尋中...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <p>{error}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 導師結果 */}
            <section>
              <h2 className="text-xl font-semibold mb-4">導師 ({results.tutors.length})</h2>
              {results.tutors.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {results.tutors.map((tutor) => (
                    <TutorCard key={tutor.id} tutor={tutor} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">沒有找到相關導師</p>
              )}
            </section>

            {/* 個案結果 */}
            <section>
              <h2 className="text-xl font-semibold mb-4">個案 ({results.cases.length})</h2>
              {results.cases.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {results.cases.map((caseItem) => (
                    <CaseCard key={caseItem.id} caseData={caseItem} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">沒有找到相關個案</p>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
} 