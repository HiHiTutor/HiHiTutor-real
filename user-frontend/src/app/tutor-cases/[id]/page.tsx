'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { caseApi } from '@/services/api';

interface TutorCase {
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

export default function TutorCaseDetailPage() {
  const { id } = useParams();
  const [caseData, setCaseData] = useState<TutorCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/tutor-cases/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch case data');
        }
        const data = await response.json();
        setCaseData(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCase();
    }
  }, [id]);

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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">錯誤</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">找不到案例</h2>
          <p className="text-gray-500">該案例可能已被移除或不存在</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-4">{caseData.title}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">基本資訊</h2>
            <div className="space-y-2">
              <p><span className="font-medium">類別：</span>{caseData.category}</p>
              <p><span className="font-medium">子類別：</span>{caseData.subCategory}</p>
              <p><span className="font-medium">科目：</span>{caseData.subjects.join(', ')}</p>
              <p><span className="font-medium">地區：</span>{caseData.region}</p>
              <p><span className="font-medium">子地區：</span>{caseData.subRegion}</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-2">教學詳情</h2>
            <div className="space-y-2">
              <p><span className="font-medium">教學模式：</span>{caseData.modes?.join(', ') || caseData.mode}</p>
              <p><span className="font-medium">預算：</span>${caseData.budget.min} - ${caseData.budget.max}</p>
              <p><span className="font-medium">經驗要求：</span>{caseData.experience}</p>
              <p><span className="font-medium">發布日期：</span>{new Date(caseData.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">詳細描述</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{caseData.description}</p>
        </div>
      </div>
    </div>
  );
} 