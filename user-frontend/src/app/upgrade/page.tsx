"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface FormData {
  education: string;
  experience: string;
  subjects: string[];
  files: File[];
}

export default function UpgradePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    education: "",
    experience: "",
    subjects: [],
    files: []
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);
  const [fileInputs, setFileInputs] = useState([0]);

  // 靜態科目選項
  const categoryOptions = [
    {
      value: "primary",
      label: "小學",
      subjects: [
        { value: "chinese", label: "中文" },
        { value: "english", label: "英文" },
        { value: "math", label: "數學" },
        { value: "general-studies", label: "常識" }
      ]
    },
    {
      value: "secondary",
      label: "中學",
      subjects: [
        { value: "chinese", label: "中文" },
        { value: "english", label: "英文" },
        { value: "math", label: "數學" },
        { value: "physics", label: "物理" },
        { value: "chemistry", label: "化學" },
        { value: "biology", label: "生物" },
        { value: "history", label: "歷史" },
        { value: "geography", label: "地理" }
      ]
    },
    {
      value: "dse",
      label: "DSE",
      subjects: [
        { value: "chinese", label: "中文" },
        { value: "english", label: "英文" },
        { value: "math", label: "數學" },
        { value: "physics", label: "物理" },
        { value: "chemistry", label: "化學" },
        { value: "biology", label: "生物" },
        { value: "history", label: "歷史" },
        { value: "geography", label: "地理" },
        { value: "economics", label: "經濟" },
        { value: "accounting", label: "會計" }
      ]
    }
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
    
    const category = categoryOptions.find(cat => cat.value === categoryValue);
    if (category) {
      setAvailableSubjects(category.subjects);
    } else {
      setAvailableSubjects([]);
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
      formDataToSend.append('education', formData.education);
      formDataToSend.append('experience', formData.experience);
      formDataToSend.append('subjects', JSON.stringify(formData.subjects));
      
      formData.files.forEach((file, index) => {
        formDataToSend.append(`file${index}`, file);
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/tutor/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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
            {/* 教育背景 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                教育背景 *
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
              <textarea
                value={formData.experience}
                onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows={4}
                placeholder="請描述您的教學經驗，包括教學對象、科目等"
                required
              />
            </div>

            {/* 課程分類 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                課程分類 *
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="">請選擇課程分類</option>
                {categoryOptions.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 可選科目 */}
            {availableSubjects.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  可選科目 *
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
                      {availableSubjects.find(s => s.value === subject)?.label || subject}
                    </span>
                  ))}
                </div>
              </div>
            )}

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
                disabled={loading || formData.subjects.length === 0}
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