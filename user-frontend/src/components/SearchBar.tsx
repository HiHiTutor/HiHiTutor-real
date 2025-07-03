'use client';

import React, { useState, useEffect, Fragment } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon, XMarkIcon } from "@heroicons/react/20/solid";
import CATEGORY_OPTIONS from "@/constants/categoryOptions";
import REGION_OPTIONS from "@/constants/regionOptions";
import { TEACHING_MODE_OPTIONS } from "@/constants/teachingModeOptions";
import PRICE_OPTIONS from "@/constants/priceOptions";

const TABS = [
  {
    key: "tutors",
    label: "導師列表",
    color: "yellow",
    icon: "📁",
    route: "/tutors",
    bg: "bg-yellow-50",
    border: "border-yellow-300",
  },
  {
    key: "cases",
    label: "補習個案",
    color: "blue",
    icon: "📁",
    route: "/find-student-cases",
    bg: "bg-blue-50",
    border: "border-blue-300",
  },
];

const initialFilters = {
  category: "unlimited",
  subCategory: "unlimited",
  mode: ["unlimited"],
  regions: ["unlimited"],
  subRegions: ["unlimited"],
  priceRange: "unlimited",
  featured: false,
};

const SearchBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("tutors");
  const [filters, setFilters] = useState(initialFilters);

  // 根據路徑預設 active tab
  useEffect(() => {
    if (pathname === "/find-student-cases") setActiveTab("cases");
    else if (pathname === "/tutors") setActiveTab("tutors");
  }, [pathname]);

  // 切換 tab
  const handleTabClick = (key: string) => {
    setActiveTab(key);
    const tab = TABS.find((t) => t.key === key);
    if (tab) router.push(tab.route);
  };

  // 篩選邏輯
  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (filters.category && filters.category !== "unlimited") params.set("category", filters.category);
    if (filters.subCategory && filters.subCategory !== "unlimited") params.set("subCategory", filters.subCategory);
    filters.mode.forEach((mode) => mode !== "unlimited" && params.append("mode", mode));
    filters.regions.forEach((region) => region !== "unlimited" && params.append("regions", region));
    filters.subRegions.forEach((subRegion) => subRegion !== "unlimited" && params.append("subRegions", subRegion));
    if (filters.priceRange && filters.priceRange !== "unlimited") params.set("priceRange", filters.priceRange);
    if (filters.featured) params.set("featured", "true");
    // 根據 active tab 決定導向頁面
    const tab = TABS.find((t) => t.key === activeTab);
    const url = tab ? tab.route : "/tutors";
    router.push(params.toString() ? `${url}?${params.toString()}` : url);
  };

  // 重置
  const handleReset = () => {
    setFilters(initialFilters);
    const tab = TABS.find((t) => t.key === activeTab);
    router.push(tab ? tab.route : "/tutors");
  };

  // UI 顏色
  const tabTheme = TABS.find((t) => t.key === activeTab);
  const bgClass = tabTheme ? tabTheme.bg : "bg-yellow-50";
  const borderClass = tabTheme ? tabTheme.border : "border-yellow-300";

  // 子分類選項
  const getSubOptions = () => {
    const cat = CATEGORY_OPTIONS.find((c) => c.value === filters.category);
    return cat && cat.subCategories ? cat.subCategories : [];
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      {/* 文件夾 tabs */}
      <div className="flex gap-0 mb-4 relative">
        {TABS.map((tab, idx) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabClick(tab.key)}
              className={`relative flex items-end px-8 pt-4 pb-2 border-x-0 border-t-0 border-b-0
                ${isActive ? `${tab.border} bg-white z-20` : 'border-gray-200 bg-gray-100 z-10'}
                transition-all duration-200
                ${idx === 0 ? 'rounded-tl-[2.5rem]' : ''}
                ${idx === TABS.length - 1 ? 'rounded-tr-[2.5rem]' : ''}
                shadow-[0_4px_12px_0_rgba(0,0,0,0.06)]
                folder-tab
              `}
              style={{
                marginRight: idx !== TABS.length - 1 ? '-1.5rem' : 0,
                boxShadow: isActive ? '0 6px 16px 0 rgba(0,0,0,0.10)' : '0 2px 6px 0 rgba(0,0,0,0.04)',
                borderBottom: isActive ? 'none' : '4px solid #e5e7eb',
                top: isActive ? 0 : 12,
                minWidth: 120,
                borderLeft: idx === 0 ? undefined : '2px solid #e5e7eb',
                borderRight: idx === TABS.length - 1 ? undefined : '2px solid #e5e7eb',
              }}
            >
              <span className="text-3xl mr-2 drop-shadow-sm">{tab.icon}</span>
              <span className={`font-bold text-lg ${isActive ? (tab.color === 'yellow' ? 'text-yellow-600' : 'text-blue-600') : 'text-gray-400'}`}>{tab.label}</span>
              {/* 左上突出 */}
              {idx === 0 && (
                <span className="absolute -top-3 -left-3 w-6 h-6 bg-white border-l-4 border-t-4 border-yellow-300 rounded-tl-2xl z-30" style={{boxShadow: isActive ? '0 0 0 2px #fde68a' : 'none'}}></span>
              )}
              {/* 右上突出 */}
              {idx === TABS.length - 1 && (
                <span className="absolute -top-3 -right-3 w-6 h-6 bg-white border-r-4 border-t-4 border-blue-300 rounded-tr-2xl z-30" style={{boxShadow: isActive ? '0 0 0 2px #93c5fd' : 'none'}}></span>
              )}
            </button>
          );
        })}
        {/* 插入主體的底色 */}
        <div className={`absolute left-0 right-0 bottom-0 h-4 ${tabTheme?.bg} z-0 rounded-b-xl`}></div>
      </div>
      {/* 搜尋欄主體 */}
      <div className={`rounded-b-xl border ${borderClass} ${bgClass} p-6`}> 
        <form onSubmit={handleFilter} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* 課程分類 */}
            <div>
              <label className="block text-sm font-medium mb-1">課程分類</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value, subCategory: "unlimited" }))}
                className="w-full px-3 py-2 border rounded-md"
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            {/* 子分類 */}
            {filters.category && getSubOptions().length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-1">子分類</label>
                <select
                  value={filters.subCategory}
                  onChange={(e) => setFilters((f) => ({ ...f, subCategory: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {getSubOptions().map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            )}
            {/* 教學模式 */}
            <div>
              <label className="block text-sm font-medium mb-1">教學模式</label>
              <Listbox value={filters.mode} onChange={(value) => setFilters((f) => ({ ...f, mode: value }))} multiple>
                <div className="relative">
                  <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left border">
                    <span className="block truncate">
                      {filters.mode.length === 0 || (filters.mode.length === 1 && filters.mode[0] === "unlimited")
                        ? "不限"
                        : filters.mode.length === 1
                        ? TEACHING_MODE_OPTIONS.find((m) => m.value === filters.mode[0])?.label
                        : `已選擇 ${filters.mode.filter((m) => m !== "unlimited").length} 個模式`}
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </span>
                  </Listbox.Button>
                  <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {TEACHING_MODE_OPTIONS.map((mode) => (
                        <Listbox.Option
                          key={mode.value}
                          className={({ active }) =>
                            `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? "bg-amber-100 text-amber-900" : "text-gray-900"}`
                          }
                          value={mode.value}
                        >
                          {({ selected }) => (
                            <>
                              <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>{mode.label}</span>
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
            {/* 地區 */}
            <div>
              <label className="block text-sm font-medium mb-1">地區</label>
              <select
                value={filters.regions[0] || "unlimited"}
                onChange={(e) => setFilters((f) => ({ ...f, regions: [e.target.value], subRegions: ["unlimited"] }))}
                className="w-full px-3 py-2 border rounded-md"
              >
                {REGION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            {/* 子地區 */}
            {filters.regions.length > 0 && filters.regions[0] !== "unlimited" && (
              <div>
                <label className="block text-sm font-medium mb-1">子地區</label>
                <Listbox value={filters.subRegions} onChange={(value) => setFilters((f) => ({ ...f, subRegions: value }))} multiple>
                  <div className="relative">
                    <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left border">
                      <span className="block truncate">
                        {filters.subRegions.length === 0 || (filters.subRegions.length === 1 && filters.subRegions[0] === "unlimited")
                          ? "不限"
                          : filters.subRegions.length === 1
                          ? REGION_OPTIONS.find((r) => r.value === filters.regions[0])?.regions.find((sr) => sr.value === filters.subRegions[0])?.label
                          : `已選擇 ${filters.subRegions.filter((sr) => sr !== "unlimited").length} 個子地區`}
                      </span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </span>
                    </Listbox.Button>
                    <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                      <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {REGION_OPTIONS.find((r) => r.value === filters.regions[0])?.regions.map((subRegion) => (
                          <Listbox.Option
                            key={subRegion.value}
                            className={({ active }) =>
                              `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? "bg-amber-100 text-amber-900" : "text-gray-900"}`
                            }
                            value={subRegion.value}
                          >
                            {({ selected }) => (
                              <>
                                <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>{subRegion.label}</span>
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
            <div>
              <label className="block text-sm font-medium mb-1">每堂堂費</label>
              <select
                value={filters.priceRange}
                onChange={(e) => setFilters((f) => ({ ...f, priceRange: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md"
              >
                {PRICE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            {/* 精選個案 */}
            <div className="flex items-center space-x-2 mt-2">
              <input
                type="checkbox"
                id="featured"
                checked={filters.featured}
                onChange={(e) => setFilters((f) => ({ ...f, featured: e.target.checked }))}
                className="h-4 w-4 text-blue-600"
              />
              <label htmlFor="featured" className="text-sm font-medium">只顯示精選個案</label>
            </div>
          </div>
          {/* 按鈕組 */}
          <div className="flex justify-end gap-4 mt-4">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              重置
            </button>
            <button
              type="submit"
              className={`px-6 py-2 text-white rounded-lg font-semibold ${activeTab === "tutors" ? "bg-yellow-500 hover:bg-yellow-600" : "bg-blue-500 hover:bg-blue-600"}`}
            >
              篩選
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default SearchBar; 