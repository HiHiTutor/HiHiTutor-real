'use client';

import { useEffect, useState } from 'react';
import { caseApi } from '@/services/api';

interface Case {
  id: string;
  subject: string;
  requirement: string;
  location: string;
  budget: string;
  mode: string;
  description?: string;
}

export default function CasePage({ params }: { params: { id: string } }) {
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState(false);

  // Mock 導師 ID
  const MOCK_TUTOR_ID = 123;

  useEffect(() => {
    const fetchCase = async () => {
      try {
        setLoading(true);
        const data = await caseApi.getCaseById(params.id);
        setCaseData(data);
        setError(null);
      } catch (err) {
        console.error('獲取個案資料失敗:', err);
        setError('未能載入個案資料，請稍後再試');
      } finally {
        setLoading(false);
      }
    };

    fetchCase();
  }, [params.id]);

  const handleApply = async () => {
    try {
      setApplying(true);
      setApplyError(null);
      await caseApi.applyCase(params.id, MOCK_TUTOR_ID);
      setApplySuccess(true);
    } catch (err) {
      console.error('申請個案失敗:', err);
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

  if (!caseData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-8 text-gray-500">
            <p>找不到個案資料</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 左側：基本資訊 */}
            <div>
              <h1 className="text-2xl font-bold mb-6">{caseData.subject}</h1>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">要求</span>
                  <span className="font-medium">{caseData.requirement}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">地區</span>
                  <span className="font-medium">{caseData.location}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">上課模式</span>
                  <span className="font-medium">{caseData.mode}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">費用</span>
                  <span className="font-medium">{caseData.budget}</span>
                </div>
              </div>
            </div>

            {/* 右側：詳細資訊 */}
            <div>
              {caseData.description && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">備註</h2>
                  <p className="text-gray-600">{caseData.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* 申請按鈕 */}
          <div className="mt-8 text-center">
            {applySuccess ? (
              <div className="text-green-600 font-medium">
                已成功申請此個案
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
                    '我要申請此個案'
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