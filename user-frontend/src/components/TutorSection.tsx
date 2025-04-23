'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { tutorApi } from '../services/api';

// 導師資料類型定義
interface Tutor {
  id: number;
  name: string;
  subject: string;
  education: string;
  experience: string;
  rating: number;
  avatarUrl: string;
  isRecommended: boolean;
  tags?: string[];
}

const TutorSection = () => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        setLoading(true);
        const data = await tutorApi.getRecommendedTutors();
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

  // 只顯示前 8 位精選導師
  const limitedTutors = tutors.slice(0, 8);

  const handleTutorClick = (tutorId: number) => {
    router.push(`/tutors/${tutorId}`);
  };

  return (
    <section className="mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-primary font-bold text-lg mb-3 border-b-2 border-primary inline-block">
          精選導師
        </h2>
        <div className="bg-blue-50 p-6 rounded-xl border border-yellow-400">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {limitedTutors.map((tutor) => (
                <div
                  key={tutor.id}
                  className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                  onClick={() => handleTutorClick(tutor.id)}
                >
                  <div className="relative h-48 w-full mb-4">
                    <Image
                      src={tutor.avatarUrl || '/avatars/default.png'}
                      alt={tutor.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">{tutor.name}</h3>
                      <div className="flex items-center">
                        <span className="text-yellow-400">⭐</span>
                        <span className="ml-1 text-sm">{tutor.rating || 5.0}</span>
                      </div>
                    </div>
                    <p className="text-gray-600">{tutor.subject}</p>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>教學年資: {tutor.experience}</span>
                      <span>{tutor.education}</span>
                    </div>
                    {tutor.tags && tutor.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tutor.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-8 text-center">
            <button className="bg-white border border-primary text-primary rounded-md px-4 py-2 hover:bg-gray-50 transition-all duration-200">
              查看更多導師
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TutorSection; 