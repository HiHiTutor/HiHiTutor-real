'use client';

import React, { useState, useEffect, Fragment } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  { value: 'find-tutor', label: '尋導師' },
  { value: 'find-student', label: '招學生' }
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
      priceRange: [Number(priceMin) || 0, Number(priceMax) || 1000],
      featured: false
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

  const handleFilter = () => {
    onFilter?.({
      type: filters.target === 'find-tutor' ? 'tutors' : 'find-student-cases',
      category: filters.category,
      subCategory: filters.subCategory || '',
      subjects: filters.subjects,
      region: filters.regions[0] || '',
      mode: filters.mode
    });
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
      priceRange: [0, 0],
      featured: false
    });
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
    return getSubjectOptions();
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
    const category = CATEGORY_OPTIONS.find(c => c.value === filters.category);
    if (!category) return [];

    // 如果有子分類，返回子分類
    if (category.subCategories) {
      return category.subCategories;
    }

    return [];
  };

  // 獲取選定子分類的科目
  const getSubjectOptions = () => {
    const category = CATEGORY_OPTIONS.find(c => c.value === filters.category);
    if (!category) return [];

    // 如果有子分類且選擇了子分類
    if (category.subCategories && filters.subCategory) {
      const subCategory = category.subCategories.find(sub => sub.value === filters.subCategory);
      return subCategory?.subjects || [];
    }

    // 如果沒有子分類但有科目，直接返回科目
    if (category.subjects) {
      return category.subjects;
    }

    return [];
  };

  // 判斷是否應該顯示科目選擇
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

  return (
    <div className={`rounded-xl border ${colorScheme.border} ${colorScheme.bg} p-6`}>
      <div className="space-y-4">
        {/* 篩選選項 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* 目標選擇 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">目標</label>
            <select
              value={filters.target}
              onChange={(e) => handleFilterChange('target', e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">全部</option>
              {TARGET_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 分類選擇 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">分類</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">全部</option>
              {CATEGORY_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 子分類選擇 */}
          {filters.category && getSubOptions().length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">子分類</label>
              <select
                value={filters.subCategory}
                onChange={(e) => handleSubCategoryChange(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">全部</option>
                {getSubOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 科目選擇 */}
          {shouldShowSubjects() && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">科目</label>
              <div className="flex flex-wrap gap-2">
                {getCategorySubjects().map(subject => (
                  <button
                    key={subject.value}
                    onClick={() => handleSubjectChange(subject.value)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      filters.subjects.includes(subject.value)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {subject.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 教學模式選擇 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">教學模式</label>
            <div className="space-y-2">
              {/* 大分類選擇 */}
              <div className="flex flex-wrap gap-2">
                {TEACHING_MODE_OPTIONS.map(mode => (
                  <button
                    key={mode.value}
                    onClick={() => handleModeChange(mode.value)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      filters.mode.includes(mode.value)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
              
              {/* 面授子分類選擇 */}
              {filters.mode.includes('in-person') && (
                <div className="ml-4 space-y-2">
                  <label className="block text-xs font-medium text-gray-600">面授類型</label>
                  <div className="flex flex-wrap gap-2">
                    {TEACHING_MODE_OPTIONS.find(m => m.value === 'in-person')?.subCategories.map(subMode => (
                      <button
                        key={subMode.value}
                        onClick={() => handleModeChange(subMode.value)}
                        className={`px-2 py-1 rounded-full text-xs ${
                          filters.mode.includes(subMode.value)
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-50 text-gray-600'
                        }`}
                      >
                        {subMode.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 地區選擇 - 只在選擇面授相關模式時顯示 */}
          {filters.mode.some(mode => shouldShowRegionForMode(mode)) && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">地區</label>
              <select
                value={filters.regions[0] || ''}
                onChange={(e) => handleRegionChange(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">全部</option>
                {REGION_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 子地區選擇 - 只在選擇面授相關模式且有地區時顯示 */}
          {filters.mode.some(mode => shouldShowRegionForMode(mode)) && filters.regions.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">子地區</label>
              <select
                value={filters.subRegions[0] || ''}
                onChange={(e) => handleSubRegionChange(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">全部</option>
                {REGION_OPTIONS.find(r => r.value === filters.regions[0])?.regions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 預算範圍 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">預算範圍</label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={filters.priceRange[0]}
                onChange={(e) => handlePriceChange('min', e.target.value)}
                className="w-24 px-3 py-2 border rounded-md"
                placeholder="最低"
              />
              <span>-</span>
              <input
                type="number"
                value={filters.priceRange[1]}
                onChange={(e) => handlePriceChange('max', e.target.value)}
                className="w-24 px-3 py-2 border rounded-md"
                placeholder="最高"
              />
            </div>
          </div>

          {/* 精選個案 */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="featured"
              checked={filters.featured}
              onChange={(e) => handleFilterChange('featured', e.target.checked)}
              className="h-4 w-4 text-blue-600"
            />
            <label htmlFor="featured" className="text-sm font-medium text-gray-700">
              只顯示精選個案
            </label>
          </div>
        </div>

        {/* 按鈕組 */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleReset}
            className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            重置
          </button>
          <button
            onClick={handleFilter}
            className={`px-6 py-2 text-white rounded-lg ${colorScheme.button}`}
          >
            篩選
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaseFilterBar; 