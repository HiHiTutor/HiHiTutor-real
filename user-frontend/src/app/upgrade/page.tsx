"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CATEGORY_OPTIONS from '@/constants/categoryOptions';
import { REGION_OPTIONS } from '@/constants/regionOptions';

interface FormData {
  name: string;
  gender: string;
  birthDate: string;
  education: string;
  experience: number;
  courseFeatures: string;
  subjects: string[];
  regions: string[];
  teachingMode: string[];
  hourlyRate: string;
  files: File[];
}

export default function UpgradePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    gender: "",
    birthDate: "",
    education: "",
    experience: 0,
    courseFeatures: "",
    subjects: [],
    regions: [],
    teachingMode: [],
    hourlyRate: "",
    files: []
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [availableSubRegions, setAvailableSubRegions] = useState<any[]>([]);
  const [fileInputs, setFileInputs] = useState([0]);

  // 過濾掉"不限"選項的課程分類
  const filteredCategories = CATEGORY_OPTIONS.filter(category => category.value !== 'unlimited');

  // 過濾掉"不限"和"全香港"選項的地區
  const filteredRegions = REGION_OPTIONS.filter(region => 
    region.value !== 'unlimited' && region.value !== 'all-hong-kong'
  );

  // 上堂形式選項
  const teachingModeOptions = [
    { value: 'in-person', label: '面授' },
    { value: 'online', label: '網課' }
  ];

  // 檢查登入狀態
  const checkLogin = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return false;
    }
    return true;
  };

  // 處理分類選擇
  const handleCategoryChange = (categoryValue: string) => {
    setSelectedCategory(categoryValue);
    setSelectedSubCategory("");
    
    const category = filteredCategories.find(cat => cat.value === categoryValue);
    if (category) {
      if (category.subCategories) {
        setAvailableSubjects([]);
      } else {
        setAvailableSubjects(category.subjects || []);
      }
    } else {
      setAvailableSubjects([]);
    }
  };

  // 處理子分類選擇
  const handleSubCategoryChange = (subCategoryValue: string) => {
    setSelectedSubCategory(subCategoryValue);
    
    const category = filteredCategories.find(cat => cat.value === selectedCategory);
    if (category?.subCategories) {
      const subCategory = category.subCategories.find(sub => sub.value === subCategoryValue);
      if (subCategory) {
        setAvailableSubjects(subCategory.subjects || []);
      }
    }
  };

  // 處理科目選擇
  const handleSubjectChange = (subjectValue: string) => {
    setFormData(prev => {
      const newSubjects = prev.subjects.includes(subjectValue)
        ? prev.subjects.filter(s => s !== subjectValue)
        : [...prev.subjects, subjectValue];
      return { ...prev, subjects: newSubjects };
    });
  };

  // 處理地區選擇
  const handleRegionChange = (regionValue: string) => {
    setSelectedRegion(regionValue);
    
    const region = filteredRegions.find(reg => reg.value === regionValue);
    if (region && region.regions && region.regions.length > 0) {
      setAvailableSubRegions(region.regions);
    } else {
      setAvailableSubRegions([]);
    }
  };

  // 處理子地區選擇
  const handleSubRegionChange = (subRegionValue: string) => {
    setFormData(prev => {
      const newRegions = prev.regions.includes(subRegionValue)
        ? prev.regions.filter(r => r !== subRegionValue)
        : [...prev.regions, subRegionValue];
      return { ...prev, regions: newRegions };
    });
  };

  // 處理上堂形式選擇
  const handleTeachingModeChange = (modeValue: string) => {
    setFormData(prev => {
      const newModes = prev.teachingMode.includes(modeValue)
        ? prev.teachingMode.filter(m => m !== modeValue)
        : [...prev.teachingMode, modeValue];
      return { ...prev, teachingMode: newModes };
    });
  };

  // 處理文件上傳
  const handleFileChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        files: [...prev.files, file]
      }));
    }
  };

  // 獲取科目標籤
  const getSubjectLabel = (subjectValue: string) => {
    for (const category of filteredCategories) {
      if (category.subjects) {
        const subject = category.subjects.find(s => s.value === subjectValue);
        if (subject) return subject.label;
      }
      if (category.subCategories) {
        for (const subCategory of category.subCategories) {
          const subject = subCategory.subjects.find(s => s.value === subjectValue);
          if (subject) return subject.label;
        }
      }
    }
    return subjectValue;
  };

  // 獲取地區標籤
  const getRegionLabel = (regionValue: string) => {
    for (const region of filteredRegions) {
      if (region.regions) {
        const subRegion = region.regions.find(r => r.value === regionValue);
        if (subRegion) return subRegion.label;
      }
      if (region.value === regionValue) return region.label;
    }
    return regionValue;
  };

  // 添加文件輸入
  const addFileInput = () => {
    setFileInputs(prev => [...prev, prev.length]);
  };

  // 提交表單
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!checkLogin()) return;
    
    setLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('gender', formData.gender);
      formDataToSend.append('birthDate', formData.birthDate);
      formDataToSend.append('education', formData.education);
      formDataToSend.append('experience', formData.experience.toString());
      formDataToSend.append('courseFeatures', formData.courseFeatures);
      formDataToSend.append('subjects', JSON.stringify(formData.subjects));
      formDataToSend.append('regions', JSON.stringify(formData.regions));
      formDataToSend.append('teachingMode', JSON.stringify(formData.teachingMode));
      formDataToSend.append('hourlyRate', formData.hourlyRate);
      
      formData.files.forEach((file, index) => {
        formDataToSend.append(`file${index}`, file);
      });

      // 檢查認證令牌
      const token = localStorage.getItem('token');
      console.log('🔐 認證令牌:', token ? '存在' : '不存在');
      
      if (!token) {
        setError('請先登入');
        setLoading(false);
        return;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/tutor-applications/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const result = await response.json();

      if (response.ok) {
        setShowSuccessModal(true);
        setMessage("申請已提交，我們會盡快處理您的申請。");
      } else {
        setError(result.message || "提交失敗，請重試");
      }
    } catch (err) {
      setError("網絡錯誤，請重試");
    } finally {
      setLoading(false);
    }
  };

  // 如果未登入，顯示載入中
  if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">申請成為導師</h1>
            <p className="text-gray-600">請填寫以下資料，我們會盡快處理您的申請</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 稱呼 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                稱呼 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="請輸入您的稱呼"
                required
              />
            </div>

            {/* 性別 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                性別 *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === "male"}
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">男</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.gender === "female"}
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">女</span>
                </label>
              </div>
            </div>

            {/* 出生年月日 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                出生年月日 *
              </label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            {/* 個人簡介 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                個人簡介 *
              </label>
              <textarea
                value={formData.education}
                onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows={4}
                placeholder="請描述您的教育背景，包括學歷、專業等"
                required
              />
            </div>

            {/* 教學經驗 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                教學經驗 *
              </label>
              <input
                type="number"
                value={formData.experience}
                onChange={(e) => setFormData(prev => ({ ...prev, experience: parseInt(e.target.value) || 0 }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="請輸入教學年數"
                min="0"
                max="50"
                required
              />
              <p className="text-sm text-gray-500 mt-1">請輸入您的教學經驗年數</p>
            </div>


            {/* 課程特點 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                課程特點 *
              </label>
              <textarea
                value={formData.courseFeatures}
                onChange={(e) => setFormData(prev => ({ ...prev, courseFeatures: e.target.value }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows={4}
                placeholder="請描述您的課程特點..."
                maxLength={800}
                required
              />
              <p className="text-sm text-gray-500 mt-1">{formData.courseFeatures.length}/800</p>
            </div>

            {/* 教授科目 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                教授科目 *
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="">請選擇課程分類</option>
                {filteredCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 子分類（如果有） */}
            {selectedCategory && filteredCategories.find(cat => cat.value === selectedCategory)?.subCategories && (
              <div>
                <select
                  value={selectedSubCategory}
                  onChange={(e) => handleSubCategoryChange(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                >
                  <option value="">請選擇子分類</option>
                  {filteredCategories.find(cat => cat.value === selectedCategory)?.subCategories?.map((subCategory) => (
                    <option key={subCategory.value} value={subCategory.value}>
                      {subCategory.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 科目選擇 */}
            {availableSubjects.length > 0 && (
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto border border-gray-300 rounded-md p-4">
                  {availableSubjects.map((subject) => (
                    <label key={subject.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.subjects.includes(subject.value)}
                        onChange={() => handleSubjectChange(subject.value)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">{subject.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* 已選科目 */}
            {formData.subjects.length > 0 && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">已選科目：</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.subjects.map((subject) => (
                    <span
                      key={subject}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
                    >
                      {getSubjectLabel(subject)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 上堂地區 */}
            {!(formData.teachingMode.length === 1 && formData.teachingMode.includes('online')) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  上堂地區 *
                </label>
                <select
                  value={selectedRegion}
                  onChange={(e) => handleRegionChange(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                >
                  <option value="">請選擇地區</option>
                  {filteredRegions.map((region) => (
                    <option key={region.value} value={region.value}>
                      {region.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 子地區（如果有） */}
            {selectedRegion && availableSubRegions.length > 0 && (
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto border border-gray-300 rounded-md p-4">
                  {availableSubRegions.map((subRegion) => (
                    <label key={subRegion.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.regions.includes(subRegion.value)}
                        onChange={() => handleSubRegionChange(subRegion.value)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">{subRegion.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* 已選地區 */}
            {formData.regions.length > 0 && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">已選地區：</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.regions.map((region) => (
                    <span
                      key={region}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                    >
                      {getRegionLabel(region)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 上堂形式 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                上堂形式 *
              </label>
              <div className="grid grid-cols-2 gap-4">
                {teachingModeOptions.map((mode) => (
                  <label key={mode.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.teachingMode.includes(mode.value)}
                      onChange={() => handleTeachingModeChange(mode.value)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">{mode.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 已選上堂形式 */}
            {formData.teachingMode.length > 0 && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">已選上堂形式：</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.teachingMode.map((mode) => (
                    <span
                      key={mode}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {teachingModeOptions.find(m => m.value === mode)?.label || mode}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 要求時薪 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                要求時薪 *
              </label>
              <input
                type="number"
                value={formData.hourlyRate}
                onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="請輸入您期望的時薪（港幣）"
                min="0"
                step="10"
                required
              />
            </div>

            {/* 文件上傳 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                上傳證明文件
              </label>
              {fileInputs.map((inputIdx, idx) => (
                <div key={inputIdx} className="flex items-center mb-2">
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(idx, e)}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addFileInput}
                className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
              >
                + 添加更多文件
              </button>
            </div>

            {/* 錯誤訊息 */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* 提交按鈕 */}
            <div className="flex justify-end space-x-4">
              <Link
                href="/"
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                取消
              </Link>
              <button
                type="submit"
                disabled={loading || !formData.name || !formData.gender || !formData.birthDate || !formData.education || formData.experience === 0 || !formData.courseFeatures || formData.subjects.length === 0 || (formData.teachingMode.length === 0) || (!(formData.teachingMode.length === 1 && formData.teachingMode.includes('online')) && formData.regions.length === 0) || !formData.hourlyRate}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "提交中..." : "提交申請"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 成功模態框 */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">申請提交成功！</h3>
              <p className="text-gray-600 mb-6">{message}</p>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push('/');
                }}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
              >
                返回首頁
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}