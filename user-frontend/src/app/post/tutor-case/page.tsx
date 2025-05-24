'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TagCheckbox from '@/components/TagCheckbox';
import CATEGORY_OPTIONS from '@/constants/categoryOptions';
import REGION_OPTIONS from '@/constants/regionOptions';
import { caseApi } from '@/services/api';

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
    lessonDuration: '',
    durationUnit: 'minutes',
    weeklyLessons: ''
  });

  const [categories, setCategories] = useState([]);
  const [regions, setRegions] = useState([]);

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
        tutorId: user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        subCategory: formData.subCategory,
        subjects: formData.subjects,
        modes: formData.modes,
        regions: formData.regions ? [formData.regions] : [],
        subRegions: formData.subRegions,
        price: Number(formData.price),
        location: formData.location,
        lessonDuration: Number(formData.lessonDuration),
        durationUnit: formData.durationUnit,
        weeklyLessons: Number(formData.weeklyLessons)
      };

      const result = await caseApi.createStudentCase(submitData);
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
        <h1 className="text-3xl font-bold text-center mb-8">發布招導師個案</h1>
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
                <TagCheckbox
                  label="面授"
                  value="in-person"
                  isSelected={formData.modes.includes('in-person')}
                  onToggle={(value) => handleToggle('modes', value)}
                />
                <TagCheckbox
                  label="網課"
                  value="online"
                  isSelected={formData.modes.includes('online')}
                  onToggle={(value) => handleToggle('modes', value)}
                />
              </div>
            </div>

            {/* 地區（單選，僅選面授時顯示） */}
            {formData.modes.includes('in-person') && (
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

            {/* 細分地區（多選，僅選面授時顯示） */}
            {formData.modes.includes('in-person') && getSubRegionOptions().length > 0 && (
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
              <label className="block text-sm font-medium text-gray-700 mb-1">價錢（港幣/堂）</label>
              <input
                type="number"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="例如：300"
                min={0}
                required
              />
            </div>

            {/* 每堂時長 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">每堂時長</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={formData.lessonDuration}
                  onChange={e => setFormData({ ...formData, lessonDuration: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-md"
                  placeholder="例如：60"
                  min={1}
                  required
                />
                <select
                  value={formData.durationUnit}
                  onChange={e => setFormData({ ...formData, durationUnit: e.target.value })}
                  className="w-32 px-3 py-2 border rounded-md"
                >
                  <option value="minutes">分鐘</option>
                  <option value="hours">小時</option>
                </select>
              </div>
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