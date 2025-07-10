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
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

  useEffect(() => {
    // 檢查用戶是否已登入
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }
  }, [router]);

  const handleFileChange = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData(prev => {
        const newFiles = [...prev.files];
        newFiles[idx] = e.target.files[0];
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

      setMessage("申請已成功提交！");
      setTimeout(() => {
        router.push("/profile");
      }, 2000);
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
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-600 text-center">{message}</p>
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
                <div className="space-y-4">
                  {CATEGORY_OPTIONS.map((category) => (
                    <div key={category.value} className="border rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-3">{category.label}</h3>
                      {category.subCategories ? (
                        // 如果有子類別，顯示子類別
                        category.subCategories.map((subCategory) => (
                          <div key={subCategory.value} className="mb-4 last:mb-0">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">{subCategory.label}</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {subCategory.subjects.map((subject) => (
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
                        ))
                      ) : (
                        // 如果沒有子類別，直接顯示科目
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {category.subjects?.map((subject) => (
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
                      )}
                    </div>
                  ))}
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