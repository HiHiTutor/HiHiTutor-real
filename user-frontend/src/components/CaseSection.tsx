'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { caseApi } from '../services/api';

// 個案資料類型定義
interface Case {
  id: number;
  subject: string;
  location: string;
  fee: string;
  frequency: string;
  description: string;
  tags: string[];
}

const CaseSection = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        const data = await caseApi.getLatestCases();
        // 確保 data 是陣列
        setCases(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error('獲取最新個案失敗:', err);
        setError('獲取最新個案失敗，請稍後再試');
        // 發生錯誤時，設置空陣列
        setCases([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  // 只顯示前 8 個最新個案，確保 cases 是陣列
  const limitedCases = Array.isArray(cases) ? cases.slice(0, 8) : [];

  const handleCaseClick = (caseId: number) => {
    router.push(`/cases/${caseId}`);
  };

  return (
    <section className="mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-primary font-bold text-lg mb-3 border-b-2 border-primary inline-block">
          最新補習個案
        </h2>
        <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-300">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              <p className="mt-2 text-gray-600">載入中...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>{error}</p>
            </div>
          ) : limitedCases.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>目前沒有最新個案</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {limitedCases.map((case_) => (
                <div
                  key={case_.id}
                  className="bg-white border border-gray-300 rounded-xl shadow-sm p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
                  onClick={() => handleCaseClick(case_.id)}
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{case_.subject || '未命名個案'}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>地點: {case_.location || '未指定'}</p>
                    <p>費用: {case_.fee || '未指定'}</p>
                    <p>頻率: {case_.frequency || '未指定'}</p>
                  </div>
                  {case_.tags && Array.isArray(case_.tags) && case_.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {case_.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="mt-8 text-center">
            <button className="bg-white border border-primary text-primary rounded-md px-4 py-2 hover:bg-gray-50 transition-all duration-200">
              查看更多個案
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaseSection; 