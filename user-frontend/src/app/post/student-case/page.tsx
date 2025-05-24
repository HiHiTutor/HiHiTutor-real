'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CATEGORY_OPTIONS from '@/constants/categoryOptions';
import REGION_OPTIONS from '@/constants/regionOptions';
import TagCheckbox from '@/components/TagCheckbox';
import { caseApi } from '@/services/api';

export default function StudentCasePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subCategory: '',
    subjects: [] as string[],
    regions: '',
    subRegions: [] as string[],
    modes: [] as string[],
    budgetMin: '',
    budgetMax: ''
  });

  // 動態獲取科目選項
  const getSubjectOptions = () => {
    const cat = CATEGORY_OPTIONS.find(opt => opt.value === formData.category);
    if (!cat) return [];
    if (cat.subCategories && formData.subCategory) {
      const sub = cat.subCategories.find(sc => sc.value === formData.subCategory);
      return sub ? sub.subjects : [];
    }
    return cat.subjects || [];
  };

  // 動態獲取細分地區選項
  const getSubRegionOptions = () => {
    if (!formData.regions) return [];
    const region = REGION_OPTIONS.find(r => r.value === formData.regions);
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
      console.log('👤 Current user:', user);

      if (!user.id) {
        console.error('❌ User ID not found in user data');
        alert('用戶資料不完整，請重新登入');
        router.push('/login');
        return;
      }

      const submitData = {
        studentId: Number(user.id),
        category: formData.category,
        subCategory: formData.subCategory,
        subjects: formData.subjects,
        regions: formData.regions ? [formData.regions] : [],
        subRegions: formData.subRegions,
        budget: {
          min: Number(formData.budgetMin),
          max: Number(formData.budgetMax)
        }
      };

      console.log('📦 Submitting data:', submitData);

      const result = await caseApi.createTutorCase(submitData);
      console.log('✅ Case created successfully:', result);
      
      alert('個案發布成功！');
      router.push('/find-tutor-cases');

    } catch (error) {
      console.error('❌ Error creating case:', error);
      alert(error instanceof Error ? error.message : '發布失敗');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">發布招學生個案</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 標題 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">個案標題</label>
              <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border rounded-md" placeholder="例如：DSE數學補習" required />
            </div>
            {/* 分類 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">分類</label>
              <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value, subCategory: '', subjects: [] })} className="w-full px-3 py-2 border rounded-md" required>
                <option value="">請選擇</option>
                {CATEGORY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            {/* 子分類（如有） */}
            {CATEGORY_OPTIONS.find(opt => opt.value === formData.category)?.subCategories && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">子分類</label>
                <select value={formData.subCategory} onChange={e => setFormData({ ...formData, subCategory: e.target.value, subjects: [] })} className="w-full px-3 py-2 border rounded-md" required>
                  <option value="">請選擇</option>
                  {CATEGORY_OPTIONS.find(opt => opt.value === formData.category)?.subCategories?.map(sub => <option key={sub.value} value={sub.value}>{sub.label}</option>)}
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
                  {REGION_OPTIONS.filter(opt => opt.value !== 'all-hong-kong').map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
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
            {/* 預算 */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">預算（最低）</label>
                <input type="number" value={formData.budgetMin} onChange={e => setFormData({ ...formData, budgetMin: e.target.value })} className="w-full px-3 py-2 border rounded-md" placeholder="例如：200" required />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">預算（最高）</label>
                <input type="number" value={formData.budgetMax} onChange={e => setFormData({ ...formData, budgetMax: e.target.value })} className="w-full px-3 py-2 border rounded-md" placeholder="例如：400" required />
              </div>
            </div>
            {/* 詳細描述 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">詳細描述（請包括經驗要求等）</label>
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