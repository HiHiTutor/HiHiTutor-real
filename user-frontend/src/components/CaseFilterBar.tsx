'use client';

import { useState, useEffect, Fragment } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { Select } from '@headlessui/react';

interface FilterState {
  target: string;
  category: string;
  subCategory: string;
  subjects: string[];
  mode: string[];
  regions: string[];
  subRegions: string[];
  priceRange: [number, number];
}

export interface CategoryOption {
  value: string;
  label: string;
  subjects?: {
    value: string;
    label: string;
  }[];
  subCategories?: {
    value: string;
    label: string;
    subjects: {
      value: string;
      label: string;
    }[];
  }[];
}

const TARGET_OPTIONS = [
  { value: 'find-tutor', label: '尋導師' },
  { value: 'find-student', label: '招學生' }
];

export const CATEGORY_OPTIONS = [
  { value: 'primary', label: '小學' },
  { value: 'secondary', label: '中學' },
  { value: 'university', label: '大學' },
  { value: 'language', label: '語言' },
  { value: 'music', label: '音樂' },
  { value: 'art', label: '美術' },
  { value: 'sports', label: '運動' },
  { value: 'other', label: '其他' }
];

export const REGION_OPTIONS = [
  { value: 'hong-kong', label: '香港島' },
  { value: 'kowloon', label: '九龍' },
  { value: 'new-territories', label: '新界' }
];

export const TEACHING_MODE_OPTIONS = [
  { value: 'online', label: '線上' },
  { value: 'in-person', label: '面授' },
  { value: 'both', label: '兩者皆可' }
];

export const EXPERIENCE_OPTIONS = [
  { value: 'none', label: '無經驗要求' },
  { value: '1-3', label: '1-3年' },
  { value: '3-5', label: '3-5年' },
  { value: '5+', label: '5年以上' }
];

interface RegionOption {
  value: string;
  label: string;
  regions: { value: string; label: string; }[];
}

const REGION_OPTIONS_FULL: RegionOption[] = [
  {
    value: 'all-hong-kong',
    label: '全港',
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

interface Option {
  value: string;
  label: string;
}

interface CaseFilterBarProps {
  onFilter?: (filters: any) => void;
  onSearch?: (filters: any) => void;
  fetchUrl: string;
}

export default function CaseFilterBar({ onFilter, onSearch, fetchUrl }: CaseFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<FilterState>({
    target: 'find-tutor',
    category: '',
    subCategory: '',
    subjects: [],
    mode: [],
    regions: [],
    subRegions: [],
    priceRange: [0, 10000]
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedMode, setSelectedMode] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');

  const isStudentCase = fetchUrl.includes('student');
  const colorScheme = isStudentCase ? {
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

  // 從 URL 參數初始化篩選條件
  useEffect(() => {
    const target = searchParams.get('target') || 'find-tutor';
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
      priceRange: [Number(priceMin) || 0, Number(priceMax) || 10000]
    });
  }, [searchParams]);

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
      regions: value ? [value] : [],
      subRegions: []
    }));
  };

  const handleSubRegionChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      subRegions: value ? [value] : []
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

  const clearFilter = () => {
    setFilters({
      target: 'find-tutor',
      category: '',
      subCategory: '',
      subjects: [],
      mode: [],
      regions: [],
      subRegions: [],
      priceRange: [0, 10000]
    });
  };

  const handleSearch = () => {
    onSearch?.({
      search: searchQuery,
      category: selectedCategory,
      region: selectedRegion,
      mode: selectedMode,
      experience: selectedExperience
    });
  };

  const handleApplyFilters = () => {
    onFilter?.({
      category: selectedCategory,
      region: selectedRegion,
      mode: selectedMode,
      experience: selectedExperience
    });
  };

  const handleReset = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedRegion('');
    setSelectedMode('');
    setSelectedExperience('');
    onFilter?.({});
  };

  const getSelectedSubRegions = () => {
    const allSubRegions: { value: string; label: string; parent: string }[] = [];
    filters.regions.forEach(region => {
      const regionGroup = REGION_OPTIONS_FULL.find(r => r.value === region);
      if (regionGroup) {
        regionGroup.regions.forEach(subRegion => {
          allSubRegions.push({
            ...subRegion,
            parent: regionGroup.label
          });
        });
      }
    });
    return allSubRegions;
  };

  const getCategorySubjects = () => {
    const category = CATEGORY_OPTIONS.find(c => c.value === filters.category) as CategoryOption;
    if (!category) return [];

    // If category has subCategories and a subCategory is selected
    if (category.subCategories && filters.subCategory) {
      const subCategory = category.subCategories.find(sc => sc.value === filters.subCategory);
      return subCategory?.subjects || [];
    }

    // If category has direct subjects
    return category.subjects || [];
  };

  const handleCategoryChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      category: value,
      subCategory: '',
      subjects: [] // 重置科目選擇
    }));
  };

  const handleSubCategoryChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      subCategory: value,
      subjects: [] // 重置科目選擇
    }));
  };

  return (
    <div className={`rounded-xl border ${colorScheme.border} ${colorScheme.bg} p-6`}>
      <div className="space-y-4">
        {/* 搜索欄 */}
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="搜索個案..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          <button
            onClick={handleSearch}
            className={`${colorScheme.button} text-white rounded-lg px-6 py-2`}
          >
            搜索
          </button>
        </div>

        {/* 過濾器 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 類別選擇 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              類別
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">全部類別</option>
              {CATEGORY_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 地區選擇 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              地區
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">全部地區</option>
              {REGION_OPTIONS_FULL.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 教學模式選擇 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              教學模式
            </label>
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">全部模式</option>
              {TEACHING_MODE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 經驗要求選擇 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              經驗要求
            </label>
            <select
              value={selectedExperience}
              onChange={(e) => setSelectedExperience(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">全部經驗</option>
              {EXPERIENCE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 重置和應用按鈕 */}
        <div className="flex justify-end gap-4">
          <button
            onClick={handleReset}
            className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            重置
          </button>
          <button
            onClick={handleApplyFilters}
            className={`${colorScheme.button} text-white rounded-lg px-6 py-2`}
          >
            應用過濾
          </button>
        </div>
      </div>
    </div>
  );
} 