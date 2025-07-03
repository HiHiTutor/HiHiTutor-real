'use client';

import { useEffect, useState } from 'react';
import { tutorApi } from '@/services/api';

export default function TestTutorsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("🔍 測試獲取導師資料...");
        
        const result = await tutorApi.getAllTutors({ category: 'early-childhood', limit: 5 });
        console.log("📦 測試結果：", result);
        
        setData(result);
      } catch (err) {
        console.error('❌ 測試錯誤：', err);
        setError(err instanceof Error ? err.message : '未知錯誤');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">測試導師 API</h1>
        <p>載入中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">測試導師 API</h1>
        <p className="text-red-500">錯誤：{error}</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">測試導師 API</h1>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">原始數據：</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>

      {data?.data?.tutors && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">導師列表：</h2>
          <div className="space-y-2">
            {data.data.tutors.map((tutor: any, index: number) => (
              <div key={tutor.id} className="border p-3 rounded">
                <p><strong>名稱：</strong>{tutor.name}</p>
                <p><strong>ID：</strong>{tutor.tutorId}</p>
                <p><strong>科目：</strong>{tutor.subjects?.join(', ')}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 