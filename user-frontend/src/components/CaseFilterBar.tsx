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

interface FilterState {
  target: string;
  category: string;
  subCategory: string;
  subjects: string[];
  mode: string[];
  regions: string[];
  subRegions: string[];
  priceRange: [number, number];
  featured: boolean;
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
}

const REGION_OPTIONS_FULL = REGION_OPTIONS;

const CaseFilterBar: React.FC<CaseFilterBarProps> = ({ onFilter, fetchUrl }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [filters, setFilters] = useState<FilterState>({
    target: '',
    category: '',
    subCategory: '',
    subjects: [],
    mode: [],
    regions: [],
    subRegions: [],
    priceRange: [0, 1000],
    featured: false
  });

  const isStudentCase = fetchUrl.includes('student');
  
  // 根據頁面路徑設定顏色方案
  const getColorScheme = () => {
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
      // 找學生案例頁：黃色主題（顯示導師）
      return {
        text: 'text-yellow-700',
        border: 'border-yellow-200',
        bg: 'bg-yellow-50',
        button: 'bg-yellow-500 hover:bg-yellow-600'
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
        text: 'text-yellow-600',
        border: 'border-yellow-200',
        bg: 'bg-yellow-50',
        button: 'bg-yellow-500 hover:bg-yellow-600'
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
    // 首頁顯示目標選擇
    if (pathname === '/') {
      return true;
    }
    // 其他頁面隱藏目標選擇
    return false;
  };

  const getAutoTarget = () => {
    // 根據頁面路徑自動設定目標
    if (pathname === '/tutors') {
      return 'find-tutor';
    } else if (pathname === '/find-tutor-cases') {
      return 'find-student';
    }
    // 首頁或其他頁面返回空值，讓用戶選擇
    return '';
  };

  // 從 URL 參數初始化篩選條件
  useEffect(() => {
    const autoTarget = getAutoTarget();
    const target = searchParams.get('target') || autoTarget;
    const category = searchParams.get('category') || '';
    const subCategory = searchParams.get('subCategory') || '';
    const subjects = searchParams.getAll('subjects');
    const mode = searchParams.getAll('mode');
    const regions = searchParams.getAll('regions');
    const subRegions = searchParams.getAll('subRegions');
    const priceMin = searchParams.get('priceMin') || '';
    const priceMax = searchParams.get('priceMax') || '';

    setFilters({
      target,
      category,
      subCategory,
      subjects,
      mode,
      regions,
      subRegions,
      priceRange: [Number(priceMin) || 0, Number(priceMax) || 1000],
      featured: false
    });
  }, [searchParams, pathname]);

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
      regions: prev.regions.includes(value)
        ? prev.regions.filter(r => r !== value)
        : [...prev.regions, value],
      subRegions: prev.regions.includes(value) ? prev.subRegions : []
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

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const numValue = parseInt(value) || 0;
    if (numValue < 0) return; // 防止負數

    if (type === 'min') {
      if (filters.priceRange[1] && numValue > filters.priceRange[1]) return; // 最小值不能大於最大值
      setFilters(prev => ({
        ...prev,
        priceRange: [numValue, prev.priceRange[1]]
      }));
    } else {
      if (numValue < filters.priceRange[0]) return; // 最大值不能小於最小值
      setFilters(prev => ({
        ...prev,
        priceRange: [prev.priceRange[0], numValue]
      }));
    }
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
    
    if (filters.target) params.set('target', filters.target);
    if (filters.category) params.set('category', filters.category);
    if (filters.subCategory) params.set('subCategory', filters.subCategory);
    filters.subjects.forEach(subject => params.append('subjects', subject));
    filters.mode.forEach(mode => params.append('mode', mode));
    filters.regions.forEach(region => params.append('regions', region));
    filters.subRegions.forEach(subRegion => params.append('subRegions', subRegion));
    if (filters.priceRange[0] > 0) params.set('priceMin', filters.priceRange[0].toString());
    if (filters.priceRange[1] < 1000) params.set('priceMax', filters.priceRange[1].toString());
    if (filters.featured) params.set('featured', 'true');

    // 根據 target 決定導向頁面
    let targetPath = pathname;
    if (filters.target === 'find-tutor') {
      targetPath = '/find-student-cases';
    } else if (filters.target === 'find-student') {
      targetPath = '/find-tutor-cases';
    }

    const queryString = params.toString();
    const newUrl = queryString ? `${targetPath}?${queryString}` : targetPath;
    
    router.push(newUrl);
    
    if (onFilter) {
      onFilter(filters);
    }
  };

  const handleReset = () => {
    setFilters({
      target: '',
      category: '',
      subCategory: '',
      subjects: [],
      mode: [],
      regions: [],
      subRegions: [],
      priceRange: [0, 1000],
      featured: false
    });
    
    router.push(pathname);
    
    if (onFilter) {
      onFilter({});
    }
  };

  const getSelectedSubRegions = () => {
    if (!filters.regions.length) return [];
    
    const selectedRegions = REGION_OPTIONS.filter(region => 
      filters.regions.includes(region.value)
    );
    
    return selectedRegions.flatMap(region => 
      region.regions.filter(subRegion => 
        filters.subRegions.includes(subRegion.value)
      )
    );
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
    return category?.subCategories || [];
  };

  const getSubjectOptions = () => {
    const category = CATEGORY_OPTIONS.find(c => c.value === filters.category);
    if (!category) return [];
    
    if (category.subCategories && filters.subCategory) {
      const subCategory = category.subCategories.find(sc => sc.value === filters.subCategory);
      return subCategory?.subjects || [];
    }
    
    return category.subjects || [];
  };

  const shouldShowSubjects = () => {
    const category = CATEGORY_OPTIONS.find(c => c.value === filters.category);
    if (!category) return false;

    // 如果有子分類，需要選擇子分類後才顯示科目
    if (category.subCategories) {
      return filters.subCategory && filters.subCategory.length > 0;
    }

    // 如果沒有子分類但有科目，直接顯示科目
    return category.subjects && category.subjects.length > 0;
  };

  // 獲取已選選項的顯示文字
  const getSelectedOptions = () => {
    const selected: { key: string; label: string; value: string }[] = [];
    
    // 目標
    if (filters.target) {
      const targetOption = TARGET_OPTIONS.find(t => t.value === filters.target);
      if (targetOption) {
        selected.push({ key: 'target', label: targetOption.label, value: filters.target });
      }
    }
    
    // 分類
    if (filters.category) {
      const categoryOption = CATEGORY_OPTIONS.find(c => c.value === filters.category);
      if (categoryOption) {
        selected.push({ key: 'category', label: categoryOption.label, value: filters.category });
      }
    }
    
    // 子分類
    if (filters.subCategory) {
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
    
    // 地區
    filters.regions.forEach(region => {
      const regionOption = REGION_OPTIONS.find(r => r.value === region);
      if (regionOption) {
        selected.push({ key: 'regions', label: regionOption.label, value: region });
      }
    });
    
    // 子地區
    filters.subRegions.forEach(subRegion => {
      const subRegionOption = getSelectedSubRegions().find(sr => sr.value === subRegion);
      if (subRegionOption) {
        selected.push({ key: 'subRegions', label: subRegionOption.label, value: subRegion });
      }
    });
    
    return selected;
  };

  // 移除已選選項
  const removeSelectedOption = (key: string, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      switch (key) {
        case 'target':
          newFilters.target = '';
          break;
        case 'category':
          newFilters.category = '';
          newFilters.subCategory = '';
          newFilters.subjects = [];
          break;
        case 'subCategory':
          newFilters.subCategory = '';
          newFilters.subjects = [];
          break;
        case 'subjects':
          newFilters.subjects = prev.subjects.filter(s => s !== value);
          break;
        case 'mode':
          newFilters.mode = prev.mode.filter(m => m !== value);
          break;
        case 'regions':
          newFilters.regions = prev.regions.filter(r => r !== value);
          // 如果移除的地區有子地區被選中，也要清空子地區
          const removedRegion = REGION_OPTIONS.find(r => r.value === value);
          if (removedRegion) {
            const removedSubRegions = removedRegion.regions.map(sr => sr.value);
            newFilters.subRegions = prev.subRegions.filter(sr => !removedSubRegions.includes(sr));
          }
          break;
        case 'subRegions':
          newFilters.subRegions = prev.subRegions.filter(sr => sr !== value);
          break;
      }
      
      return newFilters;
    });
  };

  // 清除所有選項
  const clearAllOptions = () => {
    setFilters({
      target: '',
      category: '',
      subCategory: '',
      subjects: [],
      mode: [],
      regions: [],
      subRegions: [],
      priceRange: [0, 1000],
      featured: false
    });
  };

  const selectedOptions = getSelectedOptions();

  return (
    <div className={`rounded-xl border ${colorScheme.border} ${colorScheme.bg} p-6 max-sm:p-4 max-[700px]:p-5`}>
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
          {/* 目標選擇 */}
          {shouldShowTarget() && (
            <div className="space-y-2 max-sm:space-y-1 max-[700px]:space-y-2">
              <label className="block text-sm font-medium text-gray-700 max-sm:text-xs max-[700px]:text-sm">目標</label>
              <select
                value={filters.target}
                onChange={(e) => handleFilterChange('target', e.target.value)}
                className="w-full px-3 py-2 border rounded-md max-sm:px-2 max-sm:py-1 max-sm:text-xs max-[700px]:px-3 max-[700px]:py-2 max-[700px]:text-sm"
              >
                <option value="">請選擇</option>
                {TARGET_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 分類選擇 */}
          <div className="space-y-2 max-sm:space-y-1 max-[700px]:space-y-2">
            <label className="block text-sm font-medium text-gray-700 max-sm:text-xs max-[700px]:text-sm">分類</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border rounded-md max-sm:px-2 max-sm:py-1 max-sm:text-xs max-[700px]:px-3 max-[700px]:py-2 max-[700px]:text-sm"
            >
              <option value="">請選擇</option>
              {CATEGORY_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 子分類選擇 */}
          {filters.category && getSubOptions().length > 0 && (
            <div className="space-y-2 max-sm:space-y-1 max-[700px]:space-y-2">
              <label className="block text-sm font-medium text-gray-700 max-sm:text-xs max-[700px]:text-sm">子分類</label>
              <select
                value={filters.subCategory}
                onChange={(e) => handleSubCategoryChange(e.target.value)}
                className="w-full px-3 py-2 border rounded-md max-sm:px-2 max-sm:py-1 max-sm:text-xs max-[700px]:px-3 max-[700px]:py-2 max-[700px]:text-sm"
              >
                <option value="">請選擇</option>
                {getSubOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 科目選擇 - 改為下拉式多選 */}
          {shouldShowSubjects() && (
            <div className="space-y-2 max-sm:space-y-1 max-[700px]:space-y-2">
              <label className="block text-sm font-medium text-gray-700 max-sm:text-xs max-[700px]:text-sm">科目</label>
              <Listbox
                value={filters.subjects}
                onChange={(value) => handleFilterChange('subjects', value)}
                multiple
              >
                <div className="relative">
                  <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left border focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                    <span className="block truncate">
                      {filters.subjects.length === 0
                        ? '請選擇科目'
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

          {/* 教學模式選擇 - 改為下拉式多選 */}
          <div className="space-y-2 max-sm:space-y-1 max-[700px]:space-y-2">
            <label className="block text-sm font-medium text-gray-700 max-sm:text-xs max-[700px]:text-sm">教學模式</label>
            <Listbox
              value={filters.mode}
              onChange={(value) => handleFilterChange('mode', value)}
              multiple
            >
              <div className="relative">
                <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left border focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                  <span className="block truncate">
                    {filters.mode.length === 0
                      ? '請選擇教學模式'
                      : filters.mode.length === 1
                      ? TEACHING_MODE_OPTIONS.find(m => m.value === filters.mode[0])?.label || 
                        TEACHING_MODE_OPTIONS.flatMap(m => m.subCategories).find(sm => sm.value === filters.mode[0])?.label
                      : `已選擇 ${filters.mode.length} 個模式`}
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

          {/* 地區選擇 - 改為多選 */}
          {filters.mode.some(mode => shouldShowRegionForMode(mode)) && (
            <div className="space-y-2 max-sm:space-y-1 max-[700px]:space-y-2">
              <label className="block text-sm font-medium text-gray-700 max-sm:text-xs max-[700px]:text-sm">地區</label>
              <Listbox
                value={filters.regions}
                onChange={(value) => handleFilterChange('regions', value)}
                multiple
              >
                <div className="relative">
                  <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left border focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                    <span className="block truncate">
                      {filters.regions.length === 0
                        ? '請選擇地區'
                        : filters.regions.length === 1
                        ? REGION_OPTIONS.find(r => r.value === filters.regions[0])?.label
                        : `已選擇 ${filters.regions.length} 個地區`}
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
                      {REGION_OPTIONS.map((region) => (
                        <Listbox.Option
                          key={region.value}
                          className={({ active }) =>
                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                              active ? 'bg-amber-100 text-amber-900' : 'text-gray-900'
                            }`
                          }
                          value={region.value}
                        >
                          {({ selected }) => (
                            <>
                              <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                {region.label}
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

          {/* 子地區選擇 - 改為多選 */}
          {filters.mode.some(mode => shouldShowRegionForMode(mode)) && filters.regions.length > 0 && (
            <div className="space-y-2 max-sm:space-y-1 max-[700px]:space-y-2">
              <label className="block text-sm font-medium text-gray-700 max-sm:text-xs max-[700px]:text-sm">子地區</label>
              <Listbox
                value={filters.subRegions}
                onChange={(value) => handleFilterChange('subRegions', value)}
                multiple
              >
                <div className="relative">
                  <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left border focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                    <span className="block truncate">
                      {filters.subRegions.length === 0
                        ? '請選擇子地區'
                        : filters.subRegions.length === 1
                        ? getSelectedSubRegions().find(sr => sr.value === filters.subRegions[0])?.label
                        : `已選擇 ${filters.subRegions.length} 個子地區`}
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

          {/* 預算範圍 */}
          <div className="space-y-2 max-sm:space-y-1 max-[700px]:space-y-2">
            <label className="block text-sm font-medium text-gray-700 max-sm:text-xs max-[700px]:text-sm">預算範圍</label>
            <div className="flex items-center space-x-2 max-sm:space-x-1 max-[700px]:space-x-2">
              <input
                type="number"
                value={filters.priceRange[0]}
                onChange={(e) => handlePriceChange('min', e.target.value)}
                className="w-24 px-3 py-2 border rounded-md max-sm:w-20 max-sm:px-2 max-sm:py-1 max-sm:text-xs max-[700px]:w-24 max-[700px]:px-3 max-[700px]:py-2 max-[700px]:text-sm"
                placeholder="最低"
              />
              <span className="max-sm:text-xs max-[700px]:text-sm">-</span>
              <input
                type="number"
                value={filters.priceRange[1]}
                onChange={(e) => handlePriceChange('max', e.target.value)}
                className="w-24 px-3 py-2 border rounded-md max-sm:w-20 max-sm:px-2 max-sm:py-1 max-sm:text-xs max-[700px]:w-24 max-[700px]:px-3 max-[700px]:py-2 max-[700px]:text-sm"
                placeholder="最高"
              />
            </div>
          </div>

          {/* 精選個案 */}
          <div className="flex items-center space-x-2 max-sm:space-x-1 max-[700px]:space-x-2">
            <input
              type="checkbox"
              id="featured"
              checked={filters.featured}
              onChange={(e) => handleFilterChange('featured', e.target.checked)}
              className="h-4 w-4 text-blue-600 max-sm:h-3 max-sm:w-3 max-[700px]:h-4 max-[700px]:w-4"
            />
            <label htmlFor="featured" className="text-sm font-medium text-gray-700 max-sm:text-xs max-[700px]:text-sm">
              只顯示精選個案
            </label>
          </div>
        </div>

        {/* 按鈕組 */}
        <div className="flex justify-end space-x-4 max-sm:space-x-2 max-sm:flex-col max-sm:items-stretch max-[700px]:space-x-4 max-[700px]:flex-row max-[700px]:justify-end">
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
  );
};

export default CaseFilterBar; 