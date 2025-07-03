'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface SearchTabBarProps {
  onTabChange?: (target: string) => void;
  currentTarget?: string;
  className?: string;
}

const TABS = [
  {
    key: "tutors",
    label: "導師列表",
    color: "yellow",
    icon: "📘",
    route: "/tutors",
    bg: "bg-yellow-50",
    border: "border-yellow-300",
    activeBg: "bg-yellow-100",
    activeBorder: "border-yellow-400",
  },
  {
    key: "cases",
    label: "補習個案",
    color: "blue",
    icon: "📄",
    route: "/find-student-cases",
    bg: "bg-blue-50",
    border: "border-blue-300",
    activeBg: "bg-blue-100",
    activeBorder: "border-blue-400",
  },
];

const SearchTabBar: React.FC<SearchTabBarProps> = ({ onTabChange, currentTarget, className = "" }) => {
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
    }
    // 不做 router.push，單純切換 active tab
  };

  return (
    <div className={`flex gap-0 relative ${className}`}>
      {TABS.map((tab, idx) => {
        const isActive = activeTarget === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => handleTabClick(tab.key)}
            className={`relative flex items-end px-4 sm:px-6 md:px-8 pt-2 sm:pt-3 md:pt-4 pb-1 sm:pb-2 border-x-0 border-t-0 border-b-0
              ${isActive ? `${tab.activeBorder} ${tab.activeBg} z-20` : 'border-gray-200 bg-gray-100 z-10'}
              transition-all duration-200
              ${idx === 0 ? 'rounded-tl-[1.5rem] sm:rounded-tl-[2rem] md:rounded-tl-[2.5rem]' : ''}
              ${idx === TABS.length - 1 ? 'rounded-tr-[1.5rem] sm:rounded-tr-[2rem] md:rounded-tr-[2.5rem]' : ''}
              shadow-[0_4px_12px_0_rgba(0,0,0,0.06)]
              folder-tab
            `}
            style={{
              marginRight: idx !== TABS.length - 1 ? '-1.5rem' : 0,
              boxShadow: isActive 
                ? `0 6px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)` 
                : '0 2px 6px 0 rgba(0,0,0,0.04)',
              borderBottom: isActive ? 'none' : '4px solid #e5e7eb',
              top: isActive ? 0 : 12,
              minWidth: '80px',
              maxWidth: '120px',
              borderLeft: idx === 0 ? undefined : '2px solid #e5e7eb',
              borderRight: idx === TABS.length - 1 ? undefined : '2px solid #e5e7eb',
              transform: isActive ? 'translateY(0)' : 'translateY(2px)',
            }}
          >
            <span className="text-xl sm:text-2xl md:text-3xl mr-1 sm:mr-2 drop-shadow-sm">{tab.icon}</span>
            <span className={`font-bold text-xs sm:text-sm md:text-lg whitespace-nowrap ${isActive ? (tab.color === 'yellow' ? 'text-yellow-700' : 'text-blue-700') : 'text-gray-500'}`}>
              {tab.label}
            </span>
            
            {/* 左上突出角 - 只在第一個 tab 且 active 時顯示 */}
            {idx === 0 && isActive && (
              <div className="absolute -top-3 -left-3 w-6 h-6 bg-white border-l-4 border-t-4 border-yellow-400 rounded-tl-2xl z-30 shadow-[2px_2px_4px_0_rgba(0,0,0,0.1)]"></div>
            )}
            
            {/* 右上突出角 - 只在最後一個 tab 且 active 時顯示 */}
            {idx === TABS.length - 1 && isActive && (
              <div className="absolute -top-3 -right-3 w-6 h-6 bg-white border-r-4 border-t-4 border-blue-400 rounded-tr-2xl z-30 shadow-[-2px_2px_4px_0_rgba(0,0,0,0.1)]"></div>
            )}
            
            {/* 底部插入效果 - 只在 active tab 顯示 */}
            {isActive && (
              <div className={`absolute left-0 right-0 bottom-0 h-1 ${tab.activeBg} rounded-b-sm`}></div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default SearchTabBar;