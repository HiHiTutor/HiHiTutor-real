'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface StudentCase {
  id: string;
  title: string;
  subject: string;
  subjects: string[];
  location: string;
  budget: string;
  mode: string;
  modes: string[];
  requirement: string;
  requirements: string;
  category: string;
  subCategory: string;
  region: string[];
  regions: string[];
  subRegions: string[];
  priceRange: string;
  duration: number;
  durationUnit: string;
  weeklyLessons: number;
  featured: boolean;
  isVip: boolean;
  vipLevel: number;
  isTop: boolean;
  topLevel: number;
  createdAt: string;
}

export default function StudentCaseDetail() {
  const params = useParams();
  const id = params.id as string;
  const [caseData, setCaseData] = useState<StudentCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCaseData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/find-student-cases/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch case data');
        }
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch case data');
        }
        setCaseData(data.data);
      } catch (error) {
        console.error('Error fetching case data:', error);
        setError('Failed to fetch case data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCaseData();
    }
  }, [id]);

  const handleApply = () => {
    // TODO: Implement application logic
    console.log('Applying for case:', id);
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">載入中...</div>;
  if (error) return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;
  if (!caseData) return <div className="flex justify-center items-center min-h-screen">找不到個案</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{caseData.title || '未命名案例'}</h1>
            {(caseData.isVip || caseData.isTop) && (
              <div className="flex gap-2 mt-2">
                {caseData.isVip && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    VIP {caseData.vipLevel > 0 ? `Level ${caseData.vipLevel}` : ''}
                  </span>
                )}
                {caseData.isTop && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                    置頂 {caseData.topLevel > 0 ? `Level ${caseData.topLevel}` : ''}
                  </span>
                )}
              </div>
            )}
          </div>
          <button
            onClick={handleApply}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            申請此個案
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">基本資料</h2>
              <div className="space-y-2">
                <p><span className="font-medium">類別：</span>{caseData.category || '未指定'}</p>
                <p><span className="font-medium">子類別：</span>{caseData.subCategory || '未指定'}</p>
                <p><span className="font-medium">科目：</span>{caseData.subjects?.join(', ') || caseData.subject || '未指定'}</p>
                <p><span className="font-medium">地區：</span>{caseData.regions?.join(', ') || caseData.region || '未指定'}</p>
                <p><span className="font-medium">教學模式：</span>{caseData.mode || '未指定'}</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">教學詳情</h2>
              <div className="space-y-2">
                <p><span className="font-medium">預算：</span>{caseData.budget || caseData.priceRange || '面議'}</p>
                <p><span className="font-medium">課堂時長：</span>{caseData.duration || 0} {caseData.durationUnit || '分鐘'}</p>
                <p><span className="font-medium">每週堂數：</span>{caseData.weeklyLessons || 0} 堂</p>
                <p><span className="font-medium">要求：</span>{caseData.requirement || caseData.requirements || '無要求'}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">詳細描述</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{caseData.requirement || caseData.requirements || '無描述'}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 