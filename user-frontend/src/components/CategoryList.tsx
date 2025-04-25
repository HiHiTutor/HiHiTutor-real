'use client';

import React, { useEffect, useState } from 'react';
import CategoryCard from './CategoryCard';

interface Subcategory {
  id: number;
  name: string;
  icon: string;
}

interface Category {
  id: number;
  name: string;
  icon: string;
  subcategories: Subcategory[];
}

const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/categories');
        if (!response.ok) {
          throw new Error('獲取分類失敗');
        }
        const data = await response.json();
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
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              title={category.name}
              subtitle={`${category.subcategories.length} 個科目`}
              icon={category.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryList; 