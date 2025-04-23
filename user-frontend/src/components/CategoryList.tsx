'use client';

import React, { useEffect, useState } from 'react';
import CategoryCard from './CategoryCard';

interface Category {
  id: number;
  name: string;
  description: string;
}

// TODO: 未來從 .env 讀取
const BASE_URL = 'http://localhost:3001';

const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const icons = {
    "幼兒教育": "🧸",
    "中小學教育": "📚",
    "興趣班": "🎭",
    "大專補習課程": "🎓",
    "成人教育": "💼"
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/categories`);
        if (!response.ok) {
          throw new Error('獲取分類失敗');
        }
        const data = await response.json();
        setCategories(data);
      } catch (err) {
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
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">課程分類</h2>
      <div className="grid grid-cols-5 gap-4">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            title={category.name}
            subtitle={category.description}
            icon={icons[category.name as keyof typeof icons] || "📚"}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryList; 