"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface FormData {
  education: string;
  experience: string;
  subjects: string[];
  files: File[];
}

const SUBJECT_OPTIONS = [
  "數學", "英文", "中文", "物理", "化學", "生物",
  "經濟", "歷史", "地理", "通識", "音樂", "美術"
];

export default function UpgradePage() {
  const [formData, setFormData] = useState<FormData>({
    education: "",
    experience: "",
    subjects: [],
    files: []
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

  useEffect(() => {
    // 檢查用戶權限
    const currentUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
    if (!currentUser.userType || currentUser.userType !== 'student') {
      router.replace('/');
      return;
    }
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData(prev => ({
        ...prev,
        files: Array.from(e.target.files || [])
      }));
    }
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
      const currentUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
      
      // 1. 上傳文件
      const uploadedUrls: string[] = [];
      for (const file of formData.files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("userId", currentUser.id || 'unknown');
        const res = await fetch(`${API_BASE}/api/upload`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.success && data.url) {
          uploadedUrls.push(data.url);
        } else {
          throw new Error(data.message || "檔案上傳失敗");
        }
      }

      // 2. 提交申請
      const applyRes = await fetch(`${API_BASE}/api/tutor-applications/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          education: formData.education,
          experience: formData.experience,
          subjects: formData.subjects,
          documents: uploadedUrls,
        }),
      });

      if (!applyRes.ok) {
        const text = await applyRes.text();
        throw new Error(`申請失敗：${applyRes.status} - ${text}`);
      }

      const applyData = await applyRes.json();
      if (applyData.success) {
        setMessage("申請已提交成功！請等待管理員審核。");
        // 清空表單
        setFormData({
          education: "",
          experience: "",
          subjects: [],
          files: []
        });
      } else {
        throw new Error(applyData.message || "申請失敗");
      }
    } catch (err: any) {
      setError(err.message || "提交時發生錯誤");
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
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SUBJECT_OPTIONS.map((subject) => (
                    <label key={subject} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.subjects.includes(subject)}
                        onChange={() => handleSubjectChange(subject)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">{subject}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  上傳證明文件
                </label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
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