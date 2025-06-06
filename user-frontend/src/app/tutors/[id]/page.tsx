'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { tutorApi } from '@/services/api';

interface Tutor {
  id: number;
  name: string;
  subject: string;
  education: string;
  experience: string;
  rating: number;
  avatarUrl: string;
  description?: string;
  tags?: string[];
}

export default function TutorPage({ params }: { params: { id: string } }) {
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Mock 學生 ID
  const MOCK_STUDENT_ID = 456;

  useEffect(() => {
    const fetchTutor = async () => {
      try {
        setLoading(true);
        const data = await tutorApi.getTutorById(parseInt(params.id));
        setTutor(data);
        setError(null);
      } catch (err) {
        console.error('獲取導師資料失敗:', err);
        setError('獲取導師資料失敗，請稍後再試');
      } finally {
        setLoading(false);
      }
    };

    fetchTutor();
  }, [params.id]);

  const handleApply = async () => {
    try {
      setApplying(true);
      setApplyError(null);
      await tutorApi.applyTutor(parseInt(params.id), MOCK_STUDENT_ID);
      setApplySuccess(true);
    } catch (err) {
      console.error('申請配對失敗:', err);
      setApplyError('申請失敗，請稍後再試');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-600">載入中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-8 text-red-500">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-8 text-gray-500">
            <p>找不到導師資料</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 左側：頭像和基本資訊 */}
            <div className="md:col-span-1">
              <div className="relative h-64 w-full mb-4">
                <Image
                  src={imageError ? '/avatars/default.png' : (tutor.avatarUrl || '/avatars/default.png')}
                  alt={tutor.name}
                  fill
                  className="object-cover rounded-lg"
                  onError={() => setImageError(true)}
                />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold">{tutor.name}</h1>
                  <div className="flex items-center">
                    <span className="text-yellow-400">⭐</span>
                    <span className="ml-1">{tutor.rating}</span>
                  </div>
                </div>
                <p className="text-gray-600">{tutor.subject}</p>
                <div className="text-sm text-gray-500">
                  <p>教學年資: {tutor.experience}</p>
                  <p>學歷: {tutor.education}</p>
                </div>
              </div>
            </div>

            {/* 右側：詳細資訊 */}
            <div className="md:col-span-2">
              {tutor.description && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">關於我</h2>
                  <p className="text-gray-600">{tutor.description}</p>
                </div>
              )}

              {tutor.tags && tutor.tags.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-2">專長領域</h2>
                  <div className="flex flex-wrap gap-2">
                    {tutor.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 申請按鈕 */}
          <div className="mt-8 text-center">
            {applySuccess ? (
              <div className="text-green-600 font-medium">
                已成功申請配對
              </div>
            ) : (
              <div>
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className={`bg-primary text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    applying ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90'
                  }`}
                >
                  {applying ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                      申請中...
                    </div>
                  ) : (
                    '申請配對此導師'
                  )}
                </button>
                {applyError && (
                  <p className="mt-2 text-red-500">{applyError}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 