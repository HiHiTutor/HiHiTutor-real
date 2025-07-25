'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TagCheckbox from '@/components/TagCheckbox';
import CATEGORY_OPTIONS from '@/constants/categoryOptions';
import REGION_OPTIONS from '@/constants/regionOptions';
import { caseApi } from '@/services/api';
import { TEACHING_MODE_OPTIONS } from '@/constants/teachingModeOptions';

export default function TutorCasePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subCategory: '',
    subjects: [] as string[],
    modes: [] as string[],
    regions: '',
    subRegions: [] as string[],
    price: '',
    location: '',
    duration: '',
    durationUnit: 'minutes',
    weeklyLessons: ''
  });

  const [categories, setCategories] = useState([]);
  const [regions, setRegions] = useState([]);

  const [errors, setErrors] = useState({
    price: '',
    duration: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/categories', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : (data?.data || []);
        setCategories(arr);
      })
      .catch(err => console.error('載入分類失敗', err));

    fetch('/api/regions', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : (data?.data || []);
        setRegions(arr);
      })
      .catch(err => console.error('載入地區失敗', err));
  }, []);

  const effectiveCategories = categories.length ? categories : CATEGORY_OPTIONS;
  const effectiveRegions = regions.length ? regions : REGION_OPTIONS;

  useEffect(() => {
    // 檢查用戶是否為導師
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        if (userData.role !== 'tutor' && userData.userType !== 'tutor') {
          router.push('/post');
        }
      } catch (e) {
        console.error('解析用戶資料失敗:', e);
        router.push('/post');
      }
    } else {
      router.push('/post');
    }
  }, [router]);

  // 動態獲取科目選項
  const getSubjectOptions = () => {
    const cat = effectiveCategories.find((opt: any) => opt.value === formData.category);
    if (!cat) return [];
    if (cat.subCategories && formData.subCategory) {
      const sub = cat.subCategories.find((sc: any) => sc.value === formData.subCategory);
      return sub ? sub.subjects : [];
    }
    return cat.subjects || [];
  };

  // 動態獲取細分地區選項
  const getSubRegionOptions = () => {
    if (!formData.regions) return [];
    const region = effectiveRegions.find((r: any) => r.value === formData.regions);
    return region ? region.regions || [] : [];
  };

  const handleToggle = (field: 'subjects' | 'modes' | 'subRegions', value: string) => {
    setFormData(prev => {
      const currentValues = prev[field];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [field]: newValues };
    });
  };

  const validatePrice = (value: string) => {
    if (value === '') return '';
    const num = parseInt(value);
    if (isNaN(num) || num < 100) {
      return '最低收費為100港幣/堂';
    }
    return '';
  };

  const validateDuration = (value: string, unit: string) => {
    if (value === '') return '';
    
    if (unit === 'minutes') {
      const num = parseInt(value);
      if (isNaN(num) || num < 30) {
        return '最少30分鐘，請輸入整數';
      }
    } else {
      // 小時模式：允許整數或.5的小數
      if (!/^\d+(\.5)?$/.test(value)) {
        return '請輸入整數或.5的小數（如1.5）';
      }
      const num = parseFloat(value);
      if (num < 1) {
        return '最少1小時';
      }
    }
    return '';
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, price: value }));
    setErrors(prev => ({ ...prev, price: '' }));
  };

  const handlePriceBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setErrors(prev => ({ ...prev, price: validatePrice(value) }));
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 小時模式下允許輸入小數點
    if (formData.durationUnit === 'hours') {
      // 允許輸入數字、一個小數點，以及小數點後的數字
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setFormData(prev => ({ ...prev, duration: value }));
        setErrors(prev => ({ ...prev, duration: '' }));
      }
    } else {
      // 分鐘模式只允許輸入整數
      if (value === '' || /^\d*$/.test(value)) {
        setFormData(prev => ({ ...prev, duration: value }));
        setErrors(prev => ({ ...prev, duration: '' }));
      }
    }
  };

  const handleDurationBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setErrors(prev => ({ ...prev, duration: validateDuration(value, formData.durationUnit) }));
  };

  const handleDurationUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newUnit = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      durationUnit: newUnit,
      duration: '' // 切換單位時清空時長
    }));
    setErrors(prev => ({ ...prev, duration: '' }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        alert('請先登入');
        router.push('/login');
        return;
      }
      const user = JSON.parse(userStr);
      const submitData = {
        student: user.id,  // 使用 student 字段
        type: 'tutor',  // 添加 type 字段來標識這是導師發布的個案
        title: formData.title || `${formData.subjects.join('、')}補習`,  // 如果沒有填寫標題，使用科目作為標題
        description: formData.description,
        subject: formData.subjects[0],  // 主要科目
        subjects: formData.subjects,
        category: formData.category,
        subCategory: formData.subCategory,
        regions: formData.regions ? [formData.regions] : [],
        subRegions: formData.subRegions,
        mode: formData.modes[0] || 'online',  // 確保有預設值
        modes: formData.modes.length > 0 ? formData.modes : ['online'],  // 確保有預設值
        lessonDetails: {
          duration: formData.durationUnit === 'hours' 
            ? Number(formData.duration) * 60  // 將小時轉換為分鐘
            : Number(formData.duration),
          pricePerLesson: Number(formData.price),
          lessonsPerWeek: Number(formData.weeklyLessons)
        },
        experience: "無教學經驗要求" as const,  // 使用字串字面量類型
        status: "open" as const,  // 使用字串字面量類型
        featured: false,
        isApproved: false
      };

      // 驗證必要欄位
      if (!submitData.title || !submitData.description || !submitData.subjects.length || !submitData.category) {
        throw new Error('請填寫所有必要欄位');
      }

      // 驗證課堂時長
      const duration = submitData.lessonDetails.duration;
      if (duration < 30 || duration > 180 || duration % 30 !== 0) {
        throw new Error('課堂時長必須在30-180分鐘之間，且必須是30分鐘的倍數');
      }

      const result = await caseApi.createTutorCase(submitData);
      alert('個案發布成功！');
      router.push('/find-student-cases');

    } catch (error) {
      console.error('發布個案時出錯:', error);
      alert(error instanceof Error ? error.message : '發布失敗');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">發布招學生個案</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 分類 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">分類</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value, subCategory: '', subjects: [] })}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="">請選擇</option>
                {effectiveCategories.map((opt: any) => (
                  <option key={opt.value || opt.label} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            {/* 子分類（如有） */}
            {effectiveCategories.find((opt: any) => opt.value === formData.category)?.subCategories && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">子分類</label>
                <select
                  value={formData.subCategory}
                  onChange={e => setFormData({ ...formData, subCategory: e.target.value, subjects: [] })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">請選擇</option>
                  {effectiveCategories.find((opt: any) => opt.value === formData.category)?.subCategories?.map((sub: any) => (
                    <option key={sub.value || sub.label} value={sub.value}>{sub.label}</option>
                  ))}
                </select>
              </div>
            )}
            {/* 科目（多選） */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">科目（可多選）</label>
              <div className="flex flex-wrap gap-2">
                {getSubjectOptions().map(subj => (
                  <TagCheckbox
                    key={subj.value}
                    label={subj.label}
                    value={subj.value}
                    isSelected={formData.subjects.includes(subj.value)}
                    onToggle={(value) => handleToggle('subjects', value)}
                  />
                ))}
              </div>
            </div>

            {/* 教學模式（多選） */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">教學模式（可多選）</label>
              <div className="flex flex-wrap gap-2">
                {TEACHING_MODE_OPTIONS.map(mode => (
                  <div key={mode.value} className="space-y-2">
                    <TagCheckbox
                      label={mode.label}
                      value={mode.value}
                      isSelected={formData.modes.includes(mode.value)}
                      onToggle={(value) => handleToggle('modes', value)}
                    />
                    {/* 顯示面授子分類 */}
                    {(mode.value === 'in-person' || mode.value === 'both') && (formData.modes.includes('in-person') || formData.modes.includes('both')) && (
                      <div className="ml-4 space-y-1">
                        {mode.subCategories.map((subMode: { value: string; label: string }) => (
                          <TagCheckbox
                            key={subMode.value}
                            label={subMode.label}
                            value={subMode.value}
                            isSelected={formData.modes.includes(subMode.value)}
                            onToggle={(value) => handleToggle('modes', value)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 地區（單選，僅選面授或皆可時顯示） */}
            {(formData.modes.includes('in-person') || formData.modes.includes('both')) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">地區</label>
                <select value={formData.regions} onChange={e => setFormData({ ...formData, regions: e.target.value, subRegions: [] })} className="w-full px-3 py-2 border rounded-md">
                  <option value="">請選擇</option>
                  {effectiveRegions.filter(opt => opt.value !== 'all-hong-kong').map(opt => (
                    <option key={opt.value || opt.label} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* 細分地區（多選，僅選面授或皆可時顯示） */}
            {(formData.modes.includes('in-person') || formData.modes.includes('both')) && getSubRegionOptions().length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">細分地區（可多選）</label>
                <div className="flex flex-wrap gap-2">
                  {getSubRegionOptions().map(sub => (
                    <TagCheckbox
                      key={sub.value}
                      label={sub.label}
                      value={sub.value}
                      isSelected={formData.subRegions.includes(sub.value)}
                      onToggle={(value) => handleToggle('subRegions', value)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 價錢 */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                價錢（港幣/堂）
              </label>
              <input
                type="text"
                id="price"
                name="price"
                value={formData.price}
                onChange={handlePriceChange}
                onBlur={handlePriceBlur}
                className={`mt-1 block w-full px-3 py-2 border ${errors.price ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-yellow-400 focus:border-yellow-400`}
                placeholder="請輸入每堂收費"
                required
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-500">{errors.price}</p>
              )}
            </div>

            {/* 每堂時長 */}
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                每堂時長
              </label>
              <div className="mt-1 flex space-x-2">
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleDurationChange}
                  onBlur={handleDurationBlur}
                  className={`block w-full px-3 py-2 border ${errors.duration ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-yellow-400 focus:border-yellow-400`}
                  placeholder={formData.durationUnit === 'minutes' ? "最少30分鐘" : "最少1小時"}
                  required
                />
                <select
                  id="durationUnit"
                  name="durationUnit"
                  value={formData.durationUnit}
                  onChange={handleDurationUnitChange}
                  className="block w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-400 focus:border-yellow-400"
                >
                  <option value="minutes">分鐘</option>
                  <option value="hours">小時</option>
                </select>
              </div>
              {errors.duration && (
                <p className="mt-1 text-sm text-red-500">{errors.duration}</p>
              )}
            </div>

            {/* 每星期堂數 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">每星期堂數</label>
              <input
                type="number"
                value={formData.weeklyLessons}
                onChange={e => setFormData({ ...formData, weeklyLessons: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="例如：2"
                min={1}
                required
              />
            </div>

            {/* 詳細描述 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">詳細描述</label>
              <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border rounded-md" rows={4} placeholder="請詳細描述您的需求、經驗要求、學習目標、時間安排、特殊要求等" required />
            </div>

            {/* 提交按鈕 */}
            <div className="flex justify-end space-x-4">
              <button type="button" onClick={() => router.back()} className="px-4 py-2 border rounded-md hover:bg-gray-50 transition">返回</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">發布</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 