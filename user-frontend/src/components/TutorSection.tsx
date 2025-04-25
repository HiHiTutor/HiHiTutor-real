'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import TutorCard from './TutorCard';

// 導師資料類型定義
interface Tutor {
  id: number;
  name: string;
  subject: string;
  education: string;
  experience: string;
  rating: number;
  avatarUrl: string;
  tags?: string[];
}

const TutorSection = () => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/api/tutors/recommended');
        if (!response.ok) {
          throw new Error('獲取推薦導師失敗');
        }
        const data = await response.json();
        console.log("🔥 導師列表", data);
        setTutors(data);
        setError(null);
      } catch (err) {
        console.error('獲取推薦導師失敗:', err);
        setError('獲取推薦導師失敗，請稍後再試');
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, []);

  return (
    <section className="max-w-screen-xl mx-auto px-4 md:px-12 py-8">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">👩‍🏫</span>
        <h2 className="text-2xl font-bold border-l-4 border-yellow-400 pl-3">精選導師</h2>
      </div>
      <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              <p className="mt-2 text-gray-600">載入中...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>{error}</p>
            </div>
          ) : (
            tutors.map((tutor) => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))
          )}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/tutors"
            className="inline-block bg-white border border-primary text-primary rounded-md px-4 py-2 hover:bg-gray-50 transition-all duration-200"
          >
            查看更多導師
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TutorSection; 