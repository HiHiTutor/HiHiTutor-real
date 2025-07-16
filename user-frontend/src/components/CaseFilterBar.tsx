'use client';

import React, { useState, useEffect, Fragment } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { Select } from '@headlessui/react';
import CATEGORY_OPTIONS from '@/constants/categoryOptions';
import REGION_OPTIONS from '@/constants/regionOptions';
import { SUBJECT_MAP } from '@/constants/subjectOptions';
import { TEACHING_MODE_OPTIONS, shouldShowRegionForMode } from '@/constants/teachingModeOptions';
import PRICE_OPTIONS from '@/constants/priceOptions';
import SearchTabBar from './SearchTabBar';

interface FilterState {
  target: string;
  category: string;
  subCategory: string;
  subjects: string[];
  mode: string[];
  regions: string[];
  subRegions: string[];
  priceRange: string; // 改為字符串，使用預設選項
}

const TARGET_OPTIONS = [
  { value: 'find-tutor', label: '導師列表' },
  { value: 'find-student', label: '補習個案' }
];

interface RegionOption {
  value: string;
  label: string;
  regions: { value: string; label: string; }[];
}

interface Option {
  value: string;
  label: string;
}

interface CaseFilterBarProps {
  onFilter?: (filters: any) => void;
  fetchUrl: string;
  currentTarget?: string;
  onTargetChange?: (target: string) => void;
}

const REGION_OPTIONS_FULL = REGION_OPTIONS;

const CaseFilterBar: React.FC<CaseFilterBarProps> = ({ onFilter, fetchUrl, currentTarget, onTargetChange }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [filters, setFilters] = useState<FilterState>({
    target: '',
    category: 'unlimited', // 預設為不限
    subCategory: '', // 預設為請選擇
    subjects: [],
    mode: [], // 預設為空數組
    regions: ['unlimited'], // 預設為不限，改為單選
    subRegions: ['unlimited'], // 預設為不限
    priceRange: 'unlimited' // 預設為不限
  });

  const isStudentCase = fetchUrl.includes('student');
  
  // 根據當前頁面決定顏色方案
  const getColorScheme = () => {
    // 如果有傳入currentTarget，根據target決定顏色
    if (currentTarget) {
      if (currentTarget === 'tutors') {
        // 導師列表：黃色主題
        return {
          text: 'text-yellow-700',
          border: 'border-yellow-200',
          bg: 'bg-yellow-50',
          button: 'bg-yellow-500 hover:bg-yellow-600'
        };
      } else if (currentTarget === 'cases') {
        // 補習個案：藍色主題
        return {
          text: 'text-blue-700',
          border: 'border-blue-200',
          bg: 'bg-blue-50',
          button: 'bg-blue-500 hover:bg-blue-600'
        };
      }
    }
    
    if (pathname === '/') {
      // 首頁：銀灰色，與 Topbar 一致
      return {
        text: 'text-gray-700',
        border: 'border-gray-300',
        bg: 'bg-gradient-to-b from-white to-gray-100',
        button: 'bg-gray-500 hover:bg-gray-600'
      };
    } else if (pathname === '/tutors') {
      // 導師列表頁：黃色主題
      return {
        text: 'text-yellow-700',
        border: 'border-yellow-200',
        bg: 'bg-yellow-50',
        button: 'bg-yellow-500 hover:bg-yellow-600'
      };
    } else if (pathname === '/find-student-cases') {
      // 找學生案例頁：藍色主題
      return {
        text: 'text-blue-700',
        border: 'border-blue-200',
        bg: 'bg-blue-50',
        button: 'bg-blue-500 hover:bg-blue-600'
      };
    } else if (pathname === '/find-tutor-cases') {
      // 個案頁：保持藍色主題
      return {
        text: 'text-blue-600',
        border: 'border-blue-200',
        bg: 'bg-blue-50',
        button: 'bg-blue-500 hover:bg-blue-600'
      };
    } else {
      // 其他頁面：根據 fetchUrl 判斷
      return isStudentCase ? {
        text: 'text-blue-600',
        border: 'border-blue-200',
        bg: 'bg-blue-50',
        button: 'bg-blue-500 hover:bg-blue-600'
      } : {
        text: 'text-blue-600',
        border: 'border-blue-200',
        bg: 'bg-blue-50',
        button: 'bg-blue-500 hover:bg-blue-600'
      };
    }
  };

  const colorScheme = getColorScheme();

  // 根據當前頁面決定是否顯示目標選擇和自動設定目標值
  const shouldShowTarget = () => {
    // 在 /tutors 和 /find-student-cases 頁面不顯示 tab
    if (pathname === '/tutors' || pathname === '/find-student-cases') {
      return false;
    }
    return false; // 隱藏目標選單，改為自動設定
  };

  const getAutoTarget = () => {
    // 如果有傳入currentTarget，優先使用
    if (currentTarget) {
      return currentTarget === 'tutors' ? 'find-tutor' : 'find-student';
    }
    
    if (pathname === '/tutors') {
      return 'find-tutor'; // 導師列表頁面，默認目標是"導師列表"
    } else if (pathname === '/find-student-cases') {
      return 'find-student'; // 補習個案頁面，默認目標是"補習個案"
    } else if (pathname === '/find-tutor-cases') {
      return 'find-tutor'; // 導師要收學生
    }
    return 'find-tutor'; // 首頁預設為導師列表
  };

  // 從 URL 參數初始化篩選條件
  useEffect(() => {
    const autoTarget = getAutoTarget(); // 根據 pathname 判斷正確目標
    const target = searchParams.get('target') || autoTarget;

    setFilters({
      target,
      category: searchParams.get('category') || 'unlimited',
      subCategory: searchParams.get('subCategory') || 'unlimited',
      subjects: searchParams.getAll('subjects').length > 0 ? searchParams.getAll('subjects') : [],
      mode: searchParams.getAll('mode').length > 0 ? searchParams.getAll('mode') : ['unlimited'],
      regions: searchParams.getAll('regions').length > 0 ? searchParams.getAll('regions') : ['unlimited'],
      subRegions: searchParams.getAll('subRegions').length > 0 ? searchParams.getAll('subRegions') : ['unlimited'],
      priceRange: searchParams.get('priceRange') || 'unlimited'
    });
  }, [searchParams, pathname]);

  // 同步 filters.target 與 currentTarget
  useEffect(() => {
    if (currentTarget) {
      setFilters(prev => ({
        ...prev,
        target: currentTarget === 'tutors' ? 'find-tutor' : 'find-student'
      }));
    }
  }, [currentTarget]);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubjectChange = (subject: string) => {
    setFilters(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleRegionChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      regions: [value], // 改為單選
      subRegions: value === 'unlimited' ? ['unlimited'] : []
    }));
  };

  const handleSubRegionChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      subRegions: prev.subRegions.includes(value)
        ? prev.subRegions.filter(r => r !== value)
        : [...prev.subRegions, value]
    }));
  };

  const handlePriceChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      priceRange: value
    }));
  };

  const handleModeChange = (mode: string) => {
    setFilters(prev => ({
      ...prev,
      mode: prev.mode.includes(mode)
        ? prev.mode.filter(m => m !== mode)
        : [...prev.mode, mode]
    }));
  };

  const handleFilter = () => {
    const params = new URLSearchParams();
    
    // 課程分類
    if (filters.category && filters.category !== 'unlimited') {
      params.set('category', filters.category);
    }

    // 子分類
    if (filters.subCategory && filters.subCategory !== 'unlimited') {
      params.set('subCategory', filters.subCategory);
    }

    // 科目
    if (filters.subjects.length > 0) {
      filters.subjects.forEach(subject => params.append('subjects', subject));
    } else {
      // 若冇揀科目 → 自動傳出該子分類下所有科目
      const category = CATEGORY_OPTIONS.find(c => c.value === filters.category);
      if (category) {
        let subjects: { value: string; label: string }[] = [];
        
        if (category.subCategories && filters.subCategory && filters.subCategory !== '' && filters.subCategory !== 'unlimited') {
          const subCategory = category.subCategories.find(sc => sc.value === filters.subCategory);
          subjects = subCategory?.subjects || [];
        } else if (category.subCategories && (filters.subCategory === 'unlimited' || filters.subCategory === '')) {
          subjects = category.subCategories.flatMap(sc => sc.subjects || []);
        } else {
          subjects = category.subjects || [];
        }
        
        subjects.forEach(subject => params.append('subjects', subject.value));
      }
    }

    // 其他篩選條件
    filters.mode.forEach(mode => {
      params.append('mode', mode);
    });
    filters.regions.forEach(region => {
      if (region !== 'unlimited') params.append('regions', region);
    });
    filters.subRegions.forEach(subRegion => {
      if (subRegion !== 'unlimited') params.append('subRegions', subRegion);
    });
    if (filters.priceRange && filters.priceRange !== 'unlimited') params.set('priceRange', filters.priceRange);

    // 直接用 usePathname 判斷
    const isTutorPage = pathname === "/tutors";
    const targetRoute = isTutorPage ? "/tutors" : "/find-student-cases";
    router.push(params.toString() ? `${targetRoute}?${params.toString()}` : targetRoute);
    if (onFilter) {
      onFilter(filters);
    }
  };

  const handleReset = () => {
    const autoTarget = getAutoTarget(); // 保持自動設定的目標值
    setFilters({
      target: autoTarget,
      category: 'unlimited',
      subCategory: 'unlimited',
      subjects: [],
      mode: ['unlimited'],
      regions: ['unlimited'],
      subRegions: ['unlimited'],
      priceRange: 'unlimited'
    });
    // 直接用 usePathname 判斷
    const isTutorPage = pathname === "/tutors";
    const targetRoute = isTutorPage ? "/tutors" : "/find-student-cases";
    router.push(targetRoute);
    if (onFilter) {
      onFilter({});
    }
  };

  const getSelectedSubRegions = () => {
    if (!filters.regions.length || filters.regions.includes('unlimited')) {
      return [{ value: 'unlimited', label: '不限' }];
    }
    
    const selectedRegions = REGION_OPTIONS.filter(region => 
      filters.regions.includes(region.value)
    );
    
    // Get all sub-regions from selected regions, not just the ones already selected
    const subRegions = selectedRegions.flatMap(region => region.regions);
    
    return [
      { value: 'unlimited', label: '不限' },
      ...subRegions
    ];
  };

  const getCategorySubjects = () => {
    const category = CATEGORY_OPTIONS.find(c => c.value === filters.category);
    if (!category) return [];
    
    if (category.subCategories && filters.subCategory) {
      const subCategory = category.subCategories.find(sc => sc.value === filters.subCategory);
      return subCategory?.subjects || [];
    }
    
    return category.subjects || [];
  };

  const handleSubCategoryChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      subCategory: value,
      subjects: [] // 清空科目選擇
    }));
  };

  const getSubOptions = () => {
    const category = CATEGORY_OPTIONS.find(c => c.value === filters.category);
    const subOptions = category?.subCategories || [];
    return [
      { value: '', label: '請選擇' },
      ...subOptions
    ];
  };

  const getSubjectOptions = () => {
    const category = CATEGORY_OPTIONS.find(c => c.value === filters.category);
    if (!category) return [{ value: '', label: '請選擇' }];
    
    let subjects: { value: string; label: string }[] = [];
    
    if (category.subCategories && filters.subCategory && filters.subCategory !== '' && filters.subCategory !== 'unlimited') {
      const subCategory = category.subCategories.find(sc => sc.value === filters.subCategory);
      subjects = subCategory?.subjects || [];
    } else if (category.subCategories && (filters.subCategory === 'unlimited' || filters.subCategory === '')) {
      // 如果選擇"不限"子分類或"請選擇"，顯示所有子分類的科目
      subjects = category.subCategories.flatMap(sc => sc.subjects || []);
    } else {
      subjects = category.subjects || [];
    }
    
    return [
      { value: '', label: '請選擇' },
      ...subjects
    ];
  };

  const shouldShowSubjects = () => {
    const category = CATEGORY_OPTIONS.find(c => c.value === filters.category);
    if (!category || category.value === 'unlimited') return false;

    // 只有"中小學教育"有子分類，其他分類直接顯示科目
    if (category.value === 'primary-secondary') {
      // 如果有子分類，需要選擇子分類後才顯示科目
      return filters.subCategory && filters.subCategory !== '';
    }

    // 其他分類直接顯示科目
    return category.subjects && category.subjects.length > 0;
  };

  // 獲取已選選項的顯示文字
  const getSelectedOptions = () => {
    const selected: { key: string; label: string; value: string }[] = [];
    
    // 目標 - 不顯示在已選項目中
    // if (filters.target) {
    //   const targetOption = TARGET_OPTIONS.find(t => t.value === filters.target);
    //   if (targetOption) {
    //     selected.push({ key: 'target', label: targetOption.label, value: filters.target });
    //   }
    // }
    
    // 分類 - 不顯示"不限"
    if (filters.category && filters.category !== 'unlimited') {
      const categoryOption = CATEGORY_OPTIONS.find(c => c.value === filters.category);
      if (categoryOption) {
        selected.push({ key: 'category', label: categoryOption.label, value: filters.category });
      }
    }
    
    // 子分類 - 不顯示"不限"
    if (filters.subCategory && filters.subCategory !== 'unlimited') {
      const subOptions = getSubOptions();
      const subOption = subOptions.find(s => s.value === filters.subCategory);
      if (subOption) {
        selected.push({ key: 'subCategory', label: subOption.label, value: filters.subCategory });
      }
    }
    
    // 科目
    filters.subjects.forEach(subject => {
      const subjectOptions = getSubjectOptions();
      const subjectOption = subjectOptions.find(s => s.value === subject);
      if (subjectOption) {
        selected.push({ key: 'subjects', label: subjectOption.label, value: subject });
      }
    });
    
    // 教學模式
    filters.mode.forEach(mode => {
      const modeOption = TEACHING_MODE_OPTIONS.find(m => m.value === mode);
      if (modeOption) {
        selected.push({ key: 'mode', label: modeOption.label, value: mode });
      } else {
        // 檢查子分類
        TEACHING_MODE_OPTIONS.forEach(m => {
          const subMode = m.subCategories.find(sm => sm.value === mode);
          if (subMode) {
            selected.push({ key: 'mode', label: subMode.label, value: mode });
          }
        });
      }
    });
    
    // 地區 - 不顯示"不限"
    filters.regions.forEach(region => {
      if (region === 'unlimited') return;
      const regionOption = REGION_OPTIONS.find(r => r.value === region);
      if (regionOption) {
        selected.push({ key: 'regions', label: regionOption.label, value: region });
      }
    });
    
    // 子地區 - 不顯示"不限"
    filters.subRegions.forEach(subRegion => {
      if (subRegion === 'unlimited') return;
      const subRegionOption = getSelectedSubRegions().find(sr => sr.value === subRegion);
      if (subRegionOption) {
        selected.push({ key: 'subRegions', label: subRegionOption.label, value: subRegion });
      }
    });
    
    // 價格範圍 - 不顯示"不限"
    if (filters.priceRange && filters.priceRange !== 'unlimited') {
      const priceOption = PRICE_OPTIONS.find(p => p.value === filters.priceRange);
      if (priceOption) {
        selected.push({ key: 'priceRange', label: priceOption.label, value: filters.priceRange });
      }
    }
    
    return selected;
  };

  // 移除已選選項
  const removeSelectedOption = (key: string, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      switch (key) {
        case 'category':
          newFilters.category = 'unlimited';
          newFilters.subCategory = 'unlimited';
          newFilters.subjects = [];
          break;
        case 'subCategory':
          newFilters.subCategory = 'unlimited';
          newFilters.subjects = [];
          break;
        case 'subjects':
          newFilters.subjects = prev.subjects.filter(s => s !== value);
          break;
        case 'mode':
          newFilters.mode = prev.mode.filter(m => m !== value);
          break;
        case 'regions':
          newFilters.regions = ['unlimited'];
          newFilters.subRegions = ['unlimited'];
          break;
        case 'subRegions':
          newFilters.subRegions = prev.subRegions.filter(sr => sr !== value);
          if (newFilters.subRegions.length === 0) {
            newFilters.subRegions = ['unlimited'];
          }
          break;
        case 'priceRange':
          newFilters.priceRange = 'unlimited';
          break;
      }
      
      return newFilters;
    });
  };

  // 清除所有選項
  const clearAllOptions = () => {
    const autoTarget = getAutoTarget(); // 保持自動設定的目標值
    setFilters({
      target: autoTarget,
      category: 'unlimited',
      subCategory: '',
      subjects: [],
      mode: [],
      regions: ['unlimited'],
      subRegions: ['unlimited'],
      priceRange: 'unlimited'
    });
  };

  const selectedOptions = getSelectedOptions();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 整合的資料夾風格搜尋欄 */}
      <div className={`relative border ${colorScheme.border} ${colorScheme.bg} rounded-b-xl shadow-lg`}>
        {/* Tabs 區域 - 貼合主體左上角，只在首頁顯示 */}
        {(pathname === '/' || pathname === '') && (
          <div className="absolute -top-12 left-0 z-10">
            <SearchTabBar 
              currentTarget={currentTarget}
              onTabChange={onTargetChange}
              className=""
            />
          </div>
        )}
        
        {/* 主體內容 */}
        <div className="p-6 max-sm:p-4 max-[700px]:p-5 pt-8">
          <div className="space-y-4 max-sm:space-y-3 max-[700px]:space-y-4">
            {/* 已選選項顯示區域 */}
            {selectedOptions.length > 0 && (
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700">已選選項</h3>
                  <button
                    onClick={clearAllOptions}
                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                  >
                    清除全部
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedOptions.map((option, index) => (
                    <div
                      key={`${option.key}-${option.value}`}
                      className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      <span>{option.label}</span>
                      <button
                        onClick={() => removeSelectedOption(option.key, option.value)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 篩選選項 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-sm:gap-3 max-[700px]:grid-cols-2 max-[700px]:gap-4">
              {/* 分類選擇 */}
              <div className="space-y-2 max-sm:space-y-1 max-[700px]:space-y-2">
                <label className="block text-sm font-medium text-gray-700 max-sm:text-xs max-[700px]:text-sm">課程分類</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md max-sm:px-2 max-sm:py-1 max-sm:text-xs max-[700px]:px-3 max-[700px]:py-2 max-[700px]:text-sm"
                >
                  {CATEGORY_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 子分類選擇 - 只在選擇"中小學教育"後顯示 */}
              {filters.category === 'primary-secondary' && getSubOptions().length > 0 && (
                <div className="space-y-2 max-sm:space-y-1 max-[700px]:space-y-2">
                  <label className="block text-sm font-medium text-gray-700 max-sm:text-xs max-[700px]:text-sm">子分類</label>
                  <select
                    value={filters.subCategory}
                    onChange={(e) => handleSubCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md max-sm:px-2 max-sm:py-1 max-sm:text-xs max-[700px]:px-3 max-[700px]:py-2 max-[700px]:text-sm"
                  >
                    {getSubOptions().map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 科目選擇 - 只在選擇課程分類後顯示 */}
              {filters.category !== 'unlimited' && shouldShowSubjects() && (
                <div className="space-y-2 max-sm:space-y-1 max-[700px]:space-y-2">
                  <label className="block text-sm font-medium text-gray-700 max-sm:text-xs max-[700px]:text-sm">科目</label>
                  <Listbox
                    value={filters.subjects}
                    onChange={(value) => handleFilterChange('subjects', value)}
                    multiple
                  >
                    <div className="relative">
                      <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left border focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm max-sm:py-1 max-sm:text-xs">
                        <span className="block truncate">
                          {filters.subjects.length === 0
                            ? '不限'
                            : filters.subjects.length === 1
                            ? getSubjectOptions().find(s => s.value === filters.subjects[0])?.label
                            : `已選擇 ${filters.subjects.length} 個科目`}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronUpDownIcon
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </span>
                      </Listbox.Button>
                      <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                          {getSubjectOptions().map((subject) => (
                            <Listbox.Option
                              key={subject.value}
                              className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                  active ? 'bg-amber-100 text-amber-900' : 'text-gray-900'
                                }`
                              }
                              value={subject.value}
                            >
                              {({ selected }) => (
                                <>
                                  <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                    {subject.label}
                                  </span>
                                  {selected ? (
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </Listbox>
                </div>
              )}

              {/* 教學模式選擇 */}
              <div className="space-y-2 max-sm:space-y-1 max-[700px]:space-y-2">
                <label className="block text-sm font-medium text-gray-700 max-sm:text-xs max-[700px]:text-sm">教學模式</label>
                <Listbox
                  value={filters.mode}
                  onChange={(value) => handleFilterChange('mode', value)}
                  multiple
                >
                  <div className="relative">
                    <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left border focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm max-sm:py-1 max-sm:text-xs">
                      <span className="block truncate">
                        {filters.mode.length === 0 || (filters.mode.length === 1 && filters.mode[0] === 'unlimited')
                          ? '不限'
                          : filters.mode.length === 1
                          ? TEACHING_MODE_OPTIONS.find(m => m.value === filters.mode[0])?.label || 
                            TEACHING_MODE_OPTIONS.flatMap(m => m.subCategories).find(sm => sm.value === filters.mode[0])?.label
                          : `已選擇 ${filters.mode.filter(m => m !== 'unlimited').length} 個模式`}
                      </span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDownIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </span>
                    </Listbox.Button>
                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {TEACHING_MODE_OPTIONS.map((mode) => (
                          <Listbox.Option
                            key={mode.value}
                            className={({ active }) =>
                              `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                active ? 'bg-amber-100 text-amber-900' : 'text-gray-900'
                              }`
                            }
                            value={mode.value}
                          >
                            {({ selected }) => (
                              <>
                                <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                  {mode.label}
                                </span>
                                {selected ? (
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                  </span>
                                ) : null}
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                        {filters.mode.includes('in-person') && TEACHING_MODE_OPTIONS.find(m => m.value === 'in-person')?.subCategories.map((subMode) => (
                          <Listbox.Option
                            key={subMode.value}
                            className={({ active }) =>
                              `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                active ? 'bg-amber-100 text-amber-900' : 'text-gray-900'
                              }`
                            }
                            value={subMode.value}
                          >
                            {({ selected }) => (
                              <>
                                <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'} ml-4`}>
                                  └ {subMode.label}
                                </span>
                                {selected ? (
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                  </span>
                                ) : null}
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Transition>
                  </div>
                </Listbox>
              </div>

              {/* 地區選擇 */}
              <div className="space-y-2 max-sm:space-y-1 max-[700px]:space-y-2">
                <label className="block text-sm font-medium text-gray-700 max-sm:text-xs max-[700px]:text-sm">地區</label>
                <select
                  value={filters.regions[0] || 'unlimited'}
                  onChange={(e) => handleRegionChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md max-sm:px-2 max-sm:py-1 max-sm:text-xs max-[700px]:px-3 max-[700px]:py-2 max-[700px]:text-sm"
                >
                  {REGION_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 子地區選擇 */}
              {filters.regions.length > 0 && filters.regions[0] !== 'unlimited' && (
                <div className="space-y-2 max-sm:space-y-1 max-[700px]:space-y-2">
                  <label className="block text-sm font-medium text-gray-700 max-sm:text-xs max-[700px]:text-sm">子地區</label>
                  <Listbox
                    value={filters.subRegions}
                    onChange={(value) => handleFilterChange('subRegions', value)}
                    multiple
                  >
                    <div className="relative">
                      <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left border focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm max-sm:py-1 max-sm:text-xs">
                        <span className="block truncate">
                          {filters.subRegions.length === 0 || (filters.subRegions.length === 1 && filters.subRegions[0] === 'unlimited')
                            ? '不限'
                            : filters.subRegions.length === 1
                            ? getSelectedSubRegions().find(sr => sr.value === filters.subRegions[0])?.label
                            : `已選擇 ${filters.subRegions.filter(sr => sr !== 'unlimited').length} 個子地區`}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronUpDownIcon
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </span>
                      </Listbox.Button>
                      <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                          {getSelectedSubRegions().map((subRegion) => (
                            <Listbox.Option
                              key={subRegion.value}
                              className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                  active ? 'bg-amber-100 text-amber-900' : 'text-gray-900'
                                }`
                              }
                              value={subRegion.value}
                            >
                              {({ selected }) => (
                                <>
                                  <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                    {subRegion.label}
                                  </span>
                                  {selected ? (
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </Listbox>
                </div>
              )}

              {/* 每堂堂費 */}
              <div className="space-y-2 max-sm:space-y-1 max-[700px]:space-y-2">
                <label className="block text-sm font-medium text-gray-700 max-sm:text-xs max-[700px]:text-sm">每堂堂費</label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md max-sm:px-2 max-sm:py-1 max-sm:text-xs max-[700px]:px-3 max-[700px]:py-2 max-[700px]:text-sm"
                >
                  {PRICE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>


            </div>
          </div>

          {/* 按鈕組 */}
          <div className="flex justify-end space-x-4 max-sm:space-x-2 max-sm:flex-col max-sm:items-stretch max-[700px]:space-x-4 max-[700px]:flex-row max-[700px]:justify-end mt-6">
            <button
              onClick={handleReset}
              className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 max-sm:px-4 max-sm:py-2 max-sm:text-sm max-[700px]:px-6 max-[700px]:py-2 max-[700px]:text-sm"
            >
              重置
            </button>
            <button
              onClick={handleFilter}
              className={`px-6 py-2 text-white rounded-lg ${colorScheme.button} max-sm:px-4 max-sm:py-2 max-sm:text-sm max-[700px]:px-6 max-[700px]:py-2 max-[700px]:text-sm`}
            >
              篩選
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseFilterBar; 