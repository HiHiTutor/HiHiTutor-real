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

const TEACHING_MODE_OPTIONS = [
  { value: 'online', label: '網課' },
  { value: 'in-person', label: '面授' }
];

export const CATEGORY_OPTIONS: CategoryOption[] = [
  { 
    value: 'preschool', 
    label: '幼兒教育',
    subjects: [
      { value: 'preschool-chinese', label: '幼兒中文' },
      { value: 'preschool-english', label: '幼兒英文' },
      { value: 'preschool-math', label: '幼兒數學' },
      { value: 'preschool-phonics', label: '拼音／注音' },
      { value: 'preschool-logic', label: '邏輯思維訓練' },
      { value: 'preschool-interview', label: '面試技巧訓練' },
      { value: 'preschool-homework', label: '幼稚園功課輔導' }
    ]
  },
  { 
    value: 'primary-secondary', 
    label: '中小學教育',
    subCategories: [
      {
        value: 'primary',
        label: '小學教育',
        subjects: [
          { value: 'primary-chinese', label: '中文' },
          { value: 'primary-english', label: '英文' },
          { value: 'primary-math', label: '數學' },
          { value: 'primary-general', label: '常識' },
          { value: 'primary-mandarin', label: '普通話' },
          { value: 'primary-stem', label: '常識／STEM' },
          { value: 'primary-all', label: '其他全科補習' }
        ]
      },
      {
        value: 'secondary',
        label: '中學教育',
        subjects: [
          { value: 'secondary-chinese', label: '中文' },
          { value: 'secondary-english', label: '英文' },
          { value: 'secondary-math', label: '數學' },
          { value: 'secondary-ls', label: '通識教育' },
          { value: 'secondary-physics', label: '物理' },
          { value: 'secondary-chemistry', label: '化學' },
          { value: 'secondary-biology', label: '生物' },
          { value: 'secondary-economics', label: '經濟' },
          { value: 'secondary-geography', label: '地理' },
          { value: 'secondary-history', label: '歷史' },
          { value: 'secondary-chinese-history', label: '中國歷史' },
          { value: 'secondary-bafs', label: 'BAFS' },
          { value: 'secondary-ict', label: 'ICT' },
          { value: 'secondary-integrated-science', label: '綜合科學' },
          { value: 'secondary-dse', label: '其他 DSE 專科補習' },
          { value: 'secondary-all', label: '全科補習' }
        ]
      }
    ]
  },
  { 
    value: 'interest', 
    label: '興趣班',
    subjects: [
      { value: 'art', label: '繪畫' },
      { value: 'music', label: '音樂（鋼琴、結他、小提琴等）' },
      { value: 'dance', label: '跳舞／舞蹈訓練' },
      { value: 'drama', label: '戲劇／演講' },
      { value: 'programming', label: '編程／STEM' },
      { value: 'foreign-language', label: '外語（韓文／日文／法文／德文等）' },
      { value: 'magic-chess', label: '魔術／棋藝' },
      { value: 'photography', label: '攝影／影片剪接' }
    ]
  },
  { 
    value: 'tertiary', 
    label: '大專補習課程',
    subjects: [
      { value: 'uni-liberal', label: '大學通識' },
      { value: 'uni-math', label: '大學統計與數學' },
      { value: 'uni-economics', label: '經濟學' },
      { value: 'uni-it', label: '資訊科技' },
      { value: 'uni-business', label: '商科（會計、管理、市場學等）' },
      { value: 'uni-engineering', label: '工程科目' },
      { value: 'uni-thesis', label: '論文指導／報告協助' }
    ]
  },
  { 
    value: 'adult', 
    label: '成人教育',
    subjects: [
      { value: 'business-english', label: '商務英文' },
      { value: 'conversation', label: '生活英語會話' },
      { value: 'chinese-language', label: '廣東話／普通話' },
      { value: 'second-language', label: '興趣／第二語言學習' },
      { value: 'computer-skills', label: '電腦技能（Excel／Photoshop 等）' },
      { value: 'exam-prep', label: '考試準備（IELTS／TOEFL／JLPT）' }
    ]
  }
];

interface RegionOption {
  value: string;
  label: string;
  regions: { value: string; label: string; }[];
}

const REGION_OPTIONS: RegionOption[] = [
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

export default function CaseFilterBar({ onFilter, onSearch, fetchUrl }: { onFilter: (filters: any) => void, onSearch: (filters: any) => void, fetchUrl: string }) {
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
    setFilters(prev => ({
      ...prev,
      priceRange: type === 'min' 
        ? [Number(value) || 0, prev.priceRange[1]]
        : [prev.priceRange[0], Number(value) || 10000]
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
    router.push('/find-student-cases');
  };

  const handleSearch = () => {
    // 根據搜尋目標決定跳轉路徑
    const basePath = filters.target === 'find-tutor' ? '/find-student-cases' : '/find-tutor-cases';
    const queryParams = new URLSearchParams();

    // 添加所有搜尋參數
    if (filters.category) {
      queryParams.append('category', filters.category);
    }

    // 子分類支援多選
    if (filters.subCategory) {
      if (Array.isArray(filters.subCategory)) {
        filters.subCategory.forEach(subCat => {
          queryParams.append('subCategory[]', subCat);
        });
      } else {
        queryParams.append('subCategory', filters.subCategory);
      }
    }

    // 科目支援多選
    if (filters.subjects.length > 0) {
      filters.subjects.forEach(subject => {
        queryParams.append('subjects[]', subject);
      });
    }

    // 授課模式支援多選
    if (filters.mode.length > 0) {
      filters.mode.forEach(mode => {
        queryParams.append('mode[]', mode);
      });
    }

    // 地區支援多選
    if (filters.regions.length > 0) {
      filters.regions.forEach(region => {
        queryParams.append('region[]', region);
      });
    }

    // 子地區支援多選
    if (filters.subRegions.length > 0) {
      filters.subRegions.forEach(subRegion => {
        queryParams.append('subRegion[]', subRegion);
      });
    }

    // 價格範圍
    if (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 10000) {
      queryParams.append('priceMin', filters.priceRange[0].toString());
      queryParams.append('priceMax', filters.priceRange[1].toString());
    }

    const url = `${basePath}?${queryParams.toString()}`;
    console.log("🚀 正在搜尋目標：", filters.target === 'find-tutor' ? '尋導師' : '招學生', "API路徑：", url);
    router.push(url);
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

    if (category.subCategories) {
      const subCategory = category.subCategories.find(sc => sc.value === filters.subCategory);
      return subCategory?.subjects || [];
    }

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
    <div className="max-w-7xl mx-auto">
      {/* 已選條件條 */}
      {(filters.category || filters.subjects.length > 0 || filters.mode.length > 0 || filters.regions.length > 0 || filters.subRegions.length > 0 || filters.priceRange[0] !== 0 || filters.priceRange[1] !== 10000) && (
        <div className="flex flex-wrap gap-2 items-center bg-gray-50/90 border border-gray-200 rounded-xl px-4 py-2 mb-4">
          <span className="text-sm text-gray-600">已選條件：</span>
          {filters.category && (
            <span className="bg-yellow-100 text-sm rounded-full px-3 py-1 flex items-center gap-1">
              {CATEGORY_OPTIONS.find(c => c.value === filters.category)?.label}
              <button
                onClick={() => handleFilterChange('category', '')}
                className="text-red-500 hover:text-red-700 transition cursor-pointer"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </span>
          )}
          {filters.subjects.map(subject => (
            <span key={subject} className="bg-yellow-100 text-sm rounded-full px-3 py-1 flex items-center gap-1">
              {getCategorySubjects().find(s => s.value === subject)?.label}
              <button
                onClick={() => handleSubjectChange(subject)}
                className="text-red-500 hover:text-red-700 transition cursor-pointer"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </span>
          ))}
          {filters.mode.map(mode => (
            <span key={mode} className="bg-yellow-100 text-sm rounded-full px-3 py-1 flex items-center gap-1">
              {TEACHING_MODE_OPTIONS.find(m => m.value === mode)?.label}
              <button
                onClick={() => handleModeChange(mode)}
                className="text-red-500 hover:text-red-700 transition cursor-pointer"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </span>
          ))}
          {filters.regions.map(region => (
            <span key={region} className="bg-yellow-100 text-sm rounded-full px-3 py-1 flex items-center gap-1">
              {REGION_OPTIONS.find(r => r.value === region)?.label}
              <button
                onClick={() => {
                  handleFilterChange('regions', filters.regions.filter(r => r !== region));
                  // 清除相關的子地區選擇
                  const regionData = REGION_OPTIONS.find(r => r.value === region);
                  if (regionData) {
                    handleFilterChange('subRegions', filters.subRegions.filter(sr => 
                      !regionData.regions.some(r => r.value === sr)
                    ));
                  }
                }}
                className="text-red-500 hover:text-red-700 transition cursor-pointer"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </span>
          ))}
          {filters.subRegions.map(subRegion => {
            const regionData = REGION_OPTIONS.find(r => 
              r.regions.some(sr => sr.value === subRegion)
            );
            const subRegionData = regionData?.regions.find(sr => sr.value === subRegion);
            return (
              <span key={subRegion} className="bg-yellow-100 text-sm rounded-full px-3 py-1 flex items-center gap-1">
                {subRegionData?.label}
                <button
                  onClick={() => {
                    handleFilterChange('subRegions', filters.subRegions.filter(sr => sr !== subRegion));
                  }}
                  className="text-red-500 hover:text-red-700 transition cursor-pointer"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </span>
            );
          })}
          {(filters.priceRange[0] !== 0 || filters.priceRange[1] !== 10000) && (
            <span className="bg-yellow-100 text-sm rounded-full px-3 py-1 flex items-center gap-1">
              {`HK$${filters.priceRange[0] || '0'} - ${filters.priceRange[1] || '∞'}`}
              <button
                onClick={() => handleFilterChange('priceRange', [0, 10000])}
                className="text-red-500 hover:text-red-700 transition cursor-pointer"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </span>
          )}
          <button
            onClick={clearFilter}
            className="ml-auto text-sm text-red-500 hover:text-red-700 transition cursor-pointer"
          >
            取消全部
          </button>
        </div>
      )}

      {/* 搜尋欄 */}
      <div className="bg-white rounded-2xl shadow border border-yellow-100 py-6 px-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          {/* 搜尋目標 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">搜尋目標</label>
            <Listbox 
              value={filters.target} 
              onChange={(value) => {
                handleFilterChange('target', value);
                // 自動收起選單
                const button = document.activeElement as HTMLElement;
                if (button) button.blur();
              }}
            >
              <div className="relative">
                <Listbox.Button className="relative w-full h-10 cursor-default rounded-xl bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-300">
                  <span className="block truncate">
                    {TARGET_OPTIONS.find(opt => opt.value === filters.target)?.label}
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </span>
                </Listbox.Button>
                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {TARGET_OPTIONS.map((option) => (
                    <Listbox.Option
                      key={option.value}
                      value={option.value}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                          active ? 'bg-gray-50 text-gray-900' : 'text-gray-900'
                        }`
                      }
                    >
                      {({ selected }) => (
                        <>
                          <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                            {option.label}
                          </span>
                          {selected ? (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-yellow-600">
                              <CheckIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            </Listbox>
          </div>

          {/* 課程分類 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">課程分類</label>
            <div className="space-y-2">
              <Listbox 
                value={filters.category} 
                onChange={(value) => {
                  handleCategoryChange(value);
                  // 自動收起選單
                  const button = document.activeElement as HTMLElement;
                  if (button) button.blur();
                }}
              >
                <div className="relative">
                  <Listbox.Button className="relative w-full h-10 cursor-default rounded-xl bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-300">
                    <span className="block truncate">
                      {filters.category ? CATEGORY_OPTIONS.find(opt => opt.value === filters.category)?.label : '選擇課程分類'}
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </span>
                  </Listbox.Button>
                  <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {CATEGORY_OPTIONS.map((category) => (
                      <Listbox.Option
                        key={category.value}
                        value={category.value}
                        className={({ active }) =>
                          `relative cursor-default select-none py-2 pl-10 pr-4 ${
                            active ? 'bg-gray-50 text-gray-900' : 'text-gray-900'
                          }`
                        }
                      >
                        {({ selected }) => (
                          <>
                            <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                              {category.label}
                            </span>
                            {selected ? (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-yellow-600">
                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                              </span>
                            ) : null}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              </Listbox>

              {filters.category === 'primary-secondary' && (
                <Listbox value={filters.subCategory} onChange={handleSubCategoryChange}>
                  <div className="relative">
                    <Listbox.Button className="relative w-full h-10 cursor-default rounded-xl bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-300">
                      <span className="block truncate">
                        {filters.subCategory 
                          ? CATEGORY_OPTIONS.find(c => c.value === 'primary-secondary')?.subCategories?.find(sc => sc.value === filters.subCategory)?.label 
                          : '選擇教育階段'}
                      </span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </span>
                    </Listbox.Button>
                    <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {CATEGORY_OPTIONS.find(c => c.value === 'primary-secondary')?.subCategories?.map((subCategory) => (
                        <Listbox.Option
                          key={subCategory.value}
                          value={subCategory.value}
                          className={({ active }) =>
                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                              active ? 'bg-gray-50 text-gray-900' : 'text-gray-900'
                            }`
                          }
                        >
                          {({ selected }) => (
                            <>
                              <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                {subCategory.label}
                              </span>
                              {selected ? (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-yellow-600">
                                  <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </div>
                </Listbox>
              )}

              {(filters.category === 'primary-secondary' ? filters.subCategory : filters.category) && (
                <div className="relative">
                  <Listbox value={filters.subjects} onChange={(value) => handleFilterChange('subjects', value)} multiple>
                    <div className="relative">
                      <Listbox.Button className="relative w-full h-10 cursor-default rounded-xl bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-300">
                        <span className="block truncate">
                          {filters.subjects.length > 0
                            ? `${filters.subjects.length} 個科目已選`
                            : '選擇科目'}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </span>
                      </Listbox.Button>
                      <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-gray-50 p-2 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {getCategorySubjects().map((subject) => (
                          <Listbox.Option
                            key={subject.value}
                            value={subject.value}
                            className={({ active }) =>
                              `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                active ? 'bg-white text-gray-900' : 'text-gray-900'
                              }`
                            }
                          >
                            {({ selected }) => (
                              <>
                                <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                  {subject.label}
                                </span>
                                {selected ? (
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-yellow-600">
                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                  </span>
                                ) : null}
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </div>
                  </Listbox>
                </div>
              )}
            </div>
          </div>

          {/* 授課模式 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">授課模式</label>
            <Listbox 
              value={filters.mode} 
              onChange={(value) => {
                handleFilterChange('mode', value);
                // 自動收起選單
                const button = document.activeElement as HTMLElement;
                if (button) button.blur();
              }}
              multiple
            >
              <div className="relative">
                <Listbox.Button className="relative w-full h-10 cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-300 shadow-sm">
                  <span className="block truncate">
                    {filters.mode.length > 0
                      ? `${filters.mode.length} 個模式已選`
                      : '選擇授課模式'}
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
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
                        value={mode.value}
                        className={({ active }) =>
                          `relative cursor-default select-none py-2 pl-10 pr-4 ${
                            active ? 'bg-yellow-100 text-yellow-900' : 'text-gray-900'
                          }`
                        }
                      >
                        {({ selected }) => (
                          <>
                            <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                              {mode.label}
                            </span>
                            {selected && (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-yellow-600">
                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                              </span>
                            )}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
          </div>

          {/* 地區選擇 - 只在選擇面授時顯示 */}
          {filters.mode.includes('in-person') && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">地區（主區）</label>
              <Listbox 
                value={filters.regions} 
                onChange={(value) => {
                  // 處理全港選項的互斥邏輯
                  if (value.includes('all-hong-kong')) {
                    handleFilterChange('regions', ['all-hong-kong']);
                    handleFilterChange('subRegions', []); // 清除所有子地區選擇
                  } else {
                    // 如果選擇了其他選項，移除全港選項
                    const newRegions = value.filter(r => r !== 'all-hong-kong');
                    handleFilterChange('regions', newRegions);
                  }
                  // 自動收起選單
                  const button = document.activeElement as HTMLElement;
                  if (button) button.blur();
                }}
                multiple
              >
                <div className="relative">
                  <Listbox.Button className="relative w-full h-10 cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-300 shadow-sm">
                    <span className="block truncate">
                      {filters.regions.length > 0
                        ? filters.regions.includes('all-hong-kong')
                          ? '全港'
                          : `${filters.regions.length} 個地區已選`
                        : '選擇地區'}
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
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
                          value={region.value}
                          className={({ active }) =>
                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-900'
                            }`
                          }
                        >
                          {({ selected }) => (
                            <>
                              <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                {region.label}
                              </span>
                              {selected && (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-yellow-600">
                                  <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                </span>
                              )}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>

              {/* 子地區選擇 - 根據選擇的主區顯示對應的子地區下拉選單 */}
              {filters.regions.length > 0 && !filters.regions.includes('all-hong-kong') && (
                <div className="mt-2 space-y-4">
                  {filters.regions.map(region => {
                    const regionData = REGION_OPTIONS.find(r => r.value === region);
                    if (!regionData || !regionData.regions.length) return null;

                    const currentSubRegions = filters.subRegions.filter(sr => 
                      regionData.regions.some(r => r.value === sr)
                    );

                    return (
                      <div key={region} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {regionData.label} 分區
                        </label>
                        <Listbox
                          value={currentSubRegions}
                          onChange={(value) => {
                            // 保留其他主區的子地區選擇
                            const otherSubRegions = filters.subRegions.filter(sr => 
                              !regionData.regions.some(r => r.value === sr)
                            );
                            handleFilterChange('subRegions', [...otherSubRegions, ...value]);
                            // 自動收起選單
                            const button = document.activeElement as HTMLElement;
                            if (button) button.blur();
                          }}
                          multiple
                        >
                          <div className="relative">
                            <Listbox.Button className="relative w-full h-10 cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-300 shadow-sm">
                              <span className="block truncate">
                                {currentSubRegions.length > 0
                                  ? `${currentSubRegions.length} 個分區已選`
                                  : '選擇分區'}
                              </span>
                              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                              </span>
                            </Listbox.Button>
                            <Transition
                              as={Fragment}
                              leave="transition ease-in duration-100"
                              leaveFrom="opacity-100"
                              leaveTo="opacity-0"
                            >
                              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                {/* 全選選項 */}
                                <Listbox.Option
                                  value="all"
                                  className={({ active }) =>
                                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-900'
                                    }`
                                  }
                                >
                                  {({ selected }) => (
                                    <>
                                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                        全選
                                      </span>
                                      {selected && (
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-yellow-600">
                                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                        </span>
                                      )}
                                    </>
                                  )}
                                </Listbox.Option>
                                {/* 分隔線 */}
                                <div className="border-t border-gray-200 my-1" />
                                {/* 子地區選項 */}
                                {regionData.regions.map((subRegion) => (
                                  <Listbox.Option
                                    key={subRegion.value}
                                    value={subRegion.value}
                                    className={({ active }) =>
                                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-900'
                                      }`
                                    }
                                  >
                                    {({ selected }) => (
                                      <>
                                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                          {subRegion.label}
                                        </span>
                                        {selected && (
                                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-yellow-600">
                                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                          </span>
                                        )}
                                      </>
                                    )}
                                  </Listbox.Option>
                                ))}
                              </Listbox.Options>
                            </Transition>
                          </div>
                        </Listbox>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 學費範圍 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">學費/堂 (HK$)</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">價格範圍：</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={filters.priceRange[0] || ''}
                  onChange={(e) => handlePriceChange('min', e.target.value)}
                  placeholder="最低"
                  className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <span>-</span>
                <input
                  type="number"
                  value={filters.priceRange[1] || ''}
                  onChange={(e) => handlePriceChange('max', e.target.value)}
                  placeholder="最高"
                  className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 搜尋按鈕 */}
        <div className="flex justify-end mt-4">
          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl shadow transition"
          >
            搜尋
          </button>
        </div>
      </div>
    </div>
  );
} 