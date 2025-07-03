'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface SearchTabBarProps {
  onTabChange?: (target: string) => void;
  currentTarget?: string;
}

const SearchTabBar: React.FC<SearchTabBarProps> = ({ onTabChange, currentTarget }) => {
  const router = useRouter();
  const pathname = usePathname();

  // 根據當前路徑決定預設選中的Tab
  const getDefaultTarget = () => {
    if (pathname === '/tutors') return 'tutors';
    if (pathname === '/find-student-cases') return 'cases';
    return 'tutors'; // 首頁預設選中導師列表
  };

  const activeTarget = currentTarget || getDefaultTarget();

  const handleTabClick = (target: string) => {
    if (onTabChange) {
      onTabChange(target);
    } else {
      // 直接導航到對應頁面
      if (target === 'tutors') {
        router.push('/tutors');
      } else if (target === 'cases') {
        router.push('/find-student-cases');
      }
    }
  };

  return (
    <div className="flex justify-center mb-6">
      <div className="flex bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        {/* 導師列表 Tab */}
        <button
          onClick={() => handleTabClick('tutors')}
          className={`px-8 py-3 font-medium text-sm transition-all duration-200 relative ${
            activeTarget === 'tutors'
              ? 'bg-yellow-500 text-white shadow-lg transform scale-105'
              : 'bg-white text-gray-600 hover:bg-yellow-50 hover:text-yellow-700'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span className="text-lg">👩‍🏫</span>
            <span>導師列表</span>
          </div>
          {activeTarget === 'tutors' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-600"></div>
          )}
        </button>

        {/* 補習個案 Tab */}
        <button
          onClick={() => handleTabClick('cases')}
          className={`px-8 py-3 font-medium text-sm transition-all duration-200 relative ${
            activeTarget === 'cases'
              ? 'bg-blue-500 text-white shadow-lg transform scale-105'
              : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-700'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span className="text-lg">📄</span>
            <span>補習個案</span>
          </div>
          {activeTarget === 'cases' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600"></div>
          )}
        </button>
      </div>
    </div>
  );
};

export default SearchTabBar; 