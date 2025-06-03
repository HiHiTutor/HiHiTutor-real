'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import CaseFilterBar from '@/components/CaseFilterBar';
import LoadMoreButton from '@/components/LoadMoreButton';
import CaseCard from '@/components/CaseCard';

// 分類映射
const CATEGORY_MAP: Record<string, string[]> = {
  'primary-secondary': ['小學', '中學', '高中', '國中'],
  'early-childhood': ['幼兒', '幼稚園'],
  'interest': ['興趣', 'interest'],
  'tertiary': ['大學', '大專'],
  'adult': ['成人', '職業']
};

// 反向分類映射：從後端分類映射到前端分類
const mapBackendToFrontend = (backendCategory: string) => {
  for (const [frontend, backends] of Object.entries(CATEGORY_MAP)) {
    if (backends.some(cat => backendCategory.includes(cat))) {
      return frontend;
    }
  }
  return backendCategory;
};

const mapCategoryToBackend = (frontendCategory: string) => {
  return CATEGORY_MAP[frontendCategory] || [frontendCategory];
};

interface Case {
  id: string;
  title: string;
  category: string;
  subCategory: string;
  subjects: string[];
  region: string;
  subRegion: string;
  mode: string;
  modes?: string[];
  budget: {
    min: number;
    max: number;
  };
  experience: string;
  featured: boolean;
  date: string;
  createdAt?: string;
  lessonDetails?: {
    duration: number;
    pricePerLesson: number;
    lessonsPerWeek: number;
  };
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function FindStudentCasesPage() {
  return (
    <Suspense>
      <FindStudentCasesPageContent />
    </Suspense>
  );
}

function FindStudentCasesPageContent() {
  const searchParams = useSearchParams();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 獲取個案資料
  const fetchCases = async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      
      // 構建查詢參數
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '10');

      // 從 URL 獲取過濾條件
      const category = searchParams.get('category');
      const subCategory = searchParams.getAll('subCategory');
      const region = searchParams.getAll('region');
      const priceMin = searchParams.get('priceMin');
      const priceMax = searchParams.get('priceMax');

      if (category) params.append('category', category);
      subCategory.forEach(sub => params.append('subCategory', sub));
      region.forEach(r => params.append('region', r));
      if (priceMin) params.append('priceMin', priceMin);
      if (priceMax) params.append('priceMax', priceMax);

      console.log('🔍 發送查詢請求，參數：', params.toString());

      const response = await fetch(`/api/find-student-cases?${params.toString()}`);
      if (!response.ok) {
        throw new Error('獲取資料失敗');
      }

      const data = await response.json();
      console.log('📦 獲取到的資料：', data);

      if (data.success) {
        if (page === 1) {
          setCases(data.data.cases);
        } else {
          setCases(prev => [...prev, ...data.data.cases]);
        }
        setPagination(data.data.pagination);
      } else {
        throw new Error(data.message || '獲取資料失敗');
      }
    } catch (err) {
      console.error('❌ 獲取資料時發生錯誤：', err);
      setError(err instanceof Error ? err.message : '獲取資料時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  // 當 URL 參數改變時重新獲取資料
  useEffect(() => {
    setCurrentPage(1);
    fetchCases(1);
  }, [searchParams]);

  // 載入更多
  const handleLoadMore = () => {
    if (pagination && currentPage < pagination.totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchCases(nextPage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 過濾器 */}
        <CaseFilterBar 
          onFilter={(filters) => {
            setCurrentPage(1);
            fetchCases(1);
          }}
          onSearch={(filters) => {
            setCurrentPage(1);
            fetchCases(1);
          }}
          fetchUrl="/find-student-cases"
        />

        {/* 錯誤提示 */}
        {error && (
          <div className="my-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        )}

        {/* 個案列表 */}
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cases.map((caseItem, index) => (
            <CaseCard
              key={`${caseItem.id}-${index}`}
              routeType="student"
              caseData={{
                id: caseItem.id,
                title: caseItem.title,
                subject: { label: caseItem.subjects?.[0] || '' },
                region: { label: caseItem.region || '' },
                modes: Array.isArray(caseItem.modes) ? caseItem.modes : [caseItem.mode],
                experienceLevel: { label: caseItem.experience },
                lessonDetails: caseItem.lessonDetails,
                createdAt: caseItem.createdAt || caseItem.date,
              }}
            />
          ))}
        </div>

        {/* 載入中提示 */}
        {loading && (
          <div className="my-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}

        {/* 載入更多按鈕 */}
        {pagination && currentPage < pagination.totalPages && !loading && (
          <div className="mt-8 flex justify-center">
            <LoadMoreButton onClick={handleLoadMore} loading={loading} />
          </div>
        )}

        {/* 無資料提示 */}
        {!loading && cases.length === 0 && (
          <div className="my-8 text-center text-gray-500">
            沒有找到符合條件的個案
          </div>
        )}
      </div>
    </div>
  );
} 