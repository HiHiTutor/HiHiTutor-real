'use client';

import { useState, Suspense } from 'react';
import SearchTabBar from '@/components/SearchTabBar';
import CaseFilterBar from '@/components/CaseFilterBar';

export default function TestTabsPage() {
  const [currentTarget, setCurrentTarget] = useState('tutors');

  const handleSearch = (query: any) => {
    console.log('搜尋條件:', query);
  };

  const handleTargetChange = (target: string) => {
    setCurrentTarget(target);
    console.log('切換到目標:', target);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center mb-8">Tab 功能測試頁面</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <SearchTabBar 
            currentTarget={currentTarget}
            onTabChange={handleTargetChange}
          />
          
          <Suspense fallback={<div className="text-center py-8">載入篩選器...</div>}>
            <CaseFilterBar
              onFilter={handleSearch}
              fetchUrl={currentTarget === 'tutors' ? '/tutors' : '/find-student-cases'}
              currentTarget={currentTarget}
              onTargetChange={handleTargetChange}
            />
          </Suspense>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">當前狀態</h2>
          <p>當前選中的目標: <span className="font-bold text-blue-600">{currentTarget}</span></p>
          <p>對應的顏色主題: <span className="font-bold">{currentTarget === 'tutors' ? '黃色' : '藍色'}</span></p>
        </div>
      </div>
    </div>
  );
} 