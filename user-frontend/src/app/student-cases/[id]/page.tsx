'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface StudentCase {
  id: string;
  title: string;
  description: string;
  category: string;
  subCategory: string;
  subjects: string[];
  region: string;
  subRegion: string;
  mode: string;
  modes: string[];
  budget: {
    min: number;
    max: number;
  };
  experience: string;
  featured: boolean;
  date: string;
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
          <h1 className="text-3xl font-bold text-gray-900">{caseData.title || '未命名案例'}</h1>
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
                <p><span className="font-medium">科目：</span>{caseData.subjects?.join(', ') || '未指定'}</p>
                <p><span className="font-medium">地區：</span>{caseData.region || '未指定'}</p>
                <p><span className="font-medium">教學模式：</span>{caseData.mode || '未指定'}</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">教學詳情</h2>
              <div className="space-y-2">
                <p><span className="font-medium">預算：</span>
                  {caseData.budget?.min === 0 && caseData.budget?.max === 0 
                    ? '面議' 
                    : `${caseData.budget?.min || 0} - ${caseData.budget?.max || 0} 元/小時`}
                </p>
                <p><span className="font-medium">經驗要求：</span>{caseData.experience || '無要求'}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">詳細描述</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{caseData.description || '無描述'}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 