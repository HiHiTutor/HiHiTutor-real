'use client';

import React, { useEffect, useState } from 'react';
import CategoryCard from './CategoryCard';
import { useRouter } from 'next/navigation';
import CATEGORY_OPTIONS from '@/constants/categoryOptions';

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
  'early-childhood': '🧒',
  'primary': '📘',
  'secondary': '🎓',
  'interest': '🎨',
  'tertiary': '🎓',
  'adult': '🧑‍🏫'
};

// 獲取分類描述
const getCategoryDescription = (category: Category): string => {
  // 如果有 subjectCount 欄位，直接顯示
  if (typeof (category as any).subjectCount === 'number') {
    return `${(category as any).subjectCount} 個科目`;
  }
  
  // 計算科目總數
  let totalSubjects = 0;
  
  // 如果有子分類（如中小學教育），計算所有子分類的科目總數
  if (category.subCategories && category.subCategories.length > 0) {
    totalSubjects = category.subCategories.reduce((total, subCategory) => 
      total + (subCategory.subjects?.length || 0), 0);
  }
  // 如果直接有科目（如幼兒教育、興趣班等），計算直接科目的數量
  else if (category.subjects && category.subjects.length > 0) {
    totalSubjects = category.subjects.length;
  }
  
  return `${totalSubjects} 個科目`;
};

const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // 使用靜態科目選項
    console.log('✅ 使用靜態科目選項');
    setCategories(CATEGORY_OPTIONS);
    setError(null);
    setLoading(false);
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
    'early-childhood': '/tutors?target=find-tutor&category=early-childhood',
    'primary': '/tutors?target=find-tutor&category=primary',
    'secondary': '/tutors?target=find-tutor&category=secondary',
    'interest': '/tutors?target=find-tutor&category=interest',
    'tertiary': '/tutors?target=find-tutor&category=tertiary',
    'adult': '/tutors?target=find-tutor&category=adult',
  };

  return (
    <section className="max-w-screen-xl mx-auto px-4 md:px-12 py-8 max-sm:px-4 max-sm:py-6 max-[700px]:px-6 max-[700px]:py-6">
      <div className="flex items-center gap-2 mb-6 max-sm:gap-1 max-sm:mb-4 max-[700px]:gap-2 max-[700px]:mb-5">
        <span className="text-2xl max-sm:text-xl max-[700px]:text-2xl">📚</span>
        <h2 className="text-2xl font-bold border-l-4 border-yellow-400 pl-3 max-sm:text-xl max-sm:pl-2 max-[700px]:text-2xl max-[700px]:pl-3">課程分類</h2>
      </div>
      <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 max-sm:p-3 max-[700px]:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-sm:grid-cols-2 max-sm:gap-3 max-[700px]:grid-cols-3 max-[700px]:gap-4">
          {normalizedCategories.map((category, index) => {
            const link = categoryLinks[category.value as string];
            return (
              <div
                key={category.value || category.label || index}
                className="h-36 p-4 rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer flex flex-col items-center justify-center max-sm:h-28 max-sm:p-3 max-[700px]:h-32 max-[700px]:p-4"
                onClick={() => link && router.push(link)}
              >
                <div className="text-3xl mb-2 max-sm:text-2xl max-sm:mb-1 max-[700px]:text-3xl max-[700px]:mb-2">{CATEGORY_ICONS[category.value as string] || '📚'}</div>
                <h3 className="text-sm font-medium text-gray-800 text-center max-sm:text-xs max-[700px]:text-sm">{category.label}</h3>
                <p className="text-xs text-gray-600 text-center mt-1 line-clamp-2 max-sm:text-xs max-sm:mt-0.5 max-[700px]:text-xs max-[700px]:mt-1">{getCategoryDescription(category)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryList; 