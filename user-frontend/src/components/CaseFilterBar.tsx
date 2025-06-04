'use client';

import { useState, useEffect, Fragment } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { Select } from '@headlessui/react';
import CATEGORY_OPTIONS from '@/constants/categoryOptions';
import { REGION_OPTIONS } from '@/constants/regionOptions';
import { SUBJECT_MAP } from '@/constants/subjectOptions';

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

const TARGET_OPTIONS = [
  { value: 'find-tutor', label: '尋導師' },
  { value: 'find-student', label: '招學生' }
];

export const TEACHING_MODE_OPTIONS = [
  { value: 'online', label: '線上' },
  { value: 'in-person', label: '面授' },
  { value: 'both', label: '兩者皆可' }
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
  onSearch?: (filters: any) => void;
  fetchUrl: string;
}

const REGION_OPTIONS_FULL = REGION_OPTIONS;

const CaseFilterBar = ({ onFilter, onSearch, fetchUrl }: CaseFilterBarProps) => {
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
      subCategory: filters.subCategory,
      region: selectedRegion,
      mode: selectedMode
    });
  };

  const handleApplyFilters = () => {
    onFilter?.({
      category: selectedCategory,
      subCategory: filters.subCategory,
      region: selectedRegion,
      mode: selectedMode
    });
  };

  const handleReset = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedRegion('');
    setSelectedMode('');
    onFilter?.({});
  };

  const getSelectedSubRegions = () => {
    const allSubRegions: { value: string; label: string; parent: string }[] = [];
    filters.regions.forEach(region => {
      const regionGroup = REGION_OPTIONS.find(r => r.value === region);
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
      subjects: [] // 重置科目選擇
    }));
  };

  // 獲取當前分類的子分類或科目
  const getSubOptions = () => {
    const category = CATEGORY_OPTIONS.find(c => c.value === selectedCategory);
    if (!category) return [];

    // 如果有子分類，返回子分類
    if (category.subCategories) {
      return category.subCategories;
    }
    
    // 如果沒有子分類但有科目，將科目作為子分類返回
    if (category.subjects) {
      return category.subjects.map(subject => ({
        value: subject.value,
        label: subject.label
      }));
    }

    return [];
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
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                // 當主類別改變時，重置子類別和科目
                setFilters(prev => ({
                  ...prev,
                  subCategory: '',
                  subjects: []
                }));
              }}
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

          {/* 子類別/科目選擇 */}
          {selectedCategory && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {CATEGORY_OPTIONS.find(c => c.value === selectedCategory)?.subCategories 
                  ? '子類別'
                  : '科目'}
              </label>
              <select
                value={filters.subCategory}
                onChange={(e) => handleSubCategoryChange(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">
                  {CATEGORY_OPTIONS.find(c => c.value === selectedCategory)?.subCategories 
                    ? '全部子類別'
                    : '全部科目'}
                </option>
                {getSubOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

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
              {REGION_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 子地區選擇 */}
          {selectedRegion && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                區域
              </label>
              <select
                value={filters.subRegions[0] || ''}
                onChange={(e) => handleSubRegionChange(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">全部區域</option>
                {REGION_OPTIONS.find(r => r.value === selectedRegion)?.regions.map(subRegion => (
                  <option key={subRegion.value} value={subRegion.value}>
                    {subRegion.label}
                  </option>
                ))}
              </select>
            </div>
          )}

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
};

export default CaseFilterBar; 