'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TutorCasePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    subject: '',
    target: '',
    mode: '面授',
    price: '',
    location: '',
    description: ''
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 從 localStorage 獲取用戶資料
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        alert('請先登入');
        router.push('/login');
        return;
      }
      const user = JSON.parse(userStr);

      // 準備提交的資料
      const submitData = {
        tutorId: user.id,
        name: user.name,
        subject: formData.subject,
        target: formData.target,
        price: formData.price,
        location: formData.location,
        description: formData.description,
        mode: formData.mode,
      };

      // 調用 API
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
        alert('導師個案發布成功！');
        router.push('/find-student-cases');
      } else {
        throw new Error(result.message || '發布失敗');
      }
    } catch (error) {
      console.error('發布導師個案時出錯:', error);
      alert(error instanceof Error ? error.message : '發布導師個案時出錯');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">發布導師個案</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 科目 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                科目
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例如：數學、英文、物理等"
                required
              />
            </div>

            {/* 目標學生 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                目標學生
              </label>
              <input
                type="text"
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例如：中三學生、小六學生等"
                required
              />
            </div>

            {/* 教學模式 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                教學模式
              </label>
              <select
                value={formData.mode}
                onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="面授">面授</option>
                <option value="網上">網上</option>
              </select>
            </div>

            {/* 收費 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                收費（每小時）
              </label>
              <input
                type="text"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例如：300/hr"
                required
              />
            </div>

            {/* 地點 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                地點
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例如：旺角、銅鑼灣等"
                required
              />
            </div>

            {/* 詳細描述 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                詳細描述
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="請詳細描述您的教學經驗、專長、教學方法等"
                required
              />
            </div>

            {/* 提交按鈕 */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border rounded-md hover:bg-gray-50 transition"
              >
                返回
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                發布
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 