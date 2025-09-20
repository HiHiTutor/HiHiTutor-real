'use client';

import React, { useState, useEffect, Fragment } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { Select } from '@headlessui/react';
import { Checkbox } from '@/components/ui/checkbox';
import { useCategories } from '@/hooks/useCategories';
import { SUBJECT_MAP } from '@/constants/subjectOptions';
import { TEACHING_MODE_OPTIONS, shouldShowRegionForMode, initializeTeachingModeOptions } from '@/constants/teachingModeOptions';
import PRICE_OPTIONS from '@/constants/priceOptions';
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
  const { categories: CATEGORY_OPTIONS, loading: categoriesLoading } = useCategories();
  
  const [filters, setFilters] = useState<FilterState>({
    target: '',
    search: '', // 添加搜尋字段
    category: 'unlimited', // 預設為不限
    subCategory: [], // 預設為空陣列
    subjects: [],
    mode: 'both', // 預設為皆可
    regions: [''], // 預設為空，需要用戶選擇
    subRegions: [''], // 預設為空
    priceRange: 'unlimited' // 預設為不限
  });
  
  const [teachingModeOptions, setTeachingModeOptions] = useState<any[]>([]);
  
  // 地區資料狀態
  const [regionOptions, setRegionOptions] = useState<RegionOption[]>([]);
  const [loadingRegions, setLoadingRegions] = useState(true);

  // Safety check for searchParams
  if (!searchParams) {
    return <div className="p-8">載入中...</div>;
  }

  // 如果科目資料還在載入中
  if (categoriesLoading) {
    return <div className="p-8">載入科目資料中...</div>;
  }

  const isStudentCase = fetchUrl.includes('student');
  
  // 載入地區選項
  useEffect(() => {
    const fetchRegionOptions = async () => {
      try {
        setLoadingRegions(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/regions`);
        if (!response.ok) {
          throw new Error('Failed to fetch regions');
        }
        const regions = await response.json();
        console.log('✅ 載入地區選項:', regions);
        setRegionOptions(regions);
      } catch (error) {
        console.error('❌ 載入地區選項失敗:', error);
        // 如果API失敗，使用靜態資料作為備用
        const fallbackRegions = [
          {
            value: 'unlimited',
            label: '不限',
            regions: []
          },
          {
            value: 'all-hong-kong',
            label: '全香港',
            regions: []
          },
          {
            value: 'hong-kong-island',
            label: '香港島',
            regions: [
              { value: 'central', label: '中環' },
              { value: 'sheung-wan', label: '上環' },
              { value: 'sai-wan', label: '西環' },
              { value: 'sai-ying-pun', label: '西營盤' },
              { value: 'shek-tong-tsui', label: '石塘咀' },
              { value: 'wan-chai', label: '灣仔' },
              { value: 'causeway-bay', label: '銅鑼灣' },
              { value: 'admiralty', label: '金鐘' },
              { value: 'happy-valley', label: '跑馬地' },
              { value: 'tin-hau', label: '天后' },
              { value: 'tai-hang', label: '大坑' },
              { value: 'north-point', label: '北角' },
              { value: 'quarry-bay', label: '鰂魚涌' },
              { value: 'taikoo', label: '太古' },
              { value: 'sai-wan-ho', label: '西灣河' },
              { value: 'shau-kei-wan', label: '筲箕灣' },
              { value: 'chai-wan', label: '柴灣' },
              { value: 'heng-fa-chuen', label: '杏花邨' }
            ]
          },
          {
            value: 'kowloon',
            label: '九龍',
            regions: [
              { value: 'tsim-sha-tsui', label: '尖沙咀' },
              { value: 'jordan', label: '佐敦' },
              { value: 'yau-ma-tei', label: '油麻地' },
              { value: 'mong-kok', label: '旺角' },
              { value: 'prince-edward', label: '太子' },
              { value: 'sham-shui-po', label: '深水埗' },
              { value: 'cheung-sha-wan', label: '長沙灣' },
              { value: 'hung-hom', label: '紅磡' },
              { value: 'to-kwa-wan', label: '土瓜灣' },
              { value: 'ho-man-tin', label: '何文田' },
              { value: 'kowloon-tong', label: '九龍塘' },
              { value: 'san-po-kong', label: '新蒲崗' },
              { value: 'diamond-hill', label: '鑽石山' },
              { value: 'lok-fu', label: '樂富' },
              { value: 'tsz-wan-shan', label: '慈雲山' },
              { value: 'ngau-tau-kok', label: '牛頭角' },
              { value: 'lam-tin', label: '藍田' },
              { value: 'kwun-tong', label: '觀塘' },
              { value: 'yau-tong', label: '油塘' }
            ]
          },
          {
            value: 'new-territories',
            label: '新界',
            regions: [
              { value: 'sha-tin', label: '沙田' },
              { value: 'ma-on-shan', label: '馬鞍山' },
              { value: 'tai-wai', label: '大圍' },
              { value: 'fo-tan', label: '火炭' },
              { value: 'tai-po', label: '大埔' },
              { value: 'tai-wo', label: '太和' },
              { value: 'fan-ling', label: '粉嶺' },
              { value: 'sheung-shui', label: '上水' },
              { value: 'tseung-kwan-o', label: '將軍澳' },
              { value: 'hang-hau', label: '坑口' },
              { value: 'po-lam', label: '寶琳' },
              { value: 'lohas-park', label: '康城' },
              { value: 'tuen-mun', label: '屯門' },
              { value: 'siu-hong', label: '兆康' },
              { value: 'yuen-long', label: '元朗' },
              { value: 'long-ping', label: '朗屏' },
              { value: 'tin-shui-wai', label: '天水圍' },
              { value: 'tsuen-wan', label: '荃灣' },
              { value: 'kwai-fong', label: '葵芳' },
              { value: 'kwai-chung', label: '葵涌' },
              { value: 'tsing-yi', label: '青衣' }
            ]
          },
          {
            value: 'islands',
            label: '離島',
            regions: [
              { value: 'tung-chung', label: '東涌' },
              { value: 'mui-wo', label: '梅窩' },
              { value: 'tai-o', label: '大澳' },
              { value: 'ping-chau', label: '坪洲' },
              { value: 'cheung-chau', label: '長洲' },
              { value: 'lamma-island', label: '南丫島' },
              { value: 'discovery-bay', label: '愉景灣' },
              { value: 'pui-o', label: '貝澳' }
            ]
          }
        ];
        setRegionOptions(fallbackRegions);
      } finally {
        setLoadingRegions(false);
      }
    };

    fetchRegionOptions();
  }, []);

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
            { 
              value: 'both', 
              label: '皆可',
              subCategories: []
            },
            { 
              value: 'in-person', 
              label: '面授',
              subCategories: [
                { value: 'one-on-one', label: '一對一' },
                { value: 'small-group', label: '小班教學' },
                { value: 'large-center', label: '補習社' }
              ]
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
          { 
            value: 'both', 
            label: '皆可',
            subCategories: []
          },
          { 
            value: 'in-person', 
            label: '面授',
            subCategories: [
              { value: 'one-on-one', label: '一對一' },
              { value: 'small-group', label: '小班教學' },
              { value: 'large-center', label: '補習社' }
            ]
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

    setFilters({
      target,
      search: searchParams.get('search') || '', // 初始化搜尋字段
      category: searchParams.get('category') || 'unlimited',
      subCategory: searchParams.getAll('subCategory').length > 0 ? searchParams.getAll('subCategory') : [],
      subjects: searchParams.getAll('subjects').length > 0 ? [...new Set(searchParams.getAll('subjects'))] : [],
              mode: searchParams.get('mode') || 'both', // 預設為皆可
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
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      
      // 當課程分類改變時，清空子分類和科目選擇
      if (key === 'category') {
        newFilters.subCategory = [];
        newFilters.subjects = [];
      }
      
      return newFilters;
    });
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
    // 只處理主教學模式（面授、網課、皆可）
    setFilters(prev => ({
      ...prev,
      mode: mode,
      // 當切換主模式時，清空子分類
      subCategory: []
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
    if (filters.category && filters.category !== 'unlimited') {
      params.set('category', filters.category);
      console.log('🔍 添加分類參數:', filters.category);
    }

    // 子分類 - 只有選擇具體子分類時才添加參數
    if (filters.subCategory.length > 0) {
      filters.subCategory.forEach(subCat => {
        if (subCat !== 'unlimited') {
          params.append('subCategory', subCat);
        }
      });
    }

    // 科目
    if (filters.subjects.length > 0) {
      filters.subjects.forEach(subject => params.append('subjects', subject));
      console.log('🔍 添加用戶選擇的科目:', filters.subjects);
    } else if (filters.category && filters.category !== 'unlimited') {
      // 若冇揀科目 → 自動傳出該子分類下所有科目
      const category = Array.isArray(CATEGORY_OPTIONS) ? CATEGORY_OPTIONS.find(c => c.value === filters.category) : null;
      if (category) {
        let subjects: { value: string; label: string }[] = [];
        
        if (category.subCategories && filters.subCategory.length > 0) {
          // 有選擇具體子分類
          subjects = category.subCategories
            .filter(sc => filters.subCategory.includes(sc.value))
            .flatMap(sc => sc.subjects || []);
          console.log('🔍 使用具體子分類科目:', subjects.map(s => s.value));
        } else if (category.subCategories && filters.subCategory.length === 0) {
          // 子分類是不限，使用所有子分類的科目
          subjects = category.subCategories.flatMap(sc => sc.subjects || []);
          console.log('🔍 使用所有子分類科目:', subjects.map(s => s.value));
        } else {
          // 沒有子分類，直接使用分類的科目
          subjects = category.subjects || [];
          console.log('🔍 使用分類直接科目:', subjects.map(s => s.value));
        }
        
        subjects.forEach(subject => params.append('subjects', subject.value));
        console.log('🔍 自動添加分類科目:', subjects.map(s => s.value));
      }
    }
    // 如果課程分類是不限，不添加任何科目參數（清除之前的科目參數）

    // 其他篩選條件 - 只添加非unlimited的值
    if (filters.mode && filters.mode !== 'unlimited') {
      params.append('modes', filters.mode);
      // 如果有子分類，也添加子分類
      if (filters.subCategory.length > 0) {
        filters.subCategory.forEach(subCat => {
          if (subCat !== '') {
            params.append('modes', subCat);
          }
        });
      }
    }
    filters.regions.forEach(region => {
      if (region !== 'unlimited') {
        params.append('regions', region);
      }
    });
    filters.subRegions.forEach(subRegion => {
      if (subRegion !== 'unlimited') {
        params.append('subRegions', subRegion);
      }
    });
    if (filters.priceRange && filters.priceRange !== 'unlimited') {
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
      onFilter(filters);
    }
  };

  const handleReset = () => {
    const autoTarget = getAutoTarget(); // 保持自動設定的目標值
    setFilters({
      target: autoTarget,
      search: '', // 重置搜尋字段
      category: 'unlimited',
      subCategory: [],
      subjects: [],
      mode: 'both',
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

  const getSubCategoryLabel = (value: string) => {
    const labels = {
      'one-on-one': '一對一',
      'small-group': '小班教學',
      'large-center': '補習社'
    };
    return labels[value as keyof typeof labels] || value;
  };

  const getSelectedSubRegions = () => {
    if (!filters.regions.length || filters.regions.includes('unlimited')) {
      return [{ value: 'unlimited', label: '不限' }];
    }
    
    const selectedRegions = regionOptions?.filter(region => 
      filters.regions.includes(region.value)
    ) || [];
    
    // Get all sub-regions from selected regions, not just the ones already selected
    const subRegions = selectedRegions.flatMap(region => region.regions || []);
    
    return [
      { value: 'unlimited', label: '不限' },
      ...subRegions
    ];
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

  const handleSubCategoryChange = (value: string[]) => {
    setFilters(prev => ({
      ...prev,
      subCategory: value,
      subjects: [] // 清空科目選擇
    }));
  };

  const getSubOptions = () => {
    const category = Array.isArray(CATEGORY_OPTIONS) ? CATEGORY_OPTIONS.find(c => c.value === filters.category) : null;
    const subOptions = category?.subCategories || [];
    return [
      { value: 'unlimited', label: '不限' },
      ...subOptions
    ];
  };

  const getSubjectOptions = () => {
    const category = Array.isArray(CATEGORY_OPTIONS) ? CATEGORY_OPTIONS.find(c => c.value === filters.category) : null;
    if (!category) return [{ value: 'unlimited', label: '不限' }];
    
    let subjects: { value: string; label: string }[] = [];
    
    if (category.subCategories && filters.subCategory.length > 0) {
      // 顯示所有選中子分類的科目
      subjects = category.subCategories
        .filter(sc => filters.subCategory.includes(sc.value))
        .flatMap(sc => sc.subjects || []);
    } else if (category.subCategories && filters.subCategory.length === 0) {
      // 如果沒有選擇子分類，顯示所有子分類的科目
      subjects = category.subCategories.flatMap(sc => sc.subjects || []);
    } else {
      subjects = category.subjects || [];
    }
    
    return [
      { value: 'unlimited', label: '不限' },
      ...subjects
    ];
  };

  const shouldShowSubjects = () => {
    const category = Array.isArray(CATEGORY_OPTIONS) ? CATEGORY_OPTIONS.find(c => c.value === filters.category) : null;
    if (!category || category.value === 'unlimited') return false;

    // 只有"中小學教育"有子分類，其他分類直接顯示科目
    if (category.value === 'primary-secondary') {
      // 如果有子分類，需要選擇具體的子分類後才顯示科目
      return filters.subCategory.length > 0;
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
    
    // 分類 - 永遠不顯示在已選項目中
    // if (filters.category && filters.category !== 'unlimited') {
    //   const categoryOption = CATEGORY_OPTIONS.find(c => c.value === filters.category);
    //   if (categoryOption) {
    //     selected.push({ key: 'category', label: categoryOption.label, value: filters.category });
    //   }
    // }
    
    // 子分類 - 不顯示"不限"
    filters.subCategory.forEach(subCat => {
      if (subCat !== 'unlimited') {
        const subOptions = getSubOptions();
        const subOption = Array.isArray(subOptions) ? subOptions.find(s => s.value === subCat) : null;
        if (subOption) {
          selected.push({ key: 'subCategory', label: subOption.label, value: subCat });
        }
      }
    });
    
    // 科目
    filters.subjects.forEach(subject => {
      const subjectOptions = getSubjectOptions();
      const subjectOption = Array.isArray(subjectOptions) ? subjectOptions.find(s => s.value === subject) : null;
      if (subjectOption) {
        selected.push({ key: 'subjects', label: subjectOption.label, value: subject });
      }
    });
    
    // 教學模式
    if (filters.mode && filters.mode !== 'both') {
      // 確保 teachingModeOptions 是陣列且不為空
      if (Array.isArray(teachingModeOptions) && teachingModeOptions.length > 0) {
        const modeOption = teachingModeOptions.find(m => m.value === filters.mode);
        if (modeOption) {
          selected.push({ key: 'mode', label: modeOption.label, value: filters.mode });
        }
      }
    }
    
    // 教學模式子分類
    filters.subCategory.forEach(subCat => {
      if (subCat !== 'unlimited' && subCat !== '') {
        const subCategoryLabels = {
          'one-on-one': '一對一',
          'small-group': '小班教學',
          'large-center': '補習社'
        };
        const label = subCategoryLabels[subCat as keyof typeof subCategoryLabels];
        if (label) {
          selected.push({ key: 'subCategory', label: label, value: subCat });
        }
      }
    });
    
    // 地區 - 不顯示"不限"
    filters.regions.forEach(region => {
      if (region === 'unlimited') return;
      const regionOption = Array.isArray(regionOptions) ? regionOptions.find(r => r.value === region) : null;
      if (regionOption) {
        selected.push({ key: 'regions', label: regionOption.label, value: region });
      }
    });
    
    // 子地區 - 不顯示"不限"
    filters.subRegions.forEach(subRegion => {
      if (subRegion === 'unlimited') return;
      const subRegions = getSelectedSubRegions();
      const subRegionOption = Array.isArray(subRegions) ? subRegions.find(sr => sr.value === subRegion) : null;
      if (subRegionOption) {
        selected.push({ key: 'subRegions', label: subRegionOption.label, value: subRegion });
      }
    });
    
    // 價格範圍 - 不顯示"不限"
    if (filters.priceRange && filters.priceRange !== 'unlimited') {
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
          newFilters.category = 'unlimited';
          newFilters.subCategory = [];
          newFilters.subjects = [];
          break;
        case 'subjects':
          newFilters.subjects = prev.subjects.filter(s => s !== value);
          break;
        case 'mode':
          newFilters.mode = 'both';
          newFilters.subCategory = [];
          break;
        case 'subCategory':
          newFilters.subCategory = newFilters.subCategory.filter(cat => cat !== value);
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
      search: '', // 重置搜尋字段
      category: 'unlimited',
      subCategory: [],
      subjects: [],
      mode: 'both',
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
                  <option value="unlimited">不限</option>
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
                  <Listbox
                    value={filters.subCategory}
                    onChange={(value) => handleSubCategoryChange(value)}
                    multiple
                  >
                    <div className="relative">
                      <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left border focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm max-sm:py-1 max-sm:text-xs">
                        <span className="block truncate">
                          {filters.subCategory.length === 0
                            ? '不限'
                            : filters.subCategory.length === 1
                            ? (() => {
                                const subOptions = getSubOptions();
                                const found = Array.isArray(subOptions) ? subOptions.find(s => s.value === filters.subCategory[0]) : null;
                                return found?.label || '未知';
                              })()
                            : `已選擇 ${filters.subCategory.length} 個子分類`}
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
                          {getSubOptions().map((option) => (
                            <Listbox.Option
                              key={option.value}
                              className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                  active ? 'bg-amber-100 text-amber-900' : 'text-gray-900'
                                }`
                              }
                              value={option.value}
                            >
                              {({ selected }) => (
                                <>
                                  <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                    {option.label}
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

              {/* 科目選擇 - 只在選擇課程分類後顯示，且子分類不是"不限" */}
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
                            ? (() => {
                                const subjectOptions = getSubjectOptions();
                                const found = Array.isArray(subjectOptions) ? subjectOptions.find(s => s.value === filters.subjects[0]) : null;
                                return found?.label || '未知';
                              })()
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
                <select
                  value={filters.mode}
                  onChange={(e) => handleModeChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md max-sm:px-2 max-sm:py-1 max-sm:text-xs max-[700px]:px-3 max-[700px]:py-2 max-[700px]:text-sm"
                >
                  <option value="both">皆可</option>
                  <option value="in-person">面授</option>
                  <option value="online">網課</option>
                </select>
              </div>

              {/* 子分類選擇 - 只在選擇面授時顯示 */}
              {filters.mode === 'in-person' && (
                <div className="space-y-2 max-sm:space-y-1 max-[700px]:space-y-2">
                  <label className="block text-sm font-medium text-gray-700 max-sm:text-xs max-[700px]:text-sm">子分類（可多選）</label>
                  <Listbox
                    value={filters.subCategory}
                    onChange={(value) => handleSubCategoryChange(value)}
                    multiple
                  >
                    <div className="relative">
                      <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left border focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm max-sm:py-1 max-sm:text-xs">
                        <span className="block truncate">
                          {filters.subCategory.length === 0
                            ? '請選擇'
                            : filters.subCategory.length === 1
                            ? getSubCategoryLabel(filters.subCategory[0])
                            : `已選擇 ${filters.subCategory.length} 個子分類`}
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
                          {[
                            { value: 'one-on-one', label: '一對一' },
                            { value: 'small-group', label: '小班教學' },
                            { value: 'large-center', label: '補習社' }
                          ].map((subCategory) => (
                            <Listbox.Option
                              key={subCategory.value}
                              className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                  active ? 'bg-amber-100 text-amber-900' : 'text-gray-900'
                                }`
                              }
                              value={subCategory.value}
                            >
                              {({ selected }) => (
                                <>
                                  <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                    {subCategory.label}
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

              {/* 地區選擇 - 任何教學模式下都顯示 */}
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

              {/* 子地區選擇 */}
              {filters.regions.length > 0 && filters.regions[0] !== '' && (
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
                            ? (() => {
                                const subRegions = getSelectedSubRegions();
                                const found = Array.isArray(subRegions) ? subRegions.find(sr => sr.value === filters.subRegions[0]) : null;
                                return found?.label || '未知';
                              })()
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