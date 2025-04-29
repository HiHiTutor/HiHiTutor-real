'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// 個案資料類型定義
interface Case {
  id: string;
  subject: string;
  location: string;
  budget: string;
  mode: string;
  description: string;
  requirement: string;
}

interface CaseSectionProps {
  title: string;
  fetchUrl: string;
  linkUrl: string;
  borderColor?: string;
  bgColor?: string;
  icon?: React.ReactNode;
}

const CaseSection = ({ title, fetchUrl, linkUrl, borderColor = 'border-blue-400', bgColor = 'bg-blue-50', icon }: CaseSectionProps) => {
  console.log("CaseSection 正確載入 ✅", { title, fetchUrl });
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3001/api${fetchUrl}`);
        if (response.ok) {
          const data = await response.json();
          setCases(Array.isArray(data) ? data : []);
          setError(null);
        } else {
          throw new Error('Failed to fetch cases');
        }
      } catch (err) {
        console.error('獲取個案失敗:', err);
        setError('獲取個案失敗，請稍後再試');
        setCases([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, [fetchUrl]);

  const limitedCases = Array.isArray(cases) ? cases.slice(0, 8) : [];

  return (
    <section className="max-w-screen-xl mx-auto px-4 md:px-12 py-8">
      <div className="flex items-center gap-2 mb-6">
        {icon && <span className="text-2xl">{icon}</span>}
        <h2 className={`text-2xl font-bold border-l-4 ${borderColor} pl-3`}>{title}</h2>
      </div>
      <div className={`${bgColor} border ${borderColor.replace('border-', 'border-')} rounded-xl p-4`}>
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
            <p>目前沒有個案</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 items-start">
            {limitedCases.map((case_, index) => (
              <div
                key={`${case_.id}-${index}`}
                onClick={() => router.push(`${linkUrl}/${case_.id}`)}
                className="border border-gray-300 rounded-xl p-4 bg-white shadow-sm text-start cursor-pointer hover:shadow-md transition-shadow duration-200"
              >
                <div className="font-bold text-lg mb-1">{case_.subject || ''}</div>
                <div className="text-base mb-1">{case_.location || ''}</div>
                <div className="text-base mb-1">{case_.budget || ''}</div>
                <div className="text-base mb-1">{case_.mode || ''}</div>
                {case_.requirement && <div className="text-base">{case_.requirement}</div>}
              </div>
            ))}
          </div>
        )}
        <div className="mt-8 text-center">
          <Link
            href={linkUrl}
            className="bg-white border border-primary text-primary rounded-md px-4 py-2 hover:bg-gray-50 transition-all duration-200"
          >
            查看更多個案
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CaseSection; 