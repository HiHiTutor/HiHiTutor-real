'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CATEGORY_OPTIONS from '@/constants/categoryOptions';
import REGION_OPTIONS from '@/constants/regionOptions';

export default function TutorCasePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subCategory: '',
    subjects: '',
    modes: '',
    regions: '',
    subRegions: '',
    price: '',
    location: ''
  });

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
        subRegions: formData.subRegions,
        price: formData.price,
        location: formData.location
      };
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/find-student-cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });
      const result = await response.json();
      if (result.success) {
        alert('個案發布成功！');
        router.push('/cases');
      } else {
        throw new Error(result.message || '發布失敗');
      }
    } catch (error) {
      console.error('發布個案時出錯:', error);
      alert(error instanceof Error ? error.message : '發布個案時出錯');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">發布招導師個案</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 科目（多選） */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">科目（可多選）</label>
              <select multiple value={formData.subjects.split(',')} onChange={e => {
                const selectedValues = Array.from(e.target.selectedOptions, o => o.value);
                const currentSubjects = formData.subjects.split(',').filter(Boolean);
                const newSubjects = selectedValues.filter(val => !currentSubjects.includes(val));
                const finalSubjects = [...currentSubjects, ...newSubjects];
                setFormData({ ...formData, subjects: finalSubjects.join(',') });
              }} className="w-full px-3 py-2 border rounded-md h-32" required>
                {getSubjectOptions().map(subj => <option key={subj.value} value={subj.value}>{subj.label}</option>)}
              </select>
              {formData.subjects && (
                <div className="mt-2 text-sm text-gray-600">
                  已選：{formData.subjects.split(',').map(subj => {
                    const option = getSubjectOptions().find(opt => opt.value === subj);
                    return option ? <span key={subj} className="inline-flex items-center mr-2">✓ {option.label}</span> : null;
                  })}
                </div>
              )}
            </div>

            {/* 教學模式（多選） */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">教學模式（可多選）</label>
              <select multiple value={formData.modes.split(',')} onChange={e => {
                const selectedValues = Array.from(e.target.selectedOptions, o => o.value);
                const currentModes = formData.modes.split(',').filter(Boolean);
                const newModes = selectedValues.filter(val => !currentModes.includes(val));
                const finalModes = [...currentModes, ...newModes];
                setFormData({ ...formData, modes: finalModes.join(',') });
              }} className="w-full px-3 py-2 border rounded-md h-20" required>
                <option value="in-person">面授</option>
                <option value="online">網課</option>
              </select>
              {formData.modes && (
                <div className="mt-2 text-sm text-gray-600">
                  已選：{formData.modes.split(',').map(mode => (
                    <span key={mode} className="inline-flex items-center mr-2">✓ {mode === 'in-person' ? '面授' : '網課'}</span>
                  ))}
                </div>
              )}
            </div>

            {/* 細分地區（多選，僅選面授時顯示） */}
            {formData.modes.includes('in-person') && getSubRegionOptions().length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">細分地區（可多選）</label>
                <select multiple value={formData.subRegions.split(',')} onChange={e => {
                  const selectedValues = Array.from(e.target.selectedOptions, o => o.value);
                  const currentSubRegions = formData.subRegions.split(',').filter(Boolean);
                  const newSubRegions = selectedValues.filter(val => !currentSubRegions.includes(val));
                  const finalSubRegions = [...currentSubRegions, ...newSubRegions];
                  setFormData({ ...formData, subRegions: finalSubRegions.join(',') });
                }} className="w-full px-3 py-2 border rounded-md h-32">
                  {getSubRegionOptions().map(sub => <option key={sub.value} value={sub.value}>{sub.label}</option>)}
                </select>
                {formData.subRegions && (
                  <div className="mt-2 text-sm text-gray-600">
                    已選：{formData.subRegions.split(',').map(sub => {
                      const option = getSubRegionOptions().find(opt => opt.value === sub);
                      return option ? <span key={sub} className="inline-flex items-center mr-2">✓ {option.label}</span> : null;
                    })}
                  </div>
                )}
              </div>
            )}

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