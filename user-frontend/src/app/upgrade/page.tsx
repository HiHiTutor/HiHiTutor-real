"use client";

import { useState } from "react";

export default function UpgradePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const currentUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      setMessage("請選擇要上傳的文件");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      // 1. 逐一上傳所有檔案，收集 url
      const uploadedUrls: string[] = [];
      for (const file of files) {
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
      // 2. 將所有 url 送去申請 API
      const applyRes = await fetch(`${API_BASE}/api/tutor-applications/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          education: "學歷背景（請根據實際表單擴充）",
          experience: "教學經驗（請根據實際表單擴充）",
          subjects: ["數學", "英文"], // 請根據實際表單擴充
          documents: uploadedUrls,
        }),
      });
      if (!applyRes.ok) {
        const text = await applyRes.text();
        throw new Error(`申請失敗：${applyRes.status} - ${text}`);
      }
      const applyData = await applyRes.json();
      if (applyData.success) {
        setMessage("文件已提交，請等待管理員審核。");
        setFiles([]);
      } else {
        throw new Error(applyData.message || "申請失敗");
      }
    } catch (err: any) {
      setMessage(err.message || "提交時發生錯誤");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">升級為導師</h1>
      <p>請上傳學歷證明或相關文件。</p>
      <form className="p-6 space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-2">選擇文件（可多選）</label>
          <input
            type="file"
            multiple
            className="block w-full text-sm text-gray-700 border border-gray-300 rounded-md p-2"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "提交中..." : "提交申請"}
        </button>
        {message && <div className="text-green-600 text-center mt-2">{message}</div>}
      </form>
    </div>
  );
} 