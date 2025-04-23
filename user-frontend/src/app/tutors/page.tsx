'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import TutorCard from '@/components/TutorCard';

interface Tutor {
  id: number;
  name: string;
  subject: string;
  experience: string;
  avatar: string;
  rating?: number;
}

export default function TutorsPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q');
  
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(searchQuery || '');

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        setLoading(true);
        const url = searchQuery 
          ? `/api/search?q=${encodeURIComponent(searchQuery)}`
          : '/api/tutors';
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('獲取導師資料失敗');
        }
        const data = await response.json();
        setTutors(data);
        setError(null);
      } catch (err) {
        console.error('獲取導師資料失敗:', err);
        setError(err instanceof Error ? err.message : '未知錯誤');
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(window.location.search);
    if (searchInput.trim()) {
      params.set('q', searchInput.trim());
    } else {
      params.delete('q');
    }
    window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
    // 強制重新渲染以觸發 useEffect
    window.location.reload();
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-screen-xl mx-auto px-4 md:px-12">
        {/* 搜尋區塊 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">🔍 尋找導師</h1>
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="輸入科目、年級或地區..."
              className="flex-1 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <button
              type="submit"
              className="bg-yellow-400 text-white px-8 py-2 rounded-md hover:bg-yellow-500 transition-colors"
            >
              搜尋
            </button>
          </form>
        </div>

        {/* 導師列表 */}
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-600 p-4">
              {error}
            </div>
          ) : tutors.length === 0 ? (
            <div className="text-center text-gray-600 p-4">
              沒有找到符合條件的導師
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tutors.map((tutor) => (
                <TutorCard key={tutor.id} tutor={tutor} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 