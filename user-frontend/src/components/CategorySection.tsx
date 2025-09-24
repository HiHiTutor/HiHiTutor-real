'use client';

import { useEffect, useState } from 'react';
import CATEGORY_OPTIONS from '@/constants/categoryOptions';
import {
  BookOpenIcon,
  LanguageIcon,
  MusicalNoteIcon,
  FireIcon,
} from "@heroicons/react/24/outline";

// 分類資料類型定義
interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
}

const iconMap: Record<string, JSX.Element> = {
  book: <BookOpenIcon className="w-8 h-8 text-yellow-500" />,
  language: <LanguageIcon className="w-8 h-8 text-yellow-500" />,
  music: <MusicalNoteIcon className="w-8 h-8 text-yellow-500" />,
  fitness_center: <FireIcon className="w-8 h-8 text-yellow-500" />,
};

const CategorySection = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 使用靜態科目選項
    console.log('✅ 使用靜態科目選項');
    setCategories(CATEGORY_OPTIONS);
    setError(null);
    setLoading(false);
  }, []);

  return (
    <section className="mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-primary font-bold text-xl mb-2 border-b-2 border-primary inline-block">
          課程分類
        </h2>
        <div className="bg-yellow-50 p-4 rounded-2xl shadow-sm mt-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              <p className="mt-2 text-gray-600">載入中...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>{error}</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>目前沒有課程分類</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-center justify-center mb-4">
                    {iconMap[category.icon] ?? <BookOpenIcon className="w-8 h-8 text-gray-400" />}
                  </div>
                  <h3 className="text-lg font-semibold text-center">{category.name}</h3>
                  <p className="text-gray-600 text-sm text-center mt-2">{category.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CategorySection; 