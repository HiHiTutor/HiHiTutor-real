'use client';

import React, { useState, useEffect, Fragment } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { Select } from '@headlessui/react';
import { Checkbox } from '@/components/ui/checkbox';
import CATEGORY_OPTIONS from '@/constants/categoryOptions';
import { SUBJECT_MAP } from '@/constants/subjectOptions';
import { TEACHING_MODE_OPTIONS, shouldShowRegionForMode, initializeTeachingModeOptions } from '@/constants/teachingModeOptions';
import PRICE_OPTIONS from '@/constants/priceOptions';
import { REGION_OPTIONS } from '@/constants/regionOptions';
import SearchTabBar from './SearchTabBar';

interface RegionOption {
  value: string;
  label: string;
  regions: { value: string; label: string }[];
}

interface FilterState {
  target: string;
  search: string; // 添加搜尋字段
  category: string;
  subCategory: string[];
  subjects: string[];
  mode: string; // 改為單選
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

// 移除靜態的 REGION_OPTIONS_FULL，改用動態的 regionOptions

const CaseFilterBar: React.FC<CaseFilterBarProps> = ({ onFilter, fetchUrl, currentTarget, onTargetChange }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  // 使用靜態科目選項
  const categoriesLoading = false;
  
  const [filters, setFilters] = useState<FilterState>({
    target: '',
    search: '', // 添加搜尋字段
    category: '', // 預設為空，顯示"請選擇分類"
    subCategory: [], // 預設為空陣列
    subjects: [], // 預設為空陣列
    mode: '', // 預設為空，顯示"請選擇教學模式"
    regions: [''], // 預設為空，需要用戶選擇
    subRegions: [''], // 預設為空
    priceRange: '' // 預設為空，顯示"請選擇堂費"
  });
  
  const [teachingModeOptions, setTeachingModeOptions] = useState<any[]>([]);
  
  // 地區資料狀態 - 使用靜態數據
  const [regionOptions, setRegionOptions] = useState<RegionOption[]>(REGION_OPTIONS);
  const [loadingRegions, setLoadingRegions] = useState(false);

  const isStudentCase = fetchUrl.includes('student');
  
  // 地區選項已使用靜態數據，無需動態載入

  // 初始化教學模式選項
  useEffect(() => {
    const initTeachingModes = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/teaching-modes`);
        if (response.ok) {
          const data = await response.json();
          setTeachingModeOptions(data);
        } else {
          // 如果 API 失敗，使用預設值
        setTeachingModeOptions([
          // 移除"皆可"選項，移除面授子分類
            { 
              value: 'in-person', 
              label: '面授',
              subCategories: []
            },
            { 
              value: 'online', 
              label: '網課',
              subCategories: []
            }
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch teaching mode options:', error);
        // 使用預設值
        setTeachingModeOptions([
          // 移除"皆可"選項，移除面授子分類
          { 
            value: 'in-person', 
            label: '面授',
            subCategories: []
          },
          { 
            value: 'online', 
            label: '網課',
            subCategories: []
          }
        ]);
      }
    };
    
    initTeachingModes();
  }, []);
  
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

    console.log('🔍 URL 參數初始化 - 完整 searchParams:', {
      category: searchParams.get('category'),
      subCategory: searchParams.getAll('subCategory'),
      subjects: searchParams.getAll('subjects'),
      modes: searchParams.getAll('modes'),
      regions: searchParams.getAll('regions'),
      subRegions: searchParams.getAll('subRegions'),
      priceRange: searchParams.get('priceRange'),
      allParams: Object.fromEntries(searchParams.entries())
    });

    const newFilters = {
      target,
      search: searchParams.get('search') || '', // 初始化搜尋字段
      category: searchParams.get('category') || '',
      subCategory: searchParams.getAll('subCategory').length > 0 ? 
        searchParams.getAll('subCategory').filter(cat => cat !== '' && cat !== 'unlimited') : [],
      subjects: searchParams.getAll('subjects').length > 0 ? [...new Set(searchParams.getAll('subjects'))] : [],
      mode: searchParams.getAll('modes').length > 0 ? searchParams.getAll('modes')[0] : '', // 預設為空
      regions: searchParams.getAll('regions').length > 0 ? searchParams.getAll('regions').filter(r => r !== '' && r !== 'unlimited') : [''],
      subRegions: searchParams.getAll('subRegions').length > 0 ? searchParams.getAll('subRegions').filter(r => r !== '' && r !== 'unlimited') : [''],
      priceRange: searchParams.get('priceRange') || ''
    };

    console.log('🔍 設置的 filters:', newFilters);
    setFilters(newFilters);
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

  // 條件檢查放在所有 hooks 之後
  if (categoriesLoading) {
    return <div className="p-8">載入科目資料中...</div>;
  }

  if (!searchParams) {
    return <div className="p-8">載入中...</div>;
  }

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      
      // 當課程分類改變時，清空科目選擇
      if (key === 'category') {
        newFilters.subjects = [];
      }
      
      return newFilters;
    });
  };

  // 科目單選處理函數
  const handleSubjectChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      subjects: [value] // 改為單選，包裝成陣列以保持一致性
    }));
  };

  const handleRegionChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      regions: [value], // 改為單選
      subRegions: [] // 清空子地區選擇
    }));
  };

  const handleSubRegionChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      subRegions: [value] // 改為單選
    }));
  };

  const handlePriceChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      priceRange: value
    }));
  };

  const handleModeChange = (mode: string) => {
    // 只處理主教學模式（面授、網課）
    setFilters(prev => ({
      ...prev,
      mode: mode,
      // 當切換主模式時，清空子分類
      subCategory: [],
      // 如果選擇網課，清空地區選擇
      ...(mode === 'online' && {
        regions: [''],
        subRegions: ['']
      })
    }));
  };

  const handleFilter = () => {
    const params = new URLSearchParams();
    
    // 搜尋參數
    if (filters.search && filters.search.trim()) {
      params.set('search', filters.search.trim());
      console.log('🔍 添加搜尋參數:', filters.search);
    }
    
    // 課程分類 - 確保正確添加分類參數
    if (filters.category && filters.category !== '') {
      params.set('category', filters.category);
      console.log('🔍 添加分類參數:', filters.category);
    }

    // 子分類 - 只有選擇具體子分類時才添加參數
    if (filters.subCategory.length > 0) {
      // 去重後再添加參數
      const uniqueSubCategories = [...new Set(filters.subCategory)];
      uniqueSubCategories.forEach(subCat => {
        if (subCat !== '') {
          params.append('subCategory', subCat);
        }
      });
    }

    // 科目
    if (filters.subjects.length > 0) {
      filters.subjects.forEach(subject => params.append('subjects', subject));
      console.log('🔍 添加用戶選擇的科目:', filters.subjects);
    } else if (filters.category && filters.category !== '') {
      // 若冇揀科目 → 自動傳出該分類下所有科目
      const category = Array.isArray(CATEGORY_OPTIONS) ? CATEGORY_OPTIONS.find(c => c.value === filters.category) : null;
      if (category) {
        // 新的三層結構：直接使用分類的科目
        const subjects = category.subjects || [];
        subjects.forEach(subject => params.append('subjects', subject.value));
        console.log('🔍 自動添加分類科目:', subjects.map(s => s.value));
      }
    }
    // 如果課程分類是空值，不添加任何科目參數（清除之前的科目參數）

    // 其他篩選條件 - 只添加非空的值
    if (filters.mode && filters.mode !== '') {
      params.append('modes', filters.mode);
      // 如果有子分類，也添加子分類
      if (filters.subCategory.length > 0) {
        // 去重後再添加參數
        const uniqueSubCategories = [...new Set(filters.subCategory)];
        uniqueSubCategories.forEach(subCat => {
          if (subCat !== '') {
            params.append('modes', subCat);
          }
        });
      }
    }
    filters.regions.forEach(region => {
      if (region !== '') {
        params.append('regions', region);
      }
    });
    filters.subRegions.forEach(subRegion => {
      if (subRegion !== '') {
        params.append('subRegions', subRegion);
      }
    });
    if (filters.priceRange && filters.priceRange !== '') {
      params.set('priceRange', filters.priceRange);
    }

    // 直接用 usePathname 判斷
    const isTutorPage = pathname === "/tutors";
    const targetRoute = isTutorPage ? "/tutors" : "/find-student-cases";
    
    console.log('🔍 最終URL參數:', params.toString());
    
    // 如果沒有任何有效參數，直接跳轉到乾淨的URL
    if (params.toString() === '') {
      router.push(targetRoute);
    } else {
      router.push(`${targetRoute}?${params.toString()}`);
    }
    
    if (onFilter) {
      // 轉換 filters 格式以匹配導師列表頁面的期望
      const formattedFilters = {
        ...filters,
        mode: filters.mode ? [filters.mode] : [], // 將 mode 轉換為數組
        regions: filters.regions.filter(region => region !== ''), // 過濾空值
        subRegions: filters.subRegions.filter(subRegion => subRegion !== '') // 過濾空值
      };
      onFilter(formattedFilters);
    }
  };

  const handleReset = () => {
    const autoTarget = getAutoTarget(); // 保持自動設定的目標值
    setFilters({
      target: autoTarget,
      search: '', // 重置搜尋字段
      category: '',
      subCategory: [],
      subjects: [], // 重置為空陣列
      mode: '',
      regions: [''],
      subRegions: [''],
      priceRange: ''
    });
    // 重置時不調用 onFilter，避免跳轉頁面
  };

  // 移除 getSubCategoryLabel 函數 - 不再需要面授子分類

  const getSelectedSubRegions = () => {
    if (!filters.regions.length || filters.regions[0] === '') {
      return [];
    }
    
    const selectedRegions = regionOptions?.filter(region => 
      filters.regions.includes(region.value)
    ) || [];
    
    // Get all sub-regions from selected regions, not just the ones already selected
    const subRegions = selectedRegions.flatMap(region => region.regions || []);
    
    return subRegions;
  };

  const getCategorySubjects = () => {
    const category = Array.isArray(CATEGORY_OPTIONS) ? CATEGORY_OPTIONS.find(c => c.value === filters.category) : null;
    if (!category) return [];
    
    if (category.subCategories && filters.subCategory.length > 0) {
      const subjects = category.subCategories
        .filter(sc => filters.subCategory.includes(sc.value))
        .flatMap(sc => sc.subjects || []);
      return subjects;
    }
    
    return category.subjects || [];
  };

  const handleSubCategoryChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      subCategory: [value], // 改為單選，包裝成陣列以保持一致性
      subjects: [] // 清空科目選擇
    }));
  };

  const getSubOptions = () => {
    const category = Array.isArray(CATEGORY_OPTIONS) ? CATEGORY_OPTIONS.find(c => c.value === filters.category) : null;
    const subOptions = category?.subCategories || [];
    console.log('🔍 getSubOptions - 當前分類:', category);
    console.log('🔍 getSubOptions - 子分類選項:', subOptions);
    console.log('🔍 getSubOptions - 已選子分類:', filters.subCategory);
    return subOptions;
  };

  const getSubjectOptions = () => {
    const category = Array.isArray(CATEGORY_OPTIONS) ? CATEGORY_OPTIONS.find(c => c.value === filters.category) : null;
    if (!category) return [{ value: '', label: '請選擇科目', disabled: true }];

    console.log('🔍 當前分類:', category);
    console.log('🔍 分類直接科目:', category.subjects);

    // 新的三層結構：直接使用分類的科目
    const subjects = category.subjects || [];

    console.log('🔍 最終科目選項:', subjects);

    return subjects;
  };

  const shouldShowSubjects = () => {
    const category = Array.isArray(CATEGORY_OPTIONS) ? CATEGORY_OPTIONS.find(c => c.value === filters.category) : null;
    if (!category || category.value === '') return false;

    // 新的三層結構：所有分類都直接顯示科目（不需要子分類）
    return category.subjects && category.subjects.length > 0;
  };

  // 獲取已選選項的顯示文字
  const getSelectedOptions = () => {
    const selected: { key: string; label: string; value: string }[] = [];
    console.log('🔍 getSelectedOptions - 當前 filters:', filters);
    

    
    // 目標 - 不顯示在已選項目中
    // if (filters.target) {
    //   const targetOption = TARGET_OPTIONS.find(t => t.value === filters.target);
    //   if (targetOption) {
    //     selected.push({ key: 'target', label: targetOption.label, value: filters.target });
    //   }
    // }
    
    // 分類 - 永遠不顯示在已選項目中
    // if (filters.category && filters.category !== 'unlimited') {
    //   const categoryOption = CATEGORY_OPTIONS.find(c => c.value === filters.category);
    //   if (categoryOption) {
    //     selected.push({ key: 'category', label: categoryOption.label, value: filters.category });
    //   }
    // }
    
    // 子分類 - 不顯示在已選選項中（小學教育/中學教育不加入已選選項）
    // filters.subCategory.forEach(subCat => {
    //   if (subCat !== '') {
    //     const subOptions = getSubOptions();
    //     const subOption = Array.isArray(subOptions) ? subOptions.find(s => s.value === subCat) : null;
    //     if (subOption) {
    //       selected.push({ key: 'subCategory', label: subOption.label, value: subCat });
    //     }
    //   }
    // });
    
    // 科目
    filters.subjects.forEach(subject => {
      const subjectOptions = getSubjectOptions();
      const subjectOption = Array.isArray(subjectOptions) ? subjectOptions.find(s => s.value === subject) : null;
      if (subjectOption) {
        selected.push({ key: 'subjects', label: subjectOption.label, value: subject });
      }
    });
    
    // 教學模式
    if (filters.mode && filters.mode !== '') {
      // 確保 teachingModeOptions 是陣列且不為空
      if (Array.isArray(teachingModeOptions) && teachingModeOptions.length > 0) {
        const modeOption = teachingModeOptions.find(m => m.value === filters.mode);
        if (modeOption) {
          selected.push({ key: 'mode', label: modeOption.label, value: filters.mode });
        }
      }
    }
    
    // 移除教學模式子分類處理 - 不再需要面授子分類
    
    // 主地區 - 不加入已選選項（香港島、九龍等不顯示在已選選項中）
    // filters.regions.forEach(region => {
    //   if (region === '') return;
    //   const regionOption = Array.isArray(regionOptions) ? regionOptions.find(r => r.value === region) : null;
    //   if (regionOption) {
    //     selected.push({ key: 'regions', label: regionOption.label, value: region });
    //   }
    // });
    
    // 子地區 - 不顯示空值
    filters.subRegions.forEach(subRegion => {
      if (subRegion === '') return;
      const subRegions = getSelectedSubRegions();
      const subRegionOption = Array.isArray(subRegions) ? subRegions.find(sr => sr.value === subRegion) : null;
      if (subRegionOption) {
        selected.push({ key: 'subRegions', label: subRegionOption.label, value: subRegion });
      }
    });
    
    // 教學模式 - 面授/網課會加入已選選項
    if (filters.mode && filters.mode !== '') {
      const modeLabels = {
        'in-person': '面授',
        'online': '網課'
      };
      const label = modeLabels[filters.mode as keyof typeof modeLabels];
      if (label) {
        selected.push({ key: 'mode', label: label, value: filters.mode });
      }
    }
    
    // 價格範圍 - 不顯示空值
    if (filters.priceRange && filters.priceRange !== '') {
      const priceOption = Array.isArray(PRICE_OPTIONS) ? PRICE_OPTIONS.find(p => p.value === filters.priceRange) : null;
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
          newFilters.category = '';
          newFilters.subCategory = [];
          newFilters.subjects = [];
          break;
        case 'subjects':
          newFilters.subjects = prev.subjects.filter(s => s !== value);
          break;
        case 'mode':
          newFilters.mode = '';
          newFilters.subCategory = [];
          break;
        case 'subCategory':
          newFilters.subCategory = newFilters.subCategory.filter(cat => cat !== value);
          break;
        case 'regions':
          newFilters.regions = [''];
          newFilters.subRegions = [''];
          break;
        case 'subRegions':
          newFilters.subRegions = prev.subRegions.filter(sr => sr !== value);
          if (newFilters.subRegions.length === 0) {
            newFilters.subRegions = [''];
          }
          break;
        case 'priceRange':
          newFilters.priceRange = '';
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
      search: '', // 重置搜尋字段
      category: '', // 重置為空，顯示"請選擇分類"
      subCategory: [],
      subjects: [], // 重置為空陣列
      mode: '', // 重置為空，顯示"請選擇教學模式"
      regions: [''],
      subRegions: [''],
      priceRange: ''
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
                  <option value="" disabled>請選擇分類</option>
                  {CATEGORY_OPTIONS
                    .sort((a, b) => {
                      // 確保正確的順序：幼兒教育 → 小學教育 → 中學教育
                      const order = ['early-childhood', 'primary', 'secondary'];
                      const aIndex = order.indexOf(a.value);
                      const bIndex = order.indexOf(b.value);
                      return aIndex - bIndex;
                    })
                    .map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </select>
              </div>


              {/* 科目選擇 - 只在選擇課程分類後顯示 */}
              {filters.category !== '' && shouldShowSubjects() && (
                <div className="space-y-2 max-sm:space-y-1 max-[700px]:space-y-2">
                  <label className="block text-sm font-medium text-gray-700 max-sm:text-xs max-[700px]:text-sm">
                    科目
                  </label>
                  <Listbox
                    value={filters.subjects[0] || ''}
                    onChange={(value) => handleSubjectChange(value)}
                  >
                    <div className="relative">
                      <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left border focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm max-sm:py-1 max-sm:text-xs">
                        <span className="block truncate">
                          {filters.subjects.length === 0 || filters.subjects[0] === ''
                            ? '請選擇科目'
                            : (() => {
                                const subjectOptions = getSubjectOptions();
                                const found = Array.isArray(subjectOptions) ? subjectOptions.find(s => s.value === filters.subjects[0]) : null;
                                return found?.label || '未知';
                              })()}
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
                <select
                  value={filters.mode}
                  onChange={(e) => handleModeChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md max-sm:px-2 max-sm:py-1 max-sm:text-xs max-[700px]:px-3 max-[700px]:py-2 max-[700px]:text-sm"
                >
                  <option value="" disabled>請選擇模式</option>
                  <option value="in-person">面授</option>
                  <option value="online">網課</option>
                </select>
              </div>

              {/* 移除面授子分類選擇器 - 選擇面授後直接加入已選選項 */}

              {/* 地區選擇 - 只在選擇面授時顯示，網課不顯示地區 */}
              {filters.mode === 'in-person' && (
                <div className="space-y-2 max-sm:space-y-1 max-[700px]:space-y-2">
                <label className="block text-sm font-medium text-gray-700 max-sm:text-xs max-[700px]:text-sm">地區</label>
                <select
                  value={filters.regions[0] || ''}
                  onChange={(e) => handleRegionChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md max-sm:px-2 max-sm:py-1 max-sm:text-xs max-[700px]:px-3 max-[700px]:py-2 max-[700px]:text-sm"
                >
                  <option value="">請選擇地區</option>
                  {regionOptions.filter(option => option.value !== 'all-hong-kong' && option.value !== 'unlimited').map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                </div>
              )}

              {/* 子地區選擇 - 只在面授模式下選擇地區且有子地區時顯示 */}
              {filters.mode === 'in-person' && filters.regions.length > 0 && filters.regions[0] !== '' && getSelectedSubRegions().length > 0 && (
                <div className="space-y-2 max-sm:space-y-1 max-[700px]:space-y-2">
                  <label className="block text-sm font-medium text-gray-700 max-sm:text-xs max-[700px]:text-sm">子地區</label>
                  <Listbox
                    value={filters.subRegions[0] || ''}
                    onChange={(value) => handleSubRegionChange(value)}
                  >
                    <div className="relative">
                      <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left border focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm max-sm:py-1 max-sm:text-xs">
                        <span className="block truncate">
                          {filters.subRegions.length === 0 || (filters.subRegions.length === 1 && filters.subRegions[0] === '')
                            ? '請選擇子地區'
                            : (() => {
                                const subRegions = getSelectedSubRegions();
                                const found = Array.isArray(subRegions) ? subRegions.find(sr => sr.value === filters.subRegions[0]) : null;
                                return found?.label || '未知';
                              })()}
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
                          {getSelectedSubRegions()?.map((subRegion) => (
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

              {/* 每小時堂費 */}
              <div className="space-y-2 max-sm:space-y-1 max-[700px]:space-y-2">
                <label className="block text-sm font-medium text-gray-700 max-sm:text-xs max-[700px]:text-sm">每小時堂費</label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md max-sm:px-2 max-sm:py-1 max-sm:text-xs max-[700px]:px-3 max-[700px]:py-2 max-[700px]:text-sm"
                >
                  <option value="" disabled>請選擇堂費</option>
                  {PRICE_OPTIONS.filter(option => option.value !== 'unlimited').map(option => (
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