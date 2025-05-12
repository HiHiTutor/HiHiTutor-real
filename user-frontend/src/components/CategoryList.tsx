'use client';

import React, { useEffect, useState } from 'react';
import CategoryCard from './CategoryCard';
import { useRouter } from 'next/navigation';

interface Subject {
  value: string;
  label: string;
}

interface Subcategory {
  value: string;
  label: string;
  subjects: Subject[];
  id?: string;
  name?: string;
}

interface Category {
  value: string;
  label: string;
  subCategories?: Subcategory[];
  subjects?: Subject[];
  id?: string;
  name?: string;
}

// 分類 icon 映射
const CATEGORY_ICONS: { [key: string]: string } = {
  'preschool': '🧒',
  'primary-secondary': '📘',
  'tertiary': '🎓',
  'interest': '🎨',
  'adult': '🧑‍🏫'
};

// 獲取分類描述
const getCategoryDescription = (category: Category): string => {
  const totalSubjects = category.subCategories?.reduce((total, subCategory) => 
    total + (subCategory.subjects?.length || 0), 0) || 0;

  switch (category.id) {
    case 'preschool':
      return `涵蓋 ${totalSubjects} 大熱門科目`;
    case 'primary-secondary':
      return `精選 ${totalSubjects} 個升學關鍵科目`;
    case 'tertiary':
      return `支援 ${totalSubjects} 類大專課程`;
    case 'interest':
      return '熱門興趣選擇';
    case 'adult':
      return '成人進修課程推薦';
    default:
      return `${totalSubjects} 個科目`;
  }
};

const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/categories`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) {
          throw new Error(`獲取分類失敗 (${response.status})`);
        }
        const data = await response.json();
        console.log('📦 獲取到的分類數據:', data);
        // 支援 array 或 { data: array } 結構
        const arr = Array.isArray(data) ? data : (data?.data || []);
        if (!Array.isArray(arr)) {
          throw new Error('分類數據格式錯誤');
        }
        setCategories(arr);
        setError(null);
      } catch (err) {
        console.error('獲取分類失敗:', err);
        setError(err instanceof Error ? err.message : '未知錯誤');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        載入分類時發生錯誤：{error}
      </div>
    );
  }

  // fallback patch: normalize categories
  const normalizedCategories = categories.map(cat => {
    if (!cat.subCategories && cat.subjects) {
      return {
        ...cat,
        subCategories: [
          {
            value: cat.value + '-all',
            label: '所有科目',
            subjects: cat.subjects
          }
        ]
      };
    }
    return cat;
  });

  // 分類對應跳轉路徑
  const categoryLinks: Record<string, string> = {
    'early-childhood': '/find-student-cases?category=early-childhood',
    'primary-secondary': '/find-student-cases?category=primary-secondary',
    'interest': '/find-student-cases?category=interest',
    'tertiary': '/find-student-cases?category=tertiary',
    'adult': '/find-student-cases?category=adult',
  };

  return (
    <section className="max-w-screen-xl mx-auto px-4 md:px-12 py-8">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">📚</span>
        <h2 className="text-2xl font-bold border-l-4 border-yellow-400 pl-3">課程分類</h2>
      </div>
      <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {normalizedCategories.map((category, index) => {
            const link = categoryLinks[category.value as string];
            return (
              <div
                key={category.value || category.label || index}
                className="h-36 p-4 rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer flex flex-col items-center justify-center"
                onClick={() => link && router.push(link)}
              >
                <div className="text-3xl mb-2">{CATEGORY_ICONS[category.value as string] || '📚'}</div>
                <h3 className="text-sm font-medium text-gray-800 text-center">{category.label}</h3>
                <p className="text-xs text-gray-600 text-center mt-1 line-clamp-2">{getCategoryDescription(category)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryList; 