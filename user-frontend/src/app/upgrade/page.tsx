"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CATEGORY_OPTIONS from "@/constants/categoryOptions";

interface FormData {
  education: string;
  experience: string;
  subjects: string[];
  files: File[];
}

interface SubjectOption {
  value: string;
  label: string;
  category: string;
  subCategory?: string;
}

export default function UpgradePage() {
  const [formData, setFormData] = useState<FormData>({
    education: "",
    experience: "",
    subjects: [],
    files: []
  });
  const [fileInputs, setFileInputs] = useState([0]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
  const [availableSubjects, setAvailableSubjects] = useState<SubjectOption[]>([]);
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

  // 過濾掉"不限"選項
  const filteredCategories = CATEGORY_OPTIONS.filter(cat => cat.value !== 'unlimited');

  useEffect(() => {
    // 檢查用戶是否已登入
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }
  }, [router]);

  // 當選擇課程分類時，更新可選科目
  useEffect(() => {
    if (selectedCategory) {
      const category = filteredCategories.find(cat => cat.value === selectedCategory);
      if (category) {
        if (category.subCategories) {
          // 如果有子分類，先清空科目列表
          setAvailableSubjects([]);
          setSelectedSubCategory("");
        } else {
          // 如果沒有子分類，直接顯示科目
          const subjects = category.subjects?.map(subject => ({
            ...subject,
            category: category.label
          })) || [];
          setAvailableSubjects(subjects);
        }
      }
    } else {
      setAvailableSubjects([]);
      setSelectedSubCategory("");
    }
  }, [selectedCategory]);

  // 當選擇子分類時，更新可選科目
  useEffect(() => {
    if (selectedCategory && selectedSubCategory) {
      const category = filteredCategories.find(cat => cat.value === selectedCategory);
      if (category?.subCategories) {
        const subCategory = category.subCategories.find(sub => sub.value === selectedSubCategory);
        if (subCategory) {
          const subjects = subCategory.subjects.map(subject => ({
            ...subject,
            category: category.label,
            subCategory: subCategory.label
          }));
          setAvailableSubjects(subjects);
        }
      }
    }
  }, [selectedCategory, selectedSubCategory]);

  const handleFileChange = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData(prev => {
        const newFiles = [...prev.files];
        newFiles[idx] = e.target.files![0];
        return { ...prev, files: newFiles };
      });
    }
  };

  const handleAddFileInput = () => {
    setFileInputs((prev) => [...prev, prev.length]);
  };

  const handleRemoveFileInput = (idx: number) => {
    setFileInputs((prev) => prev.filter((_, i) => i !== idx));
    setFormData((prev) => {
      const newFiles = prev.files.filter((_, i) => i !== idx);
      return { ...prev, files: newFiles };
    });
  };

  const handleSubjectChange = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const removeSelectedSubject = (subjectValue: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s !== subjectValue)
    }));
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 表單驗證
    if (!formData.education.trim()) {
      setError("請填寫學歷背景");
      return;
    }
    if (!formData.experience.trim()) {
      setError("請填寫教學經驗");
      return;
    }
    if (formData.subjects.length === 0) {
      setError("請至少選擇一個教授科目");
      return;
    }
    if (formData.files.length === 0) {
      setError("請上傳相關證明文件");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('請先登入');
      }

      // 1. 上傳文件
      const uploadedUrls: string[] = [];
      for (const file of formData.files) {
        const formDataObj = new FormData();
        formDataObj.append("file", file);
        
        const res = await fetch(`${API_BASE}/api/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataObj,
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "檔案上傳失敗");
        }

        const data = await res.json();
        if (data.success && data.url) {
          uploadedUrls.push(data.url);
        } else {
          throw new Error("檔案上傳失敗");
        }
      }

      // 2. 提交申請
      const applyRes = await fetch(`${API_BASE}/api/tutor-applications/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          education: formData.education,
          experience: formData.experience,
          subjects: formData.subjects,
          documents: uploadedUrls,
        }),
      });

      if (!applyRes.ok) {
        const errorData = await applyRes.json();
        throw new Error(errorData.message || "申請失敗");
      }

      setMessage("✅ 申請已成功提交！我們已收到您的導師申請，後台管理員將會審核您的資料。審核結果將通過電郵通知您，請耐心等待。");
      setTimeout(() => {
        router.push("/profile");
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "提交失敗，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h1 className="text-xl font-semibold text-gray-800">申請成為導師</h1>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-center">{error}</p>
              </div>
            )}
            {message && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center justify-center mb-3">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-green-800 text-center text-lg font-medium">{message}</p>
                <p className="text-green-600 text-center text-sm mt-2">即將跳轉到個人資料頁面...</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  學歷背景
                </label>
                <textarea
                  value={formData.education}
                  onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows={4}
                  placeholder="請詳細說明您的學歷背景，包括學校、主修科目等"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  教學經驗
                </label>
                <textarea
                  value={formData.experience}
                  onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows={4}
                  placeholder="請詳細說明您的教學經驗，包括教授科目、年資等"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  可教授科目（可多選）
                </label>
                
                {/* 已選選項 */}
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
                          <button
                            type="button"
                            onClick={() => removeSelectedSubject(subject)}
                            className="ml-2 text-indigo-600 hover:text-indigo-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 下拉式選擇 */}
                <div className="space-y-3">
                  {/* 課程分類選擇 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      課程分類
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="">請選擇課程分類</option>
                      {filteredCategories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 子分類選擇（如果有） */}
                  {selectedCategory && filteredCategories.find(cat => cat.value === selectedCategory)?.subCategories && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        子分類
                      </label>
                      <select
                        value={selectedSubCategory}
                        onChange={(e) => setSelectedSubCategory(e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="">請選擇子分類</option>
                        {filteredCategories
                          .find(cat => cat.value === selectedCategory)
                          ?.subCategories?.map((subCategory) => (
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        可選科目
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                </div>
              </div>

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
                    {fileInputs.length > 1 && (
                      <button type="button" onClick={() => handleRemoveFileInput(idx)} className="ml-2 text-red-500">✕</button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={handleAddFileInput} className="mt-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200">＋ 新增檔案</button>
                <p className="mt-1 text-sm text-gray-500">
                  請上傳相關證明文件（學歷證明、教學證明等）
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 px-4 py-2 text-white rounded-md transition-colors ${
                  loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {loading ? '提交中...' : '提交申請'}
              </button>
              <Link
                href="/profile"
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-center"
              >
                返回個人資料
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 