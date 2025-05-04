'use client';

import React, { useEffect, useState } from 'react';
import CategoryCard from './CategoryCard';

interface Subject {
  id: string;
  name: string;
}

interface Subcategory {
  id: string;
  name: string;
  subjects: Subject[];
}

interface Category {
  id: string;
  name: string;
  subCategories: Subcategory[];
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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`);
        if (!response.ok) {
          throw new Error('獲取分類失敗');
        }
        const data = await response.json();
        console.log('📦 獲取到的分類數據:', data);
        setCategories(data);
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

  return (
    <section className="max-w-screen-xl mx-auto px-4 md:px-12 py-8">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">📚</span>
        <h2 className="text-2xl font-bold border-l-4 border-yellow-400 pl-3">課程分類</h2>
      </div>
      <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {categories.map((category) => {
            // 對應分類 name 到 studentCases.json 的 category 值
            let categoryParam = '';
            switch (category.name) {
              case '幼兒教育':
                categoryParam = 'early-childhood'; // 與 studentCases.json 一致
                break;
              case '中小學教育':
                categoryParam = 'primary-secondary';
                break;
              case '大專補習課程':
                categoryParam = 'tertiary';
                break;
              case '興趣班':
                categoryParam = 'interest';
                break;
              case '成人教育':
                categoryParam = 'adult';
                break;
              default:
                categoryParam = '';
            }
            const link = categoryParam
              ? `/find-student-cases?category=${categoryParam}`
              : undefined;
            return (
              <CategoryCard
                key={category.id}
                title={category.name}
                subtitle={getCategoryDescription(category)}
                icon={CATEGORY_ICONS[category.id] || '📚'}
                href={link}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryList; 